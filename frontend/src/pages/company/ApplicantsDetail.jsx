import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import { FaArrowLeft, FaDownload, FaEye, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaClock, FaFileAlt, FaSearch, FaStar, FaComments, FaGift, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';

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
    }, [applicationId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view application details');
                return;
            }

            console.log('Fetching application details for ID:', applicationId);
            const response = await fetch(`https://api.sonervous.site/api/applications/company/${applicationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                console.error('Response status:', response.status);
                console.error('Response statusText:', response.statusText);
                
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    // If response is not JSON, use the text as is
                    errorMessage = errorText || errorMessage;
                }
                
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    setError('Session expired. Please log in again.');
                    return;
                }
                if (response.status === 404) {
                    setError('Application not found');
                    return;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Application data received:', data);
            setApplication(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching application details:', err);
            setError(`Failed to load application details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://api.sonervous.site/api/applications/${applicationId}/status`, {
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
            const response = await fetch(`https://api.sonervous.site/api/applications/${applicationId}/note`, {
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
        if (!dateString) return 'Not specified';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
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
                                onClick={() => navigate(-1)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!application && !loading && !error) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Application not found</p>
                        <button 
                            onClick={() => navigate(-1)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Side */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        {/* Back Button */}
                                        <button 
                                            onClick={() => navigate(-1)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-50 transition-colors"
                                            title="Go Back"
                                        >
                                            <FaArrowLeft className="w-4 h-4" />
                                        </button>
                                        
                                        {/* Profile Picture */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                {(application.userId?.fullName || application.fullName || 'A').charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        
                                        {/* Applicant Info */}
                                        <div className="flex-1">
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                {application.userId?.fullName || application.fullName || 'Applicant'}
                                            </h1>
                                            <p className="text-gray-600">
                                                Applied for: <span className="font-medium">{application.jobId?.title || 'Job Position'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                        {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                            {/* Personal Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaUser className="w-5 h-5 text-blue-600" />
                                    Personal Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                            <FaUser className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium text-gray-900">{application.userId?.fullName || application.fullName || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                            <FaEnvelope className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900">{application.userId?.email || application.email || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                                            <FaPhone className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="font-medium text-gray-900">{application.userId?.phoneNumber || application.phoneNumber || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                                            <FaMapMarkerAlt className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Location</p>
                                            <p className="font-medium text-gray-900">{application.domicile || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    
                                    {application.experienceLevel && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                                                <FaClock className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Experience Level</p>
                                                <p className="font-medium text-gray-900">{application.experienceLevel}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {application.availableStartDate && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                                                <FaCalendarAlt className="w-4 h-4 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Available Start Date</p>
                                                <p className="font-medium text-gray-900">{formatDate(application.availableStartDate)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expected Salary */}
                            {application.expectedSalary?.amount && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaDollarSign className="w-5 h-5 text-green-600" />
                                        Expected Salary
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                                            <FaDollarSign className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {application.expectedSalary.currency || 'USD'} {application.expectedSalary.amount?.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-500">per {application.expectedSalary.period || 'month'}</p>
                                        </div>
                                    </div>
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
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume & Documents</h2>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                                            <span className="text-blue-600 font-bold text-sm">PDF</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Resume.pdf</p>
                                            <p className="text-sm text-gray-500">Uploaded on {formatDate(application.applicationDate)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => window.open(`https://api.sonervous.site/${application.resume}`, '_blank')}
                                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                <FaEye className="w-4 h-4" />
                                                View
                                            </button>
                                            <a 
                                                href={`https://api.sonervous.site/${application.resume}`} 
                                                download
                                                className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                <FaDownload className="w-4 h-4" />
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Fixed Position */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-6 space-y-6">
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

                                    <div className="space-y-3 max-h-48 overflow-y-auto">
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

                                {/* Application Progress Roadmap */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                        <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                                        Application Progress
                                    </h3>
                                    
                                    {/* Progress Roadmap */}
                                    <div className="relative mb-6">
                                        {/* Progress Line */}
                                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                                        
                                        {/* Status Steps */}
                                        <div className="space-y-6">
                                            {[
                                                { status: 'pending', label: 'Application Received', icon: FaFileAlt, color: 'text-yellow-600' },
                                                { status: 'reviewing', label: 'Under Review', icon: FaSearch, color: 'text-blue-600' },
                                                { status: 'shortlisted', label: 'Shortlisted', icon: FaStar, color: 'text-purple-600' },
                                                { status: 'interview', label: 'Interview Stage', icon: FaComments, color: 'text-indigo-600' },
                                                ...(application.status === 'rejected' 
                                                    ? [{ status: 'rejected', label: 'Not Selected', icon: FaTimes, color: 'text-red-600' }]
                                                    : [{ status: 'offered', label: 'Job Offered', icon: FaGift, color: 'text-green-600' }]
                                                )
                                            ].map((step) => {
                                                const isCompleted = application.statusHistory?.some(h => h.status === step.status);
                                                const isCurrent = application.status === step.status;
                                                const isRejected = application.status === 'rejected' && step.status === 'rejected';
                                                const isOffered = application.status === 'offered' && step.status === 'offered';
                                                const statusEntry = application.statusHistory?.find(h => h.status === step.status);
                                                
                                                // Check if this step should be marked as completed
                                                // For offered or rejected status, mark the final step as completed
                                                const isFinalCompleted = (application.status === 'offered' && step.status === 'offered') || 
                                                                        (application.status === 'rejected' && step.status === 'rejected');
                                                
                                                return (
                                                    <div key={step.status} className="relative flex items-start">
                                                        {/* Status Circle */}
                                                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                                                            ${isCurrent && !isFinalCompleted
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                                                : isCompleted || isFinalCompleted
                                                                    ? isRejected || isOffered
                                                                        ? (isRejected ? 'bg-red-600 border-red-600 text-white' : 'bg-green-600 border-green-600 text-white')
                                                                        : 'bg-green-600 border-green-600 text-white'
                                                                    : 'bg-gray-100 border-gray-300 text-gray-400'
                                                            }`}
                                                        >
                                                            {isCompleted || isFinalCompleted ? (
                                                                isRejected ? (
                                                                    <FaTimes className="w-4 h-4" />
                                                                ) : (
                                                                    <FaCheck className="w-4 h-4" />
                                                                )
                                                            ) : isCurrent ? (
                                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <step.icon className={`w-4 h-4 ${step.color}`} />
                                                            )}
                                                        </div>
                                                        
                                                        {/* Status Content */}
                                                        <div className="ml-4 flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div className={`font-medium ${isCurrent && !isFinalCompleted ? 'text-blue-600' : isCompleted || isFinalCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                    {step.label}
                                                                    {isCurrent && !isFinalCompleted && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Current</span>}
                                                                    {isFinalCompleted && (
                                                                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                                                            isRejected 
                                                                                ? 'bg-red-100 text-red-600' 
                                                                                : 'bg-green-100 text-green-600'
                                                                        }`}>
                                                                            Completed
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Action Button for each step */}
                                                                {!isCompleted && !isFinalCompleted && (
                                                                    <div className="ml-2">
                                                                        {step.status === 'reviewing' && application.status === 'pending' && (
                                                                            <button
                                                                                onClick={() => updateApplicationStatus('reviewing')}
                                                                                className="flex items-center justify-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors w-16"
                                                                            >
                                                                                <FaSearch className="w-3 h-3" />
                                                                                Start
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {step.status === 'shortlisted' && (application.status === 'reviewing' || application.status === 'pending') && (
                                                                            <button
                                                                                onClick={() => updateApplicationStatus('shortlisted')}
                                                                                className="flex items-center justify-center gap-1 bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors w-16"
                                                                            >
                                                                                <FaStar className="w-3 h-3" />
                                                                                Select
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {step.status === 'interview' && (application.status === 'reviewing' || application.status === 'shortlisted') && (
                                                                            <button
                                                                                onClick={() => updateApplicationStatus('interview')}
                                                                                className="flex items-center justify-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700 transition-colors w-16"
                                                                            >
                                                                                <FaComments className="w-3 h-3" />
                                                                                Schedule
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {step.status === 'offered' && (application.status === 'interview' || application.status === 'shortlisted') && (
                                                                            <button
                                                                                onClick={() => updateApplicationStatus('offered')}
                                                                                className="flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors w-16"
                                                                            >
                                                                                <FaGift className="w-3 h-3" />
                                                                                Offer
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {step.status === 'rejected' && application.status !== 'rejected' && application.status !== 'offered' && (
                                                                            <button
                                                                                onClick={() => updateApplicationStatus('rejected')}
                                                                                className="flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors w-16"
                                                                            >
                                                                                <FaTimes className="w-3 h-3" />
                                                                                Reject
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {statusEntry && (
                                                                <div className="mt-1">
                                                                    <p className="text-xs text-gray-500">{formatDate(statusEntry.date)}</p>
                                                                    {statusEntry.note && (
                                                                        <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">{statusEntry.note}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Update Status Actions */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-gray-900 mb-3">Add Note (Optional)</h4>
                                        <div className="space-y-3">
                                            <textarea
                                                value={statusNote}
                                                onChange={(e) => setStatusNote(e.target.value)}
                                                placeholder="Add a note about status changes..."
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                rows="2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantsDetail;
