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

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentName, setStudentName] = useState("Student");

  // Load student name from localStorage (set during login)
  useEffect(() => {
    const name = localStorage.getItem('studentName');
    if (name) setStudentName(name);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      {/* --- SIDEBAR PANEL --- */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Leaf color="#D4AF37" size={28} />
            <span>ECO-HAT</span>
          </div>
          <X className="close-toggle" onClick={toggleSidebar} size={24} />
        </div>
        
        <nav className="sidebar-menu">
          <div className="menu-item active">
            <LayoutDashboard size={20} /> 
            <span>Dashboard</span>
          </div>
          <div className="menu-item">
            <User size={20} /> 
            <span>My Profile</span>
          </div>
          <div className="menu-item">
            <Gift size={20} /> 
            <span>Rewards</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="menu-item logout" onClick={handleLogout}>
            <LogOut size={20} /> 
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* --- OVERLAY (Mobile) --- */}
      {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="main-content">
        <header className="top-nav">
          <Menu className="hamburger-icon" onClick={toggleSidebar} size={30} />
          <div className="user-profile-nav">
            <span>{studentName}</span>
            <div className="avatar">JS</div>
          </div>
        </header>

        <div className="content-container">
          {/* Container 1: Current Balance */}
          <div className="card balance-card">
            <div className="balance-info">
              <p className="label">Current Balance</p>
              <h2 className="points-display">99</h2>
            </div>
            <button className="redeem-btn">Redeem Supplies</button>
          </div>

          {/* Container 2: Leaderboard */}
          <div className="card table-card">
            <div className="card-header-flex">
              <div className="header-title">
                <Trophy size={18} color="#800000" />
                <h3>Sustainability Leaderboard</h3>
              </div>
              <span className="subtitle">Top 10 Eco Warriors</span>
            </div>
            
            <div className="table-responsive">
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>STUDENT</th>
                    <th>BOTTLES</th>
                    <th>POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="current-user-row">
                    <td>1</td>
                    <td>{studentName}</td>
                    <td>45</td>
                    <td>99</td>
                  </tr>
                  {/* Additional rows would be mapped here */}
                </tbody>
              </table>
            </div>
          </div>

          {/* Container 3: Recent Activity */}
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
      </main>
    </div>
  );
};

export default Dashboard;
