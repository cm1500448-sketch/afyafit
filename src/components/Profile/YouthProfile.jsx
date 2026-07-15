import { useEffect, useState } from 'react';
import authFetch from '../../utils/authFetch';
import CoachRequestForm from './CoachRequestForm';
import CoachRequestStatus from './CoachRequestStatus';
import './Profile.css';

const YouthProfile = () => {
  const [level, setLevel] = useState(() => localStorage.getItem('fitness_level') || 'Beginner');
  const [userData, setUserData] = useState({ name: '', email: '', age: '', height: '', weight: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [coachRequest, setCoachRequest] = useState(null);
  const [hasCoachRequest, setHasCoachRequest] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCoachRequest();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch('http://localhost:5000/api/auth/me');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserData({
        name: data.name || '', email: data.email || '',
        age: data.age || '', height: data.height || '', weight: data.weight || ''
      });
      if (data.fitness_level) {
        setLevel(data.fitness_level);
        localStorage.setItem('fitness_level', data.fitness_level);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachRequest = async () => {
    try {
      const res = await authFetch('http://localhost:5000/api/coach-requests/my-request');
      if (res.ok) {
        const data = await res.json();
        setCoachRequest(data.request || data);
        setHasCoachRequest(true);
      } else if (res.status === 404) {
        setCoachRequest(null);
        setHasCoachRequest(false);
      }
    } catch (err) {
      console.error('Coach request fetch error:', err);
    }
  };

  const handleCoachRequestSuccess = () => {
    fetchCoachRequest();
  };

  const handleCoachRequestCancel = () => {
    setCoachRequest(null);
    setHasCoachRequest(false);
  };

  const handleUpdateLevel = async (newLevel) => {
    try {
      const res = await authFetch('http://localhost:5000/api/auth/update-level', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: newLevel })
      });
      if (res.ok) {
        setLevel(newLevel);
        localStorage.setItem('fitness_level', newLevel);
        setMessage(`Plan updated to ${newLevel}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Update level failed:', err);
    }
  };

  const handleGenerateCode = async () => {
    if (!parentEmail) {
      const { showNotification } = await import('../../utils/notification');
      showNotification('Please enter parent email', 'warning');
      return;
    }
    try {
      const res = await authFetch('http://localhost:5000/api/parent/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail })
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationCode(data.verification_code);
        setMessage('Verification code generated! Share this with your parent.');
        setTimeout(() => setMessage(''), 5000);
      } else {
        const error = await res.json();
        const { showNotification } = await import('../../utils/notification');
        showNotification(error.error || 'Failed to generate code', 'error');
      }
    } catch (err) {
      console.error('Generate code failed:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await authFetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userData.name, age: userData.age, height: userData.height, weight: userData.weight })
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
        const meRes = await authFetch('http://localhost:5000/api/auth/me');
        if (meRes.ok) {
          const data = await meRes.json();
          setUserData({ name: data.name || '', email: data.email || '', age: data.age ?? '', height: data.height ?? '', weight: data.weight ?? '' });
          if (data.fitness_level) setLevel(data.fitness_level);
        }
      } else {
        throw new Error('Failed to update');
      }
    } catch (err) {
      console.error('Update failed:', err);
      setMessage('Error updating profile.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Delete account permanently?')) {
      try {
        const res = await authFetch('http://localhost:5000/api/auth/delete-account', { method: 'DELETE' });
        if (res.ok) { localStorage.clear(); window.location.href = '/'; }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <h1>Youth <span className="highlight-text">Profile</span></h1>

      <div className="profile-card profile-details-card">
        <table className="profile-details-table">
          <tbody>
            <tr>
              <td><strong>Full Name</strong></td>
              <td><input type="text" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} className="profile-input" /></td>
            </tr>
            <tr>
              <td><strong>Email</strong></td>
              <td><input type="email" value={userData.email} disabled className="profile-input disabled" /></td>
            </tr>
            <tr>
              <td><strong>Age</strong></td>
              <td><input type="number" value={userData.age} onChange={(e) => setUserData({ ...userData, age: e.target.value })} className="profile-input" /></td>
            </tr>
            <tr>
              <td><strong>Height (cm)</strong></td>
              <td><input type="number" value={userData.height} onChange={(e) => setUserData({ ...userData, height: e.target.value })} className="profile-input" /></td>
            </tr>
            <tr>
              <td><strong>Current Weight (kg)</strong></td>
              <td><input type="number" value={userData.weight} onChange={(e) => setUserData({ ...userData, weight: e.target.value })} className="profile-input" /></td>
            </tr>
          </tbody>
        </table>
        <button className="update-btn" onClick={handleUpdateProfile}>Update Profile Details</button>
        <hr className="profile-divider" />
        <h3>Fitness Status: <span className={`level-tag ${level}`}>{level}</span></h3>
        <div className="level-selector">
          {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
            <button key={l} className={`level-btn ${level === l ? 'active' : ''}`} onClick={() => handleUpdateLevel(l)}>{l}</button>
          ))}
        </div>
        {message && <p className="success-msg">{message}</p>}
      </div>

      <div className="profile-card parent-link-card">
        <h3>Link Parent Account</h3>
        <p>Generate a verification code to share with your parent so they can monitor your activities.</p>
        <div style={{ marginTop: '1rem' }}>
          <input
            type="email"
            placeholder="Parent's email address"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            className="profile-input"
            style={{ marginBottom: '0.5rem', width: '100%' }}
          />
          <button className="update-btn" onClick={handleGenerateCode}>Generate Verification Code</button>
          {verificationCode && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p><strong>Verification Code:</strong></p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#475569' }}>{verificationCode}</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Share this code with your parent.</p>
            </div>
          )}
        </div>
      </div>

      <div className="profile-card coach-request-card">
        <h3>Request a Coach</h3>
        <p>Get personalized guidance from a certified fitness coach to help you reach your goals.</p>
        {!hasCoachRequest ? (
          <CoachRequestForm onSuccess={handleCoachRequestSuccess} />
        ) : (
          <CoachRequestStatus request={coachRequest} onCancel={handleCoachRequestCancel} />
        )}
      </div>

      <div className="profile-card danger-zone-card">
        <h3 className="danger-title">Delete Account</h3>
        <p className="danger-text">Once you delete your account, there is no going back. Please be certain.</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #fee2e2' }}>
          <button onClick={handleDeleteAccount} style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouthProfile;
