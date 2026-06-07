import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Leaf, Recycle, ArrowLeft, AlertTriangle, CheckCircle, 
  XCircle, Loader, Clock, Shield, ChevronRight
} from 'lucide-react';
import api from '../api';

const KioskControl = () => {
  const [searchParams] = useSearchParams();
  const kioskId = searchParams.get('id') || 'KIOSK-01';
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('connecting'); // connecting, ready, gate_open, countdown, scanning, accepted, rejected, ask_another, banned, completed, error
  const [result, setResult] = useState('');
  const [points, setPoints] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const [bottleCount, setBattleCount] = useState(0);

  // Start a kiosk session
  router.post('/kiosk/start-session', authMiddleware, async (req, res) => {
    try {
        const { kioskId, pin } = req.body;   // ← now includes pin
        const studentNumber = req.user.studentNumber;

        // 1. Validate pairing PIN (proves physical presence)
        const pairing = await db.collection('kiosk_pairing').findOne({ kioskId });
        if (!pairing || pairing.code !== pin || pairing.expiresAt < new Date()) {
            return res.status(403).json({ 
                message: 'Invalid or expired code. Please enter the current code shown on the kiosk.' 
            });
        }

        const user = await User.findOne({ studentNumber });
        if (!user) return res.status(404).json({ message: 'Student not found' });
        if (user.bannedUntil && user.bannedUntil > new Date()) {
            const hrs = ((user.bannedUntil - new Date()) / 3600000).toFixed(1);
            return res.status(403).json({ message: `Account banned for ${hrs} more hours` });
        }

        const existing = await db.collection('kiosk_sessions').findOne({
            kioskId, status: { $in: ['pending', 'active'] }, expiresAt: { $gt: new Date() }
        });
        if (existing) {
            return res.status(409).json({ message: 'Kiosk is busy' });
        }

        const session = await KioskSession.create({
            kioskId, studentNumber, status: 'pending',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        res.json({
            sessionId: session._id,
            studentName: user.fullName,
            points: user.points,
            warnings: user.warnings || 0,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate(`/login?redirect=${encodeURIComponent('/kiosk?id=' + kioskId)}`);
      return;
    }
    startSession();
  }, []);

  // Poll kiosk status
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/kiosk/session-status?sessionId=${sessionId}`);
        const data = res.data;
        if (data.kioskStatus) setStatus(data.kioskStatus);
        if (data.lastResult) setResult(data.lastResult);
        if (data.points !== undefined) setPoints(data.points);
        if (data.warnings !== undefined) setWarnings(data.warnings);
        if (data.bottles !== undefined) setBattleCount(data.bottles);
        if (data.status === 'completed') {
          setStatus('completed');
          clearInterval(interval);
        }
      } catch {
        // Silently retry
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Send command to kiosk
  const sendCommand = async (command) => {
    if (!sessionId) return;
    try {
      await api.post('/kiosk/command', { sessionId, command });
    } catch (err) {
      console.error('Command failed:', err);
    }
  };

  const statusConfig = {
    connecting: { icon: <Loader className="spin" size={48} />, title: 'Connecting to kiosk...', color: '#888' },
    ready: { icon: <Recycle size={48} />, title: 'Ready to deposit', color: '#4caf50' },
    gate_open: { icon: <Recycle size={48} />, title: 'Gate is open', color: '#2196f3', subtitle: 'Insert your PET bottle now' },
    countdown: { icon: <Clock size={48} />, title: 'Bottle detected!', color: '#ff9800', subtitle: 'Remove your hand — gate closing soon' },
    scanning: { icon: <Loader className="spin" size={48} />, title: 'Scanning bottle...', color: '#9c27b0', subtitle: 'AI is analyzing your bottle' },
    accepted: { icon: <CheckCircle size={48} />, title: 'Bottle accepted!', color: '#4caf50' },
    rejected: { icon: <XCircle size={48} />, title: 'Not accepted', color: '#f44336' },
    ask_another: { icon: <Recycle size={48} />, title: 'Insert another?', color: '#2196f3' },
    banned: { icon: <Shield size={48} />, title: 'Account banned', color: '#f44336' },
    busy: { icon: <Clock size={48} />, title: 'Kiosk is busy', color: '#ff9800', subtitle: 'Another student is currently using this kiosk' },
    completed: { icon: <CheckCircle size={48} />, title: 'Session complete', color: '#4caf50' },
    error: { icon: <AlertTriangle size={48} />, title: 'Connection error', color: '#f44336' },
    authenticated: { icon: <CheckCircle size={48} />, title: 'Identity verified', color: '#4caf50' },
    not_found: { icon: <XCircle size={48} />, title: 'Student not found', color: '#f44336' },
    bin_full: { icon: <AlertTriangle size={48} />, title: 'Bin is full', color: '#ff9800', subtitle: 'Please notify an administrator' },
  };

  const current = statusConfig[status] || statusConfig.connecting;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f9f9f9 0%, #e8e8e8 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
          <ArrowLeft size={24} color="#800000" />
        </button>
        <Leaf size={28} color="#800000" />
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#800000' }}>ECO-HAT Kiosk</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{kioskId}</p>
        </div>
      </div>

      {/* Student info card */}
      {studentName && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Logged in as</p>
          <h3 style={{ margin: '4px 0', fontSize: '18px', color: '#333' }}>{studentName}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Points</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#800000' }}>{points}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Session bottles</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{bottleCount}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Warnings</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: warnings >= 2 ? '#f44336' : '#ff9800' }}>{warnings}/3</p>
            </div>
          </div>
        </div>
      )}

      {/* Status card */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 24px', textAlign: 'center', width: '100%', maxWidth: '400px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
        <div style={{ color: current.color, marginBottom: '16px' }}>
          {current.icon}
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', color: '#333' }}>{current.title}</h2>
        {current.subtitle && <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{current.subtitle}</p>}
        {result && status !== 'ask_another' && (
          <p style={{ margin: '12px 0 0', fontSize: '14px', color: current.color, fontWeight: '600' }}>{result}</p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ width: '100%', maxWidth: '400px' }}>
        
        {status === 'ready' && (
          <button onClick={() => sendCommand('start_deposit')} style={{ width: '100%', padding: '16px', background: '#800000', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Recycle size={20} /> Start deposit <ChevronRight size={18} />
          </button>
        )}

        {status === 'ask_another' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => sendCommand('another')} style={{ flex: 1, padding: '16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Insert another
            </button>
            <button onClick={() => sendCommand('done')} style={{ flex: 1, padding: '16px', background: '#888', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Done
            </button>
          </div>
        )}

        {(status === 'gate_open' || status === 'countdown' || status === 'scanning') && (
          <button onClick={() => sendCommand('cancel')} style={{ width: '100%', padding: '14px', background: 'transparent', color: '#f44336', border: '2px solid #f44336', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            Cancel session
          </button>
        )}

        {(status === 'completed' || status === 'error' || status === 'banned') && (
          <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '16px', background: '#800000', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Back to dashboard
          </button>
        )}

        {status === 'busy' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => startSession()} style={{ flex: 1, padding: '16px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Try again
            </button>
            <button onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '16px', background: '#888', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Go back
            </button>
          </div>
        )}
      </div>

      {/* Warning bar */}
      {warnings > 0 && warnings < 3 && (
        <div style={{ marginTop: '16px', background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: '12px', padding: '12px 16px', width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="#f57c00" />
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#e65100' }}>Warning {warnings}/3</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{3 - warnings} more rejection{3 - warnings > 1 ? 's' : ''} = -2 points + 6hr ban</p>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default KioskControl;
