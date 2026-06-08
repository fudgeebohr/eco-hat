import React, { useState, useEffect, useRef } from 'react';
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
  const [manualRefCode, setManualRefCode] = useState('');

  // ─── INVENTORY STOCK STATE MANAGERS ──────────────────────────────────────
  const [inventory, setInventory] = useState([]);
  const [editingItem, setEditingItem] = useState(null); 
  const [inputStockValue, setInputStockValue] = useState(0);

  // ─── LIVE STUDENT LEADERBOARD STATE ──────────────────────────────────────
  const [leaderboard, setLeaderboard] = useState([]);

  // ─── TRANSPARENCY REPORT SYSTEM STATES ──────────────────────────────
  const [transparencyLogs, setTransparencyLogs] = useState([]);
  const [inputAmount, setInputAmount] = useState('');
  const [inputDesc, setInputDesc] = useState('');
  const [selectedReceiptFile, setSelectedReceiptFile] = useState(null); 
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState(false); 
  const [activeReceiptPreviewUrl, setActiveReceiptPreviewUrl] = useState(null); 

  // ─── NEW: DOM ELEMENT TARGET REFERENCES FOR SMOOTH SCROLL & GLOW ──────────
  const overviewRef = useRef(null);
  const inventoryRef = useRef(null);
  const leaderboardRef = useRef(null);
  const transparencyRef = useRef(null);
  const scannerRef = useRef(null);

  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin-login');
  };

  // FETCH ALL INITIAL METRICS, INVENTORY, LEADERBOARD & TRANSPARENCY DATA
  const refreshDashboardData = async () => {
    try {
      const [profileRes, statsRes, inventoryRes, leaderboardRes, logsRes] = await Promise.all([
        api.get('/admin/profile').catch(() => null),
        api.get('/admin/bottle-stats'),
        api.get('/admin/inventory'),
        api.get('/leaderboard'),
        api.get('/admin/transparency-logs')
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
        const sortedLeaderboard = [...leaderboardRes.data].sort(
          (a, b) => (b.totalPointsEarned || 0) - (a.totalPointsEarned || 0)
        );
        setLeaderboard(sortedLeaderboard);
      }
      if (logsRes.data?.success) {
        setTransparencyLogs(logsRes.data.logs);
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

  // ─── NEW: SMOOTH JUMP SCROLL & ELEMENT HIGHLIGHT TRIGGER ENGINE ────────────
  const handleSidebarTabClick = (targetRef) => {
    if (!targetRef || !targetRef.current) return;

    // 1. Close sidebar menu instantly on mobile screens
    setIsSidebarOpen(false);

    // 2. Smoothly scroll into viewport context (perfect for mobile sizing layout views)
    targetRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center' // Centers card vertically on screens
    });

    // 3. Apply class glow highlight for web view users
    targetRef.current.classList.add('highlight-glow');

    // Remove the CSS animation class after it completes running so it can be re-triggered
    setTimeout(() => {
      if (targetRef.current) {
        targetRef.current.classList.remove('highlight-glow');
      }
    }, 2000);
  };

  // LAUNCH MANAGEMENT MODAL HANDLER
  const openEditModal = (item) => {
    setEditingItem(item);
    setInputStockValue(item.stock);
  };

  // SAVE REVISED INVENTORY STOCK COUNT VALUES
  const handleSaveStockUpdate = async () => {
    try {
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

  // HANDLE SUBMISSION LOG ENTRIES UP TO CLOUD ROUTERS
  const handleLogTransactionSubmit = async () => {
    if (!inputAmount || !inputDesc) {
      return alert("Please specify both an entry amount and transaction description details.");
    }

    try {
      const response = await api.post('/admin/transparency-logs/add', {
        amount: inputAmount,
        description: inputDesc,
        receiptUrl: selectedReceiptFile,
        loggedBy: adminName
      });

      if (response.data.success) {
        alert(response.data.message);
        setInputAmount('');
        setInputDesc('');
        setSelectedReceiptFile(null);
        setReceiptFileName('');
        refreshDashboardData(); 
      }
    } catch (err) {
      alert("Failed to record transaction log entry parameters.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedReceiptFile(reader.result); 
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

const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualRefCode.trim()) return alert("Please enter a valid reference code.");

    const sanitizedCode = manualRefCode.trim().toUpperCase();

    try {
      // 1. Hit your live backend lookup router
      const response = await api.get(`/admin/lookup-voucher/${sanitizedCode}`);

      if (response.data.success) {
        // 2. Store the data inside scannedData
        setScannedData(response.data.voucher);
        
        // 3. CRITICAL: Toggle your UI state to display the hidden confirmation layout card!
        // Double-check if your file uses setScanStatus('detected') or a boolean like setIsModalOpen(true)
        setScanStatus('detected'); 
        
        // 4. Flush the text input box clean
        setManualRefCode(''); 
        
        console.log("Voucher loaded onto staging card:", response.data.voucher);
      }
    } catch (err) {
      console.error("Voucher lookup failed:", err);
      alert(err.response?.data?.message || "Failed to locate voucher reference data parameters.");
    }
  };

 const handleVerifyConfirm = async () => {
  // Ensure scannedData exists before reading properties to prevent crashes
  if (!scannedData) return alert("No active voucher data detected.");

  try {
    const payload = {
      // 1. Map the token reference universally
      qrTokenString: scannedData.token, 
      token: scannedData.token, 
      
      // 2. Add fallbacks to accept either the backend model key or the lookup alias key
      studentNumber: scannedData.studentNumber || scannedData.studentNum,
      totalCost: scannedData.totalCost !== undefined ? scannedData.totalCost : scannedData.cost,
      summary: scannedData.itemsSummary || scannedData.items
    };

    // 3. Select the correct endpoint safely
    const isManualInput = scannedData.studentNum !== undefined;
    const endpoint = isManualInput ? '/admin/confirm-manual-redeem' : '/admin/verify-redemption';

    const response = await api.post(endpoint, payload);

    if (response.data.success) {
      alert(response.data.message);
      setScanStatus('idle'); // Close the overlay card gracefully
      setScannedData(null);  // Clear state entries
    }
  } catch (err) {
    console.error("Redemption confirmation crashed:", err);
    alert(err.response?.data?.message || "Supplies verification processing dropped.");
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
        
        {/* ─── UPDATED: DYNAMIC SHORTCUT NAVIGATION LINKS LAYOUT ────────────── */}
        <nav className="sidebar-links">
          <div className="admin-menu-item active" onClick={() => handleSidebarTabClick(overviewRef)}>
            <LayoutDashboard size={20}/> Overview
          </div>
          <div className="admin-menu-item" onClick={() => handleSidebarTabClick(inventoryRef)}>
            <Package size={20}/> Inventory Stocks
          </div>
          <div className="admin-menu-item" onClick={() => handleSidebarTabClick(leaderboardRef)}>
            <Users size={20}/> Leaderboards
          </div>
          <div className="admin-menu-item" onClick={() => handleSidebarTabClick(transparencyRef)}>
            <FileText size={20}/> Transparency Report
          </div>
          <div className="admin-menu-item" onClick={() => handleSidebarTabClick(scannerRef)}>
            <QrCode size={20}/> Redemption Scanner
          </div>
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
            
            {/* Top Row: Stats Anchor Node */}
            <div className="stats-row" ref={overviewRef} style={{ scrollMarginTop: '20px', transition: 'all 0.3s' }}>
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

            {/* Split Row: Inventory & Leaderboard Anchor Nodes */}
            <div className="dashboard-split-row">
              
              {/* ATTACHED: inventoryRef anchor */}
              <div className="admin-card" ref={inventoryRef} style={{ scrollMarginTop: '20px', transition: 'all 0.3s' }}>
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

              {/* ATTACHED: leaderboardRef anchor */}
              <div className="admin-card" ref={leaderboardRef} style={{ scrollMarginTop: '20px', transition: 'all 0.3s' }}>
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
                          <tr key={user._id || index} style={{ borderBottom: '1px solid #f9f9f9' }}>
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

            {/* FULL WIDTH: TRANSPARENCY REPORT CARD */}
            {/* ATTACHED: transparencyRef anchor */}
            <div className="admin-card" ref={transparencyRef} style={{ scrollMarginTop: '20px', transition: 'all 0.3s' }}>
              <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="header-title" style={{ margin: 0 }}><FileText size={18}/> Transparency Report</h3>
                {transparencyLogs.length > 0 && (
                  <button 
                    onClick={() => setIsTransparencyModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--maroon)', fontWeight: 'bold', fontSize: '0.88rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    View All
                  </button>
                )}
              </div>
              
              <div className="transaction-form">
                <input 
                  type="number" 
                  placeholder="Amount (₱)" 
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Transaction Description" 
                  value={inputDesc}
                  onChange={(e) => setInputDesc(e.target.value)}
                />
                <label className="upload-label" style={{ cursor: 'pointer' }}>
                  <ImageIcon size={18}/> {receiptFileName ? `${receiptFileName.slice(0, 12)}...` : 'Add Receipt'}
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </label>
                <button className="log-btn-primary log-btn" onClick={handleLogTransactionSubmit}>Log Entry</button>
              </div>

              {/* RECENT RECORDS ARCHIVE */}
              {transparencyLogs.length > 0 && (
                <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <h4 style={{ fontSize: '0.82rem', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 'bold' }}>Latest Log Entries</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {transparencyLogs.slice(0, 3).map((log, i) => (
                      <div key={log._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc', border: '1px solid #f0f0f0', padding: '12px 15px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                          {log.receiptUrl ? (
                            <img 
                              src={log.receiptUrl} 
                              alt="Receipt thumbnail" 
                              onClick={() => setActiveReceiptPreviewUrl(log.receiptUrl)}
                              style={{ width: '42px', height: '42px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer' }}
                              title="Click to zoom receipt document image"
                            />
                          ) : (
                            <div style={{ width: '42px', height: '42px', borderRadius: '4px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '9px', fontWeight: 'bold', border: '1px dashed #ddd' }}>N/A</div>
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#333', fontSize: '0.92rem' }}>{log.description}</p>
                            <span style={{ fontSize: '0.78rem', color: '#777' }}>By {log.loggedBy || 'Admin'} • {log.date ? new Date(log.date).toLocaleDateString() : 'Recent'}</span>
                          </div>
                        </div>
                        <strong style={{ color: 'var(--maroon)', fontSize: '1.05rem' }}>
                          ₱{(log.amount ?? 0).toLocaleString()}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COMPACT: REDEMPTION SCANNER */}
            {/* ATTACHED: scannerRef anchor */}
            <div className="admin-card standalone-card" ref={scannerRef} style={{ scrollMarginTop: '20px', transition: 'all 0.3s' }}>
              <div className="card-header-flex">
                <h3><QrCode size={18}/> Redemption Control Hub</h3>
              </div>
              <div className="scanner-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '15px' }}>
                
                {/* CAMERA VIEW CONTROL BOX AREA */}
                <div style={{ minHeight: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  {scanStatus === 'idle' && (
                    <div className="scanner-placeholder" onClick={() => setScanStatus('scanning')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      <QrCode size={48} color="var(--gold)" style={{ marginBottom: '10px' }} />
                      <p style={{ fontWeight: 'bold', fontSize: '13px', margin: 0 }}>TAP TO START CAMERA SCANNER</p>
                    </div>
                  )}
                  
                  {scanStatus === 'scanning' && <div id="reader" style={{ width: '100%' }}></div>}
                  
                  {scanStatus === 'detected' && (
                    <div className="scan-result-card" style={{ width: '100%', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'left' }}>
                      <div className="student-info">
                        <h4 className="maroon-text" style={{ margin: '0 0 15px 0', fontSize: '1.15rem', fontWeight: 'bold', borderBottom: '2px solid var(--maroon)', paddingBottom: '6px' }}>
                          Claim Package Verification Required
                        </h4>
                        
                        <p style={{ margin: '8px 0', fontSize: '14px' }}>
                          Voucher Ref: <strong style={{ letterSpacing: '0.5px', color: 'var(--maroon)' }}>{scannedData?.token}</strong>
                        </p>
                        {/* FIXED: Resolves backend alias properties for student identification mapping */}
                        <p style={{ margin: '8px 0', fontSize: '14px' }}>
                          Student No: <strong style={{ color: '#333' }}>{scannedData?.studentNum || scannedData?.studentNumber || 'N/A'}</strong>
                        </p>
                        {/* FIXED: Resolves backend items text tracking summaries properties string payload */}
                        <p style={{ margin: '8px 0', fontSize: '14px' }}>
                          Items to Claim: <span style={{ color: '#555', fontWeight: '500' }}>{scannedData?.items || scannedData?.itemsSummary || 'No items listed'}</span>
                        </p>
                        {/* FIXED: Resolves backend cost vs totalCost metrics variations properties */}
                        <p style={{ margin: '8px 0', fontSize: '14px' }}>
                          Deduction Cost: <strong style={{ color: '#16a34a' }}>{scannedData?.cost !== undefined ? scannedData.cost : scannedData?.totalCost || 0} pts</strong>
                        </p>
                      </div>

                      <div className="action-row" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        {/* FIXED: Calls handleVerifyConfirm directly to process points write down */}
                        <button className="action-btn approve" onClick={handleVerifyConfirm} style={{ flex: 1, padding: '11px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Confirm & Redeem
                        </button>
                        <button className="action-btn reject" onClick={() => { setScanStatus('idle'); setScannedData(null); }} style={{ flex: 1, padding: '11px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── NEW: HARDWARE FAILURE MANUAL INPUT SECTION ────────────────────── */}
                {scanStatus === 'idle' && (
                  /* FIXED: Changed target from handleVerifyConfirm to handleManualSubmit for initial search lookup steps */
                  <form onSubmit={handleManualSubmit} style={{ borderTop: '1px dashed #ddd', paddingTop: '20px', width: '100%' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', marginBottom: '10px', textAlign: 'left' }}>
                      Trouble scanning? Enter manually.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Reference Code" 
                        value={manualRefCode}
                        onChange={(e) => setManualRefCode(e.target.value)}
                        style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                      />
                      <button 
                        type="submit" 
                        className="log-btn-primary log-btn" 
                        style={{ width: 'auto', padding: '0 20px', whiteSpace: 'nowrap', margin: 0, height: '45px' }}
                      >
                        Process Code
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>

      {/* INVENTORY EDIT CONTROL OVERLAY MODAL INTERFACE */}
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
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#444', marginBottom: '6px', textTransform: 'uppercase' }}>Current Stock Quantity</label>
              <input 
                type="number" 
                value={inputStockValue} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setInputStockValue(''); 
                  } else {
                    const parsed = parseInt(val, 10);
                    setInputStockValue(parsed >= 0 ? parsed : 0); 
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

      {/* ALL-TIME TRANSPARENCY EXPENSE LEDGER POPUP MODAL */}
      {isTransparencyModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="modal-content card" style={{ maxWidth: '600px', width: '92%', maxHeight: '80vh', background: '#fff', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setIsTransparencyModalOpen(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={22}/></button>
            
            <div style={{ borderBottom: '2px solid var(--maroon)', paddingBottom: '12px', marginBottom: '15px' }}>
              <h3 className="maroon-text" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>Global Expense Ledger Reports</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>Comprehensive breakdown auditing verified across all administrators</p>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
              {transparencyLogs.map((log, i) => (
                <div key={'modal-log-' + (log._id || i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdfdfd', border: '1px solid #eee', padding: '12px 15px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {log.receiptUrl ? (
                      <img 
                        src={log.receiptUrl} 
                        alt="Receipt Link" 
                        onClick={() => setActiveReceiptPreviewUrl(log.receiptUrl)}
                        style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #ccc' }}
                      />
                    ) : (
                      <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '9px', fontWeight: 'bold', border: '1px dashed #eee' }}>N/A</div>
                    )}
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', color: '#333', fontSize: '0.88rem' }}>{log.description}</p>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>Logged by: {log.loggedBy || 'Admin'} • {log.date ? new Date(log.date).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>
                  <strong style={{ color: 'var(--maroon)', fontSize: '1rem' }}>
                    ₱{(log.amount ?? 0).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>
            <button className="log-btn-primary log-btn" onClick={() => setIsTransparencyModalOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '12px' }}>Close Ledger View</button>
          </div>
        </div>
      )}

      {/* RECEIPT DOCUMENT LIGHTBOX POPUP MAXIMIZATION LIGHTBOX */}
      {activeReceiptPreviewUrl && (
        <div className="modal-overlay" onClick={() => setActiveReceiptPreviewUrl(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000, backdropFilter: 'blur(6px)' }}>
          <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveReceiptPreviewUrl(null)} 
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <X size={20} /> Close Preview
            </button>
            <img 
              src={activeReceiptPreviewUrl} 
              alt="Receipt Maximized Layout View" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 12px 35px rgba(0,0,0,0.6)', objectFit: 'contain', background: '#fff', padding: '8px' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;