import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Key, User, Leaf } from 'lucide-react';
import './Auth.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeID: '', // Using Employee ID instead of Student Number
    password: '',
    adminKey: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const SECRET_KEY = import.meta.env.VITE_ADMIN_KEY;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Check Admin Key locally first
    if (formData.adminKey !== SECRET_KEY) {
      return setError("Invalid Administrator Key. Access Denied.");
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        fullName: formData.fullName,
        studentNumber: formData.employeeID, // Backend uses studentNumber field for ID
        password: formData.password,
        role: 'admin' // Explicitly set role
      });

      if (response.status === 201) {
        alert("Admin Account Created!");
        navigate('/login?role=admin');
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
        <div className="auth-header">
          <div className="logo-circle" style={{background: '#2c3e50'}}>
            <ShieldCheck size={32} color="#fff" />
          </div>
          <h2>Admin Registration</h2>
          <p>Create an authoritative ECO-HAT account</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              name="fullName"
              type="text" 
              placeholder="Username" 
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              name="password"
              type="password" 
              placeholder="Password" 
              onChange={handleChange}
              required
            />
          </div>

          {/* THE ADMIN KEY FIELD */}
          <div className="input-group">
            <Key className="input-icon" size={20} color="#D4AF37" />
            <input 
              name="adminKey"
              type="password" 
              placeholder="Secret Admin Key" 
              onChange={handleChange}
              required
              style={{borderColor: '#D4AF37'}}
            />
          </div>

          <button type="submit" className="auth-button admin-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Register as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;