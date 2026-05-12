import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  Gift, 
  LogOut, 
  Trophy, 
  History, 
  Leaf,
  ChevronRight
} from 'lucide-react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile'; 

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentName, setStudentName] = useState("Student");
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('studentName');
    if (name) setStudentName(name);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    navigate('/login');
  };
  
const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'rewards':
        return <div className="empty-activity"><p>Rewards feature coming soon!</p></div>;
      default:
        return (
          <div className="dashboard-grid-container">
            {/* Balance Card - Cleaned Version */}
            <div className="card balance-card full-width">
              <div className="balance-info">
                <p className="label">Your Current Balance</p>
                <h1 className="points-display">750</h1>
                <p className="points-label">Total Eco-Points</p> {/* Simplified label */}
              </div>
              <button className="redeem-btn">
                Redeem Points <ChevronRight size={18} />
              </button>
            </div>

            {/* Split row for Leaderboard and Activity */}
            <div className="dashboard-split-row">
              <div className="card leaderboard-card">
                <div className="card-header-flex">
                  <div className="header-title">
                    <Trophy size={18} color="#800000" />
                    <h3>Sustainability Leaderboard</h3>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="eco-table">
                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>STUDENT</th>
                        <th>POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="current-user-row">
                        <td>1</td>
                        <td>{studentName}</td>
                        <td>99</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card activity-card">
                <div className="card-header-flex">
                  <div className="header-title">
                    <History size={18} color="#800000" />
                    <h3>Recent Activity</h3>
                  </div>
                </div>
                <div className="empty-activity">
                   <p>No recent recycling activity found.</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-wrapper">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Leaf color="#D4AF37" size={28} />
            <span>ECO-HAT</span>
          </div>
          <X className="close-toggle" onClick={toggleSidebar} size={24} />
        </div>
        
        <nav className="sidebar-menu">
          <div 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
          >
            <LayoutDashboard size={20}/> Dashboard
          </div>
          <div 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
          >
            <User size={20}/> Profile
          </div>
          <div 
            className={`menu-item ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => { setActiveTab('rewards'); setIsSidebarOpen(false); }}
          >
            <Gift size={20}/> Rewards
          </div>
        </nav>

        <div className="logout" onClick={handleLogout} style={{cursor: 'pointer'}}>
          <div className="menu-item">
            <LogOut size={20} /> Logout
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <main className="main-content">
        <header className="top-nav">
          <Menu className="hamburger-icon" size={28} onClick={toggleSidebar} />
          <div className="user-profile-nav" onClick={() => setActiveTab('profile')} style={{cursor: 'pointer'}}>
             <div className="avatar">{studentName.charAt(0).toUpperCase()}</div>
             <span>{studentName.toUpperCase()}</span>
          </div>
        </header>

        <div className="content-transition-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;