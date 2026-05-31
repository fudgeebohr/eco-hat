import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import IdleLogoutTimeout from './components/IdleLogoutTimeout'; 
import ForgotPassword from './pages/ForgotPassword'; 

function App() {
  return (
    <Router>
      {/* ─── WRAPPER WATCHES ALL INTERACTION BOUNDARIES SEAMLESSLY ─── */}
      <IdleLogoutTimeout>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          
          {/* Student Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register-admin" element={<AdminRegister />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </IdleLogoutTimeout>
    </Router>
  );
}

export default App;