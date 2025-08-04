import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../../Components/SideBar'
import { FaCamera, FaSave, FaTimes, FaMapMarkerAlt, FaIndustry, FaGlobe, FaPhone, FaEnvelope, FaUpload, FaChevronDown } from 'react-icons/fa'

const ProfileEdit = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        companyName: '',
        mainLocation: '',
        industry: '',
        website: '',
        phoneNumber: '',
        email: '',
        description: ''
    });

    const [currentImages, setCurrentImages] = useState({
        profilePicture: '',
        bannerPicture: ''
    });

    const [bannerFile, setBannerFile] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            // Decode token to get company ID
            const payload = JSON.parse(atob(token.split('.')[1]));
            const companyId = payload.companyId;

            const response = await fetch(`http://localhost:3000/company/profile/${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({
                    companyName: data.companyName || '',
                    mainLocation: data.mainLocation || '',
                    industry: data.industry || '',
                    website: data.website || '',
                    phoneNumber: data.phoneNumber || '',
                    email: data.email || '',
                    description: data.description || ''
                });

                // Set current images
                setCurrentImages({
                    profilePicture: data.profilePicture || '',
                    bannerPicture: data.bannerPicture || ''
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch profile');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setBannerPreview(previewUrl);
        }
    };

    const handleProfileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setProfilePreview(previewUrl);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");

        try {
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            const companyId = payload.companyId;

            // Create FormData for file uploads
            const formDataToSend = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Append files if selected
            if (bannerFile) {
                formDataToSend.append('bannerPicture', bannerFile);
            }
            if (profileFile) {
                formDataToSend.append('profilePicture', profileFile);
            }

            const response = await fetch(`http://localhost:3000/company/profile/${companyId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type when using FormData
                },
                body: formDataToSend
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Profile updated successfully:', result);
                // Navigate back to profile page after saving
                navigate('/company/profile');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/company/profile');
    };

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
            if (profilePreview) URL.revokeObjectURL(profilePreview);
        };
    }, [bannerPreview, profilePreview]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
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
                <div className="p-4 sm:p-6 pt-4 sm:pt-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Banner Upload Section */}
                    <div className="relative bg-gray-200 rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden group">
                        <div className="relative h-32 sm:h-64 flex items-center justify-center bg-gray-200">
                            {/* Show current banner or preview or upload placeholder */}
                            {bannerPreview ? (
                                <img 
                                    src={bannerPreview}
                                    alt="Banner Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : currentImages.bannerPicture ? (
                                <img 
                                    src={`http://localhost:3000/${currentImages.bannerPicture}`}
                                    alt="Current Banner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-gray-600 px-4">
                                    <FaUpload className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 opacity-60" />
                                    <h2 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">Upload Company Banner</h2>
                                    <p className="text-sm sm:text-lg hidden sm:block">Click to upload your company banner image</p>
                                </div>
                            )}

                            {/* Upload overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <input 
                                    type="file" 
                                    id="bannerUpload" 
                                    accept="image/*" 
                                    onChange={handleBannerUpload}
                                    className="hidden"
                                />
                                <label htmlFor="bannerUpload" className="cursor-pointer text-center text-white px-4">
                                    <FaCamera className="w-6 h-6 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2" />
                                    <h3 className="text-sm sm:text-lg font-semibold mb-1">
                                        {currentImages.bannerPicture || bannerPreview ? 'Change Banner' : 'Upload Banner'}
                                    </h3>
                                    {bannerFile && (
                                        <p className="text-xs sm:text-sm text-blue-200 font-medium">
                                            New file: {bannerFile.name}
                                        </p>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content Form */}
                    <div className="card-company w-full min-h-[400px] sm:min-h-[660px] bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                        <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-3">
                            {/* Profile Section */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-10 justify-start items-center sm:items-center p-3 w-full lg:flex-1'>
                                {/* Profile Picture Upload */}
                                <div className='profile-pic-container flex-shrink-0'>
                                    <div className='w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gray-200 shadow-sm overflow-hidden relative group cursor-pointer'>
                                        {/* Show current profile picture or preview or upload placeholder */}
                                        {profilePreview ? (
                                            <img 
                                                src={profilePreview}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : currentImages.profilePicture ? (
                                            <img 
                                                src={`http://localhost:3000/${currentImages.profilePicture}`}
                                                alt="Current Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <div className="text-center">
                                                    <FaCamera className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                                                    <p className="text-xs sm:text-sm">Upload Photo</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full">
                                            <input 
                                                type="file" 
                                                id="profileUpload" 
                                                accept="image/*" 
                                                onChange={handleProfileUpload}
                                                className="hidden"
                                            />
                                            <label htmlFor="profileUpload" className="cursor-pointer text-center text-white">
                                                <FaCamera className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1" />
                                                <p className="text-xs font-medium">
                                                    {currentImages.profilePicture || profilePreview ? 'Change Photo' : 'Upload Photo'}
                                                </p>
                                                {profileFile && (
                                                    <p className="text-xs mt-1 text-blue-200">
                                                        {profileFile.name.substring(0, 8)}...
                                                    </p>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Company Information Form */}
                                <div className='py-3 flex flex-col gap-3 sm:gap-4 justify-center items-center sm:items-start w-full'>
                                    {/* Action Buttons - Mobile Only */}
                                    <div className="sm:hidden flex gap-3 w-full justify-end mb-4">
                                        <button 
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className='flex items-center gap-2 px-4 py-2 bg-gray-500 text-white cursor-pointer rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium text-sm disabled:opacity-50'
                                        >
                                            <FaTimes className='w-4 h-4' />
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            disabled={saving}
                                            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50'
                                        >
                                            <FaSave className='w-4 h-4' />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>

                                    {/* Company Name */}
                                    <div className='w-full'>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Company Name
                                        </label>
                                        <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-8'>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                className='w-full sm:w-[60%] px-4 py-2 sm:py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-lg sm:text-2xl uppercase'
                                            />
                                            {/* Action Buttons - Desktop Only */}
                                            <div className="hidden sm:flex gap-3 w-auto justify-start">
                                                <button 
                                                    onClick={handleCancel}
                                                    disabled={saving}
                                                    className='flex items-center gap-2 px-6 py-1 bg-gray-500 text-white cursor-pointer rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium text-sm disabled:opacity-50'
                                                >
                                                    <FaTimes className='w-4 h-4' />
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={handleSave}
                                                    disabled={saving}
                                                    className='flex items-center gap-2 px-6 py-1 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50'
                                                >
                                                    <FaSave className='w-4 h-4' />
                                                    {saving ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location, Industry, Website */}
                                    <div className='flex flex-col gap-3 w-full'>
                                        <div className='flex items-center gap-2'>
                                            <FaMapMarkerAlt className='text-red-500 flex-shrink-0' />
                                            <input
                                                type="text"
                                                name="mainLocation"
                                                value={formData.mainLocation}
                                                onChange={handleInputChange}
                                                placeholder="Company Location"
                                                className='w-full sm:w-[60%] lg:w-[50%] px-3 py-2 sm:py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600'
                                            />
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <FaIndustry className='text-blue-500 flex-shrink-0' />
                                            <input
                                                type="text"
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleInputChange}
                                                placeholder="Industry"
                                                className='w-full sm:w-[60%] lg:w-[50%] px-3 py-2 sm:py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600'
                                            />
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <FaGlobe className='text-green-500 flex-shrink-0' />
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                placeholder="Company Website"
                                                className='w-full sm:w-[60%] lg:w-[50%] px-3 py-2 sm:py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Form */}
                            <div className="bg-white rounded-lg shadow-sm border w-full lg:w-[400px] border-gray-200 p-4 sm:p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center lg:text-left">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <FaPhone className="text-blue-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="Phone Number"
                                                className='w-full px-3 py-2 sm:py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-gray-900'
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <FaEnvelope className="text-green-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-600 mb-1">Email</p>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Email Address"
                                                className='w-full px-3 py-2 sm:py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-gray-900'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Description */}
                        <div className='w-full justify-between flex gap-5'>
                            <div className='flex flex-col gap-4 px-5 w-full'>
                                <div className='title'>
                                    <label className='block text-2xl font-bold text-gray-900 mb-2'>
                                        Overview:
                                    </label>
                                </div>
                                <div className='content'>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Write a detailed description about your company..."
                                        rows="8"
                                        className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-justify resize-vertical'
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        {formData.description.length} characters
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileEdit