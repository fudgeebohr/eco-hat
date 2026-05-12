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
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, detected
  const [scannedData, setScannedData] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    navigate('/admin-login');
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

  useEffect(() => {
    let scanner = null;
    if (scanStatus === 'scanning') {
      // Configuration for the QR Scanner
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 180, height: 180 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0, 1] // 0 = Camera, 1 = File
      });

      scanner.render((decodedText) => {
        setScannedData(decodedText);
        setScanStatus('detected');
        scanner.clear(); 
      }, (error) => {
        // Errors are ignored during frame scanning to avoid console spam
      });
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
          <div className="nav-left">
            <Menu className="admin-hamburger" size={28} onClick={toggleSidebar} />
          </div>
          <div className="user-profile-nav">
             <div className="avatar">A</div>
             <span>ECO-HAT ADMIN</span>
          </div>
        </header>

        <div className="admin-content">
          <div className="stats-row">
            <div className="stat-card">
              <p className="label">Bottles Collected Today</p>
              <h1 className="stat-val maroon-text" style={{color: 'var(--maroon)'}}>70</h1>
            </div>
            <div className="stat-card">
              <p className="label">Weekly Performance</p>
              <h1 className="stat-val maroon-text" style={{color: 'var(--maroon)'}}>239</h1>
            </div>
            <div className="stat-card">
              <p className="label">Total Monthly Intake</p>
              <h1 className="stat-val maroon-text" style={{color: 'var(--maroon)'}}>239</h1>
            </div>
          </div>

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

          <div className="admin-card">
            <div className="card-header-flex">
              <h3 className="header-title"><FileText size={18}/> Transparency Report</h3>
              <span className="subtitle">Verified Transactions & Receipts</span>
            </div>
            
            <div className="receipt-upload-section">
              <div className="transaction-form">
                <input type="number" placeholder="Amount (₱)" />
                <input type="text" placeholder="Transaction Description" />
                <label className="upload-label" style={{cursor: 'pointer'}}>
                  <ImageIcon size={18}/> 
                  Add Receipt
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

          <div className="admin-card standalone-card" style={{marginTop: '20px'}}>
            <div className="card-header-flex">
              <h3 className="header-title"><QrCode size={18}/> Redemption Scanner</h3>
              <span className="subtitle">Verify School Supplies Claims</span>
            </div>

            <div className="scanner-container">
              {scanStatus === 'idle' && (
                <div className="scanner-placeholder" onClick={() => setScanStatus('scanning')}>
                  <QrCode size={48} color="var(--gold)" />
                  <p>TAP TO START SCANNER</p>
                </div>
              )}

              {scanStatus === 'scanning' && (
                <div id="reader" style={{ width: '100%' }}></div>
              )}

              {scanStatus === 'detected' && (
                <div className="scan-result-card">
                  <div className="student-info" style={{ borderLeft: '4px solid var(--maroon)', paddingLeft: '15px' }}>
                    <h4 className="maroon-text" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Verification Successful</h4>
                    <p style={{ color: '#555', marginBottom: '4px' }}>Claim ID: <strong style={{ color: 'var(--text-dark)' }}>{scannedData}</strong></p>
                    <p className="label" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>STATUS: READY FOR REDEMPTION</p>
                  </div>
                  <div className="action-row" style={{ marginTop: '25px' }}>
                    <button className="action-btn approve" onClick={() => handleRedemption('approve')}>
                      <Check size={18} /> Approve Release
                    </button>
                    <button className="action-btn reject" onClick={() => handleRedemption('reject')}>
                      <Ban size={18} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;