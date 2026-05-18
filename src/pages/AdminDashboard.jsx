import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { 
  Menu, X, LayoutDashboard, Package, Users, BarChart3, 
  Settings, LogOut, Search, Plus, Leaf, Image as ImageIcon, FileText, QrCode, Check, Ban, Edit2
} from 'lucide-react';
import api from '../api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [scanStatus, setScanStatus] = useState('idle');
  const [scannedData, setScannedData] = useState(null);
  const [adminName, setAdminName] = useState('ADMIN'); 
  const [stats, setStats] = useState({ today: 0, weekly: 0, monthly: 0 });

  // ─── INVENTORY STOCK STATE MANAGERS ──────────────────────────────────────
  const [inventory, setInventory] = useState([]);
  const [editingItem, setEditingItem] = useState(null); 
  const [inputStockValue, setInputStockValue] = useState(0);

  // ─── NEW: LIVE STUDENT LEADERBOARD STATE ─────────────────────────────────
  const [leaderboard, setLeaderboard] = useState([]);

  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin-login');
  };

  // FETCH ALL INITIAL METRICS, INVENTORY & LEADERBOARD DATA
  const refreshDashboardData = async () => {
    try {
      const [profileRes, statsRes, inventoryRes, leaderboardRes] = await Promise.all([
        api.get('/admin/profile').catch(() => null),
        api.get('/admin/bottle-stats'),
        api.get('/admin/inventory'),
        api.get('/leaderboard') // ◄ Fetches verified campus data
      ]);

      if (profileRes?.data?.fullName) {
        setAdminName(profileRes.data.fullName);
        localStorage.setItem('adminName', profileRes.data.fullName);
      }
      if (statsRes.data?.success) {
        setStats({ today: statsRes.data.today, weekly: statsRes.data.weekly, monthly: statsRes.data.monthly });
      }
      if (inventoryRes.data?.success) {
        setInventory(inventoryRes.data.inventory);
      }
      if (leaderboardRes.data) {
        // Sort highest-to-lowest defensively right upon receiving the payload
        const sortedLeaderboard = [...leaderboardRes.data].sort(
          (a, b) => (b.totalPointsEarned || 0) - (a.totalPointsEarned || 0)
        );
        setLeaderboard(sortedLeaderboard);
      }
    } catch (err) {
      console.error("Dashboard engine failed to load sync cycles:", err);
    }
  };

  useEffect(() => {
    const cachedAdminName = localStorage.getItem('adminName') || localStorage.getItem('username');
    if (cachedAdminName) setAdminName(cachedAdminName);

    if (localStorage.getItem('token')) {
      refreshDashboardData();
    }
  }, [scanStatus]);

  // LAUNCH MANAGEMENT MODAL HANDLER
  const openEditModal = (item) => {
    setEditingItem(item);
    setInputStockValue(item.stock);
  };

  // SAVE REVISED INVENTORY STOCK COUNT VALUES
  const handleSaveStockUpdate = async () => {
    try {
      // Force conversion to a real number right before pushing to Render API
      const finalStockValue = inputStockValue === '' ? 0 : Number(inputStockValue);

      const response = await api.post('/admin/inventory/update', {
        id: editingItem.id,
        newStock: finalStockValue
      });

      if (response.data.success) {
        setInventory(prev => prev.map(i => i.id === editingItem.id ? { ...i, stock: finalStockValue } : i));
        setEditingItem(null); 
        alert(response.data.message);
      }
    } catch (err) {
      alert("Failed to sync inventory stock count adjustments.");
    }
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
    let html5Qrcode = null;

    if (scanStatus === 'scanning') {
      html5Qrcode = new Html5Qrcode("reader");

      const startScanner = async () => {
        try {
          const isMobile = window.innerWidth <= 550;
          const qrBoxWidth = isMobile ? 260 : 220;

          await html5Qrcode.start(
            { facingMode: "environment" },
            {
              fps: 20,
              qrbox: { width: qrBoxWidth, height: qrBoxWidth },
              aspectRatio: 1.0,
              experimentalFeatures: { useBarCodeDetectorIfSupported: true }
            },
            (decodedText) => {
              try {
                const parsedData = JSON.parse(decodedText);
                setScannedData(parsedData);
                setScanStatus('detected');
                html5Qrcode.stop().catch(err => console.error("Camera release error:", err));
              } catch (err) {
                alert("Invalid QR structure code format.");
                html5Qrcode.stop().then(() => setScanStatus('idle')).catch(() => setScanStatus('idle'));
              }
            },
            (errorMessage) => {}
          );
        } catch (err) {
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
      const response = await api.post('/admin/verify-redemption', {
        qrTokenString: scannedData.token,      
        studentNumber: scannedData.studentNum, 
        totalCost: scannedData.cost,           
        summary: scannedData.items             
      });

      if (response.data.success) {
        alert(response.data.message);
        refreshDashboardData(); 
      }
    } catch (error) {
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
          <div className="user-profile-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div className="avatar" style={{ fontWeight: 'bold' }}>{adminName.charAt(0).toUpperCase()}</div>
             <span style={{ color: 'var(--maroon)', fontWeight: 'bold', letterSpacing: '0.5px' }}>{adminName.toUpperCase()}</span>
          </div>
        </header>

        <div className="content-transition-wrapper">
          <div className="admin-content-grid">
            
            {/* Top Row: Stats */}
            <div className="stats-row">
              <div className="stat-card">
                <p className="label">Bottles Collected Today</p>
                <h1 className="stat-val maroon-text">{stats.today.toLocaleString()}</h1>
              </div>
              <div className="stat-card">
                <p className="label">Weekly Performance</p>
                <h1 className="stat-val maroon-text">{stats.weekly.toLocaleString()}</h1>
              </div>
              <div className="stat-card">
                <p className="label">Total Monthly Intake</p>
                <h1 className="stat-val maroon-text">{stats.monthly.toLocaleString()}</h1>
              </div>
            </div>

            {/* Split Row: Inventory & Leaderboard */}
            <div className="dashboard-split-row">
              
              {/* DYNAMIC LIVE INVENTORY CARD LAYOUT */}
              <div className="admin-card">
                <div className="card-header-flex">
                  <h3 className="header-title"><Package size={18}/> Inventory Stock</h3>
                </div>
                <ul className="stock-list">
                  {inventory.map((item) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9f9f9' }}>
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <b style={{ minWidth: '30px', textAlign: 'right', fontSize: '1.05rem' }}>{item.stock}</b>
                        <button 
                          onClick={() => openEditModal(item)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--maroon)', display: 'flex', alignItems: 'center', padding: '4px' }}
                          title={`Adjust ${item.name} supply count`}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DYNAMIC LIVE LEADERBOARD CARD LAYOUT */}
              <div className="admin-card">
                <div className="card-header-flex" style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '15px' }}>
                  <h3 className="header-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                    <Users size={18} color="var(--maroon)" /> Sustainability Leaderboard
                  </h3>
                </div>
                
                <div style={{ flex: 1, width: '100%' }}>
                  <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                    <thead>
                      <tr style={{ color: '#888', fontSize: '0.8rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '8px 10px', width: '20%' }}>RANK</th>
                        <th style={{ padding: '8px 10px', width: '55%' }}>NAME</th>
                        <th style={{ padding: '8px 10px', width: '25%', textAlign: 'right' }}>POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard && leaderboard.length > 0 ? (
                        leaderboard.map((user, index) => (
                          <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '11px 10px', fontWeight: 'bold', color: index === 0 ? 'var(--gold)' : '#555' }}>
                              #{index + 1}
                            </td>
                            <td style={{ padding: '11px 10px', fontWeight: '500', color: '#333' }}>
                              {user.fullName}
                            </td>
                            <td style={{ padding: '11px 10px', fontWeight: 'bold', color: 'var(--maroon)', textAlign: 'right' }}>
                              {(user.totalPointsEarned || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontStyle: 'italic' }}>
                            No Active Student Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                
                {scanStatus === 'scanning' && <div id="reader"></div>}
                
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

      {/* ─── INVENTORY EDIT CONTROL OVERLAY MODAL INTERFACE ───────────────── */}
      {editingItem && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="modal-content card" style={{ maxWidth: '400px', width: '90%', background: '#fff', borderRadius: '8px', padding: '24px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <button 
              onClick={() => setEditingItem(null)} 
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ color: 'var(--maroon)', margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>Adjust Inventory Stock</h3>
            <p style={{ color: '#666', fontSize: '0.88rem', margin: '0 0 20px 0' }}>Item Target: <strong>{editingItem.name}</strong></p>
            
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#444', marginBottom: '6px', textTransform: 'uppercase' }}>
                Current Stock Quantity
              </label>
              <input 
                type="number" 
                value={inputStockValue} 
                
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setInputStockValue(''); // Keeps field perfectly empty while typing
                  } else {
                    const parsed = parseInt(val, 10);
                    setInputStockValue(parsed >= 0 ? parsed : 0); // Stops negative entries safely
                  }
                }}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button 
                onClick={handleSaveStockUpdate}
                style={{ flex: 1, padding: '12px', background: 'var(--maroon)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Save Changes
              </button>
              <button 
                onClick={() => setEditingItem(null)}
                style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;