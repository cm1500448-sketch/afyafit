import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReportButton from '../Reports/ReportButton';
import CoachChat from './CoachChat';
import './CoachUserDetail.css';

const CoachUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/coach/user-data/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('You do not have access to this user');
        }
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading user data...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error-message">Error: {error}</div>
      <button className="btn-back" onClick={() => navigate('/coach/assigned-users')}>
        Back to My Users
      </button>
    </div>
  );
  if (!userData) return <div className="error-message">User not found</div>;

  const { user, wellness, fitness, progress, achievements, points, weeklyStats, monthlyStats } = userData;

  return (
    <div className="coach-user-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/coach/assigned-users')}>
          ← Back to My Users
        </button>
        <ReportButton userId={userId} userName={user.name} />
      </div>

      <div className="user-profile-section">
        <div className="coach-profile-card">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            {user.fitness_level && (
              <span className={`fitness-badge ${user.fitness_level.toLowerCase()}`}>
                {user.fitness_level}
              </span>
            )}
          </div>
        </div>

        {user.goals && (
          <div className="goals-card">
            <h3>User Goals</h3>
            <p>{user.goals}</p>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Weekly Summary</h3>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-label">Workouts</span>
              <span className="stat-value">{weeklyStats?.workouts || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Sleep</span>
              <span className="stat-value">
                {(weeklyStats?.avgSleep !== undefined && weeklyStats?.avgSleep !== null && !isNaN(weeklyStats.avgSleep))
                  ? `${weeklyStats.avgSleep}h`
                  : '0h'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Water</span>
              <span className="stat-value">
                {(weeklyStats?.avgWaterLiters !== undefined && !isNaN(weeklyStats.avgWaterLiters))
                  ? `${weeklyStats.avgWaterLiters}L`
                  : (weeklyStats?.avgWater !== undefined && !isNaN(weeklyStats.avgWater))
                    ? `${(weeklyStats.avgWater * 0.25).toFixed(1)}L`
                    : '0L'}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Monthly Summary</h3>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-label">Workouts</span>
              <span className="stat-value">{monthlyStats?.workouts || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">{monthlyStats?.completionRate || 0}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Points</span>
              <span className="stat-value">{monthlyStats?.points || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="data-section">
        <h2>Message {user.name}</h2>
        <CoachChat
          otherUserId={parseInt(userId)}
          otherName={user.name}
          myRole="coach"
        />
      </div>

      <div className="data-sections">
        <div className="data-section">
          <h2>Wellness Summary</h2>
          <div className="wellness-grid">
            <div className="wellness-item">
              <span className="wellness-icon"></span>
              <div className="wellness-info">
                <span className="wellness-label">Average Sleep</span>
                <span className="wellness-value">{wellness?.avgSleep || 0} hours</span>
              </div>
            </div>
            <div className="wellness-item">
              <span className="wellness-icon"></span>
              <div className="wellness-info">
                <span className="wellness-label">Average Water</span>
                <span className="wellness-value">{wellness?.avgWater || 0} liters</span>
              </div>
            </div>
            <div className="wellness-item">
              <span className="wellness-icon"></span>
              <div className="wellness-info">
                <span className="wellness-label">Average Calories</span>
                <span className="wellness-value">{wellness?.avgCalories || 0} kcal</span>
              </div>
            </div>
            <div className="wellness-item">
              <span className="wellness-icon"></span>
              <div className="wellness-info">
                <span className="wellness-label">Most Common Mood</span>
                <span className="wellness-value">{wellness?.mostCommonMood || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="data-section">
          <h2>Fitness Summary</h2>
          <div className="fitness-stats">
            <div className="fitness-stat">
              <span className="fitness-label">Total Workouts</span>
              <span className="fitness-value">{fitness?.totalWorkouts || 0}</span>
            </div>
            <div className="fitness-stat">
              <span className="fitness-label">Completion Rate</span>
              <span className="fitness-value">{fitness?.completionRate || 0}%</span>
            </div>
            <div className="fitness-stat">
              <span className="fitness-label">Total Duration</span>
              <span className="fitness-value">{fitness?.totalDuration || 0} min</span>
            </div>
          </div>
        </div>

        <div className="data-section">
          <h2>Progress Metrics</h2>
          <div className="progress-grid">
            {progress?.currentWeight && (
              <div className="progress-item">
                <span className="progress-label">Current Weight</span>
                <span className="progress-value">{progress.currentWeight} kg</span>
              </div>
            )}
            {progress?.weightChange !== undefined && (
              <div className="progress-item">
                <span className="progress-label">Weight Change</span>
                <span className={`progress-value ${progress.weightChange < 0 ? 'negative' : 'positive'}`}>
                  {progress.weightChange > 0 ? '+' : ''}{progress.weightChange} kg
                </span>
              </div>
            )}
            {progress?.currentBMI && (
              <div className="progress-item">
                <span className="progress-label">Current BMI</span>
                <span className="progress-value">{progress.currentBMI}</span>
              </div>
            )}
          </div>
        </div>

        <div className="data-section">
          <h2>Achievements</h2>
          <div className="achievements-summary">
            <div className="achievement-item">
              <span className="achievement-icon"></span>
              <div className="achievement-info">
                <span className="achievement-label">Total Badges</span>
                <span className="achievement-value">{achievements?.totalBadges || 0}</span>
              </div>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon"></span>
              <div className="achievement-info">
                <span className="achievement-label">Total Points</span>
                <span className="achievement-value">{points?.totalPoints || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachUserDetail;
