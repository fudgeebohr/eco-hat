import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Lock, Key, User, Leaf } from 'lucide-react';
import './Auth.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    adminKey: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register-admin', {
        username: formData.username,
        password: formData.password,
        adminKey: formData.adminKey
      });

      if (response.status === 201) {
        alert("Administrator Account Created Successfully!");
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
        <div className="auth-header">
          <div className="logo-circle">
            <ShieldCheck size={32} color="#D4AF37" />
          </div>
          <h2>Admin Registration</h2>
          <p>Create an authoritative ECO-HAT account</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              name="username"
              type="text" 
              placeholder="Username" 
              value={formData.username}
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
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Key className="input-icon" size={20} />
            <input 
              name="adminKey"
              type="password" 
              placeholder="Secret Admin Key" 
              value={formData.adminKey}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Verifying Key...' : 'Register Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;