import React from 'react'
import NavBar from '../../Components/NavBar'

const SavedJobs = () => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
        </div>
        <p className="text-gray-600 mb-8">Keep track of jobs you're interested in</p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No Saved Jobs Yet</h2>
          <p className="text-gray-600 mb-6">
            Start exploring job opportunities and save the ones that interest you. 
            Your saved jobs will appear here for easy access.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default SavedJobs