import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.svg'; // Adjust the path as necessary

const NavBar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Helper function to check if a link is active
    const isActiveLink = (path) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/jobs';
        }
        return location.pathname === path;
    };

    // Helper function to get link classes
    const getLinkClasses = (path) => {
        const baseClasses = "block py-2 px-3 rounded-sm md:p-0 cursor-pointer transition-colors";
        const activeClasses = "text-white border-b-2 border-white md:border-b-2";
        const inactiveClasses = "text-white/80 hover:bg-white/10 md:hover:bg-transparent md:hover:text-white";
        
        return `${baseClasses} ${isActiveLink(path) ? activeClasses : inactiveClasses}`;
    };

    // Helper function to get dropdown link classes
    const getDropdownLinkClasses = (path) => {
        const baseClasses = "block w-full text-left px-4 py-2 text-sm transition-colors";
        const activeClasses = "text-blue-700 bg-blue-50 font-medium";
        const inactiveClasses = "text-gray-700 hover:bg-gray-100";
        
        return `${baseClasses} ${isActiveLink(path) ? activeClasses : inactiveClasses}`;
    };

    // Fetch user data from backend
    const fetchUserData = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserData(data.user);
            } else {
                // Token might be invalid, remove it
                localStorage.removeItem('token');
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            // On error, assume token is invalid
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUserData(null);
        }
    };

    // Check if user is logged in by checking for token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchUserData(token);
        } else {
            setIsLoggedIn(false);
            setUserData(null);
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserData(null);
        setIsDropdownOpen(false);
        // Navigate to sign in page after sign out
        navigate('/signin');
    };

    const handleSignIn = () => {
        setIsDropdownOpen(false);
        // Navigate to sign in page
        navigate('/signin');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <div>
            <nav className="bg-[#0D6EFD]/90 backdrop-blur-md border-none fixed top-0 left-0 right-0 z-50">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <img src={logo} className="h-8" alt="Job Hive Logo" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">Job Hive</span>
                    </button>
                    <div className="flex items-center md:order-2 space-x-3 md:space-x-1 rtl:space-x-reverse relative" ref={dropdownRef}>
                        {/* Bookmark Icon - Only show when logged in */}
                        {isLoggedIn && (
                            <button 
                                onClick={() => navigate('/user/saved-jobs')}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                    isActiveLink('/user/saved-jobs') 
                                        ? 'text-white bg-white/20' 
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                                title="Saved Jobs"
                            >
                                {isActiveLink('/user/saved-jobs') ? (
                                    // Filled bookmark when active
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                ) : (
                                    // Outline bookmark when inactive
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                )}
                            </button>
                        )}
                        
                        <button 
                            type="button" 
                            className={`flex text-sm rounded-full md:me-0 focus:ring-4 focus:ring-white/20 ${
                                isLoggedIn ? 'bg-white/10' : 'bg-transparent hover:bg-white/10 p-2'
                            }`}
                            id="user-menu-button" 
                            aria-expanded={isDropdownOpen}
                            onClick={toggleDropdown}
                        >
                            <span className="sr-only">Open user menu</span>
                            {isLoggedIn ? (
                                userData?.profilePicture ? (
                                    <img className="w-8 h-8 rounded-full object-cover" src={`http://localhost:3000/${userData.profilePicture}`} alt="user photo" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {userData?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                                        </span>
                                    </div>
                                )
                            ) : (
                                <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                </svg>
                            )}
                        </button>
                        <div className={`absolute right-0 top-12 z-50 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg transition-all duration-200 ease-out transform ${
                            isDropdownOpen 
                                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`} id="user-dropdown">
                            {isLoggedIn ? (
                                <>
                                    <div className="px-4 py-3">
                                        <span className="block text-sm text-gray-900">
                                            {userData?.fullName || 'Loading...'}
                                        </span>
                                        <span className="block text-sm text-gray-500 truncate">
                                            {userData?.email || 'Loading...'}
                                        </span>
                                    </div>
                                    <ul className="py-2" aria-labelledby="user-menu-button">
                                        <li>
                                            <button 
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/user/profile');
                                                }}
                                                className={getDropdownLinkClasses('/user/profile')}
                                            >
                                                Profile
                                            </button>
                                        </li>
                                        <li>
                                            <button 
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/user/saved-jobs');
                                                }}
                                                className={getDropdownLinkClasses('/user/saved-jobs')}
                                            >
                                                Saved Jobs
                                            </button>
                                        </li>
                                        <li>
                                            <button 
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </li>
                                    </ul>
                                </>
                            ) : (
                                <ul className="py-2" aria-labelledby="user-menu-button">
                                    <li>
                                        <button 
                                            onClick={handleSignIn}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign In
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                        <button data-collapse-toggle="navbar-user" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white/80 rounded-lg md:hidden hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" aria-controls="navbar-user" aria-expanded="false">
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                            </svg>
                        </button>
                    </div>
                    <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-user">
                        <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-white/20 rounded-lg bg-white/10 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                            <li>
                                <button 
                                    onClick={() => navigate('/')}
                                    className={getLinkClasses('/')}
                                >
                                    Vacancy
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => navigate('/companies')}
                                    className={getLinkClasses('/companies')}
                                >
                                    Company
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => navigate('/cv-analyzer')}
                                    className={getLinkClasses('/cv-analyzer')}
                                >
                                    CV Analyzer
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default NavBar