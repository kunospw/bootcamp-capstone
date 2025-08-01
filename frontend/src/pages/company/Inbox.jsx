import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../../Components/SideBar'

const Inbox = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch applications from backend
    useEffect(() => {
        fetchApplications();
    }, [currentPage, filter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view applications');
                return;
            }

            const params = new URLSearchParams({
                page: currentPage,
                limit: 10
            });

            if (filter !== 'all') {
                params.append('status', filter);
            }

            const response = await fetch(`http://localhost:3000/api/applications/company-applications?${params}`, {
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
            setError(null);
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (applicationId, newStatus, note = '') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus, note })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Refresh applications
            fetchApplications();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update application status');
        }
    };

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Applications</h1>
                        <p className="text-gray-600">Review and manage job applications from candidates</p>
                    </div>

                    {/* Applications Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Applications {applications.length > 0 ? `(${applications.length})` : ''}
                            </h2>
                            <div className="flex gap-2">
                                <select 
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all">All Applications</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Under Review</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="interview">Interview</option>
                                    <option value="offered">Offered</option>
                                    <option value="rejected">Rejected</option>
                                </select>
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
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications received</h3>
                                <p className="text-gray-600 mb-4">Applications will appear here when candidates apply to your job postings.</p>
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    View Job Postings
                                </button>
                            </div>
                        ) : (
                            /* Applications List */
                            <div className="space-y-4">
                                {applications.map((application) => (
                                    <div key={application._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {application.userId?.fullName || application.fullName}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Applied for: <span className="font-medium">{application.jobId?.title}</span>
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Applied on: {formatDate(application.applicationDate)}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                    value={application.status}
                                                    onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="reviewing">Under Review</option>
                                                    <option value="shortlisted">Shortlisted</option>
                                                    <option value="interview">Interview</option>
                                                    <option value="offered">Offered</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="text-sm font-medium">{application.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="text-sm font-medium">{application.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Location</p>
                                                <p className="text-sm font-medium">{application.domicile}</p>
                                            </div>
                                        </div>

                                        {application.experienceLevel && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500">Experience Level</p>
                                                <p className="text-sm font-medium">{application.experienceLevel}</p>
                                            </div>
                                        )}

                                        {application.expectedSalary && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500">Expected Salary</p>
                                                <p className="text-sm font-medium">
                                                    {application.expectedSalary.currency} {application.expectedSalary.amount?.toLocaleString()} per {application.expectedSalary.period}
                                                </p>
                                            </div>
                                        )}

                                        {application.skills && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500">Skills</p>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                    {application.skills}
                                                </p>
                                            </div>
                                        )}

                                        {application.coverLetter && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-1">Cover Letter</p>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                    {application.coverLetter.length > 200 
                                                        ? application.coverLetter.substring(0, 200) + '...' 
                                                        : application.coverLetter
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                            <div className="flex gap-2">
                                                {application.resume && (
                                                    <a 
                                                        href={`http://localhost:3000/${application.resume}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        📄 View Resume
                                                    </a>
                                                )}
                                            </div>
                                            <button 
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                onClick={() => navigate(`/company/applicants/${application._id}`)}
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && applications.length > 0 && totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Inbox