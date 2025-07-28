import React from 'react'
import SideBar from '../../Components/SideBar'

const JobList = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Management</h1>
                        <p className="text-gray-600">Manage your job postings and track applications</p>
                    </div>

                    {/* Job List Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Active Job Postings</h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Create New Job
                            </button>
                        </div>

                        {/* Empty State */}
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM16 10h.01M8 10h.01" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                            <p className="text-gray-600 mb-4">Start by creating your first job posting to attract top talent.</p>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Post Your First Job
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobList