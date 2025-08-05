import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar';
import FloatingDecorations from '../../Components/FloatingDecorations';
import EditProfileModal from '../../Components/EditProfileModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="relative pt-16">
          <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
            <FloatingDecorations />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">My Profile</h1>
              <p className="text-lg text-blue-100">Manage your personal information and preferences</p>
            </div>
            
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white">Loading profile...</p>
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
              <h1 className="text-4xl font-bold text-white mb-4">My Profile</h1>
              <p className="text-lg text-blue-100">Manage your personal information and preferences</p>
            </div>
            
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
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="relative pt-16">
          <div className="absolute inset-x-0 top-0 h-[325px] bg-[#0D6EFD] overflow-hidden z-10">
            <FloatingDecorations />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">My Profile</h1>
              <p className="text-lg text-blue-100">Manage your personal information and preferences</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Profile Data Found</h3>
              <p className="text-gray-600">We couldn't find your profile information.</p>
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
            <h1 className="text-4xl font-bold text-white mb-4">My Profile</h1>
            <p className="text-lg text-blue-100">Manage your personal information and preferences</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6 relative z-10">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{user.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium text-gray-900 capitalize">{user.gender || 'Prefer not to say'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Birth Date:</span>
                    <span className="font-medium text-gray-900">
                      {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{user.domicile || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last updated:</span>
                    <span className="font-medium text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Email verified:</span>
                    <span className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {user.bio && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Professional Summary */}
            {user.personalSummary && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                <p className="text-gray-700 leading-relaxed">{user.personalSummary}</p>
              </div>
            )}

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {user.experience && user.experience.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                <div className="space-y-6">
                  {user.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                      <p className="text-blue-600 font-medium">{exp.company}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(exp.startDate).toLocaleDateString()} - 
                        {exp.current ? ' Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ' Present')}
                      </p>
                      {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {user.education && user.education.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                <div className="space-y-6">
                  {user.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-blue-600 font-medium">{edu.institution}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(edu.startDate).toLocaleDateString()} - 
                        {edu.current ? ' Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ' Present')}
                      </p>
                      {edu.fieldOfStudy && <p className="text-sm text-gray-600">Field of Study: {edu.fieldOfStudy}</p>}
                      {edu.grade && <p className="text-sm text-gray-600">Grade: {edu.grade}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};export default Profile;