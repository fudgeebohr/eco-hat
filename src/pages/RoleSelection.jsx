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
          <div className="logo-circle">
            <Leaf size={32} color="#D4AF37" />
          </div>
          <h2 style={{ color: '#800000' }}>ECO-HAT System</h2>
          <p>Please select your access level</p>
        </div>

        <div className="role-options">
          <button className="role-btn" onClick={() => navigate('/login?role=user')}>
            <User size={24} />
            <span>Student User</span>
          </button>

          <button className="role-btn" onClick={() => navigate('/login?role=admin')}>
            <ShieldCheck size={24} />
            <span>Administrator</span>
          </button>
        </div>

        <div className="admin-footer">
          <p className="admin-subtext">
            New Administrator? <Link to="/register-admin">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;