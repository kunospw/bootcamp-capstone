import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../Components/NavBar'
import FloatingDecorations from '../../Components/FloatingDecorations'

const CompanyList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    location: ''
  });

  // Fetch companies
  const fetchCompanies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      }).toString();

      const response = await fetch(`http://localhost:3000/company?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanies(data.companies);
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
      setTotalCompanies(data.pagination.totalCompanies);
      setError(null);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load companies on component mount and when filters change
  useEffect(() => {
    fetchCompanies(1);
  }, [filters, fetchCompanies]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchCompanies(page);
    window.scrollTo(0, 0);
  };

  // Navigate to company details
  const handleCompanyClick = (companyId) => {
    navigate(`/company/${companyId}`);
  };

  // Format company image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000/${imagePath}`;
  };

  if (loading && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="relative pt-16">
          <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
            <FloatingDecorations />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Discover Amazing Companies</h1>
              <p className="text-lg text-blue-100">Find the perfect workplace for your career journey</p>
            </div>
            
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white">Loading companies...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="relative pt-16">
          <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
            <FloatingDecorations />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Discover Amazing Companies</h1>
              <p className="text-lg text-blue-100">Find the perfect workplace for your career journey</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Companies</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => fetchCompanies(currentPage)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="relative pt-16">
        <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
          <FloatingDecorations />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Discover Amazing Companies</h1>
            <p className="text-lg text-blue-100">Find the perfect workplace for your career journey</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6 relative z-10">
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search companies, industry, or description..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="industry"
                  value={filters.industry}
                  onChange={handleFilterChange}
                  placeholder="Industry (e.g., Technology, Finance...)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Location (City, Country...)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </form>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{totalCompanies}</span> companies
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {companies.length === 0 && !loading ? (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a2 2 0 012-2h2a2 2 0 012 2v12M9 7h6m-6 4h6m-6 4h6" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No companies found</h3>
                  <p className="mt-2 text-gray-500">We couldn't find any companies matching your criteria.</p>
                  <button 
                    onClick={() => {
                      setFilters({
                        search: '',
                        industry: '',
                        location: ''
                      });
                      fetchCompanies(1);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              companies.map((company) => (
                <div
                  key={company._id}
                  onClick={() => handleCompanyClick(company._id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-6 flex flex-col h-full"
                >
                  <div className="flex items-center mb-4 min-h-[4rem]">
                    {company.profilePicture ? (
                      <img
                        src={getImageUrl(company.profilePicture)}
                        alt={company.companyName}
                        className="w-12 h-12 rounded-lg object-cover mr-4 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-gray-600 font-semibold text-lg">
                          {company.companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">{company.companyName}</h3>
                      {company.industry && (
                        <p className="text-sm text-gray-600 truncate">{company.industry}</p>
                      )}
                    </div>
                  </div>

                  {company.description ? (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1 min-h-[4.5rem]">
                      {company.description.length > 150 
                        ? `${company.description.substring(0, 150)}...` 
                        : company.description
                      }
                    </p>
                  ) : (
                    <div className="mb-4 flex-1 min-h-[4.5rem]"></div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 min-h-[1.5rem]">
                    <div className="flex items-center flex-1 min-w-0">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{company.mainLocation || 'Location not specified'}</span>
                    </div>
                    
                    {company.website && (
                      <div className="flex items-center flex-shrink-0 ml-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>Website</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-auto min-h-[2.5rem]">
                    <div className="text-xs text-gray-500">
                      Member since {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'text-blue-600 bg-blue-50 border border-blue-300'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {loading && companies.length > 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyList