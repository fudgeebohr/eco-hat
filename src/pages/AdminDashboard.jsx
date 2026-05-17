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
      // Use a distinct element initialization pattern to avoid duplicate element node binding bugs
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 15, // Bumped up slightly for faster frame rate capture paths
        qrbox: { width: 220, height: 220 }, // Marginally larger tracking boundaries for better phone resolution focus
        rememberLastUsedCamera: true,
        supportedScanTypes: [0, 1]
      });

      scanner.render((decodedText) => {
        try {
          const parsedData = JSON.parse(decodedText);
          setScannedData(parsedData);
          setScanStatus('detected');
          
          // Safely shut down scanning processes completely inside the promise loop handler
          scanner.clear().catch(err => console.error("Scanner clear warning:", err));
        } catch (err) {
          alert("Invalid QR structure format detected. Please try re-generating a clean student token code.");
          // If data fails parsing loops, cleanly kill the session back to idle state parameters safely
          scanner.clear()
            .then(() => setScanStatus('idle'))
            .catch(() => setScanStatus('idle'));
        }
      }, (error) => {
        // Leave verbose debug logging arrays completely empty here to stop console pollution profiles
      });
    }

    // Cleaning handler hook ensures that unmounting elements drop active hardware video pipelines instantly
    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner on unmount phase", err));
      }
    };
  }, [scanStatus]);

  const handleRedemption = async (status) => {
    if (status === 'reject') {
      alert("Redemption cancelled by Admin.");
      setScanStatus('idle');
      setScannedData(null);
      return;
    }

    try {
      // Map the minified keys back to your backend expectations
      const response = await api.post('/auth/admin/verify-redemption', {
        qrTokenString: scannedData.token,      // 'token' from student QR
        studentNumber: scannedData.studentNum, // 'studentNum' from student QR
        totalCost: scannedData.cost,           // 'cost' from student QR
        summary: scannedData.items             // 'items' from student QR
      });

      if (response.data.success) {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Verification processing failed:", error);
      alert(error.response?.data?.message || "An error occurred during verification.");
    } finally {
      setScanStatus('idle');
      setScannedData(null);
    }
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
                      <h4 className="maroon-text" style={{ marginBottom: '8px' }}>Claim Package Detected</h4>
                      <p style={{ margin: '4px 0' }}>Student No: <strong>{scannedData?.studentNum}</strong></p>
                      <p style={{ margin: '4px 0' }}>Items: <span style={{ color: '#555' }}>{scannedData?.items}</span></p>
                      <p style={{ margin: '4px 0' }}>Cost: <strong className="maroon-text">{scannedData?.cost} pts</strong></p>
                      <p style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Voucher Ref: {scannedData?.qrTokenString}</p>
                    </div>
                    <div className="action-row" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button className="action-btn approve" onClick={() => handleRedemption('approve')}>Confirm & Deduct</button>
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