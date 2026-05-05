import { useEffect, useState } from 'react';
import './Profile.css';

const AdminCoachParentProfile = ({ role }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
        const data = await res.json();
        setUserData({
          name: data.name || '',
          email: data.email || '',
        });
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: userData.name })
      });
      if (res.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error("Failed to update");
      }
    } catch (err) {
      console.error("Update failed", err);
      setMessage("Error updating profile.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("⚠️ Delete account permanently?")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/delete-account', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          localStorage.clear();
          window.location.href = "/";
        }
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  const roleLabel = role === 'admin' ? 'Admin' : role === 'coach' ? 'Coach' : 'Parent';

  return (
    <div className="profile-container">
      <h1>{roleLabel} <span className="highlight-text">Profile</span></h1>
      
      <div className="profile-card profile-details-card">
        <table className="profile-details-table">
          <tbody>
            <tr>
              <td><strong>Full Name</strong></td>
              <td>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className="profile-input"
                />
              </td>
            </tr>
            <tr>
              <td><strong>Email</strong></td>
              <td><input type="email" value={userData.email} disabled className="profile-input disabled" /></td>
            </tr>
            <tr>
              <td><strong>Role</strong></td>
              <td><span className="role-badge">{roleLabel}</span></td>
            </tr>
          </tbody>
        </table>

        <button className="update-btn" onClick={handleUpdateProfile}>
          Update Profile Details
        </button>
        {message && <p className="success-msg">{message}</p>}
      </div>

      <div className="profile-card danger-zone-card">
        <h3 className="danger-title">Delete Account</h3>
        <p className="danger-text">Once you delete your account, there is no going back. Please be certain.</p>
        <div className="profile-actions" style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #fee2e2'
        }}>
          <button
            onClick={handleDeleteAccount}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCoachParentProfile;
