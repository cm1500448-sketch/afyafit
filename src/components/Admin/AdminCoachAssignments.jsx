import { useEffect, useState } from 'react';
import CoachAssignmentModal from './CoachAssignmentModal';
import './AdminCoachAssignments.css';

const AdminCoachAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/coach-assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      setAssignments(data.assignments || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = (assignment) => {
    setSelectedAssignment({
      id: assignment.id,
      user_id: assignment.user_id,
      user_name: assignment.user_name,
      goals: assignment.goals || 'No goals specified'
    });
    setShowReassignModal(true);
  };

  const handleReassignSuccess = async () => {
    setShowReassignModal(false);
    setSelectedAssignment(null);
    await fetchAssignments();
  };

  const handleRemove = async (assignment) => {
    if (!window.confirm(`Remove coach assignment for ${assignment.user_name}? The user's request will return to pending status.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/coach-assignments/${assignment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to remove assignment');
      }

      await fetchAssignments();
    } catch (err) {
      const { showNotification } = await import('../../utils/notification');
      showNotification(`Error: ${err.message}`, 'error');
    }
  };

  if (loading) return <div className="loading">Loading assignments...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-coach-assignments">
      <div className="assignments-header">
        <h2>Active Coach Assignments</h2>
        <p className="assignments-count">{assignments.length} active assignment{assignments.length !== 1 ? 's' : ''}</p>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <p>No active coach assignments at this time.</p>
        </div>
      ) : (
        <div className="assignments-table-container">
          <table className="assignments-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Coach</th>
                <th>Assigned Date</th>
                <th>Assigned By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <div className="user-info">
                      <strong>{assignment.user_name}</strong>
                      <span className="user-email">{assignment.user_email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="coach-info">
                      <strong>{assignment.coach_name}</strong>
                      <span className="coach-email">{assignment.coach_email}</span>
                    </div>
                  </td>
                  <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                  <td>{assignment.admin_name}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-reassign"
                      onClick={() => handleReassign(assignment)}
                    >
                      Reassign
                    </button>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(assignment)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showReassignModal && selectedAssignment && (
        <CoachAssignmentModal
          request={selectedAssignment}
          onClose={() => setShowReassignModal(false)}
          onSuccess={handleReassignSuccess}
          isReassignment={true}
        />
      )}
    </div>
  );
};

export default AdminCoachAssignments;
