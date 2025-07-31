import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SideBar from '../../Components/SideBar';
import { FaSave, FaTimes, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaClock, FaCalendarAlt, FaUsers, FaFileAlt, FaListUl } from 'react-icons/fa';

const EditJob = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: [''],
        salaryMin: '',
        salaryMax: '',
        location: '',
        jobType: 'full-time',
        experienceLevel: 'entry',
        deadline: '',
        isActive: true
    });

    const [loading, setLoading] = useState(true);

    const jobTypes = [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' }
    ];

    const experienceLevels = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'mid', label: 'Mid Level' },
        { value: 'senior', label: 'Senior Level' }
    ];

    // Mock data untuk demo - biasanya akan fetch dari API berdasarkan ID
    useEffect(() => {
        // Simulasi loading data job berdasarkan ID
        const loadJobData = () => {
            // Mock data - replace dengan actual API call
            const mockJobData = {
                title: 'Senior React Developer',
                description: 'We are looking for an experienced React developer to join our growing team...',
                requirements: [
                    'Minimum 3 years experience with React',
                    'Strong knowledge of JavaScript ES6+',
                    'Experience with Redux or Context API',
                    'Familiarity with modern build tools'
                ],
                salaryMin: '8000000',
                salaryMax: '15000000',
                location: 'Jakarta, Indonesia',
                jobType: 'full-time',
                experienceLevel: 'senior',
                deadline: '2025-08-31',
                isActive: true
            };

            setFormData(mockJobData);
            setLoading(false);
        };

        setTimeout(loadJobData, 500); // Simulasi loading
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRequirementChange = (index, value) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData(prev => ({
            ...prev,
            requirements: newRequirements
        }));
    };

    const addRequirement = () => {
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, '']
        }));
    };

    const removeRequirement = (index) => {
        if (formData.requirements.length > 1) {
            const newRequirements = formData.requirements.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                requirements: newRequirements
            }));
        }
    };

    const handleSave = () => {
        // Validasi basic
        if (!formData.title || !formData.description || !formData.location) {
            alert('Please fill in all required fields');
            return;
        }

        // Filter out empty requirements
        const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');

        const jobData = {
            ...formData,
            requirements: filteredRequirements
        };

        console.log('Updating job with data:', jobData);

        // Simulasi save - replace dengan actual API call
        alert('Job updated successfully!');
        navigate(`/company/jobs/${id}`);
    };

    const handleCancel = () => {
        navigate(`/company/jobs/${id}`);
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Loading job data...</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Job</h1>
                                <p className="text-gray-600">Update job information and requirements</p>
                            </div>
                        </div>
                    </div>

                    {/* Job Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Left Column - Form */}
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

                                {/* Job Type */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaClock className="text-green-500" />
                                        Job Type *
                                    </label>
                                    <select
                                        name="jobType"
                                        value={formData.jobType}
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

                                {/* Deadline */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaCalendarAlt className="text-orange-500" />
                                        Application Deadline
                                    </label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
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
                                        {formData.description.length} characters
                                    </p>
                                </div>

                                {/* Salary Range */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaDollarSign className="text-green-600" />
                                        Salary Range (IDR)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            name="salaryMin"
                                            value={formData.salaryMin}
                                            onChange={handleInputChange}
                                            placeholder="Min salary"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="number"
                                            name="salaryMax"
                                            value={formData.salaryMax}
                                            onChange={handleInputChange}
                                            placeholder="Max salary"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FaListUl className="text-indigo-500" />
                                        Requirements
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

                                {/* Active Status */}
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
                                    
                                    {/* Preview Card */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                                        {/* Title */}
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900">
                                                {formData.title || 'Job Title'}
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1">Your Company Name</p>
                                        </div>

                                        {/* Job Info */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaMapMarkerAlt className="text-red-500 w-4 h-4" />
                                                <span>{formData.location || 'Location'}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaClock className="text-green-500 w-4 h-4" />
                                                <span>{jobTypes.find(type => type.value === formData.jobType)?.label || 'Job Type'}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaUsers className="text-purple-500 w-4 h-4" />
                                                <span>{experienceLevels.find(level => level.value === formData.experienceLevel)?.label || 'Experience Level'}</span>
                                            </div>
                                            
                                            {formData.deadline && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaCalendarAlt className="text-orange-500 w-4 h-4" />
                                                    <span>Deadline: {new Date(formData.deadline).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            )}
                                            
                                            {(formData.salaryMin || formData.salaryMax) && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaDollarSign className="text-green-600 w-4 h-4" />
                                                    <span>
                                                        {formData.salaryMin && formData.salaryMax 
                                                            ? `IDR ${parseInt(formData.salaryMin).toLocaleString()} - ${parseInt(formData.salaryMax).toLocaleString()}`
                                                            : formData.salaryMin 
                                                                ? `IDR ${parseInt(formData.salaryMin).toLocaleString()}+`
                                                                : formData.salaryMax
                                                                    ? `Up to IDR ${parseInt(formData.salaryMax).toLocaleString()}`
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

                                        {/* Status */}
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                                formData.isActive 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    formData.isActive ? 'bg-green-500' : 'bg-gray-400'
                                                }`}></div>
                                                {formData.isActive ? 'Active' : 'Draft'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button 
                                            onClick={handleCancel}
                                            className='flex items-center gap-2 px-6 py-1 bg-gray-500 text-white cursor-pointer rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium'
                                        >
                                            <FaTimes className='w-4 h-4' />
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            className='flex items-center gap-2 px-6 py-1 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium'
                                        >
                                            <FaSave className='w-4 h-4' />
                                            Update Job
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
