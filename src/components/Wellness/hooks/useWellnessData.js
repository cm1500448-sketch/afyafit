import { useCallback, useEffect, useState } from 'react';
import authFetch from '../../../utils/authFetch';

export function deriveGoalDirection(profile) {
  if (!profile || profile.goal_weight == null) return 'maintain';
  if (profile.weight > profile.goal_weight) return 'lose';
  if (profile.weight < profile.goal_weight) return 'gain';
  return 'maintain';
}

export function applyFitnessLevelTone(text, fitnessLevel) {
  if (fitnessLevel === 'Beginner') return `Keep it up! ${text}`;
  if (fitnessLevel === 'Advanced') return `Push further — ${text}`;
  return text;
}

const PRIORITY_RANK = { priority: 0, warning: 1, tip: 2, good: 3 };
const DEFAULT_INSIGHT = { text: "Metrics are balanced. You're on track for your goal!", type: "good", icon: "★" };

export function getSmartInsight(metrics, fitnessProfile) {
  const { water, sleep, selectedMood, totalCalories, meals = [], habits = {} } = metrics;
  const goalDir = deriveGoalDirection(fitnessProfile);
  const fitnessLevel = fitnessProfile?.fitness_level ?? null;

  const candidates = [];

  if (selectedMood <= 1 && sleep < 6)
    candidates.push({ text: "Fatigue detected. Try the mindful breathing exercise below.", type: "priority", icon: "◉" });
  if (sleep < 6 && selectedMood > 1)
    candidates.push({ text: "You're not getting enough sleep. Prioritize rest tonight.", type: "warning", icon: "◌" });
  if (selectedMood <= 1 && sleep >= 6)
    candidates.push({ text: "Your mood is low. Try the breathing exercise to lift your spirits.", type: "warning", icon: "◌" });
  if (water < 4 && totalCalories <= 1800)
    candidates.push({ text: "Low hydration detected. Drink more water throughout the day.", type: "warning", icon: "◌" });
  if (water < 4 && totalCalories > 1800)
    candidates.push({ text: "High calories, low water. Support your metabolism with hydration!", type: "warning", icon: "◌" });
  if (goalDir === 'lose' && totalCalories > 2200)
    candidates.push({ text: "Calorie intake is high for your weight-loss goal. Consider lighter meals.", type: "warning", icon: "◌" });
  if (meals.length === 0)
    candidates.push({ text: "No meals logged yet. Track your nutrition to stay on top of your goals.", type: "tip", icon: "◎" });
  if (goalDir === 'gain' && totalCalories < 1500)
    candidates.push({ text: "You need more fuel to support your weight-gain goal. Eat a bit more today.", type: "tip", icon: "◎" });
  if (goalDir === 'maintain' && totalCalories > 2500)
    candidates.push({ text: "Calorie intake is a bit high. Moderate your meals to stay on track.", type: "tip", icon: "◎" });
  if (water >= 8 && sleep >= 8 && selectedMood >= 3)
    candidates.push({ text: "All metrics are strong. You're crushing your wellness goals!", type: "good", icon: "✓" });

  candidates.sort((a, b) => PRIORITY_RANK[a.type] - PRIORITY_RANK[b.type]);

  let insight = candidates[0] ?? { ...DEFAULT_INSIGHT };

  if (!insight.text || !insight.type || !insight.icon) {
    insight = { ...DEFAULT_INSIGHT };
  }

  if (habits.schedule && habits.noScreens) {
    insight = { ...insight, text: insight.text + " Great habit streak today!" };
  }

  insight = { ...insight, text: applyFitnessLevelTone(insight.text, fitnessLevel) };

  return insight;
}

const useWellnessData = () => {
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [selectedMood, setSelectedMood] = useState(0);
  const [isMoodConfirmed, setIsMoodConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [isBreathing, setIsBreathing] = useState(false);
  const [habits, setHabits] = useState({
    schedule: false,
    noScreens: false
  });
  const [meals, setMeals] = useState([]);
  const [fitnessProfile, setFitnessProfile] = useState(null);

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const today = new Date(now - offset).toISOString().split('T')[0];

  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    date: today
  });

  const fetchWellnessData = useCallback(async () => {
    try {
      const [statsRes, mealsRes] = await Promise.all([
        authFetch('http://localhost:5000/api/wellness/daily-stats'),
        authFetch('http://localhost:5000/api/wellness/get-meals'),
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setWater(stats.water_count || 0);
        setSleep(stats.sleep_hours || 0);
        const moodFromServer = stats.mood_score ?? null;
        setSelectedMood(moodFromServer !== null ? moodFromServer : 0);
        setIsMoodConfirmed(moodFromServer !== null && moodFromServer !== undefined);
      }

      if (mealsRes.ok) {
        const mealsData = await mealsRes.json();
        setMeals(mealsData);
      }
    } catch (error) {
      console.error("Error fetching wellness data:", error);
    }
  }, []);

  useEffect(() => {
    fetchWellnessData();
  }, [fetchWellnessData]);

  const fetchFitnessProfile = useCallback(async () => {
    try {
      const res = await authFetch('http://localhost:5000/api/auth/me');
      if (res.ok) setFitnessProfile(await res.json());
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchFitnessProfile();
  }, [fetchFitnessProfile]);

  const syncDailyStats = async (updatedStats) => {
    try {
      await authFetch('http://localhost:5000/api/wellness/update-daily-stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStats)
      });
    } catch (error) {
      console.error("Failed to sync stats:", error);
    }
  };

  const handleAddWater = () => {
    if (water >= 20) {
      setError('Water count must be between 0 and 20');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const newCount = water + 1;
    setWater(newCount);
    syncDailyStats({ water_count: newCount });
    setError('');
  };

  const handleUpdateSleep = (e) => {
    const val = parseFloat(e.target.value) || 0;

    if (val < 0 || val > 12) {
      setError('Sleep hours must be between 0 and 12');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSleep(val);
    syncDailyStats({ sleep_hours: val });
    setError('');
  };

  const handleMoodSelect = (index) => {
    setSelectedMood(index);
    setIsMoodConfirmed(true);
    syncDailyStats({ mood_score: index });
    setError('');
  };

  const addMeal = async (e) => {
    e.preventDefault();
    if (!newMeal.name || !newMeal.calories) return;

    try {
      const response = await authFetch('http://localhost:5000/api/wellness/add-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_name: newMeal.name,
          calories: parseInt(newMeal.calories),
          entry_date: newMeal.date
        })
      });

      if (response.ok) {
        setNewMeal({ name: '', calories: '', date: today });
        fetchWellnessData();
      }
    } catch (error) {
      console.error("Failed to save meal:", error);
    }
  };

  const toggleHabit = (key) => {
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.calories), 0);

  const calculateWellnessGrade = () => {
    const moodPct = isMoodConfirmed ? (selectedMood / 3) * 100 : 0;
    const score = ((water / 8) * 100 + (sleep / 8) * 100 + moodPct) / 3;
    if (score >= 80) return { label: "Excellent", color: "#4ade80" };
    if (score >= 50) return { label: "Good", color: "#facc15" };
    return { label: "Needs Focus", color: "#f87171" };
  };

  return {
    water,
    sleep,
    selectedMood,
    isMoodConfirmed,
    error,
    isBreathing,
    habits,
    meals,
    newMeal,
    totalCalories,
    insight: getSmartInsight({ water, sleep, selectedMood, totalCalories, meals, habits }, fitnessProfile),
    grade: calculateWellnessGrade(),
    setIsMoodConfirmed,
    setIsBreathing,
    setNewMeal,
    handleAddWater,
    handleUpdateSleep,
    handleMoodSelect,
    addMeal,
    toggleHabit
  };
};

export default useWellnessData;
