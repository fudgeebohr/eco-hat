import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Leaf } from 'lucide-react';
import './Auth.css'; 

const AdminLogin = () => {
  // 1. Keep these names consistent with what you send to the backend
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username, // This is your Admin ID/Username
        password,
        role: 'admin' // 2. Explicitly tell the backend this is an admin login
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('studentName', response.data.fullName);
        localStorage.setItem('role', 'admin');
        
        // 3. Redirect to the Admin Dashboard specifically
        navigate('/admin-dashboard'); 
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
        <div className="auth-header">
          <div className="logo-circle">
            <Leaf size={32} color="#D4AF37" /> {/* Gold accent for admin */}
          </div>
          <h2>ECO-HAT Admin</h2>
          <p>Sign in to the administrator portal</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Admin Username / ID" 
              value={username} // Fixed variable name
              onChange={(e) => setUsername(e.target.value)} // Fixed function name
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;