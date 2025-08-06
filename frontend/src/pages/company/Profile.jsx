import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../../Components/SideBar'
import { FaCamera, FaEdit, FaMapMarkerAlt, FaIndustry, FaGlobe, FaPhone, FaEnvelope } from 'react-icons/fa'

const Profile = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
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
                setCompany(data);
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
    
    const handleEditBanner = () => {
        navigate('/company/profile/edit');
    };

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

    if (error) {
        return (
            <div className="flex h-screen bg-gray-50">
                <SideBar />
                <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={fetchCompanyProfile}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
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
                    {/* Banner Section */}
                    <div className="relative bg-gray-200 rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden group">
                        <div className="relative h-32 sm:h-64 flex items-center justify-center bg-gray-200">
                            {company?.bannerPicture ? (
                                <img 
                                    src={`http://localhost:3000/${company.bannerPicture}`}
                                    alt="Company Banner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-gray-600 transition-opacity duration-300 px-4">
                                    <FaCamera className="w-8 h-8 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 opacity-60" />
                                    <h2 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">Company Banner</h2>
                                    <p className="text-sm sm:text-lg hidden sm:block">Click to add your company banner</p>
                                </div>
                            )}

                            <div onClick={handleEditBanner} className="cursor-pointer absolute top-0 right-0 bottom-0 w-1/4 sm:w-1/4 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-r-lg">
                                <div className="text-center text-white">
                                    <FaEdit className="w-4 h-4 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                                    <h3 className="text-xs sm:text-sm font-semibold mb-1 hidden sm:block">Edit Banner</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="card-company w-full min-h-[400px] sm:min-h-[660px] bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                        <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-3">
                            {/* Profile Section */}
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-10 justify-start items-center sm:items-center p-3 w-full lg:flex-1'>
                                <div className='profile-pic w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gray-200 shadow-sm flex-shrink-0 overflow-hidden relative group'>
                                    {company?.profilePicture ? (
                                        <img 
                                            src={`http://localhost:3000/${company.profilePicture}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <FaCamera className="w-8 h-8 sm:w-12 sm:h-12 opacity-60" />
                                        </div>
                                    )}
                                    
                                    <div onClick={handleEditBanner} className="cursor-pointer absolute bottom-0 left-0 right-0 h-1/3 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-b-full">
                                        <div className="text-center text-white">
                                            <FaEdit className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1" />
                                            <p className="text-xs font-medium hidden sm:block">Edit Photo</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='py-3 flex flex-col gap-3 sm:gap-4 justify-center items-center sm:items-start w-full'>
                                    <div className='flex flex-row justify-between items-center gap-4 sm:gap-8 w-full'>
                                        <p className='font-bold text-xl sm:text-3xl uppercase text-center sm:text-left'>{company?.companyName || 'Company Name'}</p>
                                        <button 
                                            onClick={handleEditBanner}
                                            className='flex items-center gap-2 px-4 sm:px-7 py-2 sm:py-1 bg-[#F4B400] cursor-pointer rounded-lg hover:bg-[#E6A200] transition-colors duration-200 text-sm font-medium whitespace-nowrap'
                                        >
                                            <FaEdit className='w-4 h-4' />
                                            <span className='hidden sm:inline'>Edit</span>
                                        </button>
                                    </div>
                                    <div className='flex flex-col gap-2 w-full'>
                                        <div className='flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3 w-full'>
                                            <div className='flex items-center justify-start gap-2'>
                                                <FaMapMarkerAlt className='text-red-500 flex-shrink-0' />
                                                <p className='text-gray-600 text-center sm:text-left'>{company?.mainLocation || 'Location not set'}</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center justify-start gap-2'>
                                            <FaIndustry className='text-blue-500 flex-shrink-0' />
                                            <p className='text-gray-600 text-center sm:text-left'>{company?.industry || 'Industry not set'}</p>
                                        </div>
                                        <div className='flex items-center justify-start gap-2 w-full'>
                                            <FaGlobe className='text-green-500 flex-shrink-0' />
                                            <p className='text-gray-600 text-center sm:text-left break-all'>{company?.website || 'Website not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="bg-white rounded-lg shadow-sm border w-full lg:w-[400px] border-gray-200 p-4 sm:p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center lg:text-left">Contact</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <FaPhone className="text-blue-600 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-semibold text-gray-900 break-all">{company?.phoneNumber || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <FaEnvelope className="text-green-600 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-semibold text-gray-900 break-all">{company?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overview Section */}
                        <div className='w-full flex gap-5'>
                            <div className='flex flex-col gap-4 px-2 sm:px-5 py-2'>
                                <div className='title'>
                                    <p className='font-bold text-xl sm:text-3xl'>Overview: </p>
                                </div>
                                <div className='content'>
                                    {company?.description ? (
                                        <div className='text-justify text-sm sm:text-base leading-relaxed space-y-4'>
                                            {company.description.split('\n').map((paragraph, index) => (
                                                paragraph.trim() !== '' && (
                                                    <p key={index} className='mb-4 last:mb-0'>
                                                        {paragraph.trim()}
                                                    </p>
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <p className='text-justify text-sm sm:text-base leading-relaxed text-gray-500 italic'>
                                            No company description available. Click Edit to add your company overview and description.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile