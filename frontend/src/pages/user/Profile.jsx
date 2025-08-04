import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Plus, Camera, Upload } from 'lucide-react';
import NavBar from '../../components/NavBar';

// Mock NavBar component

const Profile = () => {
  const [user, setUser] = useState({
    fullName: "Haris Muhyidin Shofar",
    email: "harismuhyidinshofar45@gmail.com",
    phoneNumber: "+6281219976683",
    gender: "male",
    birthDate: "2003-01-01",
    domicile: "Kab. Bekasi, Jawa Barat",
    profilePicture: "",
    bio: "Passionate software developer with 3+ years of experience in full-stack development. Love creating innovative solutions and learning new technologies.",
    personalSummary: "I am a dedicated and results-driven software developer with expertise in modern web technologies including React, Node.js, and MongoDB. I have a strong passion for creating user-friendly applications and solving complex problems through clean, efficient code. Always eager to learn new technologies and contribute to meaningful projects that make a positive impact.",
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express.js", "HTML/CSS", "Git", "AWS", "Python", "SQL"],
    experience: [
      {
        company: "Tech Solutions Inc",
        position: "Full Stack Developer",
        startDate: "2022-03-01",
        endDate: null,
        current: true,
        description: "Developing and maintaining web applications using React and Node.js. Led team of 3 developers in creating an e-commerce platform that increased sales by 40%. Implemented automated testing and CI/CD pipelines."
      },
      {
        company: "StartupXYZ",
        position: "Frontend Developer",
        startDate: "2021-01-15",
        endDate: "2022-02-28",
        current: false,
        description: "Built responsive web interfaces using React and TypeScript. Collaborated with UX designers to implement pixel-perfect designs. Optimized application performance resulting in 50% faster load times."
      },
      {
        company: "Digital Agency ABC",
        position: "Junior Web Developer",
        startDate: "2020-06-01",
        endDate: "2020-12-31",
        current: false,
        description: "Developed client websites using HTML, CSS, and JavaScript. Worked closely with senior developers to learn best practices and modern development workflows."
      }
    ],
    education: [
      {
        institution: "University of Technology",
        degree: "Bachelor of Computer Science",
        fieldOfStudy: "Software Engineering",
        startDate: "2019-09-01",
        endDate: "2023-06-30",
        current: false,
        grade: "3.8 GPA"
      },
      {
        institution: "Technical High School",
        degree: "Computer Science Diploma",
        fieldOfStudy: "Information Technology",
        startDate: "2016-07-01",
        endDate: "2019-05-30",
        current: false,
        grade: "A"
      }
    ],
    savedJobs: [],
    isActive: true,
    lastLogin: "2024-08-04T10:30:00Z",
    emailVerified: true,
    createdAt: "2020-01-15T08:00:00Z",
    updatedAt: "2024-08-04T10:30:00Z"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [activeTab, setActiveTab] = useState('personal');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

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

  // Fetch user profile data (mock function)
  const fetchUserProfile = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile picture upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target.result;
        setPreviewImage(imageDataUrl);
        setFormData(prev => ({
          ...prev,
          profilePicture: imageDataUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    setPreviewImage(null);
    setFormData(prev => ({
      ...prev,
      profilePicture: ""
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setUser(formData);
    setIsEditing(false);
    setPreviewImage(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData(user);
    setIsEditing(false);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const age = calculateAge(user.birthDate);
  const currentProfilePicture = previewImage || user.profilePicture;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Blue Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-6">
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
                  <User className="w-16 h-16 text-gray-500" />
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold mb-4">{user.fullName}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.domicile}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{age} yo, {user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Prefer not to say'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{user.phoneNumber}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-6 px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-6 py-8">
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
            
            <div className="bg-white p-6 rounded-lg shadow-sm border-gray-200">
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
            <div className="bg-white p-6 rounded-lg shadow-sm border-gray-200">
              <p className="text-gray-700">{user.personalSummary}</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Describe yourself</p>
              <button className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
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
    <button className="ml-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2">
      <Plus className="w-4 h-4" />
      <span>Add Experience</span>
    </button>
  </div>
  
  {user.experience && user.experience.length > 0 ? (
    <div className="space-y-4">
      {user.experience.map((exp, index) => (
        <div key={index} className="group bg-white p-6 rounded-lg shadow-sm border-gray-200 flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{exp.position} at {exp.company}</h3>
            <p className="text-gray-600 text-sm mb-2">
              {new Date(exp.startDate).toLocaleDateString()} - 
              {exp.current ? ' Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ' Present')}
            </p>
            {exp.description && <p className="text-gray-700">{exp.description}</p>}
          </div>
          <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="text-blue-600 hover:text-blue-800">
              <Edit3 className="w-5 h-5" />
            </button>
            <button className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">Describe your experience</p>
      <button className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
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
    <button className="ml-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2">
      <Plus className="w-4 h-4" />
      <span>Add Education</span>
    </button>
  </div>
  
  {user.education && user.education.length > 0 ? (
    <div className="space-y-4">
      {user.education.map((edu, index) => (
        <div key={index} className="group bg-white p-6 rounded-lg shadow-sm border-gray-200 flex justify-between items-start">
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
            <button className="text-blue-600 hover:text-blue-800">
              <Edit3 className="w-5 h-5" />
            </button>
            <button className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">Describe your education</p>
      <button className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
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
            <div className="bg-white p-6 rounded-lg shadow-sm border-gray-200">
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
              <button className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                Add Skills
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {currentProfilePicture ? (
                        <img 
                          src={currentProfilePicture} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-500" />
                      )}
                    </div>
                    {currentProfilePicture && (
                      <button
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </button>
                    {currentProfilePicture && (
                      <button
                        onClick={removeProfilePicture}
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender || 'prefer-not-to-say'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domicile</label>
                    <input
                      type="text"
                      name="domicile"
                      value={formData.domicile || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows="3"
                    maxLength="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself in 500 characters or less"
                  />
                  <p className="text-sm text-gray-500 mt-1">{(formData.bio || '').length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personal Summary</label>
                  <textarea
                    name="personalSummary"
                    value={formData.personalSummary || ''}
                    onChange={handleInputChange}
                    rows="4"
                    maxLength="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your professional background and goals"
                  />
                  <p className="text-sm text-gray-500 mt-1">{(formData.personalSummary || '').length}/1000 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                    onChange={(e) => {
                      const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                      setFormData(prev => ({ ...prev, skills: skillsArray }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;