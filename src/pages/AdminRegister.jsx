import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Key, User, ArrowLeft, Eye, EyeOff } from 'lucide-react'; // Added Eye & EyeOff
import './Auth.css';
import api from '../api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({ username: '', password: '', adminKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ─── NEW: SEPARATE VISIBILITY TOGGLE STATES ──────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/register-admin', formData);
      if (response.status === 201) {
        alert("Admin Account Created!");
        navigate('/admin-login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin registration failed.');
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
          <div className="logo-circle"><ShieldCheck size={32} color="#D4AF37" /></div>
          <h2>Admin Registration</h2>
          <p>Create authoritative account</p>
        </div>
        {error && <div className="error-badge">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input name="username" placeholder="Username" onChange={handleChange} required />
          </div>

          {/* PASSWORD FIELD WITH TOGGLE ACTION */}
          <div className="input-group" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={20} />
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} // ◄ Dynamically updates type
              placeholder="Password" 
              onChange={handleChange} 
              style={{ paddingRight: '45px' }} // Ensures long inputs don't hide behind icon
              required 
            />
            <button
              type="button" // ◄ CRITICAL: Prevents hitting Enter from accidentally executing form submissions
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* SECRET ADMIN KEY FIELD WITH TOGGLE ACTION */}
          <div className="input-group" style={{ position: 'relative' }}>
            <Key className="input-icon" size={20} />
            <input 
              name="adminKey" 
              type={showAdminKey ? "text" : "password"} // ◄ Dynamically updates type
              placeholder="Secret Admin Key" 
              onChange={handleChange} 
              style={{ paddingRight: '45px' }}
              required 
            />
            <button
              type="button"
              onClick={() => setShowAdminKey(!showAdminKey)}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showAdminKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Verifying...' : 'Register Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;