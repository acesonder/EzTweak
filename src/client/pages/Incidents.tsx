import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Dashboard.css';

interface Incident {
  id: number;
  reported_by: number;
  incident_type: string;
  description: string;
  location: string;
  severity: string;
  status: string;
  created_at: string;
  reporter_name?: string;
}

const Incidents: React.FC = () => {
  const { user, token } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    }
  };

  const getSeverityClass = (severity: string) => {
    const severityMap: { [key: string]: string } = {
      low: 'severity-low',
      medium: 'severity-medium',
      high: 'severity-high',
      critical: 'severity-critical',
    };
    return severityMap[severity] || 'severity-default';
  };

  const getStatusClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      reported: 'status-reported',
      investigating: 'status-investigating',
      resolved: 'status-resolved',
      closed: 'status-closed',
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h1>Incident Reports</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Report Incident
          </button>
        </div>

        {incidents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>No Incidents Reported</h3>
            <p>There are no incident reports at this time.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>#{incident.id}</td>
                    <td>{incident.incident_type}</td>
                    <td>{incident.location}</td>
                    <td>
                      <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(incident.status)}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td>{incident.reporter_name || `User #${incident.reported_by}`}</td>
                    <td>{new Date(incident.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedIncident(incident);
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
                <h2>{selectedIncident ? 'Incident Details' : 'Report Incident'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {selectedIncident ? (
                  <div className="incident-details">
                    <p><strong>Type:</strong> {selectedIncident.incident_type}</p>
                    <p><strong>Location:</strong> {selectedIncident.location}</p>
                    <p><strong>Severity:</strong> <span className={`severity-badge ${getSeverityClass(selectedIncident.severity)}`}>{selectedIncident.severity}</span></p>
                    <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedIncident.status)}`}>{selectedIncident.status}</span></p>
                    <p><strong>Description:</strong></p>
                    <p className="incident-description">{selectedIncident.description}</p>
                    <p><strong>Reported:</strong> {new Date(selectedIncident.created_at).toLocaleString()}</p>
                  </div>
                ) : (
                  <form className="incident-form">
                    <div className="form-group">
                      <label>Incident Type</label>
                      <select required>
                        <option value="">Select type...</option>
                        <option value="overdose">Overdose</option>
                        <option value="injury">Injury</option>
                        <option value="theft">Theft</option>
                        <option value="violence">Violence</option>
                        <option value="harassment">Harassment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" placeholder="Enter location" required />
                    </div>
                    <div className="form-group">
                      <label>Severity</label>
                      <select required>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea rows={5} placeholder="Describe the incident..." required></textarea>
                    </div>
                    <button type="submit" className="btn-primary">Submit Report</button>
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

export default Incidents;
