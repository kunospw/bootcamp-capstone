import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SideBar from '../../Components/SideBar'
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaDollarSign, FaUsers, FaEdit, FaTrash, FaEye, FaDownload, FaEnvelope, FaPhone, FaGraduationCap, FaHome } from 'react-icons/fa'

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('job-info');
    const [currentPage, setCurrentPage] = useState(1);
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsTotal, setApplicationsTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [statusCounts, setStatusCounts] = useState({});
    const applicantsPerPage = 6;

    // Fetch job data and applications count from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/signin');
                    return;
                }

                // Fetch job data
                const jobResponse = await fetch(`https://api.sonervous.site/api/jobs/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (jobResponse.ok) {
                    const jobData = await jobResponse.json();
                    setJob(jobData);
                    setError('');
                } else {
                    const errorData = await jobResponse.json();
                    setError(errorData.message || 'Failed to fetch job data');
                    return;
                }

                // Fetch applications count (just the total, not the full data)
                const applicationsResponse = await fetch(`https://api.sonervous.site/api/applications/company-applications?jobId=${id}&page=1&limit=1`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (applicationsResponse.ok) {
                    const applicationsData = await applicationsResponse.json();
                    setApplicationsTotal(applicationsData.total || 0);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load job data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const fetchApplications = useCallback(async () => {
        try {
            setApplicationsLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await fetch(`https://api.sonervous.site/api/applications/company-applications?jobId=${id}&page=${currentPage}&limit=${applicantsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
                // Update total only if we get valid data
                if (data.total !== undefined) {
                    setApplicationsTotal(data.total);
                }
            } else {
                console.error('Failed to fetch applications');
                setApplications([]);
                // Don't reset total to 0 on error, keep existing value
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setApplications([]);
            // Don't reset total to 0 on error, keep existing value
        } finally {
            setApplicationsLoading(false);
        }
    }, [id, currentPage, navigate]);

    // Fetch status counts for the specific job
    const fetchStatusCounts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`https://api.sonervous.site/api/applications/company-applications?jobId=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Calculate status counts from all applications for this job
                const counts = {};
                data.applications?.forEach(app => {
                    counts[app.status] = (counts[app.status] || 0) + 1;
                });
                setStatusCounts(counts);
            }
        } catch (err) {
            console.error('Error fetching status counts:', err);
        }
    }, [id]);

    // Fetch applications data when applicants tab is active
    useEffect(() => {
        if (activeTab === 'applicants') {
            fetchApplications();
        }
    }, [activeTab, fetchApplications]);

    // Fetch status counts when component mounts or id changes
    useEffect(() => {
        fetchStatusCounts();
    }, [fetchStatusCounts]);

    // Handle loading and error states
    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading job details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                    <div className="p-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {error ? 'Error Loading Job' : 'Job Not Found'}
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {error || "The job you're looking for doesn't exist."}
                            </p>
                            <button
                                onClick={() => navigate('/company/jobs')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Back to Job List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (date) => {
        const jobDate = new Date(date);
        return jobDate.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatSalary = (salaryObj) => {
        if (!salaryObj) return 'Salary not specified';
        
        const { min, max, currency = 'IDR', period = 'monthly' } = salaryObj;
        const periodText = period === 'monthly' ? '/month' : period === 'yearly' ? '/year' : '/hour';
        
        if (min && max) {
            return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} ${periodText}`;
        } else if (min) {
            return `${currency} ${min.toLocaleString()}+ ${periodText}`;
        } else if (max) {
            return `Up to ${currency} ${max.toLocaleString()} ${periodText}`;
        }
        return 'Salary not specified';
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

    const formatExperienceLevel = (level) => {
        const levelMap = {
            'entry': 'Entry Level',
            'mid': 'Mid Level',
            'senior': 'Senior Level',
            'lead': 'Lead Level',
            'executive': 'Executive Level'
        };
        return levelMap[level] || level;
    };

    // Handler functions for job actions
    const handleEditJob = () => {
        navigate(`/company/jobs/edit/${id}`);
    };

    const handleDeleteJob = async () => {
        if (!window.confirm('Are you sure you want to delete this job?')) {
            return;
        }

        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`https://api.sonervous.site/api/jobs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Navigate back to job list after successful deletion
                navigate('/company/jobs');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to delete job');
            }
        } catch (err) {
            console.error('Error deleting job:', err);
            alert('Failed to delete job');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleJobStatus = async () => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`https://api.sonervous.site/api/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isActive: !job.isActive
                })
            });

            if (response.ok) {
                const updatedJob = await response.json();
                setJob(updatedJob);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to update job status');
            }
        } catch (err) {
            console.error('Error updating job status:', err);
            alert('Failed to update job status');
        } finally {
            setActionLoading(false);
        }
    };

    // Pagination logic for applicants
    const totalPages = Math.ceil(applicationsTotal / applicantsPerPage);
    const startIndex = (currentPage - 1) * applicantsPerPage;
    const endIndex = startIndex + applicantsPerPage;
    
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Helper functions for applications
    const getStatusColor = (status) => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'reviewed': 'bg-blue-100 text-blue-800',
            'shortlisted': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'accepted': 'bg-purple-100 text-purple-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const statusTexts = {
            'pending': 'Pending',
            'reviewed': 'Reviewed',
            'shortlisted': 'Shortlisted',
            'rejected': 'Rejected',
            'accepted': 'Accepted'
        };
        return statusTexts[status] || status;
    };

    const handleViewApplicationDetail = (application) => {
        navigate(`/company/applications/${application._id}`);
    };

    const handleDownloadResume = (application) => {
        if (application.resume) {
            const link = document.createElement('a');
            link.href = `https://api.sonervous.site/${application.resume}`;
            link.download = application.resume.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideBar />

            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/company/jobs')}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    <FaArrowLeft className="w-4 h-4" />
                                    Back to Jobs
                                </button>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                    <p className="text-gray-600">Job Details & Management</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Tab Navigation */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="flex bg-gray-50 relative">
                                    <button
                                        onClick={() => setActiveTab('job-info')}
                                        className={`relative px-6 py-3 text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'job-info'
                                                ? 'bg-white text-gray-900 rounded-t-lg border-l border-r border-t border-gray-200 z-10 -mb-px'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg mx-0.5'
                                        }`}
                                        style={activeTab === 'job-info' ? { borderBottom: '1px solid white' } : {}}
                                    >
                                        Job Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('applicants')}
                                        className={`relative px-6 py-3 text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'applicants'
                                                ? 'bg-white text-gray-900 rounded-t-lg border-l border-r border-t border-gray-200 z-10 -mb-px'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-lg mx-0.5'
                                        }`}
                                        style={activeTab === 'applicants' ? { borderBottom: '1px solid white' } : {}}
                                    >
                                        <span className="flex items-center gap-2">
                                            Applicants 
                                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                                                {applicationsTotal}
                                            </span>
                                        </span>
                                    </button>
                                    {/* Bottom border for inactive area */}
                                    <div className="flex-1 border-b border-gray-200"></div>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === 'job-info' ? (
                                        <div className="space-y-6">
                                            {/* Job Overview */}
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Overview</h2>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                                            <FaMapMarkerAlt className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Location</p>
                                                            <p className="font-medium text-gray-900">{job.location}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                                            <FaClock className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Job Type</p>
                                                            <p className="font-medium text-gray-900">{formatJobType(job.type)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                                                            <FaUsers className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Experience Level</p>
                                                            <p className="font-medium text-gray-900">{formatExperienceLevel(job.experienceLevel)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                                                            <FaDollarSign className="w-5 h-5 text-yellow-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Salary Range</p>
                                                            <p className="font-medium text-gray-900">{formatSalary(job.salary)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                                                            <FaGraduationCap className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Major/Field</p>
                                                            <p className="font-medium text-gray-900">{job.major}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                                                            <FaHome className="w-5 h-5 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Work Location</p>
                                                            <p className="font-medium text-gray-900">{formatWorkLocation(job.workLocation)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-200 pt-4 mb-6">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                                    <div className="text-gray-700 leading-relaxed space-y-3">
                                                        {job.description.split('\n').map((paragraph, index) => (
                                                            paragraph.trim() && (
                                                                <p key={index} className="text-gray-700 leading-relaxed">
                                                                    {paragraph.trim()}
                                                                </p>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Requirements */}
                                                <div className="border-t border-gray-200 pt-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                                                    <ul className="space-y-3">
                                                        {job.requirements.map((req, index) => (
                                                            <li key={index} className="flex items-start gap-3">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                <span className="text-gray-700">{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Benefits */}
                                                {job.benefits && job.benefits.length > 0 && (
                                                    <div className="border-t border-gray-200 pt-4">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                                                        <ul className="space-y-3">
                                                            {job.benefits.map((benefit, index) => (
                                                                <li key={index} className="flex items-start gap-3">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    <span className="text-gray-700">{benefit}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Applicants Header */}
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-semibold text-gray-900">Job Applicants</h2>
                                                <div className="text-sm text-gray-600">
                                                    Showing {startIndex + 1}-{Math.min(endIndex, applicationsTotal)} of {applicationsTotal} applicants
                                                </div>
                                            </div>

                                            {/* Applicants Grid */}
                                            {/* Applications List */}
                                            {applicationsLoading ? (
                                                <div className="text-center py-12">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                    <p className="text-gray-600">Loading applications...</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {applications.map((application) => (
                                                        <div key={application._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-3">
                                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                            <span className="text-blue-600 font-semibold text-sm">
                                                                                {application.userId?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h3 className="font-semibold text-gray-900 truncate">{application.userId?.fullName || 'No Name'}</h3>
                                                                            <p className="text-sm text-gray-600 truncate">{application.userId?.email || application.email}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-2 mb-3">
                                                                        {application.userId?.phoneNumber && (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs text-gray-500">Phone:</span>
                                                                                <span className="text-xs font-medium text-gray-900">{application.userId.phoneNumber}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-500">Applied:</span>
                                                                            <span className="text-xs font-medium text-gray-900">
                                                                                {formatDate(application.applicationDate)}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {application.coverLetter && (
                                                                        <div className="text-sm text-gray-700 mb-3">
                                                                            <p className="text-xs text-gray-500 mb-1">Cover Letter</p>
                                                                            <p className="line-clamp-2 text-xs">{application.coverLetter}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                                    {getStatusText(application.status)}
                                                                </div>
                                                                
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={() => handleViewApplicationDetail(application)}
                                                                        title="View Application Details"
                                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                                                                    >
                                                                        <FaEye className="w-3 h-3" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDownloadResume(application)}
                                                                        title="Download Resume"
                                                                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors cursor-pointer"
                                                                        disabled={!application.resume}
                                                                    >
                                                                        <FaDownload className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex justify-center items-center space-x-2 mt-6">
                                                    <button
                                                        onClick={handlePrevPage}
                                                        disabled={currentPage === 1}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === 1
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Previous
                                                    </button>

                                                    <div className="flex space-x-1">
                                                        {Array.from({ length: totalPages }, (_, index) => {
                                                            const page = index + 1;
                                                            return (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => goToPage(page)}
                                                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                                                        currentPage === page
                                                                            ? 'bg-blue-600 text-white'
                                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <button
                                                        onClick={handleNextPage}
                                                        disabled={currentPage === totalPages}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === totalPages
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}

                                            {applications.length === 0 && !applicationsLoading && (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <FaUsers className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants yet</h3>
                                                    <p className="text-gray-600">When people apply for this job, you'll see them here.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            {(job.contactEmail || job.contactPhone) && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {job.contactEmail && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                                    <FaEnvelope className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium text-gray-900">{job.contactEmail}</p>
                                                </div>
                                            </div>
                                        )}

                                        {job.contactPhone && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                                    <FaPhone className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                    <p className="font-medium text-gray-900">{job.contactPhone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Job Status */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Status</span>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${job.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-gray-400'
                                                }`}></div>
                                            {job.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Posted Date</span>
                                        <span className="font-medium text-gray-900">{formatDate(job.datePosted)}</span>
                                    </div>

                                    {job.applicationDeadline && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Deadline</span>
                                            <span className="font-medium text-gray-900">{formatDate(job.applicationDeadline)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex gap-2">   
                                    <button 
                                        onClick={handleEditJob}
                                        disabled={actionLoading}
                                        className="flex-1 flex cursor-pointer items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        <FaEdit className="w-3 h-3" />
                                        Edit
                                    </button>
                                    <button 
                                        onClick={handleDeleteJob}
                                        disabled={actionLoading}
                                        className="flex-1 flex cursor-pointer items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        <FaTrash className="w-3 h-3" />
                                        {actionLoading ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button 
                                        onClick={handleToggleJobStatus}
                                        disabled={actionLoading}
                                        className="flex-1 flex cursor-pointer items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        <FaClock className="w-3 h-3" />
                                        {actionLoading ? 'Updating...' : (job.isActive ? 'Deactivate' : 'Activate')}
                                    </button>
                                </div>
                            </div>

                            {/* Application Status Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-yellow-800">Pending</span>
                                        </div>
                                        <span className="text-sm font-bold text-yellow-800">
                                            {statusCounts.pending || 0}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-blue-800">Under Review</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-800">
                                            {statusCounts.reviewing || 0}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-purple-800">Shortlisted</span>
                                        </div>
                                        <span className="text-sm font-bold text-purple-800">
                                            {statusCounts.shortlisted || 0}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-indigo-800">Interview</span>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-800">
                                            {statusCounts.interview || 0}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-green-800">Offered</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-800">
                                            {statusCounts.offered || 0}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-red-800">Rejected</span>
                                        </div>
                                        <span className="text-sm font-bold text-red-800">
                                            {statusCounts.rejected || 0}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Total Applications</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {Object.values(statusCounts).reduce((sum, count) => sum + count, 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDetail