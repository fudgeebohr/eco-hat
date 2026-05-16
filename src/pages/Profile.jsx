import React, { useState, useEffect } from 'react';
import { User, Mail, Award, ShieldCheck, MapPin, Edit3, Settings } from 'lucide-react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Profile = () => {
  const navigate = useNavigate();
  
  // 1. Replaced the hardcoded object with React state
  const [userData, setUserData] = useState({
    fullName: "Loading...",
    programAndYear: "Loading...",
    studentNumber: "Loading...",
    rank: "Loading...",
    totalPointsEarned: 0,
    points: 0,
  });

  // 2. Inserted the useEffect block to fetch from the database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Replace '/api/profile' with your actual backend endpoint if different
        const response = await api.get('/profile'); 
        
        if (response.data) {
          // Map the database response to your component's state variables
          setUserData({
            fullName: response.data.fullName || "N/A", 
            programAndYear: response.data.programAndYear || "N/A",
            studentNumber: response.data.studentNumber || "N/A",
            rank: response.data.rank || "Beginner",
            totalPointsEarned: response.data.totalPointsEarned || 0,
            points: response.data.points || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // The UI below remains exactly the same
  return (
    <div className="profile-container">
      {/* --- PROFILE HEADER CARD --- */}
      <div className="profile-header-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large"><User size={48} /></div>
          <div className="profile-main-info">
            <h2>{userData.fullName?.toUpperCase()}</h2>
            <p><MapPin size={14} /> PUP Biñan Campus</p>
            <span className="rank-badge"><Award size={14} /> {userData.rank}</span>
          </div>
        </div>
        <button className="edit-profile-btn">
          <Edit3 size={16} /> Edit Profile
        </button>
      </div>

      <div className="profile-grid">
        {/* --- PERSONAL INFORMATION CARD --- */}
        <div className="admin-card">
          <div className="card-header-flex">
            <h3 className="header-title"><User size={18} /> Personal Details</h3>
          </div>
          <div className="profile-details-list">
            <div className="detail-item">
              <span className="label">Full Name</span>
              <p>{userData.fullName?.toUpperCase()}</p>
            </div>
            <div className="detail-item">
              <span className="label">Course & Section</span>
              <p>{userData.programAndYear}</p>
            </div>
            <div className="detail-item">
              <span className="label">Student Number</span>
              <p>{userData.studentNumber}</p>
            </div>
          </div>
        </div>

        {/* --- STATISTICS CARD --- */}
        <div className="admin-card">
          <div className="card-header-flex">
            <h3 className="header-title"><ShieldCheck size={18} /> Lifetime Stats</h3>
          </div>
          <div className="stats-mini-grid">
            <div className="stat-box">
              <span className="label">Total Points Earned</span>
              <h2 className="maroon-text">{userData.totalPointsEarned}</h2>
            </div>
            <div className="stat-box">
              <span className="label">Current Points</span>
              <h2 className="maroon-text">{userData.points}</h2>
            </div>
          </div>
        </div>

        {/* --- ACCOUNT SETTINGS CARD --- */}
        <div className="admin-card standalone-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header-flex">
            <h3 className="header-title"><Settings size={18} /> Account Settings</h3>
          </div>
          <div className="settings-options">
            <div className="setting-row">
              <div>
                <p className="setting-name">Email Notifications</p>
                <p className="subtitle">Receive alerts when you redeem rewards.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="setting-row">
              <div>
                <p className="setting-name">Privacy Mode</p>
                <p className="subtitle">Hide your rank from the public leaderboard.</p>
              </div>
              <input type="checkbox" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;