import { useState } from 'react';
import CoachChat from '../Coach/CoachChat';
import './CoachRequestStatus.css';

const CoachRequestStatus = ({ request, onCancel, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/coach-requests/${request.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel request');
      }

      // Success - call parent callback
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending Review', color: '#f39c12', icon: '' },
      assigned: { text: 'Coach Assigned', color: '#27ae60', icon: '' },
      cancelled: { text: 'Cancelled', color: '#95a5a6', icon: '' }
    };
    return badges[status] || badges.pending;
  };

  const statusBadge = getStatusBadge(request.status);

  // Safely parse the date — MySQL returns "YYYY-MM-DD HH:MM:SS" which Safari
  // cannot parse directly. Replace the space with "T" to make it ISO 8601.
  const safeDate = request.created_at
    ? new Date(request.created_at.toString().replace(' ', 'T'))
    : null;

  const formattedDate = safeDate && !isNaN(safeDate.getTime())
    ? safeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Date not available';

  return (
    <div className="coach-request-status-container">
      <div className="status-header">
        <h2>Your Coach Request</h2>
        <div 
          className="status-badge" 
          style={{ backgroundColor: statusBadge.color }}
        >
          <span className="badge-icon">{statusBadge.icon}</span>
          {statusBadge.text}
        </div>
      </div>

      <div className="status-card">
        {/* Request Details */}
        <div className="detail-section">
          <h3>Request Details</h3>
          
          <div className="detail-item">
            <label>Submitted On:</label>
            <p>{formattedDate}</p>
          </div>

          <div className="detail-item">
            <label>Why You Want a Coach:</label>
            <p>{request.reason}</p>
          </div>

          <div className="detail-item">
            <label>Your Goals:</label>
            <p>{request.goals}</p>
          </div>

          {request.preferred_style && (
            <div className="detail-item">
              <label>Preferred Coaching Style:</label>
              <p>{request.preferred_style}</p>
            </div>
          )}

          {request.special_requirements && (
            <div className="detail-item">
              <label>Special Requirements:</label>
              <p>{request.special_requirements}</p>
            </div>
          )}
        </div>

        {/* Coach Info (if assigned) */}
        {request.status === 'assigned' && request.coach_name && (
          <div className="coach-info-section">
            <h3>Your Assigned Coach</h3>
            <div className="coach-card">
              <div className="coach-avatar">
                {request.coach_name.charAt(0).toUpperCase()}
              </div>
              <div className="coach-details">
                <h4>{request.coach_name}</h4>
                <p className="coach-subtitle">Your Personal Fitness Coach</p>
              </div>
            </div>
            <p className="coach-message">
              Your coach will reach out to you soon to start your fitness journey!
            </p>

            {/* Messaging — only available when coach_id is known */}
            {request.coach_id && (
              <div className="coach-chat-section">
                <h4>💬 Message Your Coach</h4>
                <CoachChat
                  otherUserId={request.coach_id}
                  otherName={request.coach_name}
                  myRole="youth"
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="actions-section">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel Request
              </button>
            ) : (
              <div className="cancel-confirm">
                <p>Are you sure you want to cancel this request?</p>
                <div className="confirm-buttons">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="btn-confirm-cancel"
                  >
                    {loading ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={loading}
                    className="btn-keep"
                  >
                    Keep Request
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
      </div>

      {/* Status Info */}
      {request.status === 'pending' && (
        <div className="info-box">
          <h3>What's happening now?</h3>
          <p>
            Your request is being reviewed by our admin team. We're working to match you 
            with the best coach for your goals. You'll be notified once a coach is assigned.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoachRequestStatus;
