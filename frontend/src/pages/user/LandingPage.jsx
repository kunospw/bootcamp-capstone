import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    workLocation: '',
    experienceLevel: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Fetch jobs from the API
  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await fetch(`http://localhost:3000/api/jobs?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data.jobs);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchJobs(newPage);
    }
  };

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
    const now = new Date();
    const jobDate = new Date(dateString);
    const diffTime = Math.abs(now - jobDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Posted today';
    if (diffDays <= 7) return `Posted ${diffDays} days ago`;
    return jobDate.toLocaleDateString();
  };

  // Load jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading && jobs.length === 0) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div>
      <div>
        <h1>Find Your Dream Job</h1>
        <p>Discover opportunities that match your skills and interests</p>
      </div>

      {/* Search and Filters */}
      <div>
        <form onSubmit={handleSearch}>
          <div>
            <input
              type="text"
              name="search"
              placeholder="Search jobs, companies, or skills..."
              value={filters.search}
              onChange={handleFilterChange}
            />
            <button type="submit">Search</button>
          </div>
          
          <div>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
            />
            
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
            
            <select
              name="workLocation"
              value={filters.workLocation}
              onChange={handleFilterChange}
            >
              <option value="">Work Location</option>
              <option value="onsite">Onsite</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            
            <select
              name="experienceLevel"
              value={filters.experienceLevel}
              onChange={handleFilterChange}
            >
              <option value="">Experience Level</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div>
          Error: {error}
          <button onClick={() => fetchJobs()}>Retry</button>
        </div>
      )}

      {/* Results Summary */}
      <div>
        <p>Found {pagination.total} jobs</p>
      </div>

      {/* Job Listings */}
      <div>
        {jobs.length === 0 && !loading ? (
          <div>
            <p>No jobs found matching your criteria.</p>
            <button onClick={() => {
              setFilters({
                search: '',
                location: '',
                type: '',
                workLocation: '',
                experienceLevel: '',
              });
              fetchJobs(1);
            }}>
              Clear Filters
            </button>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id}>
              <div>
                <div>
                  {job.companyId?.profilePicture && (
                    <img 
                      src={`http://localhost:3000/${job.companyId.profilePicture}`} 
                      alt={job.companyId?.companyName || 'Company'}
                    />
                  )}
                  <div>
                    <h3 
                      onClick={() => navigate(`/job/${job._id}`)}
                      style={{ cursor: 'pointer', color: '#007bff' }}
                    >
                      {job.title}
                    </h3>
                    <p>{job.companyId?.companyName || 'Unknown Company'}</p>
                    <p>{job.location}</p>
                  </div>
                </div>
                
                <div>
                  <span>{job.type}</span>
                  <span>{job.workLocation}</span>
                  <span>{job.experienceLevel}</span>
                </div>
                
                <div>
                  <p>{formatSalary(job.salary)}</p>
                  <p>{formatDate(job.datePosted)}</p>
                </div>
                
                <div>
                  <p>{job.description.substring(0, 200)}...</p>
                </div>
                
                {job.skills && job.skills.length > 0 && (
                  <div>
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span key={index}>{skill}</span>
                    ))}
                    {job.skills.length > 5 && <span>+{job.skills.length - 5} more</span>}
                  </div>
                )}
                
                <div>
                  <div>
                    <span>👁 {job.views} views</span>
                    <span>📝 {job.applicationsCount} applicants</span>
                  </div>
                  <button onClick={() => {
                    navigate(`/job/${job._id}`);
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div>
          <button 
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && jobs.length > 0 && (
        <div>Loading more jobs...</div>
      )}
    </div>
  );
};

export default LandingPage;