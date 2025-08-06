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
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-2 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-2xl font-bold">Apply for {job.title}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {job.companyId?.companyName} • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Location/Domicile *
                  </label>
                  <input
                    type="text"
                    name="domicile"
                    value={formData.domicile}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your current location"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resume/CV *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Application Documents */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Application Documents</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows="4"
                    maxLength="2000"
                    placeholder={`Dear Hiring Manager at ${job.companyId?.companyName || 'the company'},\n\nI am writing to express my interest in the ${job.title} position. I believe my skills and experience make me a strong candidate for this role...\n\nSincerely,\n[Your name]`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.coverLetter.length}/2000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Personal Statement
                  </label>
                  <textarea
                    name="personalStatement"
                    value={formData.personalStatement}
                    onChange={handleInputChange}
                    rows="3"
                    maxLength="1000"
                    placeholder={`Brief statement about yourself and your career goals, especially as they relate to ${job.major || 'this field'}...`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.personalStatement.length}/1000 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Job Requirements */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Job Requirements</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Salary
                    {job.salary && (job.salary.min || job.salary.max) && (
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (Job offers: {job.salary.min && job.salary.max 
                          ? `${job.salary.currency} ${job.salary.min.toLocaleString()}-${job.salary.max.toLocaleString()}`
                          : job.salary.min 
                            ? `${job.salary.currency} ${job.salary.min.toLocaleString()}+`
                            : `Up to ${job.salary.currency} ${job.salary.max.toLocaleString()}`
                        } per {job.salary.period})
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      name="expectedSalary.amount"
                      value={formData.expectedSalary.amount}
                      onChange={handleInputChange}
                      placeholder="Amount"
                      className="col-span-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <select
                      name="expectedSalary.currency"
                      value={formData.expectedSalary.currency}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience Level
                    {job.experienceLevel && (
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (Job requires: {job.experienceLevel})
                      </span>
                    )}
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="">Select experience level</option>
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior Level">Senior Level (6-10 years)</option>
                    <option value="Executive">Executive (10+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relevant Skills
                    {job.requirements && job.requirements.length > 0 && (
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        (Job requirements: {job.requirements.slice(0, 3).join(', ')}{job.requirements.length > 3 ? '...' : ''})
                      </span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.skills.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Start Date
                  </label>
                  <input
                    type="date"
                    name="availableStartDate"
                    value={formData.availableStartDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="application-form"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-[#F4B400] text-black rounded-lg hover:bg-[#E6A200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Application...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
