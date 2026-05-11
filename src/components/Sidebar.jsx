import { LayoutDashboard, User, Gift, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav>
        <ul>
          <li><LayoutDashboard /> Dashboard</li>
          <li><User /> Profile</li>
          <li><Gift /> Rewards</li>
        </ul>
      </nav>
      <button className="logout-btn"><LogOut /> Logout</button>
    </div>
  );
};