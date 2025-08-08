import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import Footer from '../../Components/Footer';
import FloatingDecorations from '../../Components/FloatingDecorations';

const AppliedJobs = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [displayCount, setDisplayCount] = useState(15);

  // Fetch user applications
  const fetchApplications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/signin');
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '100', // Increased to get more data for load more functionality
        ...(statusFilter && { status: statusFilter })
      }).toString();

      const response = await fetch(`http://localhost:3000/api/applications/my-applications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApplications(data.applications);
      setCurrentPage(data.currentPage);
      setTotalApplications(data.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [navigate, statusFilter]);

  // Load applications on component mount and when filters change
  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  // Handle load more
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 15);
  };

  // Get visible applications
  const visibleApplications = applications.slice(0, displayCount);
  const hasMore = applications.length > displayCount;

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setDisplayCount(15); // Reset display count when filtering
  };

  // Navigate to job detail
  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'interview':
        return 'bg-indigo-100 text-indigo-800';
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status display text
  const getStatusDisplayText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format company image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000/${imagePath}`;
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="relative pt-16">
          <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
            <FloatingDecorations />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">My Applications</h1>
              <p className="text-lg text-blue-100">Track the status of your job applications</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center relative z-10">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Applications</h3>
                <p className="text-gray-600">Fetching your job applications...</p>
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
              <h1 className="text-4xl font-bold text-white mb-4">My Applications</h1>
              <p className="text-lg text-blue-100">Track the status of your job applications</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center relative z-10">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Error Loading Applications</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
                <button 
                  onClick={() => fetchApplications(currentPage)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center mx-auto"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
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
            <h1 className="text-4xl font-bold text-white mb-4">My Applications</h1>
            <p className="text-lg text-blue-100">Track the status of your job applications</p>
          </div>

          {/* Filter and Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalApplications}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Applications
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {applications.length} applications
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Filter:</label>
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center relative z-10">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {statusFilter ? `No ${statusFilter} applications found` : 'No applications yet'}
                </h3>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {statusFilter 
                    ? `You don't have any applications with "${statusFilter}" status. Try changing the filter to see other applications.`
                    : "You haven't applied to any jobs yet. Start exploring opportunities and take the first step towards your dream career!"
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!statusFilter && (
                    <button 
                      onClick={() => navigate('/')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse Jobs
                    </button>
                  )}
                  {statusFilter && (
                    <button 
                      onClick={() => setStatusFilter('')}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              {/* Applications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {visibleApplications.map((application) => (
                  <div
                    key={application._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full"
                  >
                    {/* Check if jobId exists */}
                    {!application.jobId ? (
                      <div className="p-6 flex flex-col flex-1 justify-center items-center text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Job Not Available</h3>
                        <p className="text-sm text-gray-500 mb-4">This job posting may have been removed or is no longer available.</p>
                        <div className="mt-auto pt-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(application.status)}`}>
                            {getStatusDisplayText(application.status)}
                          </span>
                        </div>
                      </div>
                    ) : (
                    <div className="p-6 flex flex-col flex-1">
                      {/* Company Logo and Basic Info */}
                      <div className="flex items-start space-x-4 mb-4 min-h-[4rem]">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center">
                          {application.jobId?.companyId?.profilePicture ? (
                            <img
                              src={getImageUrl(application.jobId.companyId.profilePicture)}
                              alt={application.jobId?.companyId?.companyName || 'Company logo'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                            style={{ display: application.jobId?.companyId?.profilePicture ? 'none' : 'flex' }}
                          >
                            {application.jobId?.companyId?.companyName ? 
                              application.jobId.companyId.companyName.charAt(0).toUpperCase() : 
                              'C'
                            }
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            onClick={() => application.jobId?._id && handleJobClick(application.jobId._id)}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 mb-1"
                          >
                            {application.jobId?.title || 'Job title not available'}
                          </h3>
                          <p className="text-gray-600 text-sm">{application.jobId?.companyId?.companyName || 'Company not available'}</p>
                        </div>
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(application.status)} flex-shrink-0`}>
                          {getStatusDisplayText(application.status)}
                        </span>
                      </div>

                      {/* Location and Job Type */}
                      <div className="mb-4 min-h-[3rem]">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{application.jobId?.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {application.jobId?.type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {application.jobId.type}
                            </span>
                          )}
                          {application.jobId?.workLocation && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {application.jobId.workLocation}
                            </span>
                          )}
                          {application.jobId?.experienceLevel && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {application.jobId.experienceLevel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Application Timeline */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center text-xs text-gray-600 mb-2">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Applied: {formatDate(application.applicationDate)}</span>
                        </div>
                        {application.updatedAt !== application.applicationDate && (
                          <div className="flex items-center text-xs text-blue-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Updated: {formatDate(application.updatedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Application Details Preview */}
                      {(application.coverLetter || application.personalStatement) ? (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center mb-2">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs font-semibold text-blue-800">Application Details</span>
                          </div>
                          {application.coverLetter && (
                            <p className="text-xs text-blue-700 line-clamp-2 mb-1">
                              <span className="font-medium">Cover Letter: </span>
                              {application.coverLetter.length > 60 
                                ? `${application.coverLetter.substring(0, 60)}...` 
                                : application.coverLetter
                              }
                            </p>
                          )}
                          {application.personalStatement && (
                            <p className="text-xs text-blue-700 line-clamp-2">
                              <span className="font-medium">Personal Statement: </span>
                              {application.personalStatement.length > 60 
                                ? `${application.personalStatement.substring(0, 60)}...` 
                                : application.personalStatement
                              }
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4"></div>
                      )}

                      {/* Footer */}
                      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-auto">
                        <button
                          onClick={() => application.jobId?._id && handleJobClick(application.jobId._id)}
                          disabled={!application.jobId?._id}
                          className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Job Details
                        </button>
                        {application.resume && (
                          <a
                            href={`http://localhost:3000/${application.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-gray-600 hover:text-gray-700 text-sm font-medium py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Resume
                          </a>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center mx-auto"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Load More Applications
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    Showing {visibleApplications.length} of {applications.length} applications
                  </p>
                </div>
              )}
            </div>
          )}

          {loading && applications.length > 0 && (
            <div className="text-center py-12 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading more applications...</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AppliedJobs;
