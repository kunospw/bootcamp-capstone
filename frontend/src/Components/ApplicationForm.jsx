import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ApplicationForm = ({ job, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    domicile: '',
    phoneNumber: '',
    email: '',
    coverLetter: '',
    personalStatement: '',
    expectedSalary: {
      amount: '',
      currency: job?.salary?.currency || 'USD',
      period: job?.salary?.period || 'monthly'
    },
    availableStartDate: '',
    experienceLevel: '',
    skills: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with job-related defaults
  useEffect(() => {
    if (job) {
      setFormData(prev => ({
        ...prev,
        expectedSalary: {
          ...prev.expectedSalary,
          currency: job.salary?.currency || 'USD',
          period: job.salary?.period || 'monthly',
          // Pre-fill with minimum salary if available
          amount: job.salary?.min ? job.salary.min.toString() : ''
        }
      }));
    }
  }, [job]);

  // Pre-fill form with user data if available
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Check token validity first
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (!payload.exp || payload.exp <= currentTime || payload.type !== 'user') {
            localStorage.removeItem('token');
            navigate('/signin');
            return;
          }
        } catch (error) {
          console.error('Invalid token format:', error);
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }

        const response = await fetch('http://localhost:3000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          setFormData(prev => ({
            ...prev,
            fullName: user.fullName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            domicile: user.domicile || '',
            personalStatement: user.personalSummary || user.bio || ''
          }));
        } else if (response.status === 403 || response.status === 401) {
          // Token invalid, redirect to login
          localStorage.removeItem('token');
          navigate('/signin');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('expectedSalary.')) {
      const salaryField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        expectedSalary: {
          ...prev.expectedSalary,
          [salaryField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      // Validate token before submission
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (!payload.exp || payload.exp <= currentTime || payload.type !== 'user') {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
      } catch (tokenError) {
        console.error('Invalid token format:', tokenError);
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }

      // Create FormData for file upload
      const applicationData = new FormData();
      applicationData.append('jobId', job._id);
      applicationData.append('fullName', formData.fullName);
      applicationData.append('domicile', formData.domicile);
      applicationData.append('phoneNumber', formData.phoneNumber);
      applicationData.append('email', formData.email);
      applicationData.append('coverLetter', formData.coverLetter);
      applicationData.append('personalStatement', formData.personalStatement);
      
      // Add new fields
      if (formData.experienceLevel) {
        applicationData.append('experienceLevel', formData.experienceLevel);
      }
      if (formData.skills) {
        applicationData.append('skills', formData.skills);
      }
      
      if (formData.expectedSalary.amount) {
        applicationData.append('expectedSalary[amount]', formData.expectedSalary.amount);
        applicationData.append('expectedSalary[currency]', formData.expectedSalary.currency);
        applicationData.append('expectedSalary[period]', formData.expectedSalary.period);
      }
      
      if (formData.availableStartDate) {
        applicationData.append('availableStartDate', formData.availableStartDate);
      }

      if (resumeFile) {
        applicationData.append('resume', resumeFile);
      }

      const response = await fetch('http://localhost:3000/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: applicationData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(errorData.message || 'Failed to submit application');
      }

      const result = await response.json();
      onSuccess && onSuccess(result);
      
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Apply for {job.title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <p style={{ marginBottom: '20px', color: '#666' }}>
          {job.companyId?.companyName} • {job.location}
        </p>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Current Location/Domicile *
            </label>
            <input
              type="text"
              name="domicile"
              value={formData.domicile}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Resume/CV *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <small style={{ color: '#666' }}>
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Cover Letter
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows="4"
              maxLength="2000"
              placeholder={`Dear Hiring Manager at ${job.companyId?.companyName || 'the company'},\n\nI am writing to express my interest in the ${job.title} position. I believe my skills and experience make me a strong candidate for this role...\n\nSincerely,\n[Your name]`}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666' }}>
              {formData.coverLetter.length}/2000 characters
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Personal Statement
            </label>
            <textarea
              name="personalStatement"
              value={formData.personalStatement}
              onChange={handleInputChange}
              rows="3"
              maxLength="1000"
              placeholder={`Brief statement about yourself and your career goals, especially as they relate to ${job.major || 'this field'}...`}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666' }}>
              {formData.personalStatement.length}/1000 characters
            </small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Expected Salary
              {job.salary && (job.salary.min || job.salary.max) && (
                <small style={{ color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>
                  (Job offers: {job.salary.min && job.salary.max 
                    ? `${job.salary.currency} ${job.salary.min.toLocaleString()}-${job.salary.max.toLocaleString()}`
                    : job.salary.min 
                      ? `${job.salary.currency} ${job.salary.min.toLocaleString()}+`
                      : `Up to ${job.salary.currency} ${job.salary.max.toLocaleString()}`
                  } per {job.salary.period})
                </small>
              )}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                name="expectedSalary.amount"
                value={formData.expectedSalary.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                style={{
                  flex: 2,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <select
                name="expectedSalary.currency"
                value={formData.expectedSalary.currency}
                onChange={handleInputChange}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="USD">USD</option>
                <option value="IDR">IDR</option>
                <option value="SGD">SGD</option>
                <option value="MYR">MYR</option>
                <option value="PHP">PHP</option>
                <option value="THB">THB</option>
              </select>
              <select
                name="expectedSalary.period"
                value={formData.expectedSalary.period}
                onChange={handleInputChange}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="hourly">Hourly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Experience Level
              {job.experienceLevel && (
                <small style={{ color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>
                  (Job requires: {job.experienceLevel})
                </small>
              )}
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select experience level</option>
              <option value="Entry Level">Entry Level (0-2 years)</option>
              <option value="Mid Level">Mid Level (3-5 years)</option>
              <option value="Senior Level">Senior Level (6-10 years)</option>
              <option value="Executive">Executive (10+ years)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Relevant Skills
              {job.requirements && job.requirements.length > 0 && (
                <small style={{ color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>
                  (Job requirements: {job.requirements.slice(0, 3).join(', ')}{job.requirements.length > 3 ? '...' : ''})
                </small>
              )}
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              rows="3"
              maxLength="500"
              placeholder={job.requirements && job.requirements.length > 0 
                ? `List your skills relevant to this position. Consider mentioning: ${job.requirements.slice(0, 3).join(', ')}`
                : "List your relevant skills and technologies (e.g., JavaScript, React, Node.js, etc.)"
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666' }}>
              {formData.skills.length}/500 characters
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Available Start Date
            </label>
            <input
              type="date"
              name="availableStartDate"
              value={formData.availableStartDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
