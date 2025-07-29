import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import { FaBuilding, FaBriefcase, FaInbox, FaSignOutAlt, FaUser, FaTimes, FaBars } from "react-icons/fa";


const SideBar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/signin');
        setIsMobileMenuOpen(false);
    };

    const isActivePath = (path) => {
        if (path === '/company/profile') {
            // Profile page should be active for both /company/profile and /company/profile/edit
            return location.pathname === '/company/profile' || location.pathname === '/company/profile/edit';
        }
        return location.pathname === path;
    };

    return (
        <div>
            {/* Mobile menu button */}
            <button 
                onClick={toggleMobileMenu}
                type="button" 
                className="inline-flex items-center p-3 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
            >
                <span className="sr-only">Open sidebar</span>
                {isMobileMenuOpen ? (
                    <FaTimes className="w-6 h-6" />
                ) : (
                    <FaBars className="w-6 h-6" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black/50 sm:hidden"
                    onClick={toggleMobileMenu}
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                id="logo-sidebar" 
                className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0 shadow-lg`} 
                aria-label="Sidebar"
            >
                <div className="h-full px-4 py-6 overflow-y-auto bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 flex flex-col">
                    {/* Mobile Close Button */}
                    <div className="flex justify-between items-center mb-6 sm:hidden">
                        <div className="flex items-center gap-3">
                            <img src={logo} className="h-8 w-8 object-contain" alt="Job Hive Logo" />
                            <span className="text-lg font-bold text-gray-800">Job Hive</span>
                        </div>
                        <button 
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Logo Section - Desktop */}
                    <div className="hidden sm:flex mb-8 w-full justify-center items-center gap-3 p-4 bg-transparent border-gray-100">
                        <img src={logo} className="h-12 w-12 object-contain" alt="Job Hive Logo" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Job Hive</span>
                            <span className="text-xs text-blue-600 font-medium">Your Career Partner</span>
                        </div>
                    </div>

                    {/* Navigation Menu - Main Content */}
                    <nav className="flex-1 space-y-3">
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Main Menu</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button 
                                        onClick={() => handleNavigation('/company/profile')}
                                        className={`group flex items-center p-3 w-full text-left rounded-xl transition-all duration-200 border border-transparent ${
                                            isActivePath('/company/profile')
                                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                            isActivePath('/company/profile')
                                                ? 'bg-blue-200'
                                                : 'bg-blue-100 group-hover:bg-blue-200'
                                        }`}>
                                            <FaUser className={`w-5 h-5 transition-colors ${
                                                isActivePath('/company/profile')
                                                    ? 'text-blue-700'
                                                    : 'text-blue-600 group-hover:text-blue-700'
                                            }`} />
                                        </div>
                                        <span className="flex-1 ms-4 font-medium">Profile</span>
                                        <div className={`w-2 h-2 rounded-full bg-blue-500 transition-opacity ${
                                            isActivePath('/company/profile')
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                        }`}></div>
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => handleNavigation('/company/jobs')}
                                        className={`group flex items-center p-3 w-full text-left rounded-xl transition-all duration-200 border border-transparent ${
                                            isActivePath('/company/jobs')
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                            isActivePath('/company/jobs')
                                                ? 'bg-green-200'
                                                : 'bg-green-100 group-hover:bg-green-200'
                                        }`}>
                                            <FaBriefcase className={`w-5 h-5 transition-colors ${
                                                isActivePath('/company/jobs')
                                                    ? 'text-green-700'
                                                    : 'text-green-600 group-hover:text-green-700'
                                            }`} />
                                        </div>
                                        <span className="flex-1 ms-4 font-medium">Job List</span>
                                        <div className={`w-2 h-2 rounded-full bg-green-500 transition-opacity ${
                                            isActivePath('/company/jobs')
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                        }`}></div>
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => handleNavigation('/company/applications')}
                                        className={`group flex items-center p-3 w-full text-left rounded-xl transition-all duration-200 border border-transparent ${
                                            isActivePath('/company/applications')
                                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                            isActivePath('/company/applications')
                                                ? 'bg-purple-200'
                                                : 'bg-purple-100 group-hover:bg-purple-200'
                                        }`}>
                                            <FaInbox className={`w-5 h-5 transition-colors ${
                                                isActivePath('/company/applications')
                                                    ? 'text-purple-700'
                                                    : 'text-purple-600 group-hover:text-purple-700'
                                            }`} />
                                        </div>
                                        <span className="flex-1 ms-4 font-medium">Applications</span>
                                        <div className={`w-2 h-2 rounded-full bg-purple-500 transition-opacity ${
                                            isActivePath('/company/applications')
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                        }`}></div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Account Section - Bottom */}
                    <div className="mt-auto pt-4 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Account</h3>
                        <ul className="space-y-2">
                            <li>
                                <button 
                                    onClick={handleSignOut}
                                    className="group flex items-center p-3 w-full text-left text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-transparent hover:border-red-200"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                                        <FaSignOutAlt className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                                    </div>
                                    <span className="flex-1 ms-4 font-medium">Sign Out</span>
                                    <div className="w-2 h-2 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    {/* <div className="absolute bottom-6 left-4 right-4">
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white text-center">
                            <div className="text-sm font-semibold mb-1">Need Help?</div>
                            <div className="text-xs opacity-90 mb-3">Contact our support team</div>
                            <button className="w-full py-2 px-4 bg-white bg-opacity-20 rounded-lg text-xs font-medium hover:bg-opacity-30 transition-colors">
                                Get Support
                            </button>
                        </div>
                    </div> */}
                </div>
            </aside>
        </div>
    )
}

export default SideBar