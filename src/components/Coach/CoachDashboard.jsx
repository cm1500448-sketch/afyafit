import { useEffect, useState } from 'react';
import CoachAssignedUsers from './CoachAssignedUsers';
import CoachChat from './CoachChat';
import './CoachDashboard.css';

const CoachDashboard = () => {
  const [coachName, setCoachName] = useState('');
  // selectedUser holds { user_id, user_name } when coach clicks a user to chat
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCoachName(data.name || 'Coach');
        }
      } catch (e) {
        console.error('Failed to fetch coach name:', e);
      }
    };
    fetchName();
  }, []);

  return (
    <div className="coach-dashboard">
      <div className="coach-dashboard-header">
        <div className="coach-avatar">{coachName.charAt(0).toUpperCase()}</div>
        <div>
          <h1>Welcome, <span className="coach-name-highlight">{coachName}</span></h1>
          <p className="coach-subtitle">Coach Dashboard</p>
        </div>
      </div>

      {/* Two-column layout when a user is selected for chat */}
      <div className={`coach-dashboard-body ${selectedUser ? 'with-chat' : ''}`}>
        <div className="coach-users-panel">
          <CoachAssignedUsers
            onChatUser={(user) => setSelectedUser(user)}
            selectedUserId={selectedUser?.user_id}
          />
        </div>

        {/* Chat panel slides in on the right when a user is selected */}
        {selectedUser && (
          <div className="coach-chat-panel">
            <div className="chat-panel-header">
              <span className="chat-panel-title">
                💬 Chat with {selectedUser.user_name}
              </span>
              <button
                className="chat-panel-close"
                onClick={() => setSelectedUser(null)}
                title="Close chat"
              >
                ✕
              </button>
            </div>
            <CoachChat
              otherUserId={selectedUser.user_id}
              otherName={selectedUser.user_name}
              myRole="coach"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;
