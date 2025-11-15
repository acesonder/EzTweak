import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import '../styles/Navigation.css';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <img 
            src={theme === 'medicine-wheel' 
              ? 'https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a' 
              : 'https://github.com/user-attachments/assets/6fb90b90-9f9e-40f1-add7-0f44e0766dad'
            } 
            alt="EzTweak Logo" 
            className="nav-logo"
          />
          <h1>EzTweak</h1>
        </div>

        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
            <span className="nav-icon">📦</span>
            Orders
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
            <span className="nav-icon">🏥</span>
            Products
          </Link>
          <Link to="/messaging" className={`nav-link ${isActive('/messaging') ? 'active' : ''}`}>
            <span className="nav-icon">💬</span>
            Messages
          </Link>
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <>
              <Link to="/cases" className={`nav-link ${isActive('/cases') ? 'active' : ''}`}>
                <span className="nav-icon">👥</span>
                Cases
              </Link>
              <Link to="/incidents" className={`nav-link ${isActive('/incidents') ? 'active' : ''}`}>
                <span className="nav-icon">⚠️</span>
                Incidents
              </Link>
              <Link to="/referrals" className={`nav-link ${isActive('/referrals') ? 'active' : ''}`}>
                <span className="nav-icon">📊</span>
                Referrals
              </Link>
            </>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/notifications" className="notification-icon" title="Notifications">
            <span className="nav-icon">🔔</span>
            <span className="notification-badge">3</span>
          </Link>
          
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={`Switch to ${theme === 'medicine-wheel' ? 'Neon' : 'Medicine Wheel'} theme`}
          >
            {theme === 'medicine-wheel' ? '🌙' : '☀️'}
          </button>
          
          <div className="user-menu">
            <Link to="/profile" className="user-profile">
              <img 
                src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                alt={user?.username}
                className="user-avatar"
              />
              <span className="user-name">{user?.full_name || user?.username}</span>
            </Link>
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                <span className="nav-icon">👤</span>
                Profile
              </Link>
              <Link to="/settings" className="dropdown-item">
                <span className="nav-icon">⚙️</span>
                Settings
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="dropdown-item">
                  <span className="nav-icon">🛠️</span>
                  Admin Panel
                </Link>
              )}
              <button onClick={logout} className="dropdown-item logout-item">
                <span className="nav-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
