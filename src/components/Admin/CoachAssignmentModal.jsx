import { useEffect, useState } from 'react';
import './CoachAssignmentModal.css';

const CoachAssignmentModal = ({ request, onClose, onSuccess, isReassignment = false }) => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [sortBy, setSortBy] = useState('workload');

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/coaches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch coaches');
      const data = await res.json();
      setCoaches(data.coaches || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCoach) {
      const { showNotification } = await import('../../utils/notification');
      showNotification('Please select a coach', 'warning');
      return;
    }

    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      
      let res;
      if (isReassignment) {
        // Update existing assignment
        res = await fetch(`http://localhost:5000/api/admin/coach-assignments/${request.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            newCoachId: selectedCoach.id
          })
        });
      } else {
        // Create new assignment
        res = await fetch('http://localhost:5000/api/admin/coach-assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            coachRequestId: request.id,
            coachId: selectedCoach.id
          })
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to assign coach');
      }

      onSuccess();
    } catch (err) {
      const { showNotification } = await import('../../utils/notification');
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const sortedCoaches = [...coaches].sort((a, b) => {
    if (sortBy === 'workload') {
      return a.assigned_users_count - b.assigned_users_count;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isReassignment ? 'Reassign Coach' : 'Assign Coach'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="request-info">
            <h3>Request Details</h3>
            <p><strong>User:</strong> {request.user_name}</p>
            <p><strong>Goals:</strong> {request.goals}</p>
          </div>

          <div className="coach-selection">
            <div className="selection-header">
              <h3>Select a Coach</h3>
              <div className="sort-controls">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="workload">Workload (Low to High)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading coaches...</div>
            ) : error ? (
              <div className="error-message">Error: {error}</div>
            ) : coaches.length === 0 ? (
              <div className="empty-state">No coaches available</div>
            ) : (
              <div className="coaches-list">
                {sortedCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className={`coach-card ${selectedCoach?.id === coach.id ? 'selected' : ''} ${coach.assigned_users_count === 0 ? 'zero-workload' : ''}`}
                    onClick={() => setSelectedCoach(coach)}
                  >
                    <div className="coach-info">
                      <h4>{coach.name}</h4>
                      <p className="coach-email">{coach.email}</p>
                    </div>
                    <div className="coach-workload">
                      <span className="workload-number">{coach.assigned_users_count}</span>
                      <span className="workload-label">assigned user{coach.assigned_users_count !== 1 ? 's' : ''}</span>
                      {coach.assigned_users_count === 0 && (
                        <span className="badge-available">Available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={assigning}>
            Cancel
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleAssign}
            disabled={!selectedCoach || assigning}
          >
            {assigning ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachAssignmentModal;
