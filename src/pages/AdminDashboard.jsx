import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Menu, X, LayoutDashboard, Package, Users, BarChart3, 
  Settings, LogOut, Search, Plus, Leaf, Image as ImageIcon, FileText, QrCode, Check, Ban 
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [scanStatus, setScanStatus] = useState('idle');
  const [scannedData, setScannedData] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleLogout = () => navigate('/admin-login');

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

  useEffect(() => {
    let scanner = null;
    if (scanStatus === 'scanning') {
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 180, height: 180 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0, 1]
      });

      scanner.render((decodedText) => {
        setScannedData(decodedText);
        setScanStatus('detected');
        scanner.clear(); 
      }, (error) => {});
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [scanStatus]);

  const handleRedemption = (status) => {
    alert(`Redemption for ${scannedData} ${status === 'approve' ? 'Approved' : 'Rejected'}`);
    setScanStatus('idle');
    setScannedData(null);
  };

  return (
    <div className="admin-wrapper">
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

      {isSidebarOpen && <div className="admin-overlay" onClick={toggleSidebar}></div>}

      <div className="admin-main">
        <header className="admin-top-nav">
          <Menu className="admin-hamburger" size={28} onClick={toggleSidebar} />
          <div className="user-profile-nav">
             <div className="avatar">A</div>
             <span>ECO-HAT ADMIN</span>
          </div>
        </header>

        {/* --- MAX-WIDTH WRAPPER --- */}
        <div className="content-transition-wrapper">
          <div className="admin-content-grid">
            
            {/* Top Row: Stats */}
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
                <h1 className="stat-val maroon-text">1,402</h1>
              </div>
            </div>

            {/* Split Row: Inventory & Leaderboard */}
            <div className="dashboard-split-row">
              <div className="admin-card">
                <div className="card-header-flex">
                  <h3 className="header-title"><Package size={18}/> Inventory Stock</h3>
                </div>
                <ul className="stock-list">
                  <li><span>Notebook</span> <b>95</b></li>
                  <li><span>Ballpen</span> <b>98</b></li>
                  <li><span>Pencil</span> <b>89</b></li>
                </ul>
              </div>

              <div className="admin-card">
                <div className="card-header-flex">
                  <h3 className="header-title"><Users size={18}/> Leaderboard</h3>
                </div>
                <div className="empty-activity">
                  <p>No Student Data Found</p>
                </div>
              </div>
            </div>

            {/* Full Width: Transparency Report */}
            <div className="admin-card">
              <div className="card-header-flex">
                <h3 className="header-title"><FileText size={18}/> Transparency Report</h3>
              </div>
              <div className="transaction-form">
                <input type="number" placeholder="Amount (₱)" />
                <input type="text" placeholder="Transaction Description" />
                <label className="upload-label">
                  <ImageIcon size={18}/> Add Receipt
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </label>
                <button className="log-btn-primary log-btn">Log Entry</button>
              </div>
            </div>

            {/* Compact: Redemption Scanner */}
            <div className="admin-card standalone-card">
              <div className="card-header-flex">
                <h3 className="header-title"><QrCode size={18}/> Redemption Scanner</h3>
              </div>
              <div className="scanner-container">
                {scanStatus === 'idle' && (
                  <div className="scanner-placeholder" onClick={() => setScanStatus('scanning')}>
                    <QrCode size={48} color="var(--gold)" />
                    <p>TAP TO START SCANNER</p>
                  </div>
                )}
                {scanStatus === 'scanning' && <div id="reader"></div>}
                {scanStatus === 'detected' && (
                  <div className="scan-result-card">
                    <div className="student-info">
                      <h4 className="maroon-text">Verification Successful</h4>
                      <p>Claim ID: <strong>{scannedData}</strong></p>
                    </div>
                    <div className="action-row">
                      <button className="action-btn approve" onClick={() => handleRedemption('approve')}>Approve</button>
                      <button className="action-btn reject" onClick={() => handleRedemption('reject')}>Cancel</button>
                    </div>
                  </div>
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