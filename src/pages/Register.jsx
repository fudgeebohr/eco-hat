import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, BookOpen, GraduationCap, Leaf } from 'lucide-react';
import './Auth.css'; // Uses the same CSS we created for Login

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
    setError('');

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        fullName: formData.fullName,
        studentNumber: formData.studentNumber,
        programAndYear: formData.programAndYear,
        password: formData.password
      });

      if (response.status === 201 || response.status === 200) {
        alert("Account created successfully! Please login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Student number might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-circle">
            <Leaf size={32} color="#fff" />
          </div>
          <h2>Join ECO-HAT</h2>
          <p>Create your student account to start recycling</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              name="fullName"
              type="text" 
              placeholder="Full Name" 
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <GraduationCap className="input-icon" size={20} />
            <input 
              name="studentNumber"
              type="text" 
              placeholder="Student Number (e.g. 2022-00000-BN-0)" 
              value={formData.studentNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <BookOpen className="input-icon" size={20} />
            <input 
              name="programAndYear"
              type="text" 
              placeholder="Program & Year (e.g. BSCpE 4-1)" 
              value={formData.programAndYear}
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
            <Lock className="input-icon" size={20} />
            <input 
              name="confirmPassword"
              type="password" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;