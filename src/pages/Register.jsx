import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, BookOpen, GraduationCap, Leaf, ArrowLeft } from 'lucide-react';
import './Auth.css';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match!");
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register-user', {
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
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
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