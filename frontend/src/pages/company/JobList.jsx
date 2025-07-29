import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const JobList = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 9;

    const handleCreateJob = () => {
        navigate("/company/jobs/add");
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

    // Pagination calculations
    const totalPages = Math.ceil(jobPostings.length / jobsPerPage);
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const currentJobs = jobPostings.slice(startIndex, endIndex);

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
                            <h2 className="text-lg font-semibold text-gray-900">
                                Active Job Postings
                            </h2>
                            <button
                                onClick={handleCreateJob}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create New Job
                            </button>
                        </div>

                        {/* Job Cards Container */}
                        <div className="flex-1 flex flex-col">
                            {jobPostings.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                                        {currentJobs.map((job) => (
                                            <div
                                                key={job.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white h-fit"
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
                                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                                        Edit
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800 text-xs font-medium">
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
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === 1
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
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === pageNumber
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
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === totalPages
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
                                        Start by creating your first job posting to attract top
                                        talent.
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
