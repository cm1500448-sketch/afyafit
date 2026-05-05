/**
 * DASHBOARD DATA HOOK
 * 
 * Custom hook to fetch and manage all dashboard data
 * Handles loading states and data fetching logic
 */

import { useState, useEffect } from 'react';

const useDashboardData = () => {
  const [dbStats, setDbStats] = useState(null);
  const [achievements, setAchievements] = useState({ badges: [], points: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch main stats
      const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsRes.ok) {
        const data = await statsRes.json();
        setDbStats(data);
      }

      // Fetch achievements - badges and points combined
      const [badgesRes, pointsRes] = await Promise.all([
        fetch('http://localhost:5000/api/gamification/badges', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/gamification/points', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (badgesRes.ok && pointsRes.ok) {
        const badges = await badgesRes.json();
        const pointsData = await pointsRes.json();
        setAchievements({ badges, points: pointsData.total || 0 });
      }

      // Fetch weekly wellness data
      const weeklyRes = await fetch('http://localhost:5000/api/wellness/weekly-report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyData(data.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save real step count to backend
  const saveSteps = async (steps) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/dashboard/update-steps', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ steps })
      });
      // Update local state immediately
      setDbStats(prev => prev ? { ...prev, steps } : prev);
    } catch (error) {
      console.error('Error saving steps:', error);
    }
  };

  return {
    dbStats,
    achievements,
    weeklyData,
    loading,
    saveSteps
  };
};

export default useDashboardData;
