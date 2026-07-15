import { useState, useEffect } from 'react';
import authFetch from '../../../utils/authFetch';

const useDashboardData = () => {
  const [dbStats, setDbStats] = useState(null);
  const [achievements, setAchievements] = useState({ badges: [], points: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setFetchError('no_token');
        setLoading(false);
        return;
      }

      const statsRes = await authFetch('http://localhost:5000/api/dashboard/stats');
      if (statsRes.ok) {
        setDbStats(await statsRes.json());
      } else {
        setFetchError('server');
      }

      const [badgesRes, pointsRes] = await Promise.all([
        authFetch('http://localhost:5000/api/gamification/badges'),
        authFetch('http://localhost:5000/api/gamification/points')
      ]);
      if (badgesRes.ok && pointsRes.ok) {
        const badges = await badgesRes.json();
        const pointsData = await pointsRes.json();
        setAchievements({ badges, points: pointsData.total || 0 });
      }

      const weeklyRes = await authFetch('http://localhost:5000/api/wellness/weekly-report');
      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setFetchError('network');
    } finally {
      setLoading(false);
    }
  };

  const saveSteps = async (steps) => {
    try {
      await authFetch('http://localhost:5000/api/dashboard/update-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps })
      });
      setDbStats(prev => prev ? { ...prev, steps } : prev);
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  return { dbStats, achievements, weeklyData, loading, fetchError, refetch: fetchDashboardData, saveSteps };
};

export default useDashboardData;
