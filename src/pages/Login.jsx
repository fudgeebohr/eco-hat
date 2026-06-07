import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Leaf, ArrowLeft, Eye, EyeOff } from 'lucide-react'; // Added Eye & EyeOff
import './Auth.css';
import api from '../api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const Login = () => {
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ─── NEW: VISIBILITY TOGGLE STATE ────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/login-user', {
        studentNumber,
        password
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('studentName', response.data.fullName);
        localStorage.setItem('role', 'user');
        const redirectTo = decodeURIComponent(searchParams.get('redirect') || '/dashboard');
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
          <div className="logo-circle">
            <Leaf size={32} color="#fff" />
          </div>
          <h2>Student Login</h2>
          <p>Sign in to your ECO-HAT account</p>
        </div>
        {error && <div className="error-badge">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Student Number" 
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              required
            />
          </div>

          {/* STUDENT PASSWORD FIELD WITH INTEGRATED TOGGLE BUTTON */}
          <div className="input-group" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? "text" : "password"} // ◄ Toggles types inline
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ paddingRight: '45px' }} // ◄ Keeps characters from hiding beneath the eye
              required
            />
            <button
              type="button" // ◄ Prevents enter key press misfires from submitting the form
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '15px', width: '100%' }}>
            <Link 
              to="/forgot-password" 
              style={{ color: 'var(--maroon)', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
              className="forgot-password-link"
            >
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <p>New here? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;