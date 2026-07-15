import BreathingExercise from './components/BreathingExercise';
import HydrationCard from './components/HydrationCard';
import MealLogger from './components/MealLogger';
import MoodCard from './components/MoodCard';
import SleepCard from './components/SleepCard';
import SleepHygiene from './components/SleepHygiene';
import useWellnessData from './hooks/useWellnessData';
import './Wellness.css';

const Wellness = () => {
  const {
    water, sleep, selectedMood, isMoodConfirmed, error, isBreathing,
    habits, meals, newMeal, totalCalories, insight, grade,
    setIsMoodConfirmed, setIsBreathing, setNewMeal,
    handleAddWater, handleUpdateSleep, handleMoodSelect, addMeal, toggleHabit
  } = useWellnessData();

  const waterGoal = 8;

  return (
    <div className="wellness-container">
      <header className="wellness-header">
        <div className="header-main">
          <h1>Wellness <span className="highlight-text">Center</span></h1>
          <div className="grade-badge" style={{ backgroundColor: grade.color }}>
            Overall: {grade.label}
          </div>
        </div>
        <p>Syncing your hydration, sleep, and nutrition logs.</p>
      </header>

      {error && (
        <div className="wellness-card" style={{ backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33', padding: '12px', marginBottom: '20px', borderRadius: '8px' }}>
          <strong>⚠ Validation Error:</strong> {error}
        </div>
      )}

      <div className={`wellness-card insight-card ${insight.type}`}>
        <div className="insight-header">
          <span className="insight-icon">{insight.icon}</span>
          <h4>Smart Health Advisor</h4>
        </div>
        <p className="insight-text">{insight.text}</p>
      </div>

      <div className="wellness-grid">
        <HydrationCard water={water} waterGoal={waterGoal} onAddWater={handleAddWater} />
        <SleepCard sleep={sleep} onUpdateSleep={handleUpdateSleep} />
        <MoodCard selectedMood={selectedMood} isMoodConfirmed={isMoodConfirmed} onMoodSelect={handleMoodSelect} onChangeMood={() => setIsMoodConfirmed(false)} />
      </div>

      <div className="habit-section-grid">
        <SleepHygiene habits={habits} onToggleHabit={toggleHabit} />
        <BreathingExercise isBreathing={isBreathing} onToggle={() => setIsBreathing(!isBreathing)} />
      </div>

      <MealLogger meals={meals} newMeal={newMeal} totalCalories={totalCalories} onMealChange={setNewMeal} onAddMeal={addMeal} />
    </div>
  );
};

export default Wellness;
