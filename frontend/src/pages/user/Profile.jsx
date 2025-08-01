import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

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
      setFormData(data.user);
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
      setFormData(data.user);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateUserProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setFormData(user);
    setIsEditing(false);
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {error}
        <button onClick={fetchUserProfile}>Retry</button>
      </div>
    );
  }

  if (!user) {
    return <div>No profile data found</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      {!isEditing && (
        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Full Name:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label>Email:</label>
            <input
              type="email"
              value={user.email}
              disabled
            />
          </div>

          <div>
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Bio:</label>
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div>
            <label>Birth Date:</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Gender:</label>
            <select
              name="gender"
              value={formData.gender || 'prefer-not-to-say'}
              onChange={handleInputChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label>Domicile:</label>
            <input
              type="text"
              name="domicile"
              value={formData.domicile || ''}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Personal Summary:</label>
            <textarea
              name="personalSummary"
              value={formData.personalSummary || ''}
              onChange={handleInputChange}
              rows="6"
            />
          </div>

          <div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
          </div>
        </form>
      ) : (
        <div>
          <div>
            <h2>Basic Information</h2>
            <p><strong>Full Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
            <p><strong>Gender:</strong> {user.gender || 'Prefer not to say'}</p>
            <p><strong>Birth Date:</strong> {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}</p>
            <p><strong>Domicile:</strong> {user.domicile || 'Not provided'}</p>
          </div>

          {user.bio && (
            <div>
              <h2>Bio</h2>
              <p>{user.bio}</p>
            </div>
          )}

          {user.personalSummary && (
            <div>
              <h2>Personal Summary</h2>
              <p>{user.personalSummary}</p>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div>
              <h2>Skills</h2>
              {user.skills.map((skill, index) => (
                <span key={index}>{skill}{index < user.skills.length - 1 ? ', ' : ''}</span>
              ))}
            </div>
          )}

          {user.experience && user.experience.length > 0 && (
            <div>
              <h2>Experience</h2>
              {user.experience.map((exp, index) => (
                <div key={index}>
                  <h3>{exp.position} at {exp.company}</h3>
                  <p>
                    {new Date(exp.startDate).toLocaleDateString()} - 
                    {exp.current ? ' Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ' Present')}
                  </p>
                  {exp.description && <p>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {user.education && user.education.length > 0 && (
            <div>
              <h2>Education</h2>
              {user.education.map((edu, index) => (
                <div key={index}>
                  <h3>{edu.degree} - {edu.institution}</h3>
                  <p>
                    {new Date(edu.startDate).toLocaleDateString()} - 
                    {edu.current ? ' Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ' Present')}
                  </p>
                  {edu.fieldOfStudy && <p>Field of Study: {edu.fieldOfStudy}</p>}
                  {edu.grade && <p>Grade: {edu.grade}</p>}
                </div>
              ))}
            </div>
          )}

          <div>
            <h2>Account Information</h2>
            <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Last updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
            <p><strong>Email verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;