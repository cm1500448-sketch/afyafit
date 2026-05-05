/**
 * WELLNESS DATA HOOK
 * 
 * Custom hook for fetching and managing wellness data
 * Handles water, sleep, mood, meals, and habits
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * Pure function — derives the user's weight goal direction from their fitness profile.
 * @param {object|null} profile - Fitness profile with `weight` and `goal_weight` fields.
 * @returns {'lose'|'gain'|'maintain'}
 */
export function deriveGoalDirection(profile) {
  if (!profile || profile.goal_weight == null) return 'maintain';
  if (profile.weight > profile.goal_weight) return 'lose';
  if (profile.weight < profile.goal_weight) return 'gain';
  return 'maintain';
}

/**
 * Pure function — applies a tone prefix to insight text based on the user's fitness level.
 * @param {string} text - The insight text to modify.
 * @param {'Beginner'|'Intermediate'|'Advanced'|null|undefined} fitnessLevel
 * @returns {string}
 */
export function applyFitnessLevelTone(text, fitnessLevel) {
  if (fitnessLevel === 'Beginner') return `Keep it up! ${text}`;
  if (fitnessLevel === 'Advanced') return `Push further — ${text}`;
  return text;
}

const PRIORITY_RANK = { priority: 0, warning: 1, tip: 2, good: 3 };
const DEFAULT_INSIGHT = { text: "Metrics are balanced. You're on track for your goal!", type: "good", icon: "🌟" };

/**
 * Pure function — evaluates wellness metrics and returns the single most relevant insight.
 * @param {{ water: number, sleep: number, selectedMood: number, totalCalories: number, meals: Array, habits: { schedule: boolean, noScreens: boolean } }} metrics
 * @param {object|null} fitnessProfile
 * @returns {{ text: string, type: string, icon: string }}
 */
export function getSmartInsight(metrics, fitnessProfile) {
  const { water, sleep, selectedMood, totalCalories, meals = [], habits = {} } = metrics;
  const goalDir = deriveGoalDirection(fitnessProfile);
  const fitnessLevel = fitnessProfile?.fitness_level ?? null;

  const candidates = [];

  if (selectedMood <= 1 && sleep < 6)
    candidates.push({ text: "Fatigue detected. Try the mindful breathing exercise below.", type: "priority", icon: "🧠" });
  if (sleep < 6 && selectedMood > 1)
    candidates.push({ text: "You're not getting enough sleep. Prioritize rest tonight.", type: "warning", icon: "😴" });
  if (selectedMood <= 1 && sleep >= 6)
    candidates.push({ text: "Your mood is low. Try the breathing exercise to lift your spirits.", type: "warning", icon: "🌬️" });
  if (water < 4 && totalCalories <= 1800)
    candidates.push({ text: "Low hydration detected. Drink more water throughout the day.", type: "warning", icon: "💧" });
  if (water < 4 && totalCalories > 1800)
    candidates.push({ text: "High calories, low water. Support your metabolism with hydration!", type: "warning", icon: "💧" });
  if (goalDir === 'lose' && totalCalories > 2200)
    candidates.push({ text: "Calorie intake is high for your weight-loss goal. Consider lighter meals.", type: "warning", icon: "⚖️" });
  if (meals.length === 0)
    candidates.push({ text: "No meals logged yet. Track your nutrition to stay on top of your goals.", type: "tip", icon: "🍽️" });
  if (goalDir === 'gain' && totalCalories < 1500)
    candidates.push({ text: "You need more fuel to support your weight-gain goal. Eat a bit more today.", type: "tip", icon: "🥗" });
  if (goalDir === 'maintain' && totalCalories > 2500)
    candidates.push({ text: "Calorie intake is a bit high. Moderate your meals to stay on track.", type: "tip", icon: "📊" });
  if (water >= 8 && sleep >= 8 && selectedMood >= 3)
    candidates.push({ text: "All metrics are strong. You're crushing your wellness goals!", type: "good", icon: "✅" });

  candidates.sort((a, b) => PRIORITY_RANK[a.type] - PRIORITY_RANK[b.type]);

  let insight = candidates[0] ?? { ...DEFAULT_INSIGHT };

  // Validate required fields — fallback if any missing
  if (!insight.text || !insight.type || !insight.icon) {
    insight = { ...DEFAULT_INSIGHT };
  }

  // Habit streak acknowledgment (req 1.6) — append to text only
  if (habits.schedule && habits.noScreens) {
    insight = { ...insight, text: insight.text + " Great habit streak today!" };
  }

  // Apply fitness level tone
  insight = { ...insight, text: applyFitnessLevelTone(insight.text, fitnessLevel) };

  return insight;
}

const useWellnessData = () => {
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [selectedMood, setSelectedMood] = useState(2);
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

  // Fetch wellness data
  const fetchWellnessData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, mealsRes] = await Promise.all([
        fetch('http://localhost:5000/api/wellness/daily-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/wellness/get-meals', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setWater(stats.water_count || 0);
        setSleep(stats.sleep_hours || 0);
        setSelectedMood(stats.mood_score ?? 2);
        if (stats.mood_score !== null) setIsMoodConfirmed(true);
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
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setFitnessProfile(await res.json());
    } catch {
      // silent fallback
    }
  }, []);

  useEffect(() => {
    fetchFitnessProfile();
  }, [fetchFitnessProfile]);

  // Sync daily stats to database
  const syncDailyStats = async (updatedStats) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/wellness/update-daily-stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedStats)
      });
    } catch (error) {
      console.error("Failed to sync stats:", error);
    }
  };

  // Add water
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

  // Update sleep
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

  // Select mood
  const handleMoodSelect = (index) => {
    setSelectedMood(index);
    setIsMoodConfirmed(true);
    syncDailyStats({ mood_score: index });
    setError('');
  };

  // Add meal
  const addMeal = async (e) => {
    e.preventDefault();
    if (!newMeal.name || !newMeal.calories) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/wellness/add-meal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Toggle habit
  const toggleHabit = (key) => {
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate total calories
  const totalCalories = meals.reduce((sum, meal) => sum + Number(meal.calories), 0);

  // Calculate wellness grade
  const calculateWellnessGrade = () => {
    const score = ((water / 8) * 100 + (sleep / 8) * 100 + (selectedMood + 1) * 25) / 3;
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
