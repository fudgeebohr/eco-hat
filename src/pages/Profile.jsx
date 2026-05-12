import React from 'react';
import { User, Mail, Award, ShieldCheck, MapPin, Edit3, Settings } from 'lucide-react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  // Sample data - replace with dynamic data from your backend later
  const userData = {
    name: "JADE ANDRIE L. DAHAN",
    section: "BSCpE 4-1",
    email: "jade.dahan@example.com",
    rank: "Platinum Collector",
    totalBottles: 245,
    points: 750,
  };

  return (
    <div className="profile-container">
      {/* --- PROFILE HEADER CARD --- */}
      <div className="profile-header-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">J</div>
          <div className="profile-main-info">
            <h2>{userData.name}</h2>
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
              <p>{userData.name}</p>
            </div>
            <div className="detail-item">
              <span className="label">Course & Section</span>
              <p>{userData.section}</p>
            </div>
            <div className="detail-item">
              <span className="label">Email Address</span>
              <p>{userData.email}</p>
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
              <span className="label">Bottles Collected</span>
              <h2 className="maroon-text">{userData.totalBottles}</h2>
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