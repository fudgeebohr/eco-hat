import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, BookOpen, ArrowLeft, CheckCircle, Leaf, EyeOff, Eye } from 'lucide-react';
import api from '../api';
import './Auth.css'; // Reuses your existing authentication styles cleanly!

const ForgotPassword = () => {
  const [studentNumber, setStudentNumber] = useState('');
  const [programAndYear, setProgramAndYear] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/forgot-password-user', {
        studentNumber,
        programAndYear,
        newPassword
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/'); // Redirect back to login after 3 seconds
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify account criteria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={() => navigate('/')} title="Back to Login">
          <ArrowLeft size={24} />
        </button>
        
        <div className="auth-header">
          <div className="logo-circle">
            <Leaf size={32} color="#fff" />
          </div>
          <h2>Account Recovery</h2>
          <p>Verify your student enrollment to reset your credentials</p>
        </div>

        {error && <div className="error-badge">{error}</div>}
        {message && (
          <div className="success-badge" style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            <CheckCircle size={18} /> {message}
          </div>
        )}

        <form onSubmit={handleResetSubmit} className="auth-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              placeholder="Registered Student Number" 
              value={studentNumber} 
              onChange={(e) => setStudentNumber(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <BookOpen className="input-icon" size={20} />
            <input 
              placeholder="Registered Program & Year" 
              value={programAndYear} 
              onChange={(e) => setProgramAndYear(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Enter New Secure Password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
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

          <button type="submit" className="auth-button" disabled={loading || message}>
            {loading ? 'Processing Reset...' : 'Reset Account Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;