import { useCallback, useEffect, useMemo, useState } from 'react';
import authFetch from '../../../utils/authFetch';
import { showNotification } from '../../../utils/notification';

const useFitnessData = () => {
  const [todaysPlan, setTodaysPlan] = useState({ name: 'Rest Day', exercises: [], color: '#94a3b8' });
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteExercises');
    return saved ? JSON.parse(saved) : [];
  });

  const todayIndex = new Date().getDay();

  const normalize = (ex) => ({
    ...ex,
    id: ex.id,
    targetMuscle: ex.focus || 'Full Body',
    youtubeId: ex.youtube_id || '',
    calories: ex.calories || 50
  });

  const fetchWorkouts = useCallback(async () => {
    try {
      const [planRes, libraryRes] = await Promise.all([
        authFetch('http://localhost:5000/api/fitness/generate-plan'),
        authFetch('http://localhost:5000/api/fitness/exercise-library')
      ]);

      if (!planRes.ok || !libraryRes.ok) throw new Error('Failed to fetch fitness data');

      const planData = await planRes.json();
      const libraryData = await libraryRes.json();

      const normalizedPlan = (planData.plan || []).map(normalize);
      const normalizedLibrary = (libraryData || []).map(normalize);

      setTodaysPlan({
        name: planData.planName || 'Workout Plan',
        exercises: normalizedPlan,
        color: planData.planColor || '#c084fc'
      });
      setExerciseLibrary(normalizedLibrary);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompletedToday = useCallback(async () => {
    try {
      const res = await authFetch('http://localhost:5000/api/fitness/today-completed');
      if (res.ok) {
        const completedIds = await res.json();
        setTodaysPlan(prev => {
          const indices = (prev.exercises || [])
            .map((ex, i) => completedIds.includes(ex.id) ? i : -1)
            .filter(i => i >= 0);
          setCompletedExercises(indices);
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch completed exercises:', err);
    }
  }, []);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);
  useEffect(() => { fetchCompletedToday(); }, [fetchCompletedToday]);
  useEffect(() => { localStorage.setItem('favoriteExercises', JSON.stringify(favorites)); }, [favorites]);

  const completionRate = useMemo(() => {
    if (!todaysPlan.exercises || todaysPlan.exercises.length === 0) return 0;
    return Math.round((completedExercises.length / todaysPlan.exercises.length) * 100);
  }, [completedExercises, todaysPlan]);

  const toggleFavorite = (exName) => {
    setFavorites(prev => prev.includes(exName) ? prev.filter(n => n !== exName) : [...prev, exName]);
  };

  const toggleExercise = (index) => {
    setCompletedExercises(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleFinishWorkout = async (onCompleteWorkout) => {
    if (completedExercises.length === 0) {
      showNotification('Please complete at least one exercise before finishing.', 'warning');
      return;
    }

    setSaveStatus('saving');
    try {
      const completedExs = completedExercises.map(idx => todaysPlan.exercises[idx]);

      for (const ex of completedExs) {
        await authFetch('http://localhost:5000/api/fitness/complete-workout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ calories: ex.calories || 50, workoutId: ex.id || null, duration: 10 })
        });
      }

      setSaveStatus('saved');
      if (onCompleteWorkout) {
        const totalCalories = completedExs.reduce((sum, ex) => sum + (ex.calories || 50), 0);
        onCompleteWorkout(totalCalories);
      }

      showNotification(`Workout completed! You earned ${completedExercises.length * 10} points!`, 'success', 4000);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Workout save failed:', err);
      setSaveStatus('error');
      showNotification('Failed to save workout. Please try again.', 'error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return {
    todaysPlan, exerciseLibrary, favorites, completedExercises,
    completionRate, saveStatus, loading, todayIndex,
    toggleFavorite, toggleExercise, handleFinishWorkout
  };
};

export default useFitnessData;
