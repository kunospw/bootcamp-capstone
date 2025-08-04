import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';

const AppliedJobs = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch user applications
  const fetchApplications = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/signin');
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
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
  };

  // Load applications on component mount and when filters change
  useEffect(() => {
    fetchApplications(1);
  }, [statusFilter]);

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchApplications(page);
    window.scrollTo(0, 0);
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
      <div>
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-12">
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
    );
  }

  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        {/* Filter and Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
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
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Company Logo and Job Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {application.jobId?.companyId?.profilePicture ? (
                      <img
                        src={getImageUrl(application.jobId.companyId.profilePicture)}
                        alt={application.jobId.companyId.companyName}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-semibold text-sm">
                          {application.jobId?.companyId?.companyName?.charAt(0).toUpperCase() || 'C'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleJobClick(application.jobId._id)}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {application.jobId.title}
                      </button>
                      <p className="text-gray-600 mb-1">
                        {application.jobId?.companyId?.companyName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{application.jobId.location}</span>
                        </div>
                        <span>•</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {application.jobId.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Application Status and Date */}
                  <div className="flex flex-col lg:items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(application.status)}`}>
                      {getStatusDisplayText(application.status)}
                    </span>
                    <div className="text-sm text-gray-500">
                      <p>Applied on {formatDate(application.applicationDate)}</p>
                      {application.updatedAt !== application.applicationDate && (
                        <p>Updated {formatDate(application.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                {(application.coverLetter || application.personalStatement) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {application.coverLetter && (
                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {application.coverLetter.length > 150 
                            ? `${application.coverLetter.substring(0, 150)}...` 
                            : application.coverLetter
                          }
                        </p>
                      </div>
                    )}
                    {application.personalStatement && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Personal Statement:</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {application.personalStatement.length > 150 
                            ? `${application.personalStatement.substring(0, 150)}...` 
                            : application.personalStatement
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleJobClick(application.jobId._id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Job Details
                  </button>
                  {application.resume && (
                    <>
                      <span className="text-gray-300">•</span>
                      <a
                        href={`http://localhost:3000/${application.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Resume
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'text-blue-600 bg-blue-50 border border-blue-300'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {loading && applications.length > 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;