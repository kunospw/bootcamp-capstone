import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import Footer from '../../Components/Footer';
import FloatingDecorations from '../../Components/FloatingDecorations';
import ApplicationForm from '../../Components/ApplicationForm';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Save job functionality states
  const [isSaved, setIsSaved] = useState(false);
  const [savedJobId, setSavedJobId] = useState(null);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [saveJobForm, setSaveJobForm] = useState({
    priority: 'medium',
    note: '',
    tags: ''
  });

  // Fetch job details
  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.sonervous.site/api/jobs/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jobData = await response.json();
      setJob(jobData);
      setError(null);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    return new Date(dateString).toLocaleDateString();
  };

  // Check authentication status
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode token to check if it's valid and not expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp > currentTime && payload.type === 'user') {
          setIsAuthenticated(true);
          return true;
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          return false;
        }
      } catch (error) {
        console.error('Invalid token format:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        return false;
      }
    }
    setIsAuthenticated(false);
    return false;
  };

  // Check if job is already saved
  const checkSavedJobStatus = useCallback(async () => {
    try {
      if (!isAuthenticated) return;
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.sonervous.site/api/saved-jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const savedJob = data.savedJobs.find(saved => saved.jobId._id === id);
        if (savedJob) {
          setIsSaved(true);
          setSavedJobId(savedJob._id);
          setSaveJobForm({
            priority: savedJob.priority || 'medium',
            note: savedJob.note || '',
            tags: savedJob.tags ? savedJob.tags.join(', ') : ''
          });
        } else {
          setIsSaved(false);
          setSavedJobId(null);
        }
      }
    } catch (err) {
      console.error('Error checking saved job status:', err);
    }
  }, [isAuthenticated, id]);

  // Handle save job
  const handleSaveJob = async () => {
    if (!checkAuthentication()) {
      navigate('/signin');
      return;
    }

    if (isSaved) {
      // If already saved, toggle dropdown
      setShowSaveDropdown(!showSaveDropdown);
    } else {
      // Save with default values
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://api.sonervous.site/api/saved-jobs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: id,
            priority: saveJobForm.priority,
            note: saveJobForm.note,
            tags: saveJobForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsSaved(true);
          setSavedJobId(data.savedJob._id);
          showNotification('success', 'Job saved successfully!');
          setShowSaveDropdown(true);
        } else {
          throw new Error('Failed to save job');
        }
      } catch (err) {
        console.error('Error saving job:', err);
        showNotification('error', 'Failed to save job. Please try again.');
      }
    }
  };

  // Handle update saved job
  const handleUpdateSavedJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.sonervous.site/api/saved-jobs/${savedJobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priority: saveJobForm.priority,
          note: saveJobForm.note,
          tags: saveJobForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }),
      });

      if (response.ok) {
        showNotification('success', 'Saved job updated successfully!');
        setShowSaveDropdown(false);
      } else {
        throw new Error('Failed to update saved job');
      }
    } catch (err) {
      console.error('Error updating saved job:', err);
      showNotification('error', 'Failed to update saved job. Please try again.');
    }
  };

  // Handle unsave job
  const handleUnsaveJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.sonervous.site/api/saved-jobs/${savedJobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsSaved(false);
        setSavedJobId(null);
        setSaveJobForm({
          priority: 'medium',
          note: '',
          tags: ''
        });
        setShowSaveDropdown(false);
        showNotification('success', 'Job removed from saved list!');
      } else {
        throw new Error('Failed to unsave job');
      }
    } catch (err) {
      console.error('Error unsaving job:', err);
      showNotification('error', 'Failed to remove job. Please try again.');
    }
  };

  // Helper function for notifications
  const showNotification = (type, message) => {
    const colors = {
      success: 'bg-green-100 border-green-400 text-green-700',
      error: 'bg-red-100 border-red-400 text-red-700',
    };

    const icons = {
      success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
      error: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
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

  // Check if user has already applied to this job
  const checkApplicationStatus = useCallback(async () => {
    try {
      if (!isAuthenticated) return;
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.sonervous.site/api/applications/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const application = data.applications.find(app => app.jobId._id === id);
        if (application) {
          setApplicationStatus(application.status);
        }
      } else if (response.status === 403) {
        // Token issues, clear and redirect
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  }, [isAuthenticated, id]);

  // Handle apply button click
  const handleApply = () => {
    if (!checkAuthentication()) {
      // Redirect to login if not authenticated
      navigate('/signin');
      return;
    }
    
    // Check if already applied
    if (applicationStatus) {
      alert(`You have already applied to this job. Status: ${applicationStatus}`);
      return;
    }
    
    // Check application deadline
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      alert('The application deadline for this job has passed.');
      return;
    }
    
    // Show application form
    setShowApplicationForm(true);
  };

  // Handle successful application submission
  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setApplicationStatus('pending');
    alert('Application submitted successfully!');
  };

  // Handle application form close
  const handleApplicationClose = () => {
    setShowApplicationForm(false);
  };

  // Load job details on component mount
  useEffect(() => {
    if (id) {
      fetchJobDetails();
      checkAuthentication();
    }
  }, [id, fetchJobDetails]);

  // Check application status when authentication state changes
  useEffect(() => {
    if (isAuthenticated && id) {
      checkApplicationStatus();
      checkSavedJobStatus();
    }
  }, [isAuthenticated, id, checkApplicationStatus, checkSavedJobStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSaveDropdown && !event.target.closest('.save-job-dropdown')) {
        setShowSaveDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSaveDropdown]);

  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={fetchJobDetails}>Retry</button>
        <button onClick={() => navigate('/')}>Back to Jobs</button>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <p>Job not found</p>
        <button onClick={() => navigate('/')}>Back to Jobs</button>
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
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Jobs
            </button>
          </div>

          {/* Job Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
            {/* Job Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start space-x-6">
                  {job.companyId?.profilePicture && (
                    <div className="flex-shrink-0">
                      <img 
                        src={`https://api.sonervous.site/${job.companyId.profilePicture}`} 
                        alt={job.companyId?.companyName || 'Company'}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-white/20"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <h2 className="text-xl text-blue-100 mb-2">{job.companyId?.companyName || 'Unknown Company'}</h2>
                    <div className="flex items-center text-blue-100">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-0 lg:ml-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Save Job Dropdown */}
                    {isAuthenticated && (
                      <div className="relative save-job-dropdown">
                        <button
                          onClick={handleSaveJob}
                          className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
                            isSaved
                              ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                              : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-600'
                          }`}
                        >
                          <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          {isSaved ? 'Saved' : 'Save Job'}
                          {isSaved && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        {showSaveDropdown && isSaved && (
                          <div className="absolute top-full mt-2 right-0 sm:right-0 left-0 sm:left-auto w-full sm:w-80 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Edit Saved Job</h3>
                                <button
                                  onClick={() => setShowSaveDropdown(false)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>

                              <div className="space-y-4">
                                {/* Priority */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                  </label>
                                  <select
                                    value={saveJobForm.priority}
                                    onChange={(e) => setSaveJobForm({...saveJobForm, priority: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                                  >
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                  </select>
                                </div>

                                {/* Note */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Personal Note
                                  </label>
                                  <textarea
                                    value={saveJobForm.note}
                                    onChange={(e) => setSaveJobForm({...saveJobForm, note: e.target.value})}
                                    placeholder="Add your thoughts about this job..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-500"
                                  />
                                </div>

                                {/* Tags */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags (comma separated)
                                  </label>
                                  <input
                                    type="text"
                                    value={saveJobForm.tags}
                                    onChange={(e) => setSaveJobForm({...saveJobForm, tags: e.target.value})}
                                    placeholder="e.g. remote, urgent, interested"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                                  />
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                  <button
                                    onClick={handleUpdateSavedJob}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                                  >
                                    Update
                                  </button>
                                  <button
                                    onClick={handleUnsaveJob}
                                    className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Apply Button */}
                    <button 
                      onClick={handleApply}
                      disabled={applicationStatus || (job.applicationDeadline && new Date() > new Date(job.applicationDeadline))}
                      className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 ${
                        applicationStatus 
                          ? 'bg-gray-500 cursor-not-allowed text-white' 
                          : (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) 
                            ? 'bg-red-500 cursor-not-allowed text-white' 
                            : 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                      }`}
                    >
                      {applicationStatus ? `Applied (${applicationStatus})` : 
                       (job.applicationDeadline && new Date() > new Date(job.applicationDeadline) ? 'Deadline Passed' : 
                        (!isAuthenticated ? 'Login to Apply' : 'Apply Now'))}
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Info Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{job.type}</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{job.workLocation}</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{job.experienceLevel}</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{job.major}</span>
              </div>
            </div>

            {/* Job Stats */}
            <div className="px-8 py-4 bg-gray-50 border-b">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {job.views} views
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {job.applicationsCount} applicants
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12v-4m-4 0h8m-4-4v8m-4-4h8" />
                  </svg>
                  Posted: {formatDate(job.datePosted)}
                </div>
                {job.applicationDeadline && (
                  <div className="flex items-center text-red-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Deadline: {formatDate(job.applicationDeadline)}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Salary Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Salary
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold text-lg">{formatSalary(job.salary)}</p>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Job Description
                    </h3>
                    <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </div>
                  </div>

                  {/* Requirements */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {job.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Responsibilities
                      </h3>
                      <ul className="space-y-2">
                        {job.responsibilities.map((responsibility, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {job.benefits && job.benefits.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        Benefits
                      </h3>
                      <ul className="space-y-2">
                        {job.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Required Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company Information */}
                  {job.companyId && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M13 7h-2" />
                        </svg>
                        About the Company
                      </h3>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">{job.companyId.companyName}</h4>
                        {job.companyId.description && (
                          <p className="text-gray-700 text-sm leading-relaxed">{job.companyId.description}</p>
                        )}
                        {job.companyId.website && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            <a href={job.companyId.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                              Visit Website
                            </a>
                          </div>
                        )}
                        {job.companyId.location && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700 text-sm">{job.companyId.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {(job.contactEmail || job.contactPhone) && (
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Information
                      </h3>
                      <div className="space-y-2">
                        {job.contactEmail && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            <span className="text-gray-700 text-sm">{job.contactEmail}</span>
                          </div>
                        )}
                        {job.contactPhone && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700 text-sm">{job.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                <button 
                  onClick={handleApply}
                  disabled={applicationStatus || (job.applicationDeadline && new Date() > new Date(job.applicationDeadline))}
                  className={`px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                    applicationStatus 
                      ? 'bg-gray-500 text-white cursor-not-allowed' 
                      : (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) 
                        ? 'bg-red-500 text-white cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {applicationStatus ? `Applied (${applicationStatus})` : 
                   (job.applicationDeadline && new Date() > new Date(job.applicationDeadline) ? 'Deadline Passed' : 
                    (!isAuthenticated ? 'Login to Apply' : 'Apply for this Position'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal - Only show if authenticated */}
      {showApplicationForm && isAuthenticated && (
        <ApplicationForm
          job={job}
          onClose={handleApplicationClose}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default JobDetail;