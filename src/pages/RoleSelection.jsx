import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShieldCheck, Leaf } from 'lucide-react';
import './Auth.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <button className="logo-circle" onClick={() => navigate('/admin-login')}>
            <Leaf size={32} color="#D4AF37" />
          </button>
          <h2 style={{ color: '#800000' }}>ECO-HAT Portal</h2>
          <p>Welcome to ECO-HAT Ecosystem</p>
        </div>

        <div className="role-options">
          <button className="role-btn" onClick={() => navigate('/login')}>
            <User size={24} />
            <span>Student User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;