import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Dashboard.css';

interface Case {
  id: number;
  client_id: number;
  staff_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  client_name?: string;
  staff_name?: string;
}

interface CaseNote {
  id: number;
  case_id: number;
  user_id: number;
  note: string;
  created_at: string;
  user_name?: string;
}

const Cases: React.FC = () => {
  const { user, token } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  };

  const fetchCaseDetails = async (caseId: number) => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedCase(data.case);
        setCaseNotes(data.notes || []);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch case details:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNote.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cases/${selectedCase.id}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: newNote }),
      });

      if (response.ok) {
        setNewNote('');
        fetchCaseDetails(selectedCase.id);
      } else {
        setError('Failed to add note');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      open: 'status-open',
      in_progress: 'status-progress',
      closed: 'status-closed',
      pending: 'status-pending',
    };
    return statusMap[status] || 'status-default';
  };

  const getPriorityClass = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent',
    };
    return priorityMap[priority] || 'priority-default';
  };

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <h1>Case Management</h1>
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <button className="btn-primary">+ New Case</button>
          )}
        </div>

        {cases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Cases Found</h3>
            <p>There are no cases to display at this time.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td>#{caseItem.id}</td>
                    <td>{caseItem.title}</td>
                    <td>{caseItem.client_name || `User #${caseItem.client_id}`}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(caseItem.status)}`}>
                        {caseItem.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(caseItem.priority)}`}>
                        {caseItem.priority}
                      </span>
                    </td>
                    <td>{new Date(caseItem.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => fetchCaseDetails(caseItem.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && selectedCase && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Case Details</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="case-details">
                  <h3>{selectedCase.title}</h3>
                  <p><strong>Description:</strong> {selectedCase.description}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedCase.status)}`}>{selectedCase.status}</span></p>
                  <p><strong>Priority:</strong> <span className={`priority-badge ${getPriorityClass(selectedCase.priority)}`}>{selectedCase.priority}</span></p>
                </div>

                <div className="case-notes">
                  <h4>Case Notes</h4>
                  {caseNotes.length === 0 ? (
                    <p className="empty-notes">No notes yet.</p>
                  ) : (
                    <div className="notes-list">
                      {caseNotes.map((note) => (
                        <div key={note.id} className="note-item">
                          <div className="note-header">
                            <strong>{note.user_name || `User #${note.user_id}`}</strong>
                            <span className="note-date">{new Date(note.created_at).toLocaleString()}</span>
                          </div>
                          <p className="note-text">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(user?.role === 'staff' || user?.role === 'admin') && (
                    <form onSubmit={handleAddNote} className="add-note-form">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        rows={3}
                        disabled={loading}
                      />
                      {error && <div className="error-message">{error}</div>}
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Note'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cases;
