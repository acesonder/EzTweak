import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Dashboard.css';

interface Referral {
  id: number;
  client_id: number;
  referred_by: number;
  service_type: string;
  organization: string;
  contact_info: string;
  status: string;
  notes: string;
  created_at: string;
  client_name?: string;
  referrer_name?: string;
}

const Referrals: React.FC = () => {
  const { user, token } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await fetch('/api/referrals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    }
  };

  const getStatusClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'status-pending',
      contacted: 'status-contacted',
      accepted: 'status-accepted',
      completed: 'status-completed',
      declined: 'status-declined',
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h1>Referrals</h1>
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + New Referral
            </button>
          )}
        </div>

        {referrals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Referrals</h3>
            <p>There are no referrals to display at this time.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Service Type</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td>#{referral.id}</td>
                    <td>{referral.client_name || `User #${referral.client_id}`}</td>
                    <td>{referral.service_type}</td>
                    <td>{referral.organization}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td>{new Date(referral.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedReferral(referral);
                          setShowModal(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedReferral ? 'Referral Details' : 'Create Referral'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {selectedReferral ? (
                  <div className="referral-details">
                    <p><strong>Client:</strong> {selectedReferral.client_name || `User #${selectedReferral.client_id}`}</p>
                    <p><strong>Service Type:</strong> {selectedReferral.service_type}</p>
                    <p><strong>Organization:</strong> {selectedReferral.organization}</p>
                    <p><strong>Contact Info:</strong> {selectedReferral.contact_info}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedReferral.status)}`}>{selectedReferral.status}</span></p>
                    <p><strong>Notes:</strong></p>
                    <p className="referral-notes">{selectedReferral.notes}</p>
                    <p><strong>Created:</strong> {new Date(selectedReferral.created_at).toLocaleString()}</p>
                  </div>
                ) : (
                  <form className="referral-form">
                    <div className="form-group">
                      <label>Service Type</label>
                      <select required>
                        <option value="">Select service...</option>
                        <option value="medical">Medical Services</option>
                        <option value="mental_health">Mental Health</option>
                        <option value="housing">Housing Support</option>
                        <option value="legal">Legal Aid</option>
                        <option value="employment">Employment Services</option>
                        <option value="addiction">Addiction Treatment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Organization</label>
                      <input type="text" placeholder="Organization name" required />
                    </div>
                    <div className="form-group">
                      <label>Contact Information</label>
                      <input type="text" placeholder="Phone, email, or address" required />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea rows={4} placeholder="Additional notes..."></textarea>
                    </div>
                    <button type="submit" className="btn-primary">Create Referral</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Referrals;
