import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import FloatingDecorations from '../../Components/FloatingDecorations';

const AppliedJobs = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      setTotalPages(data.totalPages);
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
            
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center relative z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your applications...</p>
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
            
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center relative z-10">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Applications</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => fetchApplications(currentPage)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
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
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {totalApplications} Total Applications
                </p>
                <p className="text-gray-600">
                  Showing {applications.length} applications on page {currentPage} of {totalPages}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter ? `No ${statusFilter} applications found` : 'No applications yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter 
                  ? `You don't have any applications with "${statusFilter}" status.`
                  : "You haven't applied to any jobs yet. Start exploring opportunities!"
                }
              </p>
              {!statusFilter && (
                <button 
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </button>
              )}
              {statusFilter && (
                <button 
                  onClick={() => setStatusFilter('')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="relative z-10">
              {/* Applications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {visibleApplications.map((application) => (
                  <div
                    key={application._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Company Logo and Job Info */}
                    <div className="flex items-start gap-3 mb-4">
                      {application.jobId?.companyId?.profilePicture ? (
                        <img
                          src={getImageUrl(application.jobId.companyId.profilePicture)}
                          alt={application.jobId.companyId.companyName}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-semibold text-xs">
                            {application.jobId?.companyId?.companyName?.charAt(0).toUpperCase() || 'C'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => handleJobClick(application.jobId._id)}
                          className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left line-clamp-2 mb-1"
                        >
                          {application.jobId.title}
                        </button>
                        <p className="text-sm text-gray-600 truncate">
                          {application.jobId?.companyId?.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(application.status)}`}>
                        {getStatusDisplayText(application.status)}
                      </span>
                    </div>

                    {/* Location and Job Type */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{application.jobId.location}</span>
                      </div>
                      <span>•</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {application.jobId.type}
                      </span>
                    </div>

                    {/* Application Date */}
                    <div className="text-xs text-gray-500 mb-3">
                      <p>Applied on {formatDate(application.applicationDate)}</p>
                      {application.updatedAt !== application.applicationDate && (
                        <p>Updated {formatDate(application.updatedAt)}</p>
                      )}
                    </div>

                    {/* Application Details Preview */}
                    {(application.coverLetter || application.personalStatement) && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                        {application.coverLetter && (
                          <p className="text-gray-600 line-clamp-2">
                            <span className="font-medium">Cover Letter: </span>
                            {application.coverLetter.length > 80 
                              ? `${application.coverLetter.substring(0, 80)}...` 
                              : application.coverLetter
                            }
                          </p>
                        )}
                        {application.personalStatement && (
                          <p className="text-gray-600 line-clamp-2 mt-1">
                            <span className="font-medium">Personal Statement: </span>
                            {application.personalStatement.length > 80 
                              ? `${application.personalStatement.substring(0, 80)}...` 
                              : application.personalStatement
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleJobClick(application.jobId._id)}
                        className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium py-2 px-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View Job Details
                      </button>
                      {application.resume && (
                        <a
                          href={`http://localhost:3000/${application.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-gray-600 hover:text-gray-700 text-sm font-medium py-2 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                        >
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Load More Applications
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {visibleApplications.length} of {applications.length} applications
                  </p>
                </div>
              )}
            </div>
          )}

          {loading && applications.length > 0 && (
            <div className="text-center py-8 relative z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppliedJobs;