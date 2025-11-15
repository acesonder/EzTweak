import React from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.full_name || user?.username}!</h1>
          <p className="role-badge">{user?.role}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📦</div>
            <h3>Quick Order</h3>
            <p>Browse and order harm reduction supplies</p>
            <a href="/products" className="card-link">Start Shopping →</a>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>My Orders</h3>
            <p>View order history and track deliveries</p>
            <a href="/orders" className="card-link">View Orders →</a>
          </div>

          {user?.role === 'staff' || user?.role === 'admin' ? (
            <>
              <div className="dashboard-card">
                <div className="card-icon">👥</div>
                <h3>Case Management</h3>
                <p>Manage client cases and notes</p>
                <a href="/cases" className="card-link">View Cases →</a>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">⚠️</div>
                <h3>Incident Reports</h3>
                <p>File and review incident reports</p>
                <a href="/incidents" className="card-link">View Incidents →</a>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📊</div>
                <h3>Analytics</h3>
                <p>View reports and statistics</p>
                <a href="/analytics" className="card-link">View Analytics →</a>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">🔗</div>
                <h3>Referrals</h3>
                <p>Manage client referrals</p>
                <a href="/referrals" className="card-link">View Referrals →</a>
              </div>
            </>
          ) : (
            <div className="dashboard-card">
              <div className="card-icon">🗓️</div>
              <h3>Schedule Pickup</h3>
              <p>Arrange delivery or pickup times</p>
              <a href="/schedule" className="card-link">Schedule →</a>
            </div>
          )}
        </div>

        <div className="quick-stats">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">-</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">-</div>
              <div className="stat-label">Active Cases</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">-</div>
              <div className="stat-label">Items Distributed</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
