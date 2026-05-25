import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LayoutDashboard, User, Gift, LogOut, 
  Trophy, History, Leaf, ChevronRight, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile'; 
import Rewards from './Rewards'; 
import './Dashboard.css';
import api from '../api'; // Adjusted to match your primary api import pattern

const Dashboard = () => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [studentName, setStudentName] = useState(''); 
  const [userData, setUserData] = useState(null); 
  const [leaderboard, setLeaderboard] = useState([]); 
  const [loading, setLoading] = useState(true);
  const totalHistory = userData?.recentActivity 
    ? [...userData.recentActivity].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
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
          api.get('/profile'),      
          api.get('/leaderboard')   
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
  const handleLogout = () => {
    localStorage.clear(); // Recommending flushing states on exit profile sessions
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Profile 
            onProfileUpdate={(updatedName) => {
              setStudentName(updatedName);
              setUserData(prev => prev ? { ...prev, fullName: updatedName } : null);
              localStorage.setItem('studentName', updatedName);
            }} 
          />
        );
      case 'rewards':
        return <Rewards userPoints={userData?.points || 0} />;
      default:
        return (
          <div className="dashboard-grid-container">
            {/* BALANCE DISPLAY CARD */}
            <div className="card balance-card full-width">
              <div className="balance-info">
                <p className="label">Your Current Balance</p>
                <h1 className="points-display">{userData?.points || 0}</h1>
              </div>
              <button 
                className="redeem-btn" 
                onClick={() => setActiveTab('rewards')}
              >
                Redeem Points <ChevronRight size={18} />
              </button>
            </div>

            <div className="dashboard-split-row">
              {/* LEADERBOARD ELEMENT CONTEXT */}
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
                      // FIX: Creates a copy of the array and sorts totalPointsEarned descending
                      [...leaderboard]
                        .sort((a, b) => (b.totalPointsEarned || 0) - (a.totalPointsEarned || 0))
                        .map((user, index) => (
                          <tr key={user._id || index}>
                            <td className="rank-col">#{index + 1}</td>
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

              {/* RECENT ACTIVITY CARD (SLICED TO 6 ENTRIES) */}
              <div className="card activity-card" style={{ padding: '25px', position: 'relative', marginTop: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="var(--maroon)" />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--maroon)', fontWeight: 'bold' }}>
                      Recent Activity
                    </h3>
                  </div>
                  {totalHistory.length > 0 && (
                    <button 
                      onClick={() => setIsHistoryModalOpen(true)} 
                      style={{ background: 'none', border: 'none', color: 'var(--maroon)', fontWeight: 'bold', fontSize: '0.88rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
                      className="view-all-btn"
                    >
                      View All
                    </button>
                  )}
                </div>

                <table className="activity-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#888', fontSize: '0.85rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '8px 10px' }}>ACTION</th>
                      <th style={{ padding: '8px 10px' }}>POINTS</th>
                      <th style={{ padding: '8px 10px' }}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalHistory.length > 0 ? (
                      totalHistory.slice(0, 7).map((item, index) => {
                        const rawPoints = item.points !== undefined ? item.points : 0;
                        const isPositive = rawPoints > 0;
                        const colorClass = isPositive ? 'text-green' : 'text-red';
                        const actionText = isPositive ? 'Bottle Collection' : 'Rewards Redemption';

                        return (
                          <tr key={item._id || index} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '12px 10px', textAlign: 'left' }}>
                              <div style={{ fontWeight: '600', color: '#333', fontSize: '0.92rem' }}>{actionText}</div>
                              {item.description && (
                                <div className={colorClass} style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '3px' }}>
                                  {item.description}
                                </div>
                              )}
                            </td>
                            <td className={colorClass} style={{ padding: '12px 10px', fontWeight: 'bold' }}>
                              {isPositive ? `+${rawPoints}` : rawPoints}
                            </td>
                            <td style={{ padding: '12px 10px', color: '#666', fontSize: '0.85rem' }}>
                              {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#999', fontStyle: 'italic' }}>
                          No Recent Activity Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div> {/* END OF .dashboard-split-row */}

            {/* ALL-TIME LEDGER MODAL POPUP */}
            {isHistoryModalOpen && (
              <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div className="modal-content card" style={{ maxWidth: '550px', width: '92%', maxHeight: '80vh', background: '#fff', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                  <button 
                    onClick={() => setIsHistoryModalOpen(false)} 
                    style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                  >
                    <X size={22} />
                  </button>

                  <div style={{ borderBottom: '2px solid var(--maroon)', paddingBottom: '12px', marginBottom: '15px' }}>
                    <h3 className="maroon-text" style={{ margin: 0, fontSize: '1.3rem' }}>Account Transaction History</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>Full breakdown ledger of all lifetime activities</p>
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ color: '#888', fontSize: '0.85rem', textAlign: 'left', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff' }}>
                          <th style={{ padding: '8px 5px' }}>ACTION</th>
                          <th style={{ padding: '8px 5px' }}>POINTS</th>
                          <th style={{ padding: '8px 5px' }}>DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {totalHistory.map((item, index) => {
                          const rawPoints = item.points !== undefined ? item.points : 0;
                          const isPositive = rawPoints > 0;
                          const colorClass = isPositive ? 'text-green' : 'text-red';
                          const actionText = isPositive ? 'Bottle Collection' : 'Rewards Redemption';

                          return (
                            <tr key={'modal-' + (item._id || index)} style={{ borderBottom: '1px solid #f5f5f5' }}>
                              <td style={{ padding: '12px 5px', textAlign: 'left' }}>
                                <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{actionText}</div>
                                {item.description && (
                                  <div className={colorClass} style={{ fontSize: '0.78rem', fontStyle: 'italic', marginTop: '2px' }}>
                                    {item.description}
                                  </div>
                                )}
                              </td>
                              <td className={colorClass} style={{ padding: '12px 5px', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                {isPositive ? `+${rawPoints}` : rawPoints}
                              </td>
                              <td style={{ padding: '12px 5px', color: '#666', fontSize: '0.82rem' }}>
                                {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button 
                    onClick={() => setIsHistoryModalOpen(false)}
                    style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'var(--maroon)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Close Ledger
                  </button>
                </div>
              </div>
            )}
          </div> // END OF .dashboard-grid-container
        );
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR NAVIGATION */}
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

      {/* PRIMARY VIEWS SYSTEM PLATES */}
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