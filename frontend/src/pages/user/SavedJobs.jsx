import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';

const SavedJobs = () => {
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await fetch('http://localhost:3000/api/saved-jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSavedJobs(data.savedJobs);
            } else {
                throw new Error('Failed to fetch saved jobs');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSavedJob = async (savedJobId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/saved-jobs/${savedJobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setSavedJobs(prev => prev.filter(job => job._id !== savedJobId));
                
                // Success notification
                showNotification('success', 'Job removed from saved list!');
            }
        } catch (err) {
            console.error('Error removing saved job:', err);
            showNotification('error', 'Failed to remove job. Please try again.');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function for notifications 
    const showNotification = (type, message) => {
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-700',
            error: 'bg-red-100 border-red-400 text-red-700'
        };
        
        const icons = {
            success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
            error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
        };

        const notification = document.createElement('div');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading saved jobs...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading saved jobs</h3>
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
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
                    <p className="text-gray-600">Jobs you've saved for later review</p>
                </div>
                
                {savedJobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                        <p className="text-gray-500 mb-6">Start saving jobs you're interested in to keep track of them.</p>
                        <button 
                            onClick={() => navigate('/jobs')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {savedJobs.map((savedJob) => (
                            <div key={savedJob._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start space-x-4 flex-1">
                                            {savedJob.jobId.companyId?.profilePicture && (
                                                <img
                                                    src={`http://localhost:3000/${savedJob.jobId.companyId.profilePicture}`}
                                                    alt={savedJob.jobId.companyId.companyName}
                                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    onClick={() => navigate(`/job/${savedJob.jobId._id}`)}
                                                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                                                >
                                                    {savedJob.jobId.title}
                                                </h3>
                                                <p className="text-gray-600 mt-1">{savedJob.jobId.companyId?.companyName}</p>
                                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{savedJob.jobId.location}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{formatSalary(savedJob.jobId.salary)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(savedJob.priority)}`}>
                                                {savedJob.priority} priority
                                            </span>
                                            <button
                                                onClick={() => handleRemoveSavedJob(savedJob._id)}
                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove from saved"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Job Type and Work Location Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
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
                                    {savedJob.note && (
                                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-600 mb-1">Your note:</p>
                                                    <p className="text-sm text-gray-800 leading-relaxed">{savedJob.note}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Tags */}
                                    {savedJob.tags && savedJob.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {savedJob.tags.map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500">
                                            <span>Saved on {new Date(savedJob.dateSaved).toLocaleDateString()}</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/job/${savedJob.jobId._id}`)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            View Job
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;