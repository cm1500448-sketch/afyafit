import { useEffect, useState } from 'react';
import CoachAssignmentModal from './CoachAssignmentModal';
import './AdminCoachRequests.css';

const AdminCoachRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/coach-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data.requests || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleAssignmentSuccess = () => {
    setShowModal(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-coach-requests">
      <div className="requests-header">
        <h2>Pending Coach Requests</h2>
        <p className="requests-count">{requests.length} pending request{requests.length !== 1 ? 's' : ''}</p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No pending coach requests at this time.</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>Goals</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <>
                  <tr key={request.id} className={expandedRow === request.id ? 'expanded' : ''}>
                    <td>{request.user_name}</td>
                    <td>{request.user_email}</td>
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                    <td className="goals-cell">
                      {request.goals.length > 50 
                        ? `${request.goals.substring(0, 50)}...` 
                        : request.goals}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-expand"
                        onClick={() => toggleRow(request.id)}
                      >
                        {expandedRow === request.id ? 'Hide' : 'Details'}
                      </button>
                      <button 
                        className="btn-assign"
                        onClick={() => handleAssignClick(request)}
                      >
                        Assign Coach
                      </button>
                    </td>
                  </tr>
                  {expandedRow === request.id && (
                    <tr className="expanded-row">
                      <td colSpan="5">
                        <div className="expanded-content">
                          <div className="detail-section">
                            <h4>Reason for Request</h4>
                            <p>{request.reason}</p>
                          </div>
                          <div className="detail-section">
                            <h4>Fitness Goals</h4>
                            <p>{request.goals}</p>
                          </div>
                          {request.preferred_style && (
                            <div className="detail-section">
                              <h4>Preferred Coaching Style</h4>
                              <p>{request.preferred_style}</p>
                            </div>
                          )}
                          {request.special_requirements && (
                            <div className="detail-section">
                              <h4>Special Requirements</h4>
                              <p>{request.special_requirements}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CoachAssignmentModal
          request={selectedRequest}
          onClose={() => setShowModal(false)}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
};

export default AdminCoachRequests;
