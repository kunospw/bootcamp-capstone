import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SideBar from '../../Components/SideBar'
import { FaSave, FaTimes, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock, FaCalendarAlt, FaUsers, FaFileAlt, FaListUl, FaIndustry, FaPhone, FaEnvelope } from 'react-icons/fa'

const EditJob = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        major: '',
        type: 'full-time',
        workLocation: 'onsite',
        location: '',
        salary: {
            min: '',
            max: '',
            currency: 'USD',
            period: 'monthly'
        },
        description: '',
        requirements: [''],
        responsibilities: [''],
        skills: [''],
        benefits: [''],
        experienceLevel: 'entry',
        applicationDeadline: '',
        isActive: true,
        isFeatured: false,
        tags: [''],
        contactEmail: '',
        contactPhone: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetchingJob, setFetchingJob] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const jobTypes = [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' },
        { value: 'freelance', label: 'Freelance' }
    ];

    const workLocations = [
        { value: 'onsite', label: 'On-site' },
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' }
    ];

    const experienceLevels = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior Level' },
        { value: 'lead', label: 'Lead Level' },
        { value: 'executive', label: 'Executive Level' }
    ];

    const currencies = [
        { value: 'USD', label: 'USD' },
        { value: 'IDR', label: 'IDR' },
        { value: 'SGD', label: 'SGD' },
        { value: 'MYR', label: 'MYR' },
        { value: 'PHP', label: 'PHP' },
        { value: 'THB', label: 'THB' }
    ];

    const salaryPeriods = [
        { value: 'hourly', label: 'Per Hour' },
        { value: 'monthly', label: 'Per Month' },
        { value: 'yearly', label: 'Per Year' }
    ];

    // Fetch job data when component mounts
    useEffect(() => {
        fetchJobData();
    }, [jobId]);

    const fetchJobData = async () => {
        try {
            setFetchingJob(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const jobData = await response.json();

                // Format the application deadline for the date input
                const formattedDeadline = jobData.applicationDeadline
                    ? new Date(jobData.applicationDeadline).toISOString().split('T')[0]
                    : '';

                // Populate form with fetched data
                setFormData({
                    title: jobData.title || '',
                    major: jobData.major || '',
                    type: jobData.type || 'full-time',
                    workLocation: jobData.workLocation || 'onsite',
                    location: jobData.location || '',
                    salary: {
                        min: jobData.salary?.min ? jobData.salary.min.toString() : '',
                        max: jobData.salary?.max ? jobData.salary.max.toString() : '',
                        currency: jobData.salary?.currency || 'USD',
                        period: jobData.salary?.period || 'monthly'
                    },
                    description: jobData.description || '',
                    requirements: jobData.requirements?.length > 0 ? jobData.requirements : [''],
                    responsibilities: jobData.responsibilities?.length > 0 ? jobData.responsibilities : [''],
                    skills: jobData.skills?.length > 0 ? jobData.skills : [''],
                    benefits: jobData.benefits?.length > 0 ? jobData.benefits : [''],
                    experienceLevel: jobData.experienceLevel || 'entry',
                    applicationDeadline: formattedDeadline,
                    isActive: jobData.isActive !== undefined ? jobData.isActive : true,
                    isFeatured: jobData.isFeatured !== undefined ? jobData.isFeatured : false,
                    tags: jobData.tags?.length > 0 ? jobData.tags : [''],
                    contactEmail: jobData.contactEmail || '',
                    contactPhone: jobData.contactPhone || ''
                });
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch job data');
            }
        } catch (err) {
            console.error('Error fetching job:', err);
            setError('Failed to load job data');
        } finally {
            setFetchingJob(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            // Handle nested object properties (like salary.min)
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleArrayChange = (arrayName, index, value) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) =>
                i === index ? value : item
            )
        }));
    };

    const addArrayItem = (arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], '']
        }));
    };

    const removeArrayItem = (arrayName, index) => {
        if (formData[arrayName].length > 1) {
            setFormData(prev => ({
                ...prev,
                [arrayName]: prev[arrayName].filter((_, i) => i !== index)
            }));
        }
    };

    const handleRequirementChange = (index, value) => {
        handleArrayChange('requirements', index, value);
    };

    const addRequirement = () => {
        addArrayItem('requirements');
    };

    const removeRequirement = (index) => {
        removeArrayItem('requirements', index);
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.title.trim()) errors.push('Job title is required');
        if (!formData.major.trim()) errors.push('Job major/field is required');
        if (!formData.location.trim()) errors.push('Location is required');
        if (!formData.description.trim()) errors.push('Job description is required');
        if (formData.requirements.filter(req => req.trim()).length === 0) {
            errors.push('At least one requirement is required');
        }
        if (formData.responsibilities.filter(resp => resp.trim()).length === 0) {
            errors.push('At least one responsibility is required');
        }
        if (formData.applicationDeadline && new Date(formData.applicationDeadline) <= new Date()) {
            errors.push('Application deadline must be in the future');
        }
        if (formData.salary.min && formData.salary.max &&
            parseFloat(formData.salary.min) > parseFloat(formData.salary.max)) {
            errors.push('Minimum salary cannot be greater than maximum salary');
        }

        return errors;
    };

    const handleUpdate = async () => {
        setError('');
        setSuccess('');

        // Validate form
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            // Prepare job data for API
            const jobData = {
                title: formData.title.trim(),
                major: formData.major.trim(),
                type: formData.type,
                workLocation: formData.workLocation,
                location: formData.location.trim(),
                salary: {
                    min: formData.salary.min ? parseFloat(formData.salary.min) : undefined,
                    max: formData.salary.max ? parseFloat(formData.salary.max) : undefined,
                    currency: formData.salary.currency,
                    period: formData.salary.period
                },
                description: formData.description.trim(),
                requirements: formData.requirements.filter(req => req.trim()),
                responsibilities: formData.responsibilities.filter(resp => resp.trim()),
                skills: formData.skills.filter(skill => skill.trim()),
                benefits: formData.benefits.filter(benefit => benefit.trim()),
                experienceLevel: formData.experienceLevel,
                applicationDeadline: formData.applicationDeadline || undefined,
                isActive: formData.isActive,
                isFeatured: formData.isFeatured,
                tags: formData.tags.filter(tag => tag.trim()),
                contactEmail: formData.contactEmail.trim() || undefined,
                contactPhone: formData.contactPhone.trim() || undefined
            };

            const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobData)
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess('Job updated successfully!');
                setTimeout(() => {
                    navigate('/company/jobs');
                }, 1500);
            } else {
                setError(result.message || 'Failed to update job');
            }
        } catch (err) {
            console.error('Error updating job:', err);
            setError('Failed to update job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/company/jobs');
    };

    if (fetchingJob) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading job data...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Edit Job Posting
                        </h1>
                        <p className="text-gray-600">
                            Update your job posting details
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        {/* Error/Success Messages */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex">
                                    <div className="text-red-400">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <div className="flex">
                                    <div className="text-green-400">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-800">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Job Title */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaBriefcase className="text-blue-600" />
                                        Job Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Senior Frontend Developer"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Major/Field */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaIndustry className="text-purple-600" />
                                        Major/Field *
                                    </label>
                                    <input
                                        type="text"
                                        name="major"
                                        value={formData.major}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Computer Science, Engineering"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaUsers className="text-indigo-500" />
                                        Experience Level *
                                    </label>
                                    <select
                                        name="experienceLevel"
                                        value={formData.experienceLevel}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {experienceLevels.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaMapMarkerAlt className="text-red-500" />
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Jakarta, Indonesia"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Job Type & Work Location */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaClock className="text-green-500" />
                                        Job Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {jobTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaMapMarkerAlt className="text-orange-500" />
                                        Work Location *
                                    </label>
                                    <select
                                        name="workLocation"
                                        value={formData.workLocation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {workLocations.map(location => (
                                            <option key={location.value} value={location.value}>
                                                {location.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Application Deadline */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaCalendarAlt className="text-orange-500" />
                                        Application Deadline
                                    </label>
                                    <input
                                        type="date"
                                        name="applicationDeadline"
                                        value={formData.applicationDeadline}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Job Description */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FaFileAlt className="text-gray-600" />
                                    Job Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the job role, responsibilities, and what you're looking for in a candidate..."
                                    rows="6"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {formData.description.length}/5000 characters
                                </p>
                            </div>

                            {/* Salary Range */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FaDollarSign className="text-green-600" />
                                    Salary Range
                                </label>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="number"
                                        name="salary.min"
                                        value={formData.salary.min}
                                        onChange={handleInputChange}
                                        placeholder="Min salary"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        name="salary.max"
                                        value={formData.salary.max}
                                        onChange={handleInputChange}
                                        placeholder="Max salary"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        name="salary.currency"
                                        value={formData.salary.currency}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency.value} value={currency.value}>
                                                {currency.label}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        name="salary.period"
                                        value={formData.salary.period}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {salaryPeriods.map(period => (
                                            <option key={period.value} value={period.value}>
                                                {period.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FaListUl className="text-indigo-500" />
                                    Requirements *
                                </label>
                                <div className="space-y-2">
                                    {formData.requirements.map((requirement, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={requirement}
                                                onChange={(e) => handleRequirementChange(index, e.target.value)}
                                                placeholder={`Requirement ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {formData.requirements.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRequirement(index)}
                                                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        + Add Requirement
                                    </button>
                                </div>
                            </div>

                            {/* Responsibilities */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FaListUl className="text-green-500" />
                                    Responsibilities *
                                </label>
                                <div className="space-y-2">
                                    {formData.responsibilities.map((responsibility, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={responsibility}
                                                onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                                                placeholder={`Responsibility ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {formData.responsibilities.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('responsibilities', index)}
                                                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('responsibilities')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        + Add Responsibility
                                    </button>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FaListUl className="text-purple-500" />
                                    Skills
                                </label>
                                <div className="space-y-2">
                                    {formData.skills.map((skill, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={skill}
                                                onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                                                placeholder={`Skill ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {formData.skills.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('skills', index)}
                                                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('skills')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        + Add Skill
                                    </button>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FaListUl className="text-yellow-500" />
                                    Benefits
                                </label>
                                <div className="space-y-2">
                                    {formData.benefits.map((benefit, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={benefit}
                                                onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                                                placeholder={`Benefit ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {formData.benefits.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('benefits', index)}
                                                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('benefits')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        + Add Benefit
                                    </button>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FaListUl className="text-pink-500" />
                                    Tags
                                </label>
                                <div className="space-y-2">
                                    {formData.tags.map((tag, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tag}
                                                onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                                                placeholder={`Tag ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {formData.tags.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('tags', index)}
                                                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem('tags')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        + Add Tag
                                    </button>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaEnvelope className="text-red-500" />
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleInputChange}
                                        placeholder="hr@company.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaPhone className="text-green-500" />
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleInputChange}
                                        placeholder="+1234567890"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Job Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        Job is Active
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        Featured Job
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaSave />
                                {loading ? 'Updating...' : 'Update Job'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaTimes />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditJob;
