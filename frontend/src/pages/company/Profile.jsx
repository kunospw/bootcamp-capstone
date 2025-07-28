import React from 'react'
import SideBar from '../../Components/SideBar'
import { FaCamera, FaEdit, FaMapMarkerAlt, FaIndustry, FaGlobe, FaPhone, FaEnvelope } from 'react-icons/fa'

const Profile = () => {
    const handleEditBanner = () => {
        console.log('Navigate to edit profile page');
    };
    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Banner Placeholder Section */}
                    <div className="relative bg-gray-200 rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden cursor-pointer group" onClick={handleEditBanner}>
                        {/* Banner Placeholder */}
                        <div className="relative h-64 flex items-center justify-center bg-gradient-to-r from-gray-300 to-gray-400">
                            {/* Default Content */}
                            <div className="text-center text-gray-600 group-hover:opacity-30 transition-opacity duration-300">
                                <FaCamera className="w-16 h-16 mx-auto mb-4 opacity-60" />
                                <h2 className="text-2xl font-semibold mb-2">Company Banner</h2>
                                <p className="text-lg">Click to add your company banner</p>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="text-center text-white">
                                    <FaEdit className="w-12 h-12 mx-auto mb-3" />
                                    <h3 className="text-xl font-semibold mb-2">Edit Banner</h3>
                                    <p className="text-sm opacity-90">Click to customize your company banner</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    {/* Company Information Card */}
                    <div className="card-company w-full min-h-[660px] bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-5">
                        <div className="w-full justify-between flex gap-3">
                            <div className='flex gap-10 justify-start items-center p-3 w-full'>
                                <div className='profile-pic w-48 h-48 rounded-full bg-gray-200 shadow-sm flex-shrink-0 overflow-hidden'>
                                </div>
                                <div className='py-3 flex flex-col gap-4 justify-center items-start w-full'>
                                    <div className='flex justify-between items-center gap-8'>
                                        <p className='font-bold text-3xl uppercase'>PT Fitra Abadi</p>
                                        <button 
                                            onClick={handleEditBanner}
                                            className='flex items-center gap-2 px-7 py-1 bg-[#F4B400] cursor-pointer rounded-lg hover:bg-[#E6A200] transition-colors duration-200 text-sm font-medium'
                                        >
                                            <FaEdit className='w-4 h-4' />
                                            Edit
                                        </button>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <div className='flex justify-between gap-3 w-[325px]'>
                                            <div className='flex items-center gap-2'>
                                                <FaMapMarkerAlt className='text-red-500' />
                                                <p className='text-gray-600'>Garut, Indonesia</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <FaIndustry className='text-blue-500' />
                                            <p className='text-gray-600'>Information Technology</p>
                                        </div>
                                        <div className='flex items-center gap-2 w-[275px]'>
                                            <FaGlobe className='text-green-500' />
                                            <p className='text-gray-600'>www.companywebsite.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border w-[400px] border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <FaPhone className="text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-semibold text-gray-900">+62 123 456 7890</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <FaEnvelope className="text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-semibold text-gray-900">contact@ptfitraabadi.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='w-full justify-between flex gap-5'>
                            <div className='flex flex-col gap-4 px-5 py-2   '>
                                <div className='title'>
                                    <p className='font-bold text-3xl'>Overview: </p>
                                </div>
                                <div className='content'>
                                    <p className='text-justify'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quo veniam qui repudiandae rerum quas expedita earum cupiditate consequatur iure, maiores et, deserunt sapiente accusamus soluta ullam ipsum? Reiciendis, architecto. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut vitae saepe neque atque quam dolorum sed debitis, ratione tempore non dolore praesentium recusandae eveniet commodi ad mollitia ullam, necessitatibus odit!</p><br />
                                    {/* <p className='text-justify'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quo veniam qui repudiandae rerum quas expedita earum cupiditate consequatur iure, maiores et, deserunt sapiente accusamus soluta ullam ipsum? Reiciendis, architecto. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut vitae saepe neque atque quam dolorum sed debitis, ratione tempore non dolore praesentium recusandae eveniet commodi ad mollitia ullam, necessitatibus odit!</p><br />
                                    <p className='text-justify'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quo veniam qui repudiandae rerum quas expedita earum cupiditate consequatur iure, maiores et, deserunt sapiente accusamus soluta ullam ipsum? Reiciendis, architecto. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut vitae saepe neque atque quam dolorum sed debitis, ratione tempore non dolore praesentium recusandae eveniet commodi ad mollitia ullam, necessitatibus odit!</p><br />
                                    <p className='text-justify'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quo veniam qui repudiandae rerum quas expedita earum cupiditate consequatur iure, maiores et, deserunt sapiente accusamus soluta ullam ipsum? Reiciendis, architecto. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut vitae saepe neque atque quam dolorum sed debitis, ratione tempore non dolore praesentium recusandae eveniet commodi ad mollitia ullam, necessitatibus odit!</p><br />
                                    <p className='text-justify'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quo veniam qui repudiandae rerum quas expedita earum cupiditate consequatur iure, maiores et, deserunt sapiente accusamus soluta ullam ipsum? Reiciendis, architecto. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut vitae saepe neque atque quam dolorum sed debitis, ratione tempore non dolore praesentium recusandae eveniet commodi ad mollitia ullam, necessitatibus odit!</p> */}
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