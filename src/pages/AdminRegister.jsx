import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Key, User, ArrowLeft } from 'lucide-react';
import './Auth.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({ username: '', password: '', adminKey: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://ecohat-node.onrender.com/api/auth/register-admin', formData);
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
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <Key className="input-icon" size={20} />
            <input name="adminKey" type="password" placeholder="Secret Admin Key" onChange={handleChange} required />
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