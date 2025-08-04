import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApplicationForm from '../../components/ApplicationForm';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch job details
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/jobs/${id}`);
      
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

  // Check if user has already applied to this job
  const checkApplicationStatus = async () => {
    try {
      if (!isAuthenticated) return;
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/applications/my-applications', {
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
  };

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
  const handleApplicationSuccess = (result) => {
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
  }, [id]);

  // Check application status when authentication state changes
  useEffect(() => {
    if (isAuthenticated && id) {
      checkApplicationStatus();
    }
  }, [isAuthenticated, id]);

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
    <div>
      {/* Back Button */}
      <div>
        <button onClick={() => navigate('/')}>← Back to Jobs</button>
      </div>

      {/* Job Header */}
      <div>
        <div>
          {job.companyId?.profilePicture && (
            <img 
              src={`http://localhost:3000/${job.companyId.profilePicture}`} 
              alt={job.companyId?.companyName || 'Company'}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}
          <div>
            <h1>{job.title}</h1>
            <h2>{job.companyId?.companyName || 'Unknown Company'}</h2>
            <p>{job.location}</p>
          </div>
        </div>
        
        <div>
          <button 
            onClick={handleApply}
            disabled={applicationStatus || (job.applicationDeadline && new Date() > new Date(job.applicationDeadline))}
            style={{
              backgroundColor: applicationStatus ? '#6c757d' : (job.applicationDeadline && new Date() > new Date(job.applicationDeadline) ? '#dc3545' : '#007bff'),
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: (applicationStatus || (job.applicationDeadline && new Date() > new Date(job.applicationDeadline))) ? 'not-allowed' : 'pointer'
            }}
          >
            {applicationStatus ? `Applied (${applicationStatus})` : 
             (job.applicationDeadline && new Date() > new Date(job.applicationDeadline) ? 'Deadline Passed' : 
              (!isAuthenticated ? 'Login to Apply' : 'Apply Now'))}
          </button>
        </div>
      </div>

      {/* Job Info Tags */}
      <div>
        <span>{job.type}</span>
        <span>{job.workLocation}</span>
        <span>{job.experienceLevel}</span>
        <span>{job.major}</span>
      </div>

      {/* Job Stats */}
      <div>
        <div>
          <span>👁 {job.views} views</span>
          <span>📝 {job.applicationsCount} applicants</span>
          <span>📅 Posted: {formatDate(job.datePosted)}</span>
          {job.applicationDeadline && (
            <span>⏰ Deadline: {formatDate(job.applicationDeadline)}</span>
          )}
        </div>
      </div>

      {/* Salary Information */}
      <div>
        <h3>Salary</h3>
        <p>{formatSalary(job.salary)}</p>
      </div>

      {/* Job Description */}
      <div>
        <h3>Job Description</h3>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {job.description}
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div>
          <h3>Requirements</h3>
          <ul>
            {job.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <div>
          <h3>Responsibilities</h3>
          <ul>
            {job.responsibilities.map((responsibility, index) => (
              <li key={index}>{responsibility}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div>
          <h3>Required Skills</h3>
          <div>
            {job.skills.map((skill, index) => (
              <span key={index} style={{ 
                display: 'inline-block', 
                background: '#f0f0f0', 
                padding: '4px 8px', 
                margin: '2px', 
                borderRadius: '4px' 
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div>
          <h3>Benefits</h3>
          <ul>
            {job.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact Information */}
      {(job.contactEmail || job.contactPhone) && (
        <div>
          <h3>Contact Information</h3>
          {job.contactEmail && <p>Email: {job.contactEmail}</p>}
          {job.contactPhone && <p>Phone: {job.contactPhone}</p>}
        </div>
      )}

      {/* Company Information */}
      {job.companyId && (
        <div>
          <h3>About the Company</h3>
          <div>
            <h4>{job.companyId.companyName}</h4>
            {job.companyId.description && (
              <p>{job.companyId.description}</p>
            )}
            {job.companyId.website && (
              <p>Website: <a href={job.companyId.website} target="_blank" rel="noopener noreferrer">
                {job.companyId.website}
              </a></p>
            )}
            {job.companyId.location && (
              <p>Location: {job.companyId.location}</p>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div>
          <h3>Tags</h3>
          <div>
            {job.tags.map((tag, index) => (
              <span key={index} style={{ 
                display: 'inline-block', 
                background: '#e3f2fd', 
                color: '#1976d2',
                padding: '4px 8px', 
                margin: '2px', 
                borderRadius: '4px' 
              }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Apply Button Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button 
          onClick={handleApply}
          disabled={applicationStatus || (job.applicationDeadline && new Date() > new Date(job.applicationDeadline))}
          style={{
            backgroundColor: applicationStatus ? '#6c757d' : (job.applicationDeadline && new Date() > new Date(job.applicationDeadline) ? '#dc3545' : '#007bff'),
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: (applicationStatus || (job.applicationDeadline && new Date() > new Date(job.applicationDeadline))) ? 'not-allowed' : 'pointer'
          }}
        >
          {applicationStatus ? `Applied (${applicationStatus})` : 
           (job.applicationDeadline && new Date() > new Date(job.applicationDeadline) ? 'Deadline Passed' : 
            (!isAuthenticated ? 'Login to Apply' : 'Apply for this Position'))}
        </button>
      </div>

      {/* Application Form Modal - Only show if authenticated */}
      {showApplicationForm && isAuthenticated && (
        <ApplicationForm
          job={job}
          onClose={handleApplicationClose}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobDetail;
