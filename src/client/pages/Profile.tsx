import React from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="profile-container">
          <div className="profile-header">
            <img 
              src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.username}&background=random&size=200`}
              alt={user?.username}
              className="profile-avatar-large"
            />
            <h1>{user?.full_name || user?.username}</h1>
            <p className="profile-username">@{user?.username}</p>
            <div className="profile-role">{user?.role}</div>
          </div>

          <div className="profile-details">
            <h2>Account Information</h2>
            
            <div className="detail-section">
              <div className="detail-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              
              <div className="detail-item">
                <label>Role:</label>
                <span className="role-badge-small">{user?.role}</span>
              </div>
              
              <div className="detail-item">
                <label>Member Since:</label>
                <span>Recently</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-edit">Edit Profile</button>
              <button className="btn-password">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
