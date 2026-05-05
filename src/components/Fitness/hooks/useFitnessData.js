/**
 * FITNESS DATA HOOK
 * 
 * Custom hook for fetching fitness data
 * Handles workout plans and exercise library
 * Manages favorites and completed exercises
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { showNotification } from '../../../utils/notification';

const useFitnessData = () => {
  const [dailyWorkouts, setDailyWorkouts] = useState({});
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  // Favorites from localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteExercises');
    return saved ? JSON.parse(saved) : [];
  });

  const todayIndex = new Date().getDay();

  // Fetch workout plan and exercise library
  const fetchWorkouts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [planRes, libraryRes] = await Promise.all([
        fetch('http://localhost:5000/api/fitness/generate-plan', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/fitness/exercise-library', { 
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const planData = await planRes.json();
      const libraryData = await libraryRes.json();

      const normalize = (ex) => ({
        ...ex,
        id: ex.id,
        targetMuscle: ex.focus || "Full Body", 
        youtubeId: ex.youtube_id || "dQw4w9WgXcQ",
        calories: ex.calories || 50
      });

      const normalizedPlan = (planData.plan || []).map(normalize);
      const normalizedLibrary = (libraryData || []).map(normalize);

      setDailyWorkouts({
        [todayIndex]: {
          name: planData.planName || "Workout Plan",
          exercises: normalizedPlan,
          color: planData.planColor || "#c084fc"
        }
      });
      setExerciseLibrary(normalizedLibrary);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [todayIndex]);

  // Fetch completed exercises for today
  const fetchCompletedToday = useCallback(async () => {
    const plan = dailyWorkouts[todayIndex];
    if (!plan?.exercises?.length) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/fitness/today-completed', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (res.ok) {
        const completedIds = await res.json();
        const planIds = plan.exercises.map(ex => ex.id);
        const indices = planIds
          .map((id, i) => (completedIds.includes(id) ? i : -1))
          .filter(i => i >= 0);
        setCompletedExercises(indices);
      }
    } catch (err) {
      console.error('Failed to fetch completed exercises:', err);
    }
  }, [dailyWorkouts, todayIndex]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  useEffect(() => {
    fetchCompletedToday();
  }, [fetchCompletedToday]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteExercises', JSON.stringify(favorites));
  }, [favorites]);

  const todaysPlan = useMemo(() => {
    return dailyWorkouts[todayIndex] || { name: "Rest Day", exercises: [], color: "#94a3b8" };
  }, [dailyWorkouts, todayIndex]);

  const completionRate = useMemo(() => {
    if (!todaysPlan.exercises || todaysPlan.exercises.length === 0) return 0;
    return Math.round((completedExercises.length / todaysPlan.exercises.length) * 100);
  }, [completedExercises, todaysPlan]);

  const toggleFavorite = (exName) => {
    setFavorites(prev => prev.includes(exName) ? prev.filter(n => n !== exName) : [...prev, exName]);
  };

  const toggleExercise = (index) => {
    const isNowComplete = !completedExercises.includes(index);
    setCompletedExercises(prev => 
      isNowComplete ? [...prev, index] : prev.filter(i => i !== index)
    );
  };

  const handleFinishWorkout = async (onCompleteWorkout) => {
    if (completedExercises.length === 0) {
      showNotification('Please complete at least one exercise before finishing.', 'warning');
      return;
    }

    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const completedExs = completedExercises.map(idx => todaysPlan.exercises[idx]);
      
      for (const ex of completedExs) {
        await fetch('http://localhost:5000/api/fitness/complete-workout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            calories: ex.calories || 50, 
            workoutId: ex.id || null, 
            duration: 10 
          })
        });
      }
      
      setSaveStatus('saved');
      if (onCompleteWorkout) {
        const totalCalories = completedExs.reduce((sum, ex) => sum + (ex.calories || 50), 0);
        onCompleteWorkout(totalCalories);
      }
      
      showNotification(`🎉 Workout completed! You earned ${completedExercises.length * 10} points!`, 'success', 4000);
      
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Workout save failed:", err);
      setSaveStatus('error');
      showNotification('Failed to save workout. Please try again.', 'error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return {
    todaysPlan,
    exerciseLibrary,
    favorites,
    completedExercises,
    completionRate,
    saveStatus,
    loading,
    todayIndex,
    toggleFavorite,
    toggleExercise,
    handleFinishWorkout
  };
};

export default useFitnessData;
