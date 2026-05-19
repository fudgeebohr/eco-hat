import React, { useState, useEffect } from 'react';
import { User, Mail, Award, ShieldCheck, MapPin, Edit3, Settings, X, Ban, FileText } from 'lucide-react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Profile = ({ onProfileUpdate }) => {
  const navigate = useNavigate();
  
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

  // ─── NEW: TRANSPARENCY REPORT FOR STUDENTS STATES ───────────────────────
  const [transparencyLogs, setTransparencyLogs] = useState([]);
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState(false);
  const [activeReceiptPreviewUrl, setActiveReceiptPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile'); 
        
        if (response.data) {
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

  const handleOpenTransparencyReport = async () => {
    try {
      const response = await api.get('/admin/transparency-logs'); 
      if (response.data?.success) {
        setTransparencyLogs(response.data.logs);
        setIsTransparencyModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load public transparency ledger:", err);
      alert("Unable to fetch the transparency report at this moment.");
    }
  };

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

  const handleEditClick = () => {
    setEditFormData({
      fullName: userData.fullName !== "Loading..." && userData.fullName !== "N/A" ? userData.fullName : "",
      programAndYear: userData.programAndYear !== "Loading..." && userData.programAndYear !== "N/A" ? userData.programAndYear : "",
      studentNumber: userData.studentNumber !== "Loading..." && userData.studentNumber !== "N/A" ? userData.studentNumber : ""
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile', editFormData); 
      
      setUserData(prev => ({
        ...prev,
        fullName: editFormData.fullName,
        programAndYear: editFormData.programAndYear,
        studentNumber: editFormData.studentNumber
      }));

      if (onProfileUpdate) {
        onProfileUpdate(editFormData.fullName);
      }
      
      setIsModalOpen(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handlePrivacyToggle = async (e) => {
    const isChecked = e.target.checked;
    try {
      await api.put('/profile', { privacyMode: isChecked });
      setUserData(prev => ({ ...prev, privacyMode: isChecked }));
      alert(isChecked ? "Privacy Mode activated!" : "Privacy Mode deactivated.");
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
      e.target.checked = !isChecked;
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmDeactivate = window.confirm(
      "Are you sure you want to deactivate your account? Your data will be archived until you log back in again."
    );
    if (!confirmDeactivate) return;

    try {
      await api.post('/deactivate');
      alert("Your account has been deactivated. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('studentName');
      navigate('/login');
    } catch (error) {
      console.error("Failed to deactivate account:", error);
    }
  };

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
            
            {/* PRIVACY MODE ROW */}
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

            {/* TRANSPARENCY REPORT GENERATION LINE VIEW */}
            <div className="setting-row" onClick={handleOpenTransparencyReport} style={{ cursor: 'pointer', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', padding: '15px 0' }}>
              <div>
                <p className="setting-name" style={{ color: 'var(--maroon)' }}>Transparency Report</p>
                <p className="subtitle">Generate transparency report.</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--maroon)', display: 'flex', alignItems: 'center', padding: '4px' }}>
                <FileText size={18} />
              </button>
            </div>

            {/* DEACTIVATE ACCOUNT ROW */}
            <div className="setting-row" onClick={handleDeactivateAccount} style={{ cursor: 'pointer', paddingTop: '15px' }}>
              <div>
                <p className="setting-name" style={{ color: '#dc2626' }}>Deactivate Account</p>
                <p className="subtitle">Archive all your data momentarily.</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                <Ban size={17} style={{ color: '#dc2626' }} />
              </button>
            </div>

          </div>
        </div>
      </div> {/* ◄ FIX 1: This closed grid layout bracket belongs inside the master return chain wrapper */}

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

      {/* --- ALL-TIME TRANSPARENCY EXPENSE LEDGER POPUP MODAL --- */}
      {isTransparencyModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="modal-content card" style={{ maxWidth: '600px', width: '92%', maxHeight: '80vh', background: '#fff', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setIsTransparencyModalOpen(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={22}/></button>
            
            <div style={{ borderBottom: '2px solid var(--maroon)', paddingBottom: '12px', marginBottom: '15px', textAlign: 'left' }}>
              <h3 style={{ color: 'var(--maroon)', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>Campus Transparency Report</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>Real-time breakdown auditing of kiosk operations and supplies management</p>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
              {transparencyLogs && transparencyLogs.length > 0 ? (
                transparencyLogs.map((log, i) => (
                  <div key={'student-log-' + (log._id || i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdfdfd', border: '1px solid #eee', padding: '12px 15px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                      {log.receiptUrl ? (
                        <img 
                          src={log.receiptUrl} 
                          alt="Receipt" 
                          onClick={() => setActiveReceiptPreviewUrl(log.receiptUrl)}
                          style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #ccc' }}
                          title="Click to zoom receipt document image"
                        />
                      ) : (
                        <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '9px', fontWeight: 'bold', border: '1px dashed #eee' }}>N/A</div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', color: '#333', fontSize: '0.88rem' }}>{log.description}</p>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>Verified Ecosystem Entry • {new Date(log.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <strong style={{ color: 'var(--maroon)', fontSize: '1rem' }}>₱{log.amount.toLocaleString()}</strong>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontStyle: 'italic' }}>No logged operational expenditures found.</div>
              )}
            </div>
            <button className="modal-save-btn" onClick={() => setIsTransparencyModalOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'var(--maroon)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Close Ledger View</button>
          </div>
        </div>
      )}

      {/* --- RECEIPT DOCUMENT LIGHTBOX POPUP MAXIMIZATION LIGHTBOX --- */}
      {activeReceiptPreviewUrl && (
        <div className="modal-overlay" onClick={() => setActiveReceiptPreviewUrl(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000, backdropFilter: 'blur(6px)' }}>
          <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveReceiptPreviewUrl(null)} 
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <X size={20} /> Close Preview
            </button>
            <img 
              src={activeReceiptPreviewUrl} 
              alt="Receipt Maximized Layout View" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 12px 35px rgba(0,0,0,0.6)', objectFit: 'contain', background: '#fff', padding: '8px' }} 
            />
          </div>
        </div>
      )}

    </div> // ◄ FIX 2: Closes the outer <div className="profile-container"> wrapper layout tag correctly
  );
};

export default Profile;