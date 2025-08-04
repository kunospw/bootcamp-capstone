import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import FloatingDecorations from '../../Components/FloatingDecorations';
import SaveJobForm from '../../Components/SaveJobForm'; // Change from SaveJobModal

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
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
        hasMore: true,
    });
    
    // Save job functionality
    const [saveJobForms, setSaveJobForms] = useState(new Set()); // Track which jobs have forms open
    const [editingJobs, setEditingJobs] = useState(new Map()); // Track which jobs are being edited
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    // Load saved jobs status when authenticated
    useEffect(() => {
        if (isAuthenticated && jobs.length > 0) {
            checkSavedJobsStatus();
        }
    }, [isAuthenticated, jobs]);

    // Check which jobs are already saved and get their details
    const checkSavedJobsStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const savedJobsMap = new Map();
            
            // Check each job to see if it's saved and get the saved job details
            for (const job of jobs) {
                try {
                    const response = await fetch(`http://localhost:3000/api/saved-jobs/check/${job._id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.isSaved && data.savedJob) {
                            savedJobsMap.set(job._id, data.savedJob);
                        }
                    }
                } catch (error) {
                    console.error(`Error checking saved status for job ${job._id}:`, error);
                }
            }
            
            setSavedJobs(new Set(savedJobsMap.keys()));
            setSavedJobDetails(savedJobsMap); // New state to store saved job details
        } catch (error) {
            console.error('Error checking saved jobs status:', error);
        }
    };

    // Add new state for saved job details
    const [savedJobDetails, setSavedJobDetails] = useState(new Map());

    // Load jobs on component mount
    useEffect(() => {
        const loadJobs = async () => {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    page: '1',
                    limit: '15',
                    includeInactive: 'true'
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
    }, []);

    // Fetch jobs from the API
    const fetchJobs = async (page = 1, append = false) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                includeInactive: 'true',
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

    // Handle save job - show inline form
    const handleSaveJob = (job) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        // Toggle form visibility
        setSaveJobForms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(job._id)) {
                newSet.delete(job._id);
                setEditingJobs(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(job._id);
                    return newMap;
                });
            } else {
                newSet.add(job._id);
            }
            return newSet;
        });
    };

    // Handle edit saved job note
    const handleEditSavedJob = (job, savedJob) => {
        setSaveJobForms(prev => new Set([...prev, job._id]));
        setEditingJobs(prev => new Map([...prev, [job._id, savedJob]]));
    };

    // Handle cancel save job form
    const handleCancelSaveJob = (jobId) => {
        setSaveJobForms(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
        });
        setEditingJobs(prev => {
            const newMap = new Map(prev);
            newMap.delete(jobId);
            return newMap;
        });
    };

    // Handle save job submission
    const handleSaveJobSubmit = async (saveData) => {
        try {
            const token = localStorage.getItem('token');
            const existingSave = editingJobs.get(saveData.jobId);
            
            let response;
            if (existingSave) {
                // Update existing saved job
                response = await fetch(`http://localhost:3000/api/saved-jobs/${existingSave._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(saveData)
                });
            } else {
                // Create new saved job
                response = await fetch('http://localhost:3000/api/saved-jobs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(saveData)
                });
            }

            const result = await response.json();

            if (response.ok) {
                setSavedJobs(prev => new Set([...prev, saveData.jobId]));
                setSavedJobDetails(prev => new Map([...prev, [saveData.jobId, result.savedJob]]));
                
                // Hide the form
                setSaveJobForms(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(saveData.jobId);
                    return newSet;
                });
                setEditingJobs(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(saveData.jobId);
                    return newMap;
                });
                
                // Success notification
                showNotification('success', existingSave ? 'Note updated successfully!' : 'Job saved successfully!');
            } else {
                if (response.status === 409) {
                    showNotification('warning', 'Job is already saved!');
                } else {
                    throw new Error(result.message);
                }
            }
        } catch (error) {
            console.error('Error saving job:', error);
            showNotification('error', 'Failed to save job. Please try again.');
        }
    };

    // Helper function for notifications 
    const showNotification = (type, message) => {
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-700',
            warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
            error: 'bg-red-100 border-red-400 text-red-700'
        };
        
        const icons = {
            success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
            warning: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
            error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} px-4 py-3 rounded-lg shadow-lg z-50`;
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
            document.body.removeChild(notification);
        }, 3000);
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

    if (loading && jobs.length === 0) {
        return <div>Loading jobs...</div>;
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
                        <h1 className="text-4xl font-bold text-white mb-4">Find Your Dream Job</h1>
                        <p className="text-lg text-blue-100">Discover opportunities that match your skills and interests</p>
                    </div>

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
                        </form>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm8-8a8 8 0 11-16 0 8 8 0 0116 0zM10 11a1 1 0 100-2 1 1 0 000 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V4a1 1 0 00-1-1z" clipRule="evenodd" />
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

                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">
                            Found <span className="font-semibold text-gray-900">{pagination.total}</span> jobs
                        </p>
                    </div>

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
                                <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    {/* Existing job card content */}
                                    <div className={`p-4 ${!job.canApply ? 'opacity-75' : ''}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start space-x-3 flex-1">
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
                                                        className="text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                                                    >
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1 truncate">{job.companyId?.companyName || 'Unknown Company'}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Job Status Badge */}
                                            {!job.canApply && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                                                    {job.isExpired ? 'Expired' : 'Inactive'}
                                                </span>
                                            )}
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
                                                <div className="flex items-center gap-2">
                                                    {isAuthenticated && (
                                                        <button
                                                            onClick={() => savedJobs.has(job._id) ? handleUnsaveJob(job._id) : handleSaveJob(job)}
                                                            className={`p-1 rounded-md transition-colors ${
                                                                savedJobs.has(job._id)
                                                                    ? 'text-yellow-600 hover:text-yellow-700'
                                                                    : 'text-gray-400 hover:text-yellow-600'
                                                            }`}
                                                            title={savedJobs.has(job._id) ? 'Remove from saved' : 'Save job'}
                                                        >
                                                            <svg className="w-4 h-4" fill={savedJobs.has(job._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => navigate(`/job/${job._id}`)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-gray-400">{formatDate(job.datePosted)}</p>
                                                {job.applicationDeadline && (
                                                    <p className={`text-xs ${job.canApply ? 'text-gray-500' : 'text-red-500'}`}>
                                                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inline Save Job Form */}
                                    <SaveJobForm
                                        job={job}
                                        onSave={handleSaveJobSubmit}
                                        onCancel={() => handleCancelSaveJob(job._id)}
                                        existingSave={editingJobs.get(job._id)}
                                        isVisible={saveJobForms.has(job._id)}
                                    />

                                    {/* Personal Note Comment Section (for saved jobs with notes) */}
                                    {savedJobs.has(job._id) && savedJobDetails.has(job._id) && !saveJobForms.has(job._id) && (
                                        <div className="border-t border-gray-100 bg-blue-50 px-4 py-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <p className="text-sm font-medium text-gray-900">You</p>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            savedJobDetails.get(job._id)?.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                            savedJobDetails.get(job._id)?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {savedJobDetails.get(job._id)?.priority || 'medium'} priority
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            • {new Date(savedJobDetails.get(job._id)?.dateSaved).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    
                                                    {savedJobDetails.get(job._id)?.note && (
                                                        <div className="bg-white rounded-lg p-3 shadow-sm border">
                                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                                {savedJobDetails.get(job._id).note}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {savedJobDetails.get(job._id)?.tags && savedJobDetails.get(job._id).tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {savedJobDetails.get(job._id).tags.map((tag, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                                        <button 
                                                            onClick={() => handleEditSavedJob(job, savedJobDetails.get(job._id))}
                                                            className="hover:text-blue-600 transition-colors"
                                                        >
                                                            Edit note
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUnsaveJob(job._id)}
                                                            className="hover:text-red-600 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

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

                    {!pagination.hasMore && jobs.length > 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">You've reached the end of the job listings.</p>
                        </div>
                    )}

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
