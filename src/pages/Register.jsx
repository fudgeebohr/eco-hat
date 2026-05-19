import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, BookOpen, GraduationCap, Leaf, ArrowLeft, Eye, EyeOff } from 'lucide-react'; // Added Eye & EyeOff
import './Auth.css';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentNumber: '',
    programAndYear: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ─── NEW: VISIBILITY TOGGLE STATES FOR BOTH FIELDS ───────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match!");
    setLoading(true);
    try {
      const response = await api.post('/register-user', {
        fullName: formData.fullName,
        studentNumber: formData.studentNumber,
        programAndYear: formData.programAndYear,
        password: formData.password
      });
      if (response.status === 201) {
        alert("Account Created! Please Login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={() => navigate('/login')} title="Back to Login">
          <ArrowLeft size={24} />
        </button>
        <div className="auth-header">
          <div className="logo-circle"><Leaf size={32} color="#fff" /></div>
          <h2>Create Account</h2>
          <p>Join the ECO-HAT community</p>
        </div>
        {error && <div className="error-badge">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <GraduationCap className="input-icon" size={20} />
            <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input name="studentNumber" placeholder="Student Number" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <BookOpen className="input-icon" size={20} />
            <input name="programAndYear" placeholder="Program & Year" onChange={handleChange} required />
          </div>

          {/* MAIN PASSWORD INPUT FIELD */}
          <div className="input-group" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={20} />
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              onChange={handleChange} 
              style={{ paddingRight: '45px' }}
              required 
            />
            <button
              type="button" // Prevents form submission triggers on enter key down
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD INPUT FIELD */}
          <div className="input-group" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={20} />
            <input 
              name="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" 
              onChange={handleChange} 
              style={{ paddingRight: '45px' }}
              required 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;