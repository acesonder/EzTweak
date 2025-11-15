import React, { useState } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import { Navigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'registration' | 'email' | 'logging' | 'scheduling' | 'orders'>('registration');
  
  // Registration settings
  const [requireEmail, setRequireEmail] = useState(true);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireAddress, setRequireAddress] = useState(false);
  const [emailVerification, setEmailVerification] = useState(false);
  const [autoApproval, setAutoApproval] = useState(true);
  const [allowClientReg, setAllowClientReg] = useState(true);
  const [allowStaffReg, setAllowStaffReg] = useState(false);
  const [minPasswordLength, setMinPasswordLength] = useState(6);
  const [requireStrongPassword, setRequireStrongPassword] = useState(true);
  const [enableCaptcha, setEnableCaptcha] = useState(false);
  
  // Password reset settings
  const [allowPasswordReset, setAllowPasswordReset] = useState(true);
  const [resetViaEmail, setResetViaEmail] = useState(true);
  const [resetViaSecurityQ, setResetViaSecurityQ] = useState(false);
  const [resetViaSMS, setResetViaSMS] = useState(false);
  const [resetTokenExpiry, setResetTokenExpiry] = useState(24);
  
  // Login settings
  const [allowRememberMe, setAllowRememberMe] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState(30);
  const [require2FA, setRequire2FA] = useState(false);
  
  // Email settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('EzTweak System');
  
  // Logging settings
  const [enableErrorLogging, setEnableErrorLogging] = useState(true);
  const [enableActivityLogging, setEnableActivityLogging] = useState(true);
  const [logLevel, setLogLevel] = useState('info');
  const [logRetentionDays, setLogRetentionDays] = useState(30);
  
  // Scheduling settings
  const [enableScheduling, setEnableScheduling] = useState(true);
  const [scheduleSlotDuration, setScheduleSlotDuration] = useState(30);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(14);
  const [reminderHours, setReminderHours] = useState(24);
  
  // Order settings
  const [enableQuickOrder, setEnableQuickOrder] = useState(true);
  const [enableClientOrder, setEnableClientOrder] = useState(true);
  const [requireOrderApproval, setRequireOrderApproval] = useState(false);
  const [maxOrderItems, setMaxOrderItems] = useState(50);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    setMessage('');

    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage(`${section} settings saved successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h1>🛠️ Admin Panel</h1>
          <p className="subtitle">Advanced System Configuration</p>
        </div>

        {message && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <div className="settings-container">
          <div className="settings-tabs">
            <button 
              className={`tab-button ${activeTab === 'registration' ? 'active' : ''}`}
              onClick={() => setActiveTab('registration')}
            >
              📝 Registration & Login
            </button>
            <button 
              className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              📧 Email Settings
            </button>
            <button 
              className={`tab-button ${activeTab === 'logging' ? 'active' : ''}`}
              onClick={() => setActiveTab('logging')}
            >
              📊 Error Logging
            </button>
            <button 
              className={`tab-button ${activeTab === 'scheduling' ? 'active' : ''}`}
              onClick={() => setActiveTab('scheduling')}
            >
              📅 Scheduling
            </button>
            <button 
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Order Settings
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'registration' && (
              <div className="settings-section">
                <h2>Registration & Login Configuration</h2>
                
                <div className="config-group">
                  <h3>Registration Fields</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Require Email Address</h4>
                      <p>Email is mandatory during registration</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={requireEmail} onChange={(e) => setRequireEmail(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Require Phone Number</h4>
                      <p>Phone number is mandatory</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={requirePhone} onChange={(e) => setRequirePhone(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Require Address</h4>
                      <p>Physical address is mandatory</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={requireAddress} onChange={(e) => setRequireAddress(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="config-group">
                  <h3>Registration Options</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Email Verification</h4>
                      <p>Require email verification before account activation</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={emailVerification} onChange={(e) => setEmailVerification(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Auto-Approve Registrations</h4>
                      <p>Automatically approve new user accounts</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={autoApproval} onChange={(e) => setAutoApproval(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Allow Client Registration</h4>
                      <p>Clients can self-register</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={allowClientReg} onChange={(e) => setAllowClientReg(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Allow Staff Registration</h4>
                      <p>Staff can self-register (requires approval)</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={allowStaffReg} onChange={(e) => setAllowStaffReg(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Enable CAPTCHA</h4>
                      <p>Require CAPTCHA verification on registration</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={enableCaptcha} onChange={(e) => setEnableCaptcha(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="config-group">
                  <h3>Password Requirements</h3>
                  <div className="form-group">
                    <label>Minimum Password Length</label>
                    <input 
                      type="number" 
                      value={minPasswordLength}
                      onChange={(e) => setMinPasswordLength(parseInt(e.target.value))}
                      min="6"
                      max="32"
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Require Strong Password</h4>
                      <p>Password must contain uppercase, lowercase, number, and special character</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={requireStrongPassword} onChange={(e) => setRequireStrongPassword(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="config-group">
                  <h3>Password Reset Options</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Allow Password Reset</h4>
                      <p>Users can reset their password</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={allowPasswordReset} onChange={(e) => setAllowPasswordReset(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Reset via Email</h4>
                      <p>Allow password reset via email link</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={resetViaEmail} onChange={(e) => setResetViaEmail(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Reset via Security Questions</h4>
                      <p>Allow password reset using security questions</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={resetViaSecurityQ} onChange={(e) => setResetViaSecurityQ(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Reset via SMS</h4>
                      <p>Allow password reset via SMS code</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={resetViaSMS} onChange={(e) => setResetViaSMS(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Reset Token Expiry (hours)</label>
                    <input 
                      type="number" 
                      value={resetTokenExpiry}
                      onChange={(e) => setResetTokenExpiry(parseInt(e.target.value))}
                      min="1"
                      max="72"
                    />
                  </div>
                </div>

                <div className="config-group">
                  <h3>Login Security</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Allow "Remember Me"</h4>
                      <p>Users can stay logged in across sessions</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={allowRememberMe} onChange={(e) => setAllowRememberMe(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input 
                      type="number" 
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                      min="15"
                      max="1440"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Login Attempts</label>
                    <input 
                      type="number" 
                      value={maxLoginAttempts}
                      onChange={(e) => setMaxLoginAttempts(parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>

                  <div className="form-group">
                    <label>Lockout Duration (minutes)</label>
                    <input 
                      type="number" 
                      value={lockoutDuration}
                      onChange={(e) => setLockoutDuration(parseInt(e.target.value))}
                      min="5"
                      max="60"
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Require Two-Factor Authentication</h4>
                      <p>Mandatory 2FA for all users</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={require2FA} onChange={(e) => setRequire2FA(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => handleSaveSettings('Registration & Login')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="settings-section">
                <h2>Email Configuration</h2>
                <p className="info-text">Configure SMTP settings for sending system emails</p>

                <div className="form-group">
                  <label>SMTP Host</label>
                  <input 
                    type="text" 
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>

                <div className="form-group">
                  <label>SMTP Port</label>
                  <input 
                    type="text" 
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                  />
                </div>

                <div className="form-group">
                  <label>SMTP Username</label>
                  <input 
                    type="text" 
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>SMTP Password</label>
                  <input 
                    type="password" 
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label>From Email</label>
                  <input 
                    type="email" 
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="noreply@eztweak.com"
                  />
                </div>

                <div className="form-group">
                  <label>From Name</label>
                  <input 
                    type="text" 
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="EzTweak System"
                  />
                </div>

                <div className="button-group">
                  <button className="btn-secondary">Test Email Configuration</button>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleSaveSettings('Email')}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'logging' && (
              <div className="settings-section">
                <h2>Error & Activity Logging</h2>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Enable Error Logging</h4>
                    <p>Log all system errors and exceptions</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={enableErrorLogging} onChange={(e) => setEnableErrorLogging(e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Enable Activity Logging</h4>
                    <p>Log user activities and actions</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={enableActivityLogging} onChange={(e) => setEnableActivityLogging(e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Log Level</label>
                  <select value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Log Retention (days)</label>
                  <input 
                    type="number" 
                    value={logRetentionDays}
                    onChange={(e) => setLogRetentionDays(parseInt(e.target.value))}
                    min="7"
                    max="365"
                  />
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => handleSaveSettings('Logging')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {activeTab === 'scheduling' && (
              <div className="settings-section">
                <h2>Real-Time Scheduling Configuration</h2>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Enable Scheduling System</h4>
                    <p>Allow clients to schedule pickup/delivery times</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={enableScheduling} onChange={(e) => setEnableScheduling(e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Time Slot Duration (minutes)</label>
                  <input 
                    type="number" 
                    value={scheduleSlotDuration}
                    onChange={(e) => setScheduleSlotDuration(parseInt(e.target.value))}
                    min="15"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label>Advance Booking Days</label>
                  <input 
                    type="number" 
                    value={advanceBookingDays}
                    onChange={(e) => setAdvanceBookingDays(parseInt(e.target.value))}
                    min="1"
                    max="30"
                  />
                </div>

                <div className="form-group">
                  <label>Reminder Notice (hours before)</label>
                  <input 
                    type="number" 
                    value={reminderHours}
                    onChange={(e) => setReminderHours(parseInt(e.target.value))}
                    min="1"
                    max="48"
                  />
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => handleSaveSettings('Scheduling')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="settings-section">
                <h2>Order Management Settings</h2>

                <div className="config-group">
                  <h3>Order Types</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Enable Quick Order</h4>
                      <p>Staff can create quick orders (Client name + products + status)</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={enableQuickOrder} onChange={(e) => setEnableQuickOrder(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Enable Client Order</h4>
                      <p>Full client order with order history tracking</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={enableClientOrder} onChange={(e) => setEnableClientOrder(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="config-group">
                  <h3>Order Options</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Require Order Approval</h4>
                      <p>Orders must be approved by staff before processing</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={requireOrderApproval} onChange={(e) => setRequireOrderApproval(e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Maximum Items per Order</label>
                    <input 
                      type="number" 
                      value={maxOrderItems}
                      onChange={(e) => setMaxOrderItems(parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  onClick={() => handleSaveSettings('Order')}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
