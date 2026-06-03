import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios';
import { User, Lock, Leaf, ArrowLeft, Eye, EyeOff } from 'lucide-react'; 
import './Auth.css';
import api from '../api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ─── NEW: VISIBILITY TOGGLE STATE ────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/login-admin', { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('adminName', response.data.fullName);
        localStorage.setItem('role', 'admin');
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={() => navigate('/')} title="Back to Selection">
          <ArrowLeft size={24} />
        </button>
        <div className="auth-header">
          <div className="logo-circle"><Leaf size={32} color="#D4AF37" /></div>
          <h2>Admin Login</h2>
          <p>Administrator Portal Access</p>
        </div>
        {error && <div className="error-badge">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          {/* PASSWORD FIELD WITH INTEGRATED TOGGLE BUTTON */}
          <div className="input-group" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? "text" : "password"} // ◄ Switches dynamically
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ paddingRight: '45px' }} // ◄ Prevents text running under icon
              required 
            />
            <button
              type="button" // ◄ Prevents accidental form submissions on Enter key
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login as Admin'}
          </button>

          <div className="auth-footer">
            <p>New Administrator? <Link to="/register-admin" className="auth-link">Register here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;