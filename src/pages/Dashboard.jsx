import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LayoutDashboard, User, Gift, LogOut, 
  Trophy, History, Leaf, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile'; 
import Rewards from './Rewards'; //
import './Dashboard.css';
import api, { getProfile, getLeaderboard } from '../api'; // Adjust path

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); //
  const [studentName, setStudentName] = useState(''); // For displaying in nav
  const [userData, setUserData] = useState(null); // Real user data from DB
  const [leaderboard, setLeaderboard] = useState([]); // Top 10 users from DB
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('studentName');
    if (name) setStudentName(name);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [profileRes, leaderboardRes] = await Promise.all([
          api.get('/profile'),      // → /api/auth/profile ✅
          api.get('/leaderboard')   // → /api/auth/leaderboard ✅
        ]);

        console.log('Profile:', profileRes.data);
        console.log('Leaderboard:', leaderboardRes.data);
        
        setUserData(profileRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (error) {
        console.error('Dashboard Error:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('token')) {  
      fetchDashboardData();
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleLogout = () => navigate('/login');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Profile 
            onProfileUpdate={(updatedName) => {
              // Update the dashboard states dynamically
              setStudentName(updatedName);
              setUserData(prev => prev ? { ...prev, fullName: updatedName } : null);
              
              // Keep localStorage fresh for subsequent page reloads
              localStorage.setItem('studentName', updatedName);
            }} 
          />
        );
      case 'rewards':
        return <Rewards userPoints={userData?.points || 0} />;
      default:
        return (
          <div className="dashboard-grid-container">
            <div className="card balance-card full-width">
              <div className="balance-info">
                <p className="label">Your Current Balance</p>
                <h1 className="points-display">{userData?.points || 0}</h1>
              </div>
              {/* Functional Navigation Button */}
              <button 
                className="redeem-btn" 
                onClick={() => setActiveTab('rewards')}
              >
                Redeem Points <ChevronRight size={18} />
              </button>
            </div>

            <div className="dashboard-split-row">
              <div className="card leaderboard-card">
                <div className="card-header-flex">
                  <div className="header-title">
                    <Trophy size={18} color="#800000" />
                    <h3>Sustainability Leaderboard</h3>
                  </div>
                </div>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th className="rank-col">Rank</th>
                      <th className="name-col">Name</th>
                      <th className="points-col">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard && leaderboard.length > 0 ? (
                      leaderboard.map((user, index) => (
                        <tr key={user._id || index}>
                          <td className="rank-col">#{index + 1}</td>
                          {/* Update user.firstName/lastName to match what your API returns (e.g. user.name) */}
                          <td className="name-col">{user.fullName}</td>
                          <td className="points-col">{user.totalPointsEarned || 0}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-data">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card activity-card">
                <div className="card-header-flex">
                  <div className="header-title">
                    <History size={18} color="#800000" />
                    <h3>Recent Activity</h3>
                  </div>
                </div>
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th className="action-col">Action</th>
                      <th className="points-col">Points</th>
                      <th className="date-col">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData?.history && userData.history.length > 0 ? (
                      userData.history.map((item, index) => {
                        // Determine if this is a positive or negative action
                        // You can also check by string: item.action === 'Bottle Collection'
                        const isPositive = item.points > 0; 
                        const colorClass = isPositive ? 'text-green' : 'text-red';
                        const actionText = isPositive ? "Bottle Collection" : "Rewards Redemption";

                        return (
                          <React.Fragment key={item._id || index}>
                            {/* Main Row: Action, Points, Date */}
                            <tr className="activity-main-row">
                              <td className="action-col">{actionText}</td>
                              <td className={`points-col ${colorClass}`}>
                                {item.points > 0 ? `+${item.points}` : item.points}
                              </td>
                              <td className="date-col">
                                {new Date(item.date).toLocaleDateString()}
                              </td>
                            </tr>
                            {/* Sub Row: Description */}
                            <tr className="activity-desc-row">
                              <td colSpan="3" className={`desc-col ${colorClass}`}>
                                {item.description}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-data">No recent activity</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
             <div className="avatar"><User size={24} /></div>
             <span>{(userData?.fullName || studentName).toUpperCase()}</span>
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