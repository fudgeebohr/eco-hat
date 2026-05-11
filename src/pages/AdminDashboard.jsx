import React, { useState } from 'react';
import { 
  Menu, X, LayoutDashboard, Package, Users, BarChart3, 
  Settings, LogOut, Search, Plus, Leaf 
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-wrapper">
      {/* --- RETRACTABLE SIDEBAR --- */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Leaf color="#D4AF37" size={24} />
          <span>ADMIN PANEL</span>
          <X className="sidebar-close" onClick={toggleSidebar} />
        </div>
        <nav className="sidebar-links">
          <div className="admin-menu-item active"><LayoutDashboard size={20}/> Overview</div>
          <div className="admin-menu-item"><Package size={20}/> Inventory</div>
          <div className="admin-menu-item"><Users size={20}/> User Management</div>
          <div className="admin-menu-item"><BarChart3 size={20}/> Analytics</div>
          <div className="admin-menu-item"><Settings size={20}/> Settings</div>
        </nav>
      </aside>

      {/* --- OVERLAY --- */}
      {isSidebarOpen && <div className="admin-overlay" onClick={toggleSidebar}></div>}

      {/* --- MAIN CONTENT --- */}
      <div className="admin-main">
        {/* Top Navbar */}
        <header className="admin-top-nav">
          <div className="nav-left">
            <Menu className="admin-hamburger" onClick={toggleSidebar} />
            <div className="admin-logo-text">
               <Leaf size={20} /> <span>ECO-HAT ADMIN</span>
            </div>
          </div>
          <button className="admin-logout-btn">Logout</button>
        </header>

        {/* Dashboard Grid */}
        <div className="admin-content">
          {/* Top 3 Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <p>Bottles Collected Today</p>
              <h1 className="stat-val maroon-text">70</h1>
            </div>
            <div className="stat-card">
              <p>Weekly Performance</p>
              <h1 className="stat-val maroon-text">239</h1>
            </div>
            <div className="stat-card">
              <p>Total Monthly Intake</p>
              <h1 className="stat-val maroon-text">239</h1>
            </div>
          </div>

          <div className="middle-grid">
            {/* Inventory Stock */}
            <div className="admin-card inventory-card">
              <div className="card-top">
                <h3>📦 Inventory Stock</h3>
                <span className="edit-link">Edit Stock</span>
              </div>
              <ul className="stock-list">
                <li><span>Notebook</span> <b className="maroon-text">95</b></li>
                <li><span>Ballpen</span> <b className="maroon-text">98</b></li>
                <li><span>Pencil</span> <b className="maroon-text">89</b></li>
                <li><span>Scissors</span> <b className="maroon-text">55</b></li>
              </ul>
            </div>

            {/* Leaderboard Section */}
            <div className="admin-card leaderboard-section">
              <div className="card-top">
                <h3>🏆 Sustainability Leaderboard</h3>
              </div>
              <div className="search-bar-container">
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Search name or ID..." />
              </div>
              <div className="empty-state">
                <img src="/api/placeholder/64/64" alt="No data" />
                <p>No Student Data Found</p>
              </div>
            </div>
          </div>

          {/* Sales Transparency System */}
          <div className="admin-card sales-card">
            <div className="card-top">
              <h3>💰 Full Sales Transparency System</h3>
              <div className="total-sales">Total Verified Sales: <b>₱750.00</b></div>
            </div>
            <div className="transaction-form">
               <input type="number" placeholder="Amount (₱)" />
               <input type="text" placeholder="Description" />
               <button className="log-btn"><Plus size={18}/> Log Transaction</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;