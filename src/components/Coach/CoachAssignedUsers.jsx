import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoachAssignedUsers.css';

const CoachAssignedUsers = ({ onChatUser, selectedUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedUsers();
  }, []);

  const fetchAssignedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/coach/assigned-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch assigned users');
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/coach/user/${userId}`);
  };

  if (loading) return <div className="loading">Loading assigned users...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="coach-assigned-users">
      <div className="users-header">
        <h2>My Assigned Users</h2>
        <p className="users-count">{users.length} user{users.length !== 1 ? 's' : ''} assigned</p>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Assigned Users Yet</h3>
          <p>You don't have any users assigned to you at this time.</p>
          <p>Check back later or contact your administrator.</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((user) => (
            <div
              key={user.user_id}
              className={`user-card ${selectedUserId === user.user_id ? 'user-card-active' : ''}`}
            >
              <div className="user-card-header">
                <div className="user-avatar">
                  {user.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3>{user.user_name}</h3>
                  <p className="user-email">{user.user_email}</p>
                </div>
              </div>

              <div className="user-card-body">
                <div className="info-row">
                  <span className="info-label">Assigned Date:</span>
                  <span className="info-value">
                    {new Date(user.assigned_at).toLocaleDateString()}
                  </span>
                </div>

                {user.goals && (
                  <div className="info-row goals-row">
                    <span className="info-label">Goals:</span>
                    <p className="goals-text">
                      {user.goals.length > 100
                        ? `${user.goals.substring(0, 100)}...`
                        : user.goals}
                    </p>
                  </div>
                )}

                {user.fitness_level && (
                  <div className="info-row">
                    <span className="info-label">Fitness Level:</span>
                    <span className={`fitness-badge ${user.fitness_level.toLowerCase()}`}>
                      {user.fitness_level}
                    </span>
                  </div>
                )}
              </div>

              <div className="user-card-footer">
                <button
                  className="btn-view-details"
                  onClick={() => handleViewDetails(user.user_id)}
                >
                  View Details
                </button>
                <button
                  className={`btn-chat ${selectedUserId === user.user_id ? 'btn-chat-active' : ''}`}
                  onClick={() => onChatUser && onChatUser({
                    user_id: user.user_id,
                    user_name: user.user_name
                  })}
                >
                  {selectedUserId === user.user_id ? '💬 Chatting' : '💬 Chat'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachAssignedUsers;
