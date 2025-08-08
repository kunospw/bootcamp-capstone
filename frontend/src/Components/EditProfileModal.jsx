import React, { useState, useEffect } from 'react';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Country and City states
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    
    // Dropdown states
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    // Profile picture states
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [uploadingPicture, setUploadingPicture] = useState(false);

    // Initialize form data when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                ...user,
                skillsInput: user.skills ? user.skills.join(', ') : '',
                country: user.domicile ? user.domicile.split(', ')[1] || '' : '', // Extract country from domicile
                city: user.domicile ? user.domicile.split(', ')[0] || '' : '' // Extract city from domicile
            });
        }
    }, [isOpen, user]);

    // Fetch countries on modal open
    useEffect(() => {
        if (isOpen && countries.length === 0) {
            fetchCountries();
        }
    }, [isOpen, countries.length]);

    // Set cities when countries are loaded and country is already selected
    useEffect(() => {
        if (countries.length > 0 && formData.country) {
            const selectedCountry = countries.find(c => c.country === formData.country);
            if (selectedCountry) {
                setCities(selectedCountry.cities || []);
            }
        }
    }, [countries, formData.country]);

    // Filter countries based on search
    useEffect(() => {
        const filtered = countries.filter(country =>
            country.country.toLowerCase().includes(countrySearch.toLowerCase())
        );
        setFilteredCountries(filtered);
    }, [countries, countrySearch]);

    // Filter cities based on search
    useEffect(() => {
        const filtered = cities.filter(city =>
            city.toLowerCase().includes(citySearch.toLowerCase())
        );
        setFilteredCities(filtered);
    }, [cities, citySearch]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setCountryDropdownOpen(false);
                setCityDropdownOpen(false);
            }
        };

        if (countryDropdownOpen || cityDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [countryDropdownOpen, cityDropdownOpen]);

    const fetchCountries = async () => {
        setLoadingCountries(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries');
            const data = await response.json();
            if (data.error) {
                throw new Error(data.msg || 'Failed to fetch countries');
            }
            setCountries(data.data);
        } catch (error) {
            console.error('Error fetching countries:', error);
        } finally {
            setLoadingCountries(false);
        }
    };

    const handleCountrySelect = (country) => {
        setFormData(prev => ({
            ...prev,
            country: country.country,
            city: '' // Reset city when country changes
        }));
        setCities(country.cities || []);
        setCountryDropdownOpen(false);
        setCountrySearch('');
    };

    const handleCitySelect = (city) => {
        setFormData(prev => ({
            ...prev,
            city: city
        }));
        setCityDropdownOpen(false);
        setCitySearch('');
    };

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

    // Handle profile picture upload
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, or GIF)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            
            setProfilePictureFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicturePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload profile picture to server
    const uploadProfilePicture = async () => {
        if (!profilePictureFile) return null;
        
        setUploadingPicture(true);
        const formData = new FormData();
        formData.append('profilePicture', profilePictureFile);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://api.sonervous.site/auth/upload-profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload profile picture');
            }
            
            const data = await response.json();
            return data.profilePictureUrl;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload profile picture');
            return null;
        } finally {
            setUploadingPicture(false);
        }
    };

    // Remove profile picture
    const removeProfilePicture = () => {
        setProfilePictureFile(null);
        setProfilePicturePreview('');
        setFormData(prev => ({
            ...prev,
            profilePicture: ''
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload profile picture if there's a new one
            let profilePictureUrl = formData.profilePicture;
            if (profilePictureFile) {
                const uploadedUrl = await uploadProfilePicture();
                if (uploadedUrl) {
                    profilePictureUrl = uploadedUrl;
                }
            }

            // Process skills input into array and combine country/city into domicile
            const processedData = {
                ...formData,
                profilePicture: profilePictureUrl,
                skills: formData.skillsInput 
                    ? formData.skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill)
                    : [],
                domicile: formData.country && formData.city 
                    ? `${formData.city}, ${formData.country}`
                    : formData.country || formData.city || ''
            };
            
            // Remove the temporary fields
            delete processedData.skillsInput;
            delete processedData.country;
            delete processedData.city;
            
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
        const resetData = {
            ...user,
            skillsInput: user.skills ? user.skills.join(', ') : '',
            country: user.domicile ? user.domicile.split(', ')[1] || '' : '',
            city: user.domicile ? user.domicile.split(', ')[0] || '' : ''
        };
        setFormData(resetData);
        setCountryDropdownOpen(false);
        setCityDropdownOpen(false);
        setCountrySearch('');
        setCitySearch('');
        // Reset profile picture states
        setProfilePictureFile(null);
        setProfilePicturePreview('');
        setUploadingPicture(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-2 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div>
                        <h2 className="text-2xl font-bold">Edit Profile</h2>
                        <p className="text-blue-100 text-sm mt-1">Update your professional information</p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="text-blue-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

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
                                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                            </div>
                            
                            {/* Profile Picture Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-4">
                                    Profile Picture
                                </label>
                                <div className="flex items-start space-x-6">
                                    {/* Current/Preview Picture */}
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                            {profilePicturePreview ? (
                                                <img 
                                                    src={profilePicturePreview} 
                                                    alt="Profile Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : formData.profilePicture ? (
                                                <img 
                                                    src={formData.profilePicture.startsWith('http') ? formData.profilePicture : `https://api.sonervous.site/${formData.profilePicture}`} 
                                                    alt="Current Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            )}
                                        </div>
                                        {uploadingPicture && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Upload Controls */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-3">
                                            {/* Upload Button */}
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleProfilePictureChange}
                                                    className="hidden"
                                                    disabled={uploadingPicture}
                                                />
                                                <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    {profilePictureFile ? 'Change Picture' : 'Upload Picture'}
                                                </span>
                                            </label>
                                            
                                            {/* Remove Button */}
                                            {(profilePicturePreview || formData.profilePicture) && (
                                                <button
                                                    type="button"
                                                    onClick={removeProfilePicture}
                                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                    disabled={uploadingPicture}
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 flex items-start">
                                            <svg className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Supported formats: JPEG, PNG, GIF. Maximum size: 5MB.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName || ''}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Birth Date
                                    </label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender || 'prefer-not-to-say'}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Country Dropdown */}
                                        <div className="relative dropdown-container">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Country
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCountryDropdownOpen(!countryDropdownOpen);
                                                        setCityDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between transition-colors"
                                                >
                                                    <span className={formData.country ? 'text-gray-900' : 'text-gray-500'}>
                                                        {formData.country || 'Select country...'}
                                                    </span>
                                                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} 
                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {countryDropdownOpen && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
                                                        <div className="p-3 border-b border-gray-200">
                                                            <input
                                                                type="text"
                                                                placeholder="Search countries..."
                                                                value={countrySearch}
                                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {loadingCountries ? (
                                                                <div className="p-4 text-center text-gray-500">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                                    Loading countries...
                                                                </div>
                                                            ) : filteredCountries.length > 0 ? (
                                                                filteredCountries.map((country, index) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        onClick={() => handleCountrySelect(country)}
                                                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                                                                    >
                                                                        {country.country}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="p-4 text-center text-gray-500">No countries found</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* City Dropdown */}
                                        <div className="relative dropdown-container">
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                City
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (formData.country) {
                                                            setCityDropdownOpen(!cityDropdownOpen);
                                                            setCountryDropdownOpen(false);
                                                        }
                                                    }}
                                                    disabled={!formData.country}
                                                    className={`w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between transition-colors ${
                                                        !formData.country ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                                                    }`}
                                                >
                                                    <span className={formData.city ? 'text-gray-900' : 'text-gray-500'}>
                                                        {formData.city || (formData.country ? 'Select city...' : 'Select country first')}
                                                    </span>
                                                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} 
                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {cityDropdownOpen && formData.country && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
                                                        <div className="p-3 border-b border-gray-200">
                                                            <input
                                                                type="text"
                                                                placeholder="Search cities..."
                                                                value={citySearch}
                                                                onChange={(e) => setCitySearch(e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {filteredCities.length > 0 ? (
                                                                filteredCities.map((city, index) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        onClick={() => handleCitySelect(city)}
                                                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                                                                    >
                                                                        {city}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="p-4 text-center text-gray-500">No cities found</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-green-100 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">About</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio || ''}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Tell us about yourself..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Professional Summary
                                    </label>
                                    <textarea
                                        name="personalSummary"
                                        value={formData.personalSummary || ''}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Describe your professional background and career goals..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Skills (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.skillsInput || ''}
                                    onChange={handleSkillsChange}
                                    placeholder="e.g., JavaScript, React, Node.js, Python"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Separate skills with commas
                                </p>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 13h.01M16 13h.01" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addExperience}
                                    className="bg-[#F4B400] hover:bg-[#E6A200] text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Experience
                                </button>
                            </div>

                            {(formData.experience || []).length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 13h.01M16 13h.01" />
                                    </svg>
                                    <p className="text-gray-500">No experience added yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Click "Add Experience" to start</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(formData.experience || []).map((exp, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900 flex items-center">
                                                    <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                                                        {index + 1}
                                                    </span>
                                                    Experience {index + 1}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExperience(index)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Company *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={exp.company || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Company name"
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Job title"
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    />
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <input
                                                            type="checkbox"
                                                            checked={exp.current || false}
                                                            onChange={(e) => {
                                                                handleExperienceChange(index, 'current', e.target.checked);
                                                                if (e.target.checked) {
                                                                    handleExperienceChange(index, 'endDate', '');
                                                                }
                                                            }}
                                                            className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">Currently working here</span>
                                                    </label>
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={exp.description || ''}
                                                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                        rows="3"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                                        placeholder="Describe your responsibilities and achievements..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Education */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addEducation}
                                    className="bg-[#F4B400] hover:bg-[#E6A200] text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Education
                                </button>
                            </div>

                            {(formData.education || []).length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="text-gray-500">No education added yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Click "Add Education" to start</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(formData.education || []).map((edu, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-gray-900 flex items-center">
                                                    <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                                                        {index + 1}
                                                    </span>
                                                    Education {index + 1}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEducation(index)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Institution *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={edu.institution || ''}
                                                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="University or school name"
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Bachelor's, Master's, etc."
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="Computer Science, Business, etc."
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="3.8, A, etc."
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    />
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <input
                                                            type="checkbox"
                                                            checked={edu.current || false}
                                                            onChange={(e) => {
                                                                handleEducationChange(index, 'current', e.target.checked);
                                                                if (e.target.checked) {
                                                                    handleEducationChange(index, 'endDate', '');
                                                                }
                                                            }}
                                                            className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">Currently studying here</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="edit-profile-form"
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
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
