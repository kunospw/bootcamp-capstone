import React from 'react'
import NavBar from '../../Components/NavBar'

const CvAnalyzer = () => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">CV Analyzer</h1>
        <p className="text-gray-600 mb-8">Get insights on your CV and improve your chances of landing your dream job</p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CV Analysis Tool Coming Soon</h2>
          <p className="text-gray-600">We're developing an AI-powered CV analyzer that will help you optimize your resume for better job matches.</p>
          
          <div className="mt-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              Feature in development
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CvAnalyzer