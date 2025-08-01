import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';

const ApplicantsDetail = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusNote, setStatusNote] = useState('');
    const [companyNote, setCompanyNote] = useState('');
    const [showNoteForm, setShowNoteForm] = useState(false);

    // Fetch application details
    useEffect(() => {
        fetchApplicationDetails();
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view application details');
                return;
            }

            const response = await fetch(`http://localhost:3000/api/applications/company/${applicationId}`, {
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
                throw new Error('Failed to fetch application details');
            }

            const data = await response.json();
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching application details:', err);
            setError('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: newStatus, 
                    note: statusNote 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Refresh application data
            fetchApplicationDetails();
            setStatusNote('');
            alert('Application status updated successfully!');
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update application status');
        }
    };

    const addCompanyNote = async () => {
        try {
            if (!companyNote.trim()) {
                alert('Please enter a note');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/note`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note: companyNote })
            });

            if (!response.ok) {
                throw new Error('Failed to add note');
            }

            // Refresh application data
            fetchApplicationDetails();
            setCompanyNote('');
            setShowNoteForm(false);
            alert('Note added successfully!');
        } catch (err) {
            console.error('Error adding note:', err);
            alert('Failed to add note');
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading application details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 flex items-center justify-center">
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <p className="text-red-800 mb-4">{error}</p>
                            <button 
                                onClick={() => navigate('/company/inbox')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Back to Applications
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Application not found</p>
                        <button 
                            onClick={() => navigate('/company/inbox')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Back to Applications
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <button 
                                    onClick={() => navigate('/company/inbox')}
                                    className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
                                >
                                    ← Back to Applications
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {application.userId?.fullName || application.fullName}
                                </h1>
                                <p className="text-gray-600">
                                    Applied for: <span className="font-medium">{application.jobId?.title}</span>
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium">{application.userId?.fullName || application.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{application.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="font-medium">{application.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{application.domicile}</p>
                                    </div>
                                    {application.experienceLevel && (
                                        <div>
                                            <p className="text-sm text-gray-500">Experience Level</p>
                                            <p className="font-medium">{application.experienceLevel}</p>
                                        </div>
                                    )}
                                    {application.availableStartDate && (
                                        <div>
                                            <p className="text-sm text-gray-500">Available Start Date</p>
                                            <p className="font-medium">{formatDate(application.availableStartDate)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expected Salary */}
                            {application.expectedSalary && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Salary</h2>
                                    <p className="text-lg font-medium text-green-600">
                                        {application.expectedSalary.currency} {application.expectedSalary.amount?.toLocaleString()} per {application.expectedSalary.period}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            {application.skills && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 whitespace-pre-wrap">{application.skills}</p>
                                    </div>
                                </div>
                            )}

                            {/* Cover Letter */}
                            {application.coverLetter && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h2>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                                    </div>
                                </div>
                            )}

                            {/* Personal Statement */}
                            {application.personalStatement && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Statement</h2>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 whitespace-pre-wrap">{application.personalStatement}</p>
                                    </div>
                                </div>
                            )}

                            {/* Resume */}
                            {application.resume && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
                                    <a 
                                        href={`http://localhost:3000/${application.resume}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        📄 Download Resume
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Application Info */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Info</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Applied on</p>
                                        <p className="font-medium">{formatDate(application.applicationDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Current Status</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Update Status */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                                <div className="space-y-3">
                                    <textarea
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        placeholder="Add a note (optional)"
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                        rows="2"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => updateApplicationStatus('reviewing')}
                                            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                                        >
                                            Review
                                        </button>
                                        <button
                                            onClick={() => updateApplicationStatus('shortlisted')}
                                            className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            onClick={() => updateApplicationStatus('interview')}
                                            className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                                        >
                                            Interview
                                        </button>
                                        <button
                                            onClick={() => updateApplicationStatus('offered')}
                                            className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                                        >
                                            Offer
                                        </button>
                                        <button
                                            onClick={() => updateApplicationStatus('rejected')}
                                            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Company Notes */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Company Notes</h3>
                                    <button
                                        onClick={() => setShowNoteForm(!showNoteForm)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        + Add Note
                                    </button>
                                </div>

                                {showNoteForm && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded">
                                        <textarea
                                            value={companyNote}
                                            onChange={(e) => setCompanyNote(e.target.value)}
                                            placeholder="Enter your note here..."
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                            rows="3"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={addCompanyNote}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowNoteForm(false);
                                                    setCompanyNote('');
                                                }}
                                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {application.companyNotes && application.companyNotes.length > 0 ? (
                                        application.companyNotes.map((note, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded">
                                                <p className="text-sm text-gray-700 mb-1">{note.note}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(note.createdAt)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No notes yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Status History */}
                            {application.statusHistory && application.statusHistory.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
                                    <div className="space-y-3">
                                        {application.statusHistory.map((history, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(history.status).split(' ')[0]}`}></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-medium capitalize">{history.status}</span>
                                                        <span className="text-xs text-gray-500">{formatDate(history.date)}</span>
                                                    </div>
                                                    {history.note && (
                                                        <p className="text-xs text-gray-600 mt-1">{history.note}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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

export default ApplicantsDetail;
