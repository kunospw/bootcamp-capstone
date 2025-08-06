import React from 'react';
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import logo from '../assets/logo.svg';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <img src={logo} className="h-8 w-8 object-contain" alt="Job Hive Logo" />
                            <span className="text-xl font-bold">Job Hive</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Connecting talented professionals with top companies. 
                            Find your dream job or discover exceptional talent with Job Hive.
                        </p>
                        <div className="flex space-x-4">
                            <a 
                                href="#" 
                                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                                aria-label="LinkedIn"
                            >
                                <FaLinkedin className="w-5 h-5" />
                            </a>
                            <a 
                                href="#" 
                                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                                aria-label="Twitter"
                            >
                                <FaTwitter className="w-5 h-5" />
                            </a>
                            <a 
                                href="#" 
                                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                                aria-label="Facebook"
                            >
                                <FaFacebook className="w-5 h-5" />
                            </a>
                            <a 
                                href="#" 
                                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                                aria-label="Instagram"
                            >
                                <FaInstagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* For Job Seekers */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">For Job Seekers</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/jobs" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Browse Jobs
                                </a>
                            </li>
                            <li>
                                <a href="/companies" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Browse Companies
                                </a>
                            </li>
                            <li>
                                <a href="/user/saved-jobs" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Saved Jobs
                                </a>
                            </li>
                            <li>
                                <a href="/user/applied-jobs" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Applied Jobs
                                </a>
                            </li>
                            <li>
                                <a href="/cv-analyzer" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    CV Analyzer
                                </a>
                            </li>
                            <li>
                                <a href="/user/profile" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Profile
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contact Us</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">
                                    123 Business District<br />
                                    Jakarta, Indonesia 12345
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FaPhone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">+62 21 1234 5678</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FaEnvelope className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">support@jobhive.com</span>
                            </div>
                        </div>
                        
                        {/* Newsletter Signup */}
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-white mb-2">Stay Updated</h4>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors duration-200 text-sm font-medium">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm">
                                © 2025 Job Hive. All rights reserved.
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="flex justify-center md:justify-end space-x-6">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Privacy Policy
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Terms of Service
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Cookie Policy
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                    Help Center
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
