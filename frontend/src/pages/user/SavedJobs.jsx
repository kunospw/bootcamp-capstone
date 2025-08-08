import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import Footer from "../../Components/Footer";
import FloatingDecorations from "../../Components/FloatingDecorations";
import ApplicationForm from "../../Components/ApplicationForm";

const SavedJobs = () => {
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [displayCount, setDisplayCount] = useState(15); // Show 15 items initially

    // Application form state
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicationStatuses, setApplicationStatuses] = useState(new Map());
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Filter states
    const [filterPriority, setFilterPriority] = useState("");
    const [filterTags, setFilterTags] = useState("");
    const [filterSearch, setFilterSearch] = useState(""); // New: search filter
    const [filterLoading, setFilterLoading] = useState(false); // New: filter loading indicator

    const debounceTimer = useRef(null);

    // 1. Define fetchSavedJobs FIRST
    const fetchSavedJobs = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/signin");
                return;
            }

            // Build query string for filters
            const params = new URLSearchParams();
            if (filterPriority) params.append("priority", filterPriority);
            if (filterTags)
                params.append(
                    "tags",
                    filterTags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag)
                        .join(",")
                );
            if (filterSearch) params.append("search", filterSearch);

            const response = await fetch(
                `https://api.sonervous.site/api/saved-jobs?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSavedJobs(data.savedJobs);
                setError(null);
            } else {
                throw new Error("Failed to fetch saved jobs");
            }
        } catch (err) {
            setError(err.message);
            setSavedJobs([]);
        } finally {
            setLoading(false);
            setFilterLoading(false);
        }
    }, [filterPriority, filterTags, filterSearch, navigate]);

    // 2. Now define debouncedFetchSavedJobs
    const debouncedFetchSavedJobs = useCallback(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        setFilterLoading(true);
        debounceTimer.current = setTimeout(() => {
            fetchSavedJobs();
        }, 400);
    }, [fetchSavedJobs]);

    // Handle filter button click
    const handleFilter = () => {
        setFilterLoading(true);
        fetchSavedJobs();
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setFilterPriority("");
        setFilterTags("");
        setFilterSearch("");
    };

    // Initial load and authentication check
    useEffect(() => {
        // Check authentication status
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    // Fetch jobs when filters change (debounced)
    useEffect(() => {
        debouncedFetchSavedJobs();
        // eslint-disable-next-line
    }, [filterPriority, filterTags, filterSearch]);

    // Check application statuses when authenticated and jobs are loaded
    useEffect(() => {
        if (isAuthenticated && savedJobs.length > 0) {
            checkApplicationStatuses();
        }
    }, [isAuthenticated, savedJobs]);

    const checkApplicationStatuses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch(
                "https://api.sonervous.site/api/applications/my-applications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const statusMap = new Map();
                data.applications.forEach((app) => {
                    if (app.jobId && app.jobId._id) {
                        statusMap.set(app.jobId._id, app.status);
                    }
                });
                setApplicationStatuses(statusMap);
            }
        } catch (error) {
            console.error("Error checking application statuses:", error);
        }
    };

    // Handle apply button click
    const handleApply = (job) => {
        if (!isAuthenticated) {
            navigate("/signin");
            return;
        }

        // Check if already applied
        if (applicationStatuses.has(job._id)) {
            alert(
                `You have already applied to this job. Status: ${applicationStatuses.get(
                    job._id
                )}`
            );
            return;
        }

        // Check application deadline
        if (
            job.applicationDeadline &&
            new Date() > new Date(job.applicationDeadline)
        ) {
            alert("The application deadline for this job has passed.");
            return;
        }

        // Show application form
        setSelectedJob(job);
        setShowApplicationForm(true);
    };

    // Handle successful application submission
    const handleApplicationSuccess = () => {
        setShowApplicationForm(false);
        setSelectedJob(null);
        if (selectedJob) {
            setApplicationStatuses(
                (prev) => new Map([...prev, [selectedJob._id, "pending"]])
            );
        }
        alert("Application submitted successfully!");
    };

    // Handle application form close
    const handleApplicationClose = () => {
        setShowApplicationForm(false);
        setSelectedJob(null);
    };

    const handleRemoveSavedJob = async (savedJobId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `https://api.sonervous.site/api/saved-jobs/${savedJobId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setSavedJobs((prev) => prev.filter((job) => job._id !== savedJobId));

                // Success notification
                showNotification("success", "Job removed from saved list!");
            }
        } catch (err) {
            console.error("Error removing saved job:", err);
            showNotification("error", "Failed to remove job. Please try again.");
        }
    };

    const handleClearNote = async (savedJobId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `https://api.sonervous.site/api/saved-jobs/${savedJobId}/clear-note`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();

                // Update the saved jobs list with cleared note
                setSavedJobs((prev) =>
                    prev.map((savedJob) =>
                        savedJob._id === savedJobId
                            ? { ...savedJob, note: "", tags: result.savedJob.tags }
                            : savedJob
                    )
                );

                showNotification("success", "Note cleared successfully!");
            } else {
                throw new Error("Failed to clear note");
            }
        } catch (error) {
            console.error("Error clearing note:", error);
            showNotification("error", "Failed to clear note. Please try again.");
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Helper function for notifications
    const showNotification = (type, message) => {
        const colors = {
            success: "bg-green-100 border-green-400 text-green-700",
            error: "bg-red-100 border-red-400 text-red-700",
        };

        const icons = {
            success:
                "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
            error:
                "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
        };

        const notification = document.createElement("div");
        notification.className = `fixed top-4 right-4 ${colors[type]} px-4 py-3 rounded-lg shadow-lg z-50 border`;
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="${icons[type]}" clip-rule="evenodd" />
                </svg>
                ${message}
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    };

    const formatSalary = (salary) => {
        if (!salary || (!salary.min && !salary.max)) return "Salary not specified";

        const currency = salary.currency || "USD";
        const period = salary.period || "monthly";

        if (salary.min && salary.max) {
            return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} per ${period}`;
        } else if (salary.min) {
            return `${currency} ${salary.min.toLocaleString()}+ per ${period}`;
        } else if (salary.max) {
            return `Up to ${currency} ${salary.max.toLocaleString()} per ${period}`;
        }
    };

    // Handle load more
    const handleLoadMore = () => {
        setDisplayCount((prev) => prev + 15);
    };

    // Get visible saved jobs
    const visibleSavedJobs = savedJobs.slice(0, displayCount);
    const hasMore = savedJobs.length > displayCount;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="relative pt-16">
                    <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
                        <FloatingDecorations />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-4">Saved Jobs</h1>
                            <p className="text-lg text-blue-100">
                                Jobs you've saved for later review
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 relative z-10">
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">
                                    Loading saved jobs...
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="relative pt-16">
                    <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
                        <FloatingDecorations />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-4">Saved Jobs</h1>
                            <p className="text-lg text-blue-100">
                                Jobs you've saved for later review
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 relative z-10">
                            <div className="text-center py-12">
                                <div className="text-red-600 mb-4">
                                    <svg
                                        className="w-12 h-12 mx-auto mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Error loading saved jobs
                                </h3>
                                <p className="text-gray-500 mb-4">{error}</p>
                                <button
                                    onClick={fetchSavedJobs}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="relative pt-16">
                <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
                    <FloatingDecorations />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Saved Jobs</h1>
                        <p className="text-lg text-blue-100">
                            Jobs you've saved for later review
                        </p>
                    </div>

                    {/* Filter Controls */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 relative z-10">
                        <form onSubmit={(e) => { e.preventDefault(); handleFilter(); }}>
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Search saved jobs by title, company, or notes..."
                                            value={filterSearch}
                                            onChange={(e) => setFilterSearch(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                        {/* Search loading indicator */}
                                        {filterLoading && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                        disabled={filterLoading}
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Filter by tags (comma separated)"
                                    value={filterTags}
                                    onChange={(e) => setFilterTags(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex-1"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex-1"
                                        disabled={filterLoading}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Filter Chips */}
                        {(filterSearch || filterPriority || filterTags) && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                                
                                {filterSearch && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        <span>Search: "{filterSearch}"</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilterSearch("")}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {filterPriority && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                        <span>Priority: {filterPriority}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilterPriority("")}
                                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {filterTags && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        <span>Tags: {filterTags}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFilterTags("")}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {savedJobs.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 relative z-10">
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg
                                        className="w-16 h-16 mx-auto mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No saved jobs yet
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Start saving jobs you're interested in to keep track of them.
                                </p>
                                <button
                                    onClick={() => navigate("/jobs")}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Browse Jobs
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 relative z-10">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
                                    {visibleSavedJobs.map((savedJob) => (
                                        <div
                                            key={savedJob._id}
                                            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full"
                                        >
                                            <div className="p-6 flex flex-col flex-1">
                                                {/* Company Logo and Basic Info */}
                                                <div className="flex items-start space-x-4 mb-4 min-h-[4rem]">
                                                    <div className="w-12 h-12 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center">
                                                        {savedJob.jobId.companyId?.profilePicture ? (
                                                            <img
                                                                src={`https://api.sonervous.site/${savedJob.jobId.companyId.profilePicture}`}
                                                                alt={savedJob.jobId.companyId.companyName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = "none";
                                                                    e.target.nextSibling.style.display = "flex";
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div
                                                            className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                                                            style={{
                                                                display: savedJob.jobId.companyId
                                                                    ?.profilePicture
                                                                    ? "none"
                                                                    : "flex",
                                                            }}
                                                        >
                                                            {savedJob.jobId.companyId?.companyName
                                                                ? savedJob.jobId.companyId.companyName
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                                : "C"}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3
                                                            onClick={() =>
                                                                navigate(`/job/${savedJob.jobId._id}`)
                                                            }
                                                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 mb-1"
                                                        >
                                                            {savedJob.jobId.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">
                                                            {savedJob.jobId.companyId?.companyName}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveSavedJob(savedJob._id)}
                                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                                        title="Remove from saved"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Location and Salary */}
                                                <div className="mb-4 min-h-[3rem]">
                                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                                        <svg
                                                            className="w-4 h-4 mr-1 flex-shrink-0"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <span className="truncate">
                                                            {savedJob.jobId.location}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-green-600 font-medium">
                                                        {formatSalary(savedJob.jobId.salary)}
                                                    </div>
                                                </div>

                                                {/* Priority */}
                                                <div className="mb-4 min-h-[1.75rem]">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                                            savedJob.priority
                                                        )}`}
                                                    >
                                                        {savedJob.priority} priority
                                                    </span>
                                                </div>

                                                {/* Job Type Tags */}
                                                <div className="flex flex-wrap gap-1 mb-4 min-h-[1.75rem]">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {savedJob.jobId.type}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {savedJob.jobId.workLocation}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {savedJob.jobId.experienceLevel}
                                                    </span>
                                                </div>

                                                {/* Personal Note */}
                                                {savedJob.note ? (
                                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <svg
                                                                        className="w-3 h-3 text-blue-600"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <p className="text-xs text-gray-600">
                                                                        Your note:
                                                                    </p>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleClearNote(savedJob._id)
                                                                        }
                                                                        className="text-xs text-orange-600 hover:text-orange-800 transition-colors"
                                                                    >
                                                                        Clear note
                                                                    </button>
                                                                </div>
                                                                <p className="text-sm text-gray-800 leading-relaxed">
                                                                    {savedJob.note}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                                    <svg
                                                                        className="w-3 h-3 text-gray-400"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-400 italic">
                                                                No note added yet
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Tags */}
                                                {savedJob.tags && savedJob.tags.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 mb-4 min-h-[2rem]">
                                                        {savedJob.tags.slice(0, 3).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {savedJob.tags.length > 3 && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                                +{savedJob.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mb-4"></div>
                                                )}

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto min-h-[3rem]">
                                                    <div className="text-xs text-gray-500">
                                                        <span>
                                                            Saved{" "}
                                                            {new Date(
                                                                savedJob.dateSaved
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleApply(savedJob.jobId)}
                                                        disabled={
                                                            applicationStatuses.has(savedJob.jobId._id) ||
                                                            (savedJob.jobId.applicationDeadline &&
                                                                new Date() >
                                                                new Date(
                                                                    savedJob.jobId.applicationDeadline
                                                                )) ||
                                                            !savedJob.jobId.canApply
                                                        }
                                                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex-shrink-0 ${applicationStatuses.has(savedJob.jobId._id)
                                                                ? "bg-gray-500 text-white cursor-not-allowed"
                                                                : (savedJob.jobId.applicationDeadline &&
                                                                    new Date() >
                                                                    new Date(
                                                                        savedJob.jobId.applicationDeadline
                                                                    )) ||
                                                                    !savedJob.jobId.canApply
                                                                    ? "bg-red-500 text-white cursor-not-allowed"
                                                                    : !isAuthenticated
                                                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                            }`}
                                                    >
                                                        {applicationStatuses.has(savedJob.jobId._id)
                                                            ? `Applied (${applicationStatuses.get(
                                                                savedJob.jobId._id
                                                            )})`
                                                            : (savedJob.jobId.applicationDeadline &&
                                                                new Date() >
                                                                new Date(
                                                                    savedJob.jobId.applicationDeadline
                                                                )) ||
                                                                !savedJob.jobId.canApply
                                                                ? "Unavailable"
                                                                : !isAuthenticated
                                                                    ? "Login to Apply"
                                                                    : "Apply"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {hasMore && (
                                    <div className="text-center">
                                        <button
                                            onClick={handleLoadMore}
                                            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Load More Jobs
                                        </button>
                                    </div>
                                )}

                                {/* Total Count */}
                                <div className="text-center mt-6 text-sm text-gray-500">
                                    Showing {Math.min(displayCount, savedJobs.length)} of{" "}
                                    {savedJobs.length} saved jobs
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Form Modal */}
            {showApplicationForm && selectedJob && isAuthenticated && (
                <ApplicationForm
                    job={selectedJob}
                    onClose={handleApplicationClose}
                    onSuccess={handleApplicationSuccess}
                />
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SavedJobs;
