import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { 
  Menu, X, LayoutDashboard, Package, Users, BarChart3, 
  Settings, LogOut, Search, Plus, Leaf, Image as ImageIcon, FileText, QrCode, Check, Ban 
} from 'lucide-react';
import api from '../api';
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
    let html5Qrcode = null;

    if (scanStatus === 'scanning') {
      // Create a programmatic camera controller instance linked directly to our target node container
      html5Qrcode = new Html5Qrcode("reader");

      const startScanner = async () => {
        try {
          // 1. CALCULATE RESPONSIVE BOX SIZE (Wider view bounding box for phones)
          const isMobile = window.innerWidth <= 550;
          const qrBoxWidth = isMobile ? 260 : 220; // Opens up the frame grid on mobile screens

          await html5Qrcode.start(
            { facingMode: "environment" }, // Focuses back camera lens array
            {
              fps: 20, // Snappier frame scanning sampling limits
              qrbox: { width: qrBoxWidth, height: qrBoxWidth },
              aspectRatio: 1.0, // Hard locks a square dimension framework
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true // ◄ CRITICAL: Leverages native mobile GPU decoding
              }
            },
            (decodedText) => {
              try {
                const parsedData = JSON.parse(decodedText);
                setScannedData(parsedData);
                setScanStatus('detected');

                html5Qrcode.stop().catch(err => console.error("Camera release error:", err));
              } catch (err) {
                alert("Invalid QR structure code format.");
                html5Qrcode.stop()
                  .then(() => setScanStatus('idle'))
                  .catch(() => setScanStatus('idle'));
              }
            },
            (errorMessage) => {
              // Frame track tracking loop drop pass filtering
            }
          );
        } catch (err) {
          console.error("Camera startup error:", err);
          alert("Could not start camera. Please verify device access permissions.");
          setScanStatus('idle');
        }
      };
      startScanner();
    }
    return () => {
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(err => console.error("Unmount camera stop error:", err));
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
      const response = await api.post('/admin/verify-redemption', {
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
              <div className="scanner-container" style={{ minHeight: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {scanStatus === 'idle' && (
                  <div className="scanner-placeholder" onClick={() => setScanStatus('scanning')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    <QrCode size={48} color="var(--gold)" style={{ marginBottom: '10px' }} />
                    <p style={{ fontWeight: 'bold', fontSize: '13px' }}>TAP TO START SCANNER</p>
                  </div>
                )}
                
                {/* The video element frame track injects inside this node container here */}
                {scanStatus === 'scanning' && <div id="reader"></div>}
                
                {/* APPROVAL CARD INTERACTION INTERFACE */}
                {scanStatus === 'detected' && (
                  <div className="scan-result-card" style={{ width: '100%', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div className="student-info">
                      <h4 className="maroon-text" style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>Claim Package Detected</h4>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>Student No: <strong>{scannedData?.studentNum}</strong></p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>Items: <span style={{ color: '#555' }}>{scannedData?.items}</span></p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>Cost: <strong style={{ color: 'var(--maroon)' }}>{scannedData?.cost} pts</strong></p>
                    </div>
                    <div className="action-row" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button className="action-btn approve" onClick={() => handleRedemption('approve')} style={{ flex: 1, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Confirm & Deduct
                      </button>
                      <button className="action-btn reject" onClick={() => handleRedemption('reject')} style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Cancel
                      </button>
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