import React from 'react'
import SideBar from '../../Components/SideBar'

const Inbox = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            <SideBar />

            {/* Main Content Area */}
            <div className="flex-1 ml-0 sm:ml-72 transition-all duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Applications</h1>
                        <p className="text-gray-600">Review and manage job applications from candidates</p>
                    </div>

                    {/* Applications Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                            <div className="flex gap-2">
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                    <option>All Applications</option>
                                    <option>New</option>
                                    <option>Under Review</option>
                                    <option>Accepted</option>
                                    <option>Rejected</option>
                                </select>
                            </div>
                        </div>

                        {/* Empty State */}
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications received</h3>
                            <p className="text-gray-600 mb-4">Applications will appear here when candidates apply to your job postings.</p>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                View Job Postings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Inbox