import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";

const JobList = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
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

    // Dummy data for job postings
    const jobPostings = [
        {
            id: 1,
            title: "Senior Frontend Developer",
            jobType: "Full Time",
            location: "Jakarta, Indonesia",
            postedDate: new Date("2024-11-17"),
            isActive: true,
        },
        {
            id: 2,
            title: "Backend Developer",
            jobType: "Full Time",
            location: "Bandung, Indonesia",
            postedDate: new Date("2024-11-15"),
            isActive: true,
        },
        {
            id: 3,
            title: "UI/UX Designer",
            jobType: "Contract",
            location: "Surabaya, Indonesia",
            postedDate: new Date("2024-11-10"),
            isActive: false,
        },
        {
            id: 4,
            title: "Data Analyst",
            jobType: "Part Time",
            location: "Yogyakarta, Indonesia",
            postedDate: new Date("2024-11-08"),
            isActive: true,
        },
        {
            id: 5,
            title: "Marketing Intern",
            jobType: "Internship",
            location: "Denpasar, Indonesia",
            postedDate: new Date("2024-11-05"),
            isActive: true,
        },
        {
            id: 6,
            title: "Product Manager",
            jobType: "Full Time",
            location: "Jakarta, Indonesia",
            postedDate: new Date("2024-11-03"),
            isActive: true,
        },
        {
            id: 7,
            title: "DevOps Engineer",
            jobType: "Full Time",
            location: "Bandung, Indonesia",
            postedDate: new Date("2024-11-01"),
            isActive: true,
        },
        {
            id: 8,
            title: "Mobile Developer",
            jobType: "Contract",
            location: "Surabaya, Indonesia",
            postedDate: new Date("2024-10-28"),
            isActive: true,
        },
        {
            id: 9,
            title: "Quality Assurance",
            jobType: "Full Time",
            location: "Yogyakarta, Indonesia",
            postedDate: new Date("2024-10-25"),
            isActive: true,
        },
        {
            id: 10,
            title: "Content Writer",
            jobType: "Part Time",
            location: "Denpasar, Indonesia",
            postedDate: new Date("2024-10-22"),
            isActive: true,
        },
    ];

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
            case "Full Time":
                return "bg-green-100 text-green-700";
            case "Part Time":
                return "bg-yellow-100 text-yellow-700";
            case "Contract":
                return "bg-blue-100 text-blue-700";
            case "Internship":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Filter jobs based on search term and filters
    const filteredJobs = jobPostings.filter((job) => {
        // Search filter
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && job.isActive) ||
            (statusFilter === "inactive" && !job.isActive);

        // Job type filter
        const matchesJobType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;

        // Location filter
        const matchesLocation = locationFilter === "all" ||
            job.location.toLowerCase().includes(locationFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesJobType && matchesLocation;
    });

    // Pagination calculations (using filtered jobs)
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const currentJobs = filteredJobs.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, jobTypeFilter, locationFilter]);

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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Title and Description */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Job Management
                                </h1>
                                <p className="text-gray-600">
                                    Manage your job postings and track applications
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4">
                                {/* Active Jobs Stats */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 min-w-[120px]">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <p className="text-sm font-medium text-center text-blue-600">Active Jobs</p>
                                            <p className="text-2xl text-center font-bold text-blue-700">
                                                {jobPostings.filter(job => job.isActive).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Applicants Stats */}
                                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 min-w-[120px]">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <p className="text-sm font-medium text-center text-green-600">Total Applicants</p>
                                            <p className="text-2xl text-center font-bold text-green-700">
                                                {jobPostings.reduce((total, job) => total + (job.applicants || Math.floor(Math.random() * 50) + 5), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Inactive Jobs Stats */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 min-w-[120px]">
                                    <div className="flex items-center justify-center">
                                        <div>
                                            <p className="text-sm font-medium text-center text-gray-600">Inactive Jobs</p>
                                            <p className="text-2xl text-center font-bold text-gray-700">
                                                {jobPostings.filter(job => !job.isActive).length}
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
                            <div className="relative flex-1 max-w-md">
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
                                    className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-sm text-gray-700 cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                {/* Job Type Filter */}
                                <select
                                    value={jobTypeFilter}
                                    onChange={(e) => setJobTypeFilter(e.target.value)}
                                    className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-sm text-gray-700 cursor-pointer"
                                >
                                    <option value="all">All Types</option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>

                                {/* Location Filter */}
                                <select
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-sm text-gray-700 cursor-pointer"
                                >
                                    <option value="all">All Locations</option>
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
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
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
                                    {filteredJobs.length === 0 ? (
                                        "No jobs found"
                                    ) : (
                                        <>
                                            Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
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

                            {filteredJobs.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                        {currentJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                onClick={() => handleJobClick(job.id)}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white h-fit cursor-pointer"
                                            >
                                                {/* Job Title */}
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {job.title}
                                                    </h3>
                                                    <div
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(
                                                            job.jobType
                                                        )}`}
                                                    >
                                                        {job.jobType}
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
                                                        <span>Posted: {formatDate(job.postedDate)}</span>
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
                                                                // Handle edit functionality here
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Handle delete functionality here
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
                                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
