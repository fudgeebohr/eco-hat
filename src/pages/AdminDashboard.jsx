import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { 
  Menu, X, LayoutDashboard, Package, Users, BarChart3, 
  Settings, LogOut, Search, Plus, Leaf, Image as ImageIcon, FileText 
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const navigate = useNavigate(); // Initialize navigate

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    // Perform any cleanup like clearing tokens here if necessary
    navigate('/admin-login'); // Redirect to admin login page
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipts([...receipts, { url: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="admin-wrapper">
      {/* --- SIDEBAR --- */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Leaf color="#D4AF37" size={24} />
            <span>ADMIN PANEL</span>
          </div>
          <X className="sidebar-close" onClick={toggleSidebar} size={24} />
        </div>
        
        <nav className="sidebar-links">
          <div className="admin-menu-item active"><LayoutDashboard size={20}/> Overview</div>
          <div className="admin-menu-item"><Package size={20}/> Inventory</div>
          <div className="admin-menu-item"><Users size={20}/> User Management</div>
          <div className="admin-menu-item"><BarChart3 size={20}/> Analytics</div>
          <div className="admin-menu-item"><Settings size={20}/> Settings</div>
        </nav>

        <div className="admin-logout-section">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* --- OVERLAY --- */}
      {isSidebarOpen && <div className="admin-overlay" onClick={toggleSidebar}></div>}

      <div className="admin-main">
        {/* --- TOP NAV --- */}
        <header className="admin-top-nav">
          <Menu className="admin-hamburger" size={28} onClick={toggleSidebar} />
          <div className="user-profile-nav">
             <div className="avatar">A</div>
             <span>ECO-HAT ADMIN</span>
          </div>
        </header>

        <div className="admin-content">
          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card">
              <p className="label">Bottles Collected Today</p>
              <h1 className="stat-val maroon-text">70</h1>
            </div>
            <div className="stat-card">
              <p className="label">Weekly Performance</p>
              <h1 className="stat-val maroon-text">239</h1>
            </div>
            <div className="stat-card">
              <p className="label">Total Monthly Intake</p>
              <h1 className="stat-val maroon-text">239</h1>
            </div>
          </div>

          {/* Balanced Middle Grid */}
          <div className="middle-grid">
            <div className="admin-card">
              <div className="card-header-flex">
                <h3 className="header-title"><Package size={18}/> Inventory Stock</h3>
              </div>
              <ul style={{listStyle: 'none', marginTop: '15px'}}>
                <li style={{display:'flex', justifyContent:'space-between', padding:'8px 0'}}>
                  <span>Notebook</span> <b className="maroon-text">95</b>
                </li>
                <li style={{display:'flex', justifyContent:'space-between', padding:'8px 0'}}>
                  <span>Ballpen</span> <b className="maroon-text">98</b>
                </li>
                <li style={{display:'flex', justifyContent:'space-between', padding:'8px 0'}}>
                  <span>Pencil</span> <b className="maroon-text">89</b>
                </li>
              </ul>
            </div>

            <div className="admin-card">
              <div className="card-header-flex">
                <h3 className="header-title"><Users size={18}/> Sustainability Leaderboard</h3>
              </div>
              <div className="empty-activity">
                <p>No Student Data Found</p>
              </div>
            </div>
          </div>

          {/* Transparency Report */}
          <div className="admin-card">
            <div className="card-header-flex">
              <h3 className="header-title"><FileText size={18}/> Transparency Report</h3>
              <span className="subtitle">Verified Transactions & Receipts</span>
            </div>
            
            <div className="receipt-upload-section">
              <div className="transaction-form">
                <input type="number" placeholder="Amount (₱)" />
                <input type="text" placeholder="Transaction Description" />
                <label className="upload-label">
                  <ImageIcon size={18}/> Add Receipt
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </label>
                <button className="log-btn log-btn-primary"><Plus size={18}/> Log Entry</button>
              </div>

              <h4 className="label" style={{marginTop: '30px'}}>Recent Receipt Gallery</h4>
              <div className="receipt-preview-list">
                {receipts.length === 0 ? (
                  <p className="empty-activity" style={{gridColumn: '1/-1'}}>No receipts uploaded yet.</p>
                ) : (
                  receipts.map((img, i) => (
                    <div key={i} className="receipt-item">
                      <img src={img.url} alt="receipt" />
                      <p title={img.name}>{img.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;