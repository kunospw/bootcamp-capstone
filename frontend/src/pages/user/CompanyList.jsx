import React from 'react'
import NavBar from '../../Components/NavBar'

const CompanyList = () => {
  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Companies</h1>
        <p className="text-gray-600 mb-8">Discover amazing companies and explore career opportunities</p>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Directory Coming Soon</h2>
          <p className="text-gray-600">We're working on bringing you a comprehensive list of companies and their open positions.</p>
        </div>
      </div>
    </div>
  )
}

export default CompanyList