
import { Award, Calendar, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import './Achievements.css';

const Achievements = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    badges: [],
    points: { total: 0, history: [] },
    availableBadges: []
  });

  useEffect(() => {
    fetchAchievementsData();
  }, []);

  const fetchAchievementsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [badgesRes, pointsRes, historyRes, allBadgesRes] = await Promise.all([
        fetch('http://localhost:5000/api/gamification/badges', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/gamification/points', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/gamification/points-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/gamification/all-badges', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const badges = badgesRes.ok ? await badgesRes.json() : [];
      const points = pointsRes.ok ? await pointsRes.json() : { total: 0 };
      const history = historyRes.ok ? await historyRes.json() : [];
      const allBadges = allBadgesRes.ok ? await allBadgesRes.json() : [];

      setData({
        badges,
        points: { total: points.total || 0, history },
        availableBadges: allBadges
      });
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadgeIds = data.badges.map(b => b.code);
  const lockedBadges = data.availableBadges.filter(b => !earnedBadgeIds.includes(b.code));

  if (loading) {
    return <div className="achievements-loading">Loading your achievements...</div>;
  }

  return (
    <div className="achievements-container">
      {/* Header */}
      <header className="achievements-header">
        <div>
          <h1>Your Achievements</h1>
          <p>Track your progress and earn badges</p>
        </div>
        <div className="total-points-badge">
          <Zap size={24} />
          <div>
            <span className="points-label">Total Points</span>
            <span className="points-value">{data.points.total.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Badges Section */}
      <section className="badges-section">
        <h2><Trophy size={20} /> Badges ({data.badges.length}/{data.availableBadges.length})</h2>
        
        {/* Earned Badges */}
        {data.badges.length > 0 && (
          <div className="badges-subsection">
            <h3>Earned Badges</h3>
            <div className="badges-grid">
              {data.badges.map((badge) => (
                <div key={badge.id} className="badge-card earned">
                  <div className="badge-icon">{badge.icon_url}</div>
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                  <div className="badge-footer">
                    <span className="badge-date">
                      <Calendar size={14} />
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div className="badges-subsection">
            <h3>Available Badges</h3>
            <div className="badges-grid">
              {lockedBadges.map((badge) => (
                <div key={badge.id} className="badge-card locked">
                  <div className="badge-icon locked-icon">🔒</div>
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                  <div className="badge-footer">
                    <span className="badge-points">
                      <Zap size={14} />
                      {badge.points_reward} points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Points History Section */}
      <section className="points-section">
        <h2><TrendingUp size={20} /> Points History</h2>
        
        {data.points.history.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <p>No points earned yet</p>
            <p className="empty-hint">Complete workouts and log wellness data to earn points!</p>
          </div>
        ) : (
          <div className="points-history">
            {data.points.history.map((transaction, index) => (
              <div key={index} className="points-transaction">
                <div className="transaction-icon">
                  {transaction.reference_type === 'workout' ? 'W' :
                   transaction.reference_type === 'wellness' ? 'H' :
                   transaction.reference_type === 'meal' ? 'M' :
                   transaction.reference_type === 'badge' ? 'B' : 'P'}
                </div>
                <div className="transaction-info">
                  <span className="transaction-reason">{transaction.reason}</span>
                  <span className="transaction-date">
                    {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                    {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`transaction-points ${transaction.points_delta > 0 ? 'positive' : 'negative'}`}>
                  {transaction.points_delta > 0 ? '+' : ''}{transaction.points_delta}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Achievements;
