import React, { useState, useEffect } from 'react';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize form data when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                ...user,
                skillsInput: user.skills ? user.skills.join(', ') : ''
            });
        }
    }, [isOpen, user]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle skills input (comma-separated)
    const handleSkillsChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            skillsInput: value
        }));
    };

    // Handle experience changes
    const handleExperienceChange = (index, field, value) => {
        const updatedExperience = [...(formData.experience || [])];
        updatedExperience[index] = {
            ...updatedExperience[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            experience: updatedExperience
        }));
    };

    // Add new experience
    const addExperience = () => {
        const newExperience = {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        setFormData(prev => ({
            ...prev,
            experience: [...(prev.experience || []), newExperience]
        }));
    };

    // Remove experience
    const removeExperience = (index) => {
        const updatedExperience = (formData.experience || []).filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            experience: updatedExperience
        }));
    };

    // Handle education changes
    const handleEducationChange = (index, field, value) => {
        const updatedEducation = [...(formData.education || [])];
        updatedEducation[index] = {
            ...updatedEducation[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            education: updatedEducation
        }));
    };

    // Add new education
    const addEducation = () => {
        const newEducation = {
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            current: false,
            grade: ''
        };
        setFormData(prev => ({
            ...prev,
            education: [...(prev.education || []), newEducation]
        }));
    };

    // Remove education
    const removeEducation = (index) => {
        const updatedEducation = (formData.education || []).filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            education: updatedEducation
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Process skills input into array
            const processedData = {
                ...formData,
                skills: formData.skillsInput 
                    ? formData.skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill)
                    : []
            };
            
            // Remove the temporary skillsInput field
            delete processedData.skillsInput;
            
            await onSave(processedData);
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setFormData({
            ...user,
            skillsInput: user.skills ? user.skills.join(', ') : ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender || 'prefer-not-to-say'}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="domicile"
                                    value={formData.domicile || ''}
                                    onChange={handleInputChange}
                                    placeholder="City, Country"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Tell us about yourself..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Summary
                                </label>
                                <textarea
                                    name="personalSummary"
                                    value={formData.personalSummary || ''}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Describe your professional background and career goals..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Skills (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.skillsInput || ''}
                                onChange={handleSkillsChange}
                                placeholder="e.g., JavaScript, React, Node.js, Python"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                        </div>
                    </div>

                    {/* Experience */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Experience</h3>
                            <button
                                type="button"
                                onClick={addExperience}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Experience
                            </button>
                        </div>

                        {(formData.experience || []).map((exp, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeExperience(index)}
                                        className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company *
                                        </label>
                                        <input
                                            type="text"
                                            value={exp.company || ''}
                                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position *
                                        </label>
                                        <input
                                            type="text"
                                            value={exp.position || ''}
                                            onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                                            disabled={exp.current}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exp.current || false}
                                                onChange={(e) => {
                                                    handleExperienceChange(index, 'current', e.target.checked);
                                                    if (e.target.checked) {
                                                        handleExperienceChange(index, 'endDate', '');
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">Currently working here</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={exp.description || ''}
                                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Education */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Education</h3>
                            <button
                                type="button"
                                onClick={addEducation}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Education
                            </button>
                        </div>

                        {(formData.education || []).map((edu, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeEducation(index)}
                                        className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Institution *
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.institution || ''}
                                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Degree *
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.degree || ''}
                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Field of Study
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.fieldOfStudy || ''}
                                            onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Grade/GPA
                                        </label>
                                        <input
                                            type="text"
                                            value={edu.grade || ''}
                                            onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                                            disabled={edu.current}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={edu.current || false}
                                                onChange={(e) => {
                                                    handleEducationChange(index, 'current', e.target.checked);
                                                    if (e.target.checked) {
                                                        handleEducationChange(index, 'endDate', '');
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-gray-700">Currently studying here</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
