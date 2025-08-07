import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.svg'
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
        if (path === '/company/jobs') {
            // Jobs page should be active for jobs list, add job, and edit job pages
            return location.pathname === '/company/jobs' ||
                location.pathname === '/company/jobs/add' ||
                location.pathname.startsWith('/company/jobs/edit/') ||
                location.pathname.startsWith('/company/jobs/');
        }
        if (path === '/company/applications') {
            // Applications page should be active for applications list and application detail pages
            return location.pathname === '/company/applications' ||
                location.pathname.startsWith('/company/applications/');
        }
        return location.pathname === path;
    };

    return (
        <div>
            {/* Mobile menu button - Fixed position, hidden when sidebar is open */}
            <button
                onClick={toggleMobileMenu}
                type="button"
                className={`fixed top-4 left-4 z-50 inline-flex items-center p-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white shadow-lg border border-gray-200 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none transform -translate-x-2' : 'opacity-100 pointer-events-auto transform translate-x-0'
                    }`}
            >
                <span className="sr-only">Open sidebar</span>
                <FaBars className="w-6 h-6" />
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
                className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } sm:translate-x-0 shadow-lg`}
                aria-label="Sidebar"
            >
                <div className="h-full px-4 py-6 overflow-y-auto bg-[#0D6EFD] border-r border-blue-600 flex flex-col">
                    {/* Mobile Close Button */}
                    <div className="flex justify-between items-center mb-6 sm:hidden">
                        <div className="flex items-center gap-3">
                            <img src={logo} className="h-8 w-8 object-contain" alt="Job Hive Logo" />
                            <span className="text-lg font-bold text-white">Job Hive</span>
                        </div>
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Logo Section - Desktop */}
                    <div className="hidden sm:flex mb-8 w-full justify-center items-center gap-3 p-4 bg-transparent">
                        <img src={logo} className="h-12 w-12 object-contain" alt="Job Hive Logo" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white uppercase tracking-wide">Job Hive</span>
                            <span className="text-xs text-blue-200 font-medium">Your Career Partner</span>
                        </div>
                    </div>

                    {/* Navigation Menu - Main Content */}
                    <nav className="flex-1 space-y-3">
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3 px-3">Main Menu</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => handleNavigation('/company/profile')}
                                        className={`group flex items-center p-3 w-full text-left rounded-xl transition-all duration-200 border border-transparent ${isActivePath('/company/profile')
                                                ? 'bg-white text-[#0D6EFD] border-white shadow-sm'
                                                : 'text-white hover:bg-white/10 hover:text-white hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${isActivePath('/company/profile')
                                                ? 'bg-[#0D6EFD] text-white'
                                                : 'bg-white/20 group-hover:bg-white/30'
                                            }`}>
                                            <FaUser className={`w-5 h-5 transition-colors ${isActivePath('/company/profile')
                                                    ? 'text-white'
                                                    : 'text-white group-hover:text-white'
                                                }`} />
                                        </div>
                                        <span className="flex-1 ms-4 font-medium">Profile</span>
                                        <div className={`w-2 h-2 rounded-full bg-white transition-opacity ${isActivePath('/company/profile')
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                            }`}></div>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleNavigation('/company/jobs')}
                                        className={`group flex items-center p-3 w-full text-left rounded-xl transition-all duration-200 border border-transparent ${isActivePath('/company/jobs')
                                                ? 'bg-white text-[#0D6EFD] border-white shadow-sm'
                                                : 'text-white hover:bg-white/10 hover:text-white hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${isActivePath('/company/jobs')
                                                ? 'bg-[#0D6EFD] text-white'
                                                : 'bg-white/20 group-hover:bg-white/30'
                                            }`}>
                                            <FaBriefcase className={`w-5 h-5 transition-colors ${isActivePath('/company/jobs')
                                                    ? 'text-white'
                                                    : 'text-white group-hover:text-white'
                                                }`} />
                                        </div>
                                        <span className="flex-1 ms-4 font-medium">Job List</span>
                                        <div className={`w-2 h-2 rounded-full bg-white transition-opacity ${isActivePath('/company/jobs')
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                            }`}></div>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleNavigation('/company/applications')}
                                        className={`group flex items-center p-3 w-full text-left rounded-xl transition-all duration-200 border border-transparent ${isActivePath('/company/applications')
                                                ? 'bg-white text-[#0D6EFD] border-white shadow-sm'
                                                : 'text-white hover:bg-white/10 hover:text-white hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${isActivePath('/company/applications')
                                                ? 'bg-[#0D6EFD] text-white'
                                                : 'bg-white/20 group-hover:bg-white/30'
                                            }`}>
                                            <FaInbox className={`w-5 h-5 transition-colors ${isActivePath('/company/applications')
                                                    ? 'text-white'
                                                    : 'text-white group-hover:text-white'
                                                }`} />
                                        </div>
                                        <span className="flex-1 ms-4 font-medium">Applications</span>
                                        <div className={`w-2 h-2 rounded-full bg-white transition-opacity ${isActivePath('/company/applications')
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                            }`}></div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Account Section - Bottom */}
                    <div className="mt-auto pt-4 border-t border-white/20">
                        <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-3 px-3">Account</h3>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={handleSignOut}
                                    className="group flex items-center p-3 w-full text-left text-white rounded-xl hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 border border-transparent hover:border-red-400/30"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                                        <FaSignOutAlt className="w-5 h-5 text-red-200 group-hover:text-red-100" />
                                    </div>
                                    <span className="flex-1 ms-4 font-medium">Sign Out</span>
                                    <div className="w-2 h-2 rounded-full bg-red-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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