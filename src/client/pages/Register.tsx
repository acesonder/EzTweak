import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import '../styles/Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'client' as 'client' | 'staff',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
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
          <h1>Join EzTweak</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Type *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="client">Client</option>
              <option value="staff">Staff Member</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Repeat your password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
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
