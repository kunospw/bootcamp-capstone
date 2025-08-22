import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaDownload, FaUsers, FaChartLine, FaStar, FaSort } from 'react-icons/fa'
import SideBar from '../../Components/SideBar'

const Applications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('score');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusCounts, setStatusCounts] = useState({});
    const [stats, setStats] = useState({});
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [useSmartAnalysis, setUseSmartAnalysis] = useState(false);

    // Fetch applications from backend (with optional CV analysis)
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            if (useSmartAnalysis) {
                setAnalysisLoading(true);
            }
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view applications');
                return;
            }

            const params = new URLSearchParams({
                page: currentPage,
                limit: 6
            });

            if (filter !== 'all') {
                params.append('status', filter);
            }

            // Add sortBy for smart analysis
            if (useSmartAnalysis) {
                params.append('sortBy', sortBy);
            }

            // Choose endpoint based on analysis mode
            const endpoint = useSmartAnalysis 
                ? 'company-applications-with-analysis'
                : 'company-applications';

            const response = await fetch(`http://localhost:3000/api/applications/${endpoint}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    setError('Session expired. Please log in again.');
                    return;
                }
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();
            setApplications(data.applications);
            setTotalPages(data.totalPages);
            
            // Handle stats for smart analysis
            if (useSmartAnalysis && data.stats) {
                setStats(data.stats);
            }
            
            // Calculate status counts from current applications if no specific endpoint
            if (filter === 'all') {
                const counts = {};
                data.applications?.forEach(app => {
                    counts[app.status] = (counts[app.status] || 0) + 1;
                });
                setStatusCounts(counts);
            }
            
            setError(null);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
            setAnalysisLoading(false);
        }
    }, [currentPage, filter, useSmartAnalysis, sortBy]);

    // Fetch status counts
    const fetchStatusCounts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:3000/api/applications/company-applications/status-counts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStatusCounts(data.statusCounts || {});
            }
        } catch (err) {
            console.error('Error fetching status counts:', err);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        fetchStatusCounts();
    }, [fetchStatusCounts]);

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'reviewing': 'bg-blue-100 text-blue-800',
            'shortlisted': 'bg-purple-100 text-purple-800',
            'interview': 'bg-indigo-100 text-indigo-800',
            'offered': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'withdrawn': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getScoreBadgeColor = (score) => {
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadResume = (application) => {
        if (application.resume) {
            const link = document.createElement('a');
            link.href = `http://localhost:3000/${application.resume}`;
            link.download = application.resume.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                                    {useSmartAnalysis ? (
                                        <>
                                            <FaChartLine className="mr-3 text-blue-600" />
                                            Smart CV Analysis
                                        </>
                                    ) : (
                                        <>
                                            <FaUsers className="mr-3 text-gray-600" />
                                            Applications
                                        </>
                                    )}
                                </h1>
                                <p className="text-gray-600">
                                    {useSmartAnalysis 
                                        ? 'AI-powered candidate ranking based on CV skills matching'
                                        : 'Review and manage job applications from candidates'
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {analysisLoading && (
                                    <div className="flex items-center text-blue-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        <span className="text-sm">Analyzing CVs...</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Smart Analysis</span>
                                    <button
                                        onClick={() => {
                                            setUseSmartAnalysis(!useSmartAnalysis);
                                            setCurrentPage(1);
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            useSmartAnalysis ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`${
                                                useSmartAnalysis ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards - Only show when smart analysis is enabled */}
                    {useSmartAnalysis && stats.totalApplications > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FaUsers className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Total Applications</p>
                                        <p className="text-lg font-semibold text-gray-900">{stats.totalApplications}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <FaStar className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">High Match (80%+)</p>
                                        <p className="text-lg font-semibold text-green-600">{stats.highScoreCount}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <FaChartLine className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Average Score</p>
                                        <p className="text-lg font-semibold text-yellow-600">{stats.averageScore}%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FaSort className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Medium Match</p>
                                        <p className="text-lg font-semibold text-purple-600">{stats.mediumScoreCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applications Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Content - Applications List */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                <span className="flex items-center gap-2">
                                    Applications 
                                    {applications.length > 0 && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                                            {applications.length}
                                        </span>
                                    )}
                                </span>
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                <select 
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filter}
                                    onChange={(e) => {
                                        setFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Applications</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Under Review</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="interview">Interview</option>
                                    <option value="offered">Offered</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                
                                {/* Show sorting options only when smart analysis is enabled */}
                                {useSmartAnalysis && (
                                    <select 
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={sortBy}
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="score">Overall Match Score</option>
                                        <option value="skills">Skills Match</option>
                                        <option value="experience">Experience Level</option>
                                        <option value="date">Application Date</option>
                                    </select>
                                )}
                                
                                {useSmartAnalysis && (
                                    <button
                                        onClick={() => {
                                            setCurrentPage(1);
                                            fetchApplications();
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Refresh Analysis
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading applications...</p>
                            </div>
                        ) : applications.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FaUsers className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications received</h3>
                                <p className="text-gray-600 mb-4">Applications will appear here when candidates apply to your job postings.</p>
                                <button 
                                    onClick={() => navigate('/company/jobs')}
                                    className="bg-[#F4B400] text-black px-6 py-1 rounded-lg hover:bg-[#E6A200] transition-colors"
                                >
                                    View Job Postings
                                </button>
                            </div>
                        ) : (
                            /* Applications Grid - 2 columns layout */
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {applications.map((application) => (
                                    <div key={application._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-semibold text-sm">
                                                            {(application.userId?.fullName || application.fullName)?.split(' ').map(n => n[0]).join('') || 'U'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {application.userId?.fullName || application.fullName || 'No Name'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {application.userId?.email || application.email}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                            {application.status}
                                                        </span>
                                                        {useSmartAnalysis && application.cvAnalysis && (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getScoreBadgeColor(application.cvAnalysis.overallScore || 0)}`}>
                                                                {application.cvAnalysis.overallScore || 0}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">Applied for:</span>
                                                        <span className="text-xs font-medium text-gray-900 truncate">
                                                            {application.jobId?.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">Applied:</span>
                                                        <span className="text-xs font-medium text-gray-900">
                                                            {formatDate(application.applicationDate)}
                                                        </span>
                                                    </div>
                                                    {useSmartAnalysis && application.cvAnalysis && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">Skills Match:</span>
                                                            <span className="text-xs font-medium text-gray-900">
                                                                {application.cvAnalysis.skillMatch?.matchPercentage || 0}%
                                                            </span>
                                                        </div>
                                                    )}
                                                    {application.domicile && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">Location:</span>
                                                            <span className="text-xs font-medium text-gray-900">{application.domicile}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Skills Analysis - Only show when smart analysis is enabled */}
                                                {useSmartAnalysis && application.cvAnalysis && (
                                                    <div className="border-t border-gray-100 pt-3 mb-3">
                                                        <div className="space-y-2">
                                                            {/* Matching Skills */}
                                                            {application.cvAnalysis.skillMatch?.matchingSkills?.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                                                        Matching Skills ({application.cvAnalysis.skillMatch.matchingSkills.length})
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {application.cvAnalysis.skillMatch.matchingSkills.slice(0, 3).map((skill, index) => (
                                                                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                                {skill}
                                                                            </span>
                                                                        ))}
                                                                        {application.cvAnalysis.skillMatch.matchingSkills.length > 3 && (
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                                                +{application.cvAnalysis.skillMatch.matchingSkills.length - 3}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Missing Skills */}
                                                            {application.cvAnalysis.skillMatch?.missingSkills?.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                                                                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                                                                        Skills Gap ({application.cvAnalysis.skillMatch.missingSkills.length})
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {application.cvAnalysis.skillMatch.missingSkills.slice(0, 3).map((skill, index) => (
                                                                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                                {skill}
                                                                            </span>
                                                                        ))}
                                                                        {application.cvAnalysis.skillMatch.missingSkills.length > 3 && (
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                                                +{application.cvAnalysis.skillMatch.missingSkills.length - 3}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Regular Cover Letter - Only show when not using smart analysis or no analysis data */}
                                                {(!useSmartAnalysis || !application.cvAnalysis) && application.coverLetter && (
                                                    <div className="text-sm text-gray-700 mb-3">
                                                        <p className="text-xs font-medium text-gray-500 mb-1">Cover Letter:</p>
                                                        <p className="line-clamp-2 text-xs">{application.coverLetter}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => navigate(`/company/applications/${application._id}`)}
                                                    title="View Details"
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
                                            {useSmartAnalysis && application.cvAnalysis && (
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500">
                                                        Overall Match: {application.cvAnalysis.overallScore || 0}%
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Experience: {application.cvAnalysis.experienceLevelMatch || 0}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && applications.length > 0 && totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                                onClick={() => setCurrentPage(page)}
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
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                            </div>
                        </div>

                        {/* Sidebar - Status Information */}
                        <div className="lg:col-span-1">
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

export default Applications
