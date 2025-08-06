import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import Footer from '../../Components/Footer';
import FloatingDecorations from '../../Components/FloatingDecorations';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch company details
  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/company/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const companyData = await response.json();
      setCompany(companyData);
      setError(null);
    } catch (err) {
      console.error('Error fetching company details:', err);
      setError(err.message || 'Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch company jobs
  const fetchCompanyJobs = async () => {
    try {
      setJobsLoading(true);
      // Filter jobs by companyId to only get jobs from this specific company
      const response = await fetch(`http://localhost:3000/api/jobs?companyId=${id}&includeInactive=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Error fetching company jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  // Load company details on component mount
  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
      fetchCompanyJobs();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Format company image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000/${imagePath}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format salary
  const formatSalary = (salary) => {
    if (!salary || !salary.amount) return 'Salary not disclosed';
    
    const { amount, currency = 'USD', period = 'monthly' } = salary;
    const formattedAmount = new Intl.NumberFormat().format(amount);
    
    return `${currency} ${formattedAmount} per ${period}`;
  };

  // Navigate to job detail
  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company details...</p>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Company</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button 
                onClick={() => fetchCompanyDetails()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/companies')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Companies
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Company Not Found</h3>
            <p className="text-gray-600 mb-6">The company you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/companies')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bannerImageUrl = getImageUrl(company.bannerPicture);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="relative pt-16">
        <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
          <FloatingDecorations />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/companies')}
            className="mb-6 flex items-center text-white hover:text-blue-100 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Companies
          </button>

          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10">
          {/* Banner Image */}
          <div className={`h-48 bg-gray-200 ${!bannerImageUrl && 'bg-gradient-to-r from-gray-200 to-gray-300'}`}>
            {bannerImageUrl && (
              <img
                src={bannerImageUrl}
                alt={`${company.companyName} banner`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Company Header */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              {/* Profile Picture */}
              <div className="-mt-16 md:-mt-20 z-10">
                {company.profilePicture ? (
                  <img
                    src={getImageUrl(company.profilePicture)}
                    alt={company.companyName}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-gray-600 font-semibold text-4xl">
                      {company.companyName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Company Info */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{company.companyName}</h1>
                {company.industry && (
                  <p className="text-lg text-gray-600 mb-3">{company.industry}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                  {company.mainLocation && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{company.mainLocation}</span>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m6 4V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4m0 0v8a2 2 0 002 2h8a2 2 0 002-2v-8m-6 0V9" />
                    </svg>
                    <span>{jobs.length} open positions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Jobs ({jobs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                    <div className="text-sm text-gray-600">Total Jobs Posted</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{jobs.filter(job => job.isActive).length}</div>
                    <div className="text-sm text-gray-600">Active Openings</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{jobs.reduce((total, job) => total + (job.views || 0), 0)}</div>
                    <div className="text-sm text-gray-600">Total Job Views</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{jobs.reduce((total, job) => total + (job.applicationsCount || 0), 0)}</div>
                    <div className="text-sm text-gray-600">Applications Received</div>
                  </div>
                </div>
              </div>

              {/* Company Brief */}
              {company.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.companyName}</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {company.description.length > 300 
                      ? `${company.description.substring(0, 300)}...`
                      : company.description
                    }
                  </p>
                  {company.description.length > 300 && (
                    <button 
                      onClick={() => setActiveTab('about')}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Read More →
                    </button>
                  )}
                </div>
              )}

              {/* Recent Jobs */}
              {jobs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Job Postings</h2>
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All Jobs →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {jobs
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 3)
                      .map((job) => (
                      <div
                        key={job._id}
                        onClick={() => handleJobClick(job._id)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                                {job.title}
                              </h3>
                              {!job.isActive && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Closed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{job.location} • {job.type}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {job.experienceLevel}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {job.workLocation}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formatSalary(job.salary)}</p>
                            <p className="text-xs text-gray-500">{formatDate(job.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {jobs.length > 3 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => setActiveTab('jobs')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View {jobs.length - 3} more jobs
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.email && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700">
                          {company.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Website</p>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">{/* Company Description */}
              {company.description && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.companyName}</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{company.description}</p>
                </div>
              )}

              {/* Company Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.industry && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Industry</h3>
                      <p className="text-gray-700">{company.industry}</p>
                    </div>
                  )}
                  
                  {company.mainLocation && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Main Location</h3>
                      <p className="text-gray-700">{company.mainLocation}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Active Jobs</h3>
                    <p className="text-gray-700">{jobs.filter(job => job.isActive).length} positions available</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Total Jobs Posted</h3>
                    <p className="text-gray-700">{jobs.length} jobs posted</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Member Since</h3>
                    <p className="text-gray-700">{formatDate(company.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Profile Last Updated</h3>
                    <p className="text-gray-700">{formatDate(company.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Company Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                    <div className="text-sm text-gray-600">Total Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{jobs.filter(job => job.isActive).length}</div>
                    <div className="text-sm text-gray-600">Active Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{jobs.reduce((total, job) => total + (job.views || 0), 0)}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{jobs.reduce((total, job) => total + (job.applicationsCount || 0), 0)}</div>
                    <div className="text-sm text-gray-600">Total Applications</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {company.email && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                      <a 
                        href={`mailto:${company.email}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {company.email}
                      </a>
                    </div>
                  )}
                  
                  {company.phoneNumber && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
                      <a 
                        href={`tel:${company.phoneNumber}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {company.phoneNumber}
                      </a>
                    </div>
                  )}
                  
                  {company.mainLocation && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-700">{company.mainLocation}</p>
                    </div>
                  )}
                  
                  {company.website && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Website</h3>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Open Positions</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {jobs.filter(job => job.isActive).length} active / {jobs.length} total jobs
                  </span>
                </div>
              </div>

              {/* Job Statistics Summary */}
              {jobs.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-blue-600">{jobs.filter(job => job.type === 'full-time').length}</div>
                      <div className="text-xs text-gray-600">Full-time</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{jobs.filter(job => job.type === 'part-time').length}</div>
                      <div className="text-xs text-gray-600">Part-time</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">{jobs.filter(job => job.type === 'contract').length}</div>
                      <div className="text-xs text-gray-600">Contract</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-orange-600">{jobs.filter(job => job.type === 'internship').length}</div>
                      <div className="text-xs text-gray-600">Internship</div>
                    </div>
                  </div>
                </div>
              )}

              {jobsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 13h.01M16 13h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600">This company hasn't posted any job openings yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => handleJobClick(job._id)}
                      className={`border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer ${
                        !job.isActive ? 'opacity-60 bg-gray-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                              {job.title}
                            </h3>
                            {!job.isActive && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                            {job.isFeatured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{job.location}</p>
                          <p className="text-sm text-gray-500">Major: {job.major}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatSalary(job.salary)}</p>
                          <p className="text-xs text-gray-500">Posted {formatDate(job.createdAt)}</p>
                          {job.applicationDeadline && (
                            <p className={`text-xs ${
                              new Date(job.applicationDeadline) > new Date() ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Deadline: {formatDate(job.applicationDeadline)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {job.type}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {job.workLocation}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                          {job.experienceLevel}
                        </span>
                      </div>

                      {job.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {job.description.length > 150 
                            ? `${job.description.substring(0, 150)}...` 
                            : job.description
                          }
                        </p>
                      )}

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{job.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Job Statistics */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {job.views || 0} views
                          </span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                            {job.applicationsCount || 0} applications
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(job._id);
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            job.isActive 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-gray-400 text-white cursor-not-allowed'
                          }`}
                          disabled={!job.isActive}
                        >
                          {job.isActive ? 'View Details' : 'Job Closed'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Footer */}
    <Footer />
  </div>
);
};

export default CompanyDetail;