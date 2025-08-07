import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaEye, FaUsers, FaSearch } from "react-icons/fa";

const JobList = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [jobTypeFilter, setJobTypeFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");
    const jobsPerPage = 9;

    const handleCreateJob = () => {
        navigate("/company/jobs/add");
    };

    const handleJobClick = (jobId) => {
        navigate(`/company/jobs/${jobId}`);
    };

    // Fetch jobs from backend
    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            // Decode token to get company ID
            const payload = JSON.parse(atob(token.split('.')[1]));
            const companyId = payload.companyId;

            // Build query parameters for filtering
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: jobsPerPage,
                includeInactive: 'true' // Always include inactive jobs for company view
            });

            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }
            if (statusFilter !== 'all') {
                queryParams.append('status', statusFilter);
            }
            if (jobTypeFilter !== 'all') {
                queryParams.append('type', jobTypeFilter);
            }
            if (locationFilter !== 'all') {
                queryParams.append('location', locationFilter);
            }

            console.log('Fetching jobs for company:', companyId); // Debug log

            const response = await fetch(
                `http://localhost:3000/api/jobs/company/${companyId}?${queryParams}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Received jobs:', data.jobs.length); // Debug log
                
                // Apply client-side filtering as fallback if backend doesn't support all filters
                let filteredJobs = data.jobs || [];
                
                if (searchTerm) {
                    filteredJobs = filteredJobs.filter(job =>
                        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.location.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                
                if (statusFilter !== 'all') {
                    filteredJobs = filteredJobs.filter(job => {
                        if (statusFilter === 'active') return job.isActive;
                        if (statusFilter === 'inactive') return !job.isActive;
                        return true;
                    });
                }
                
                if (jobTypeFilter !== 'all') {
                    filteredJobs = filteredJobs.filter(job => 
                        formatJobType(job.type) === jobTypeFilter || job.type === jobTypeFilter
                    );
                }
                
                if (locationFilter !== 'all') {
                    filteredJobs = filteredJobs.filter(job =>
                        job.location.toLowerCase().includes(locationFilter.toLowerCase())
                    );
                }

                setJobs(filteredJobs);
                // Recalculate pagination based on filtered results
                const totalFiltered = filteredJobs.length;
                setTotalPages(Math.ceil(totalFiltered / jobsPerPage));
                setTotalJobs(totalFiltered);
                setError("");
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch jobs');
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter, jobTypeFilter, locationFilter, navigate]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, jobTypeFilter, locationFilter]);

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh the job list
                fetchJobs();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to delete job');
            }
        } catch (err) {
            console.error('Error deleting job:', err);
            alert('Failed to delete job');
        }
    };

    const handleEditJob = (jobId) => {
        navigate(`/company/jobs/edit/${jobId}`);
    };

    // Keep the dummy data as fallback for now, but we'll use the real data from API
    const formatDate = (date) => {
        const months = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];

        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    };

    const getJobTypeColor = (jobType) => {
        switch (jobType) {
            case "full-time":
                return "bg-green-100 text-green-700";
            case "part-time":
                return "bg-yellow-100 text-yellow-700";
            case "contract":
                return "bg-blue-100 text-blue-700";
            case "internship":
                return "bg-purple-100 text-purple-700";
            case "freelance":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatJobType = (type) => {
        const typeMap = {
            'full-time': 'Full Time',
            'part-time': 'Part Time',
            'contract': 'Contract',
            'internship': 'Internship',
            'freelance': 'Freelance'
        };
        return typeMap[type] || type;
    };

    const formatWorkLocation = (workLocation) => {
        const locationMap = {
            'onsite': 'On-site',
            'remote': 'Remote',
            'hybrid': 'Hybrid'
        };
        return locationMap[workLocation] || workLocation;
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="md:p-6 p-4">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Title and Description */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Job Management
                                </h1>
                                <p className="text-gray-600 md:block hidden">
                                    Manage your job postings and track applications
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4">
                                {/* Active Jobs Stats */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 md:min-w-[120px]">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <p className="text-sm font-medium text-center text-blue-600">Active Jobs</p>
                                            <p className="text-2xl text-center font-bold text-blue-700">
                                                {loading ? '...' : jobs.filter(job => job.isActive).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Applicants Stats */}
                                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 md:min-w-[120px]">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <p className="text-sm font-medium text-center text-green-600">Total Applicants</p>
                                            <p className="text-2xl text-center font-bold text-green-700">
                                                {loading ? '...' : jobs.reduce((total, job) => total + (job.applicationsCount || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Inactive Jobs Stats */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 md:min-w-[120px]">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <p className="text-sm font-medium text-center text-gray-600">Inactive Jobs</p>
                                            <p className="text-2xl text-center font-bold text-gray-700">
                                                {loading ? '...' : jobs.filter(job => !job.isActive).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job List Content */}
                    <div className="bg-white min-h-[805px] rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
                        {/* Search Bar and Filters */}
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-md w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filters - Center */}
                            <div className="flex flex-wrap gap-3 items-center justify-center">
                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="md:w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-sm text-gray-700 cursor-pointer"
                                >
                                    <option value="all">Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                {/* Job Type Filter */}
                                <select
                                    value={jobTypeFilter}
                                    onChange={(e) => setJobTypeFilter(e.target.value)}
                                    className="md:w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-sm text-gray-700 cursor-pointer"
                                >
                                    <option value="all">Types</option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Freelance">Freelance</option>
                                </select>

                                {/* Location Filter */}
                                <select
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="md:w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-sm text-gray-700 cursor-pointer"
                                >
                                    <option value="all">Locations</option>
                                    <option value="Jakarta">Jakarta</option>
                                    <option value="Bandung">Bandung</option>
                                    <option value="Surabaya">Surabaya</option>
                                    <option value="Yogyakarta">Yogyakarta</option>
                                    <option value="Denpasar">Denpasar</option>
                                </select>
                            </div>

                            {/* Create Job Button - Right */}
                            <div className="flex-shrink-0">
                                <button
                                    onClick={handleCreateJob}
                                    className="bg-[#F4B400] text-black px-4 py-2 rounded-lg hover:bg-[#E6A200] transition-colors text-sm font-medium cursor-pointer"
                                >
                                    Create New Job
                                </button>
                            </div>
                        </div>

                        {/* Job Cards Container */}
                        <div className="flex-1 flex flex-col">
                            {/* Results Summary and Filter Chips */}
                            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-sm text-gray-600">
                                    {jobs.length === 0 ? (
                                        "No jobs found"
                                    ) : (
                                        <>
                                            Showing {jobs.length} of {totalJobs} job{totalJobs !== 1 ? 's' : ''}
                                            {(searchTerm || statusFilter !== "all" || jobTypeFilter !== "all" || locationFilter !== "all") && (
                                                <span className="ml-2 text-blue-600">(filtered)</span>
                                            )}
                                        </>
                                    )}
                                </p>

                                {/* Filter Chips */}
                                {(searchTerm || statusFilter !== "all" || jobTypeFilter !== "all" || locationFilter !== "all") && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {/* Search Term Chip */}
                                        {searchTerm && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                <span>Search: "{searchTerm}"</span>
                                                <button
                                                    onClick={() => setSearchTerm("")}
                                                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* Status Filter Chip */}
                                        {statusFilter !== "all" && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                                <span>Status: {statusFilter === "active" ? "Active" : "Inactive"}</span>
                                                <button
                                                    onClick={() => setStatusFilter("all")}
                                                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* Job Type Filter Chip */}
                                        {jobTypeFilter !== "all" && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                                <span>Type: {jobTypeFilter}</span>
                                                <button
                                                    onClick={() => setJobTypeFilter("all")}
                                                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* Location Filter Chip */}
                                        {locationFilter !== "all" && (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                                <span>Location: {locationFilter}</span>
                                                <button
                                                    onClick={() => setLocationFilter("all")}
                                                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* Clear All Filters Button */}
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setStatusFilter("all");
                                                setJobTypeFilter("all");
                                                setLocationFilter("all");
                                            }}
                                            className="cursor-pointer inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Clear All
                                        </button>
                                    </div>
                                )}
                            </div>
                            {loading ? (
                                /* Loading State */
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading jobs...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                /* Error State */
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading jobs</h3>
                                        <p className="text-gray-600 mb-4">{error}</p>
                                        <button
                                            onClick={fetchJobs}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : jobs.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                        {jobs.map((job) => (
                                            <div
                                                key={job._id}
                                                onClick={() => handleJobClick(job._id)}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white h-fit cursor-pointer relative"
                                            >
                                                {/* Views and Applications Count - Top Right */}
                                                <div className="absolute top-3 right-3 flex gap-2">
                                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <FaEye className="w-3 h-3" />
                                                        <span>{job.views || 0}</span>
                                                    </div>
                                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                        <FaUsers className="w-3 h-3" />
                                                        <span>{job.applicationsCount || 0}</span>
                                                    </div>
                                                </div>

                                                {/* Job Title */}
                                                <div className="mb-3 pr-24">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <div
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}
                                                        >
                                                            {formatJobType(job.type)}
                                                        </div>
                                                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                            {formatWorkLocation(job.workLocation)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Job Details */}
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaMapMarkerAlt className="text-red-500 w-3 h-3" />
                                                        <span>{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaCalendarAlt className="text-blue-500 w-3 h-3" />
                                                        <span>Posted: {formatDate(new Date(job.datePosted))}</span>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="flex justify-between items-center">
                                                    <div
                                                        className={`inline-flex items-center gap-1 text-xs font-medium ${job.isActive ? "text-green-600" : "text-gray-500"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${job.isActive ? "bg-green-500" : "bg-gray-400"
                                                                }`}
                                                        ></div>
                                                        {job.isActive ? "Active" : "Inactive"}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditJob(job._id);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteJob(job._id);
                                                            }}
                                                            className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination - Always at bottom */}
                                    <div className="flex-1 flex flex-col justify-end">
                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center space-x-2">
                                                {/* Previous Button */}
                                                <button
                                                    onClick={handlePrevPage}
                                                    disabled={currentPage === 1}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <FaChevronLeft className="w-3 h-3" />
                                                    Previous
                                                </button>

                                                {/* Page Numbers */}
                                                <div className="flex space-x-1">
                                                    {Array.from({ length: totalPages }, (_, index) => {
                                                        const pageNumber = index + 1;
                                                        return (
                                                            <button
                                                                key={pageNumber}
                                                                onClick={() => handlePageChange(pageNumber)}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNumber
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {pageNumber}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Next Button */}
                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Next
                                                    <FaChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Empty State */
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            {searchTerm || statusFilter !== "all" || jobTypeFilter !== "all" || locationFilter !== "all" ? (
                                                <FaSearch className="w-8 h-8 text-gray-400" />
                                            ) : (
                                                <svg
                                                    className="w-8 h-8 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM16 10h.01M8 10h.01"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        {searchTerm || statusFilter !== "all" || jobTypeFilter !== "all" || locationFilter !== "all" ? (
                                            <>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    No jobs match your criteria
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    Try adjusting your search terms or filters to find more results.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setStatusFilter("all");
                                                        setJobTypeFilter("all");
                                                        setLocationFilter("all");
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Clear all filters
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    No jobs posted yet
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    Start by creating your first job posting to attract top talent.
                                                </p>
                                                <button
                                                    onClick={handleCreateJob}
                                                    className="bg-[#F4B400] text-black px-6 py-2 rounded-lg hover:bg-[#E6A200] transition-colors"
                                                >
                                                    Post Your First Job
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobList;