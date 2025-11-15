import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img 
            src={theme === 'medicine-wheel' 
              ? 'https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a' 
              : 'https://github.com/user-attachments/assets/6fb90b90-9f9e-40f1-add7-0f44e0766dad'
            } 
            alt="EzTweak Logo" 
            className="auth-logo"
          />
          <h1>Welcome to EzTweak</h1>
          <p>Harm Reduction Order & Case Management</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <p className="demo-info">
            <strong>Demo Account:</strong><br />
            Username: admin<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
