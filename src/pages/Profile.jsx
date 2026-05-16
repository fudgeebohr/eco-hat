import React, { useState, useEffect } from 'react';
import { User, Mail, Award, ShieldCheck, MapPin, Edit3, Settings, X, Ban } from 'lucide-react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Profile = ({ onProfileUpdate }) => {
  const navigate = useNavigate();
  
  // 1. Replaced the hardcoded object with React state
  const [userData, setUserData] = useState({
    fullName: "Loading...",
    programAndYear: "Loading...",
    studentNumber: "Loading...",
    rank: "Loading...",
    totalPointsEarned: 0,
    points: 0,
    privacyMode: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    programAndYear: "",
    studentNumber: ""
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
            rank: response.data.rank,
            totalPointsEarned: response.data.totalPointsEarned || 0,
            points: response.data.points || 0,
            privacyMode: response.data.privacyMode || false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const getRankDetails = (totalPointsEarned) => {
    if (totalPointsEarned <= 150) {
      return { title: "Green Guardian", className: "rank-green" };
    } else if (totalPointsEarned >= 151 && totalPointsEarned <= 250) {
      return { title: "Eco Crusader", className: "rank-earth-blue" };
    } else if (totalPointsEarned >= 251 && totalPointsEarned <= 350) {
      return { title: "Planet Protector", className: "rank-gold" };
    } else {
      return { title: "Nature Knight", className: "rank-magenta" };
    }
  };

  const { title: rankTitle, className: rankClass } = getRankDetails(userData.totalPointsEarned);

  // Open modal and populate the form with current user data
  const handleEditClick = () => {
    setEditFormData({
      fullName: userData.fullName !== "Loading..." && userData.fullName !== "N/A" ? userData.fullName : "",
      programAndYear: userData.programAndYear !== "Loading..." && userData.programAndYear !== "N/A" ? userData.programAndYear : "",
      studentNumber: userData.studentNumber !== "Loading..." && userData.studentNumber !== "N/A" ? userData.studentNumber : ""
    });
    setIsModalOpen(true);
  };

  // Handle typing in the input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit the updated data to the backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the updated data to your backend (adjust the endpoint if necessary)
      await api.put('/profile', editFormData); 
      
      // Update the local state so the UI reflects the changes instantly
      setUserData(prev => ({
        ...prev,
        fullName: editFormData.fullName,
        programAndYear: editFormData.programAndYear,
        studentNumber: editFormData.studentNumber
      }));

      if (onProfileUpdate) {
        onProfileUpdate(editFormData.fullName);
      }
      
      // Close the modal
      setIsModalOpen(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handlePrivacyToggle = async (e) => {
  const isChecked = e.target.checked;
    try {
      // Send the updated privacy mode directly to the backend
      await api.put('/profile', { privacyMode: isChecked });
      
      // Update local state instantly
      setUserData(prev => ({
        ...prev,
        privacyMode: isChecked
      }));
      
      alert(isChecked ? "Privacy Mode activated. You are now hidden from the leaderboard!" : "Privacy Mode deactivated. You are now visible on the leaderboard.");
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
      alert("Could not update privacy setting. Please try again.");
      // Revert checkbox state on failure
      e.target.checked = !isChecked;
    }
  };

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
            <span className={`rank-badge ${rankClass}`}>
              <Award size={14} /> {rankTitle}
            </span>
          </div>
        </div>
        <button className="edit-profile-btn" onClick={handleEditClick}>
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
              <span className="label">Program & Year</span>
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
                <p className="setting-name">Privacy Mode</p>
                <p className="subtitle">Hide your rank from the public leaderboard.</p>
              </div>
              <input 
                type="checkbox" 
                checked={userData.privacyMode} 
                onChange={handlePrivacyToggle} 
              />
            </div>
          </div>
            <div className="setting-row">
              <div>
                <p className="setting-name">Deactivate Account</p>
                <p className="subtitle">Archive all your data.</p>
              </div>
              <input type="button"></input><Ban size={15} />
            </div>
        </div>

        {/* --- EDIT PROFILE MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Edit Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="modal-form-group">
                <label className="modal-label">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={editFormData.fullName} 
                  onChange={handleInputChange} 
                  className="modal-input"
                  required 
                />
              </div>
              
              <div className="modal-form-group">
                <label className="modal-label">Program & Year</label>
                <input 
                  type="text" 
                  name="programAndYear" 
                  value={editFormData.programAndYear} 
                  onChange={handleInputChange} 
                  className="modal-input"
                  required 
                />
              </div>
              
              <div className="modal-form-group">
                <label className="modal-label">Student Number</label>
                <input 
                  type="text" 
                  name="studentNumber" 
                  value={editFormData.studentNumber} 
                  onChange={handleInputChange} 
                  className="modal-input"
                  required 
                />
              </div>

              <div className="modal-action-buttons">
                <button type="button" onClick={() => setIsModalOpen(false)} className="modal-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default Profile;