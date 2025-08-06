import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit3, FiPlus } from 'react-icons/fi';
import NavBar from '../../Components/NavBar';
import Footer from '../../Components/Footer';
import FloatingDecorations from '../../Components/FloatingDecorations';
import EditProfileModal from '../../Components/EditProfileModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data.user);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return false;
      }

      const response = await fetch('http://localhost:3000/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data.user);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return false;
    }
  };

  // Handle save profile from modal
  const handleSaveProfile = async (formData) => {
    const success = await updateUserProfile(formData);
    if (success) {
      setIsEditModalOpen(false);
    }
    return success;
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Profile</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchUserProfile}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-4xl mx-auto px-6 py-8 pt-24">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No Profile Data Found</h3>
            <p className="text-gray-600">We couldn't find your profile information.</p>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(user.birthDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Blue Header Section */}
      <div className="relative bg-[#0D6EFD] pt-20 pb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <FloatingDecorations />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto px-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-16 h-16 text-gray-500" />
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold mb-4">{user.fullName}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>{user.domicile || 'Location not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiUser className="w-4 h-4" />
                  <span>{age ? `${age} yo, ` : ''}{user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Prefer not to say'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="w-4 h-4" />
                  <span>{user.phoneNumber || 'Phone not provided'}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="mt-6 px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"
              >
                <FiEdit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Information
            </button>
          </div>
        </div>

        {/* Bio Section */}
        {user.bio && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Bio</h2>
              <hr className="flex-1 ml-4 border-gray-300" />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700">{user.bio}</p>
            </div>
          </div>
        )}

        {/* Personal Summary Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Summary</h2>
            <hr className="flex-1 ml-4 border-gray-300" />
          </div>
          
          {user.personalSummary ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700">{user.personalSummary}</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Describe yourself</p>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Add Summary
              </button>
            </div>
          )}
        </div>

        {/* Experiences Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Experiences</h2>
            <hr className="flex-1 ml-4 border-gray-300" />
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="ml-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>
          
          {user.experience && user.experience.length > 0 ? (
            <div className="space-y-4">
              {user.experience.map((exp, index) => (
                <div key={index} className="group bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position} at {exp.company}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.current ? ' Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ' Present')}
                    </p>
                    {exp.description && <p className="text-gray-700">{exp.description}</p>}
                  </div>
                  <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Describe your experience</p>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Add Experiences
              </button>
            </div>
          )}
        </div>

        {/* Educations Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Educations</h2>
            <hr className="flex-1 ml-4 border-gray-300" />
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="ml-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>
          
          {user.education && user.education.length > 0 ? (
            <div className="space-y-4">
              {user.education.map((edu, index) => (
                <div key={index} className="group bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree} - {edu.institution}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {new Date(edu.startDate).toLocaleDateString()} - 
                      {edu.current ? ' Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ' Present')}
                    </p>
                    {edu.fieldOfStudy && <p className="text-gray-700">Field of Study: {edu.fieldOfStudy}</p>}
                    {edu.grade && <p className="text-gray-700">Grade: {edu.grade}</p>}
                  </div>
                  <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Describe your education</p>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Add Educations
              </button>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
            <hr className="flex-1 ml-4 border-gray-300" />
          </div>
          
          {user.skills && user.skills.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Describe yourself</p>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Add Skills
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};export default Profile;