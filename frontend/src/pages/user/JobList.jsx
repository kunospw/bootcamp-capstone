import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import FloatingDecorations from '../../Components/FloatingDecorations';

const JobList = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        type: '',
        workLocation: '',
        experienceLevel: '',
    });
    const [showInactive, setShowInactive] = useState(true); // Show inactive jobs by default
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasMore: true,
    });

    // Fetch jobs from the API
    const fetchJobs = async (page = 1, append = false) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                ...(showInactive && { includeInactive: 'true' }), // Conditionally include inactive jobs
                ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
            });

            const response = await fetch(`http://localhost:3000/api/jobs?${queryParams}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (append) {
                setJobs(prevJobs => [...prevJobs, ...data.jobs]);
            } else {
                setJobs(data.jobs);
            }
            
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                total: data.total,
                hasMore: data.currentPage < data.totalPages,
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError(err.message || 'Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs(1);
    };

    // Handle load more
    const handleLoadMore = () => {
        if (pagination.hasMore && !loading) {
            fetchJobs(pagination.currentPage + 1, true);
        }
    };

    // Format salary
    const formatSalary = (salary) => {
        if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';

        const currency = salary.currency || 'USD';
        const period = salary.period || 'monthly';

        if (salary.min && salary.max) {
            return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} per ${period}`;
        } else if (salary.min) {
            return `${currency} ${salary.min.toLocaleString()}+ per ${period}`;
        } else if (salary.max) {
            return `Up to ${currency} ${salary.max.toLocaleString()} per ${period}`;
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const now = new Date();
        const jobDate = new Date(dateString);
        const diffTime = Math.abs(now - jobDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Posted today';
        if (diffDays <= 7) return `Posted ${diffDays} days ago`;
        return jobDate.toLocaleDateString();
    };

    // Load jobs on component mount
    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    page: '1',
                    limit: '15',
                    ...(showInactive && { includeInactive: 'true' }) // Conditionally include inactive jobs
                });

                const response = await fetch(`http://localhost:3000/api/jobs?${queryParams}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setJobs(data.jobs);
                setPagination({
                    currentPage: data.currentPage,
                    totalPages: data.totalPages,
                    total: data.total,
                    hasMore: data.currentPage < data.totalPages,
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError(err.message || 'Failed to fetch jobs');
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, [showInactive]); // Add showInactive to dependencies

    if (loading && jobs.length === 0) {
        return <div>Loading jobs...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            {/* Background with blue section */}
            <div className="relative pt-16">
                {/* Blue background for top 1/3 with decorative elements */}
                <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
                    <FloatingDecorations />
                </div>
                
                {/* Content container */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Find Your Dream Job</h1>
                        <p className="text-lg text-blue-100">Discover opportunities that match your skills and interests</p>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 relative z-10">
                        <form onSubmit={handleSearch}>
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search jobs, companies, or skills..."
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <button 
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />

                                <select
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">All Job Types</option>
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                    <option value="freelance">Freelance</option>
                                </select>

                                <select
                                    name="workLocation"
                                    value={filters.workLocation}
                                    onChange={handleFilterChange}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">Work Location</option>
                                    <option value="onsite">Onsite</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>

                                <select
                                    name="experienceLevel"
                                    value={filters.experienceLevel}
                                    onChange={handleFilterChange}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">Experience Level</option>
                                    <option value="entry">Entry Level</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior Level</option>
                                    <option value="lead">Lead</option>
                                    <option value="executive">Executive</option>
                                </select>
                            </div>
                            
                            {/* Toggle for showing inactive jobs */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showInactive}
                                        onChange={(e) => setShowInactive(e.target.checked)}
                                        className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span>Show inactive job listings</span>
                                    <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                    Inactive jobs are no longer accepting applications but may still be viewed for reference.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error loading jobs</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                                <div className="ml-auto">
                                    <button 
                                        onClick={() => fetchJobs()}
                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Summary */}
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            Found <span className="font-semibold text-gray-900">{pagination.total}</span> jobs
                        </p>
                    </div>

                    {/* Job Listings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.length === 0 && !loading ? (
                            <div className="col-span-full text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
                                    <p className="mt-2 text-gray-500">We couldn't find any jobs matching your criteria.</p>
                                    <button 
                                        onClick={() => {
                                            setFilters({
                                                search: '',
                                                location: '',
                                                type: '',
                                                workLocation: '',
                                                experienceLevel: '',
                                            });
                                            fetchJobs(1);
                                        }}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job._id} className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                                    !job.isActive ? 'border-gray-300 opacity-75 bg-gray-50' : 'border-gray-200'
                                }`}>
                                    {/* Status Badge for Inactive Jobs */}
                                    {!job.isActive && (
                                        <div className="mb-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                Inactive Job
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start space-x-3 mb-4">
                                        {job.companyId?.profilePicture && (
                                            <img
                                                src={`http://localhost:3000/${job.companyId.profilePicture}`}
                                                alt={job.companyId?.companyName || 'Company'}
                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                onClick={() => navigate(`/job/${job._id}`)}
                                                className={`text-base font-semibold hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 ${
                                                    !job.isActive ? 'text-gray-700' : 'text-gray-900'
                                                }`}
                                            >
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1 truncate">{job.companyId?.companyName || 'Unknown Company'}</p>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="truncate">{job.location}</span>
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{formatSalary(job.salary)}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {job.type}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {job.workLocation}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {job.experienceLevel}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-gray-600 text-sm line-clamp-3">{job.description.substring(0, 150)}...</p>
                                    </div>

                                    {job.skills && job.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {job.skills.slice(0, 3).map((skill, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills.length > 3 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    +{job.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {job.views}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                    </svg>
                                                    {job.applicationsCount}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/job/${job._id}`)}
                                                className={`px-3 py-1 rounded-md transition-colors text-xs font-medium ${
                                                    !job.isActive 
                                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                                disabled={!job.isActive}
                                            >
                                                {!job.isActive ? 'Unavailable' : 'View'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">{formatDate(job.datePosted)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Load More Button */}
                    {pagination.hasMore && jobs.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className={`px-6 py-3 rounded-lg border transition-colors ${
                                    loading
                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                        : 'border-blue-600 text-blue-600 hover:bg-blue-50 bg-white'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        Loading more jobs...
                                    </div>
                                ) : (
                                    'Load More Jobs'
                                )}
                            </button>
                        </div>
                    )}

                    {/* End of results message */}
                    {!pagination.hasMore && jobs.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">You've reached the end of the job listings.</p>
                        </div>
                    )}

                    {/* Loading indicator for initial load */}
                    {loading && jobs.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                                <span className="text-gray-600 text-lg">Loading jobs...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobList;
