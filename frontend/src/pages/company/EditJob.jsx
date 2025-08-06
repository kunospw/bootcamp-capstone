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
        // if (formData.responsibilities.filter(resp => resp.trim()).length === 0) {
        //   errors.push('At least one responsibility is required');
        // }
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
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm">{success}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Form Fields */}
                            <div className="space-y-6">
                                {/* Job Title */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaBriefcase className="text-blue-500" />
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

                                {/* Job Major/Field */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaIndustry className="text-purple-500" />
                                        Job Major/Field *
                                    </label>
                                    <input
                                        type="text"
                                        name="major"
                                        value={formData.major}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Software Engineering, Marketing, Finance"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
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
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaUsers className="text-purple-500" />
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
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {formData.requirements.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRequirement(index)}
                                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addRequirement}
                                            className="w-full px-3 py-2 border border-dashed border-gray-400 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            + Add Requirement
                                        </button>
                                    </div>
                                </div>

                                {/* Responsibilities */}
                                {/* <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaListUl className="text-green-500" />
                                        Responsibilities (Optional)
                                    </label>
                                    <div className="space-y-2">
                                        {formData.responsibilities.map((responsibility, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={responsibility}
                                                    onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                                                    placeholder={`Responsibility ${index + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {formData.responsibilities.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem('responsibilities', index)}
                                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('responsibilities')}
                                            className="w-full px-3 py-2 border border-dashed border-gray-400 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            + Add Responsibility
                                        </button>
                                    </div>
                                </div> */}

                                {/* Skills */}
                                {/* <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaListUl className="text-purple-500" />
                                        Skills (Optional)
                                    </label>
                                    <div className="space-y-2">
                                        {formData.skills.map((skill, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={skill}
                                                    onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                                                    placeholder={`Skill ${index + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {formData.skills.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem('skills', index)}
                                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('skills')}
                                            className="w-full px-3 py-2 border border-dashed border-gray-400 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            + Add Skill
                                        </button>
                                    </div>
                                </div> */}

                                {/* Benefits */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaListUl className="text-yellow-500" />
                                        Benefits (Optional)
                                    </label>
                                    <div className="space-y-2">
                                        {formData.benefits.map((benefit, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={benefit}
                                                    onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                                                    placeholder={`Benefit ${index + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                {formData.benefits.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayItem('benefits', index)}
                                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <FaTimes className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addArrayItem('benefits')}
                                            className="w-full px-3 py-2 border border-dashed border-gray-400 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            + Add Benefit
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <FaEnvelope className="text-blue-500" />
                                            Contact Email (Optional)
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
                                            Contact Phone (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            name="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={handleInputChange}
                                            placeholder="+62-XXX-XXXX-XXXX"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Job Status */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Activate job posting immediately
                                        </label>
                                    </div>
                                    {/* <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={formData.isFeatured}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Featured Job (highlighted in listings)
                                        </label>
                                    </div> */}
                                </div>
                            </div>

                            {/* Right Column - Preview */}
                            <div className="space-y-6">
                                <div className="sticky top-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Job Preview
                                    </h3>

                                    {/* Job Preview Card */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                                        {/* Header */}
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900">
                                                {formData.title || 'Job Title'}
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1">Your Company Name</p>
                                        </div>

                                        {/* Job Details */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaMapMarkerAlt className="text-red-500 w-4 h-4" />
                                                <span>{formData.location || 'Location'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaClock className="text-green-500 w-4 h-4" />
                                                <span>{jobTypes.find(type => type.value === formData.type)?.label || 'Job Type'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaMapMarkerAlt className="text-orange-500 w-4 h-4" />
                                                <span>{workLocations.find(location => location.value === formData.workLocation)?.label || 'Work Location'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaUsers className="text-purple-500 w-4 h-4" />
                                                <span>{experienceLevels.find(level => level.value === formData.experienceLevel)?.label || 'Experience Level'}</span>
                                            </div>

                                            {formData.applicationDeadline && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaCalendarAlt className="text-orange-500 w-4 h-4" />
                                                    <span>Deadline: {new Date(formData.applicationDeadline).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            )}

                                            {(formData.salary.min || formData.salary.max) && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaDollarSign className="text-green-600 w-4 h-4" />
                                                    <span>
                                                        {formData.salary.min && formData.salary.max
                                                            ? `${formData.salary.currency} ${parseInt(formData.salary.min).toLocaleString()} - ${parseInt(formData.salary.max).toLocaleString()} ${salaryPeriods.find(p => p.value === formData.salary.period)?.label?.toLowerCase() || ''}`
                                                            : formData.salary.min
                                                                ? `${formData.salary.currency} ${parseInt(formData.salary.min).toLocaleString()}+ ${salaryPeriods.find(p => p.value === formData.salary.period)?.label?.toLowerCase() || ''}`
                                                                : formData.salary.max
                                                                    ? `Up to ${formData.salary.currency} ${parseInt(formData.salary.max).toLocaleString()} ${salaryPeriods.find(p => p.value === formData.salary.period)?.label?.toLowerCase() || ''}`
                                                                    : 'Salary Range'
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description Preview */}
                                        {formData.description && (
                                            <div>
                                                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                                                <p className="text-sm text-gray-600 line-clamp-4">
                                                    {formData.description.substring(0, 200)}
                                                    {formData.description.length > 200 && '...'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Requirements Preview */}
                                        {formData.requirements.some(req => req.trim()) && (
                                            <div>
                                                <h5 className="font-semibold text-gray-900 mb-2">Requirements</h5>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {formData.requirements
                                                        .filter(req => req.trim())
                                                        .slice(0, 3)
                                                        .map((req, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <span className="text-blue-500 mt-1">•</span>
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    {formData.requirements.filter(req => req.trim()).length > 3 && (
                                                        <li className="text-gray-400 text-xs">
                                                            +{formData.requirements.filter(req => req.trim()).length - 3} more requirements
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
    
                                        {/* Benefits Preview */}
                                        {formData.benefits.some(benefit => benefit.trim()) && (
                                            <div>
                                                <h5 className="font-semibold text-gray-900 mb-2">Benefits</h5>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {formData.benefits
                                                        .filter(benefit => benefit.trim())
                                                        .slice(0, 3)
                                                        .map((benefit, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <span className="text-green-500 mt-1">•</span>
                                                                <span>{benefit}</span>
                                                            </li>
                                                        ))}
                                                    {formData.benefits.filter(benefit => benefit.trim()).length > 3 && (
                                                        <li className="text-gray-400 text-xs">
                                                            +{formData.benefits.filter(benefit => benefit.trim()).length - 3} more benefits
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Contact Information Preview */}
                                        {(formData.contactEmail || formData.contactPhone) && (
                                            <div>
                                                <h5 className="font-semibold text-gray-900 mb-2">Contact Information</h5>
                                                <div className="space-y-2">
                                                    {formData.contactEmail && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <FaEnvelope className="text-blue-500 w-4 h-4" />
                                                            <span>{formData.contactEmail}</span>
                                                        </div>
                                                    )}
                                                    {formData.contactPhone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <FaPhone className="text-green-500 w-4 h-4" />
                                                            <span>{formData.contactPhone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${formData.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}></div>
                                                {formData.isActive ? 'Active' : 'Draft'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className='flex items-center gap-2 px-6 py-1 bg-gray-500 text-white cursor-pointer rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            <FaTimes className='w-4 h-4' />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={loading}
                                            className='flex items-center gap-2 px-6 py-1 bg-[#F4B400] text-black cursor-pointer rounded-lg hover:bg-[#E6A200] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className='w-4 h-4' />
                                                    Update Job
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditJob;
