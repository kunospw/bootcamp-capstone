import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../../Components/SideBar'
import { FaCamera, FaSave, FaTimes, FaMapMarkerAlt, FaIndustry, FaGlobe, FaPhone, FaEnvelope, FaUpload, FaChevronDown } from 'react-icons/fa'

const ProfileEdit = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        companyName: 'PT Fitra Abadi',
        location: 'Garut, Indonesia',
        industry: 'Information Technology',
        website: 'www.companywebsite.com',
        phone: '+62 123 456 7890',
        email: 'contact@ptfitraabadi.com',
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quo veniam qui repudiandae rerum quas expedita earum cupiditate consequatur iure, maiores et, deserunt sapiente accusamus soluta ullam ipsum? Reiciendis, architecto. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut vitae saepe neque atque quam dolorum sed debitis, ratione tempore non dolore praesentium recusandae eveniet commodi ad mollitia ullam, necessitatibus odit!'
    });

    const [bannerFile, setBannerFile] = useState(null);
    const [profileFile, setProfileFile] = useState(null);

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
        }
    };

    const handleProfileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
        }
    };

    const handleSave = () => {
        console.log('Saving profile data:', formData);
        console.log('Banner file:', bannerFile);
        console.log('Profile file:', profileFile);
        // Navigate back to profile page after saving
        navigate('/company/profile');
    };

    const handleCancel = () => {
        console.log('Cancel editing');
        // Navigate back to profile page without saving
        navigate('/company/profile');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Banner Upload Section */}
                    <div className="relative bg-gray-200 rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                        <div className="relative h-64 flex items-center justify-center bg-gray-200">
                            <input 
                                type="file" 
                                id="bannerUpload" 
                                accept="image/*" 
                                onChange={handleBannerUpload}
                                className="hidden"
                            />
                            <label htmlFor="bannerUpload" className="cursor-pointer text-center text-gray-600 hover:text-gray-800 transition-colors">
                                <FaUpload className="w-16 h-16 mx-auto mb-4 opacity-60" />
                                <h2 className="text-2xl font-semibold mb-2">Upload Company Banner</h2>
                                <p className="text-lg">Click to upload your company banner image</p>
                                {bannerFile && (
                                    <p className="text-sm mt-2 text-blue-600 font-medium">
                                        Selected: {bannerFile.name}
                                    </p>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Profile Content Form */}
                    <div className="card-company w-full min-h-[660px] bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-5">
                        <div className="w-full justify-between flex gap-3">
                            <div className='flex gap-10 justify-start items-center p-3 w-full'>
                                {/* Profile Picture Upload */}
                                <div className='profile-pic-container flex-shrink-0'>
                                    <div className='w-48 h-48 rounded-full bg-gray-200 shadow-sm overflow-hidden relative group cursor-pointer'>
                                        <input 
                                            type="file" 
                                            id="profileUpload" 
                                            accept="image/*" 
                                            onChange={handleProfileUpload}
                                            className="hidden"
                                        />
                                        <label htmlFor="profileUpload" className="w-full h-full flex items-center justify-center cursor-pointer">
                                            <div className="text-center text-gray-500 group-hover:text-gray-700">
                                                <FaCamera className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-sm">Upload Photo</p>
                                                {profileFile && (
                                                    <p className="text-xs mt-1 text-blue-600">
                                                        {profileFile.name.substring(0, 15)}...
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Company Information Form */}
                                <div className='py-3 flex flex-col gap-4 justify-center items-start w-full'>
                                    {/* Company Name */}
                                    <div className='w-full'>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Company Name
                                        </label>
                                        <div className='flex items-center gap-8'>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                className='w-[50%] px-4 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-2xl uppercase'
                                            />
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={handleCancel}
                                                    className='flex items-center gap-2 px-6 py-1 bg-gray-500 text-white cursor-pointer rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium text-sm'
                                                >
                                                    <FaTimes className='w-4 h-4' />
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={handleSave}
                                                    className='flex items-center gap-2 px-6 py-1 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm'
                                                >
                                                    <FaSave className='w-4 h-4' />
                                                    Save
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
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="Company Location"
                                                className='w-[30%] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600'
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
                                                className='w-[30%] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600'
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
                                                className='w-[30%] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Form */}
                            <div className="bg-white rounded-lg shadow-sm border w-[400px] border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <FaPhone className="text-blue-600 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Phone Number"
                                                className='w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-gray-900'
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <FaEnvelope className="text-green-600 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 mb-1">Email</p>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Email Address"
                                                className='w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-gray-900'
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