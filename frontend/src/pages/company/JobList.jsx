import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaEye, FaUsers } from "react-icons/fa";

const JobList = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const jobsPerPage = 9;

    const handleCreateJob = () => {
        navigate("/company/jobs/add");
    };

    // Fetch jobs from backend
    useEffect(() => {
        fetchJobs();
    }, [currentPage]);

    const fetchJobs = async () => {
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

            const response = await fetch(
                `http://localhost:3000/api/jobs/company/${companyId}?page=${currentPage}&limit=${jobsPerPage}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setJobs(data.jobs || []);
                setTotalPages(data.totalPages || 1);
                setTotalJobs(data.total || 0);
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
    };

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
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Job Management
                        </h1>
                        <p className="text-gray-600">
                            Manage your job postings and track applications
                        </p>
                    </div>

                    {/* Job List Content */}
                    <div className="bg-white min-h-[805px] rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Active Job Postings
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {loading ? 'Loading...' : `${totalJobs} total job${totalJobs !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                            <button
                                onClick={handleCreateJob}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create New Job
                            </button>
                        </div>

                        {/* Job Cards Container */}
                        <div className="flex-1 flex flex-col">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                                        {jobs.map((job) => (
                                            <div
                                                key={job._id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white h-fit"
                                            >
                                                {/* Job Title */}
                                                <div className="mb-3">
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
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaEye className="text-green-500 w-3 h-3" />
                                                        <span>{job.views || 0} views</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaUsers className="text-purple-500 w-3 h-3" />
                                                        <span>{job.applicationsCount || 0} applications</span>
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
                                                            onClick={() => handleEditJob(job._id)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteJob(job._id)}
                                                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination - Always at bottom */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center pt-8 space-x-2">
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
                                </>
                            ) : (
                                /* Empty State */
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
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
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No jobs posted yet
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Start by creating your first job posting to attract top talent.
                                        </p>
                                        <button
                                            onClick={handleCreateJob}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Post Your First Job
                                        </button>
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