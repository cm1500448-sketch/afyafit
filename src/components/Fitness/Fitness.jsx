/**
 * FITNESS - MAIN COMPONENT
 * 
 * Displays workout plans and exercise library
 * Allows users to complete exercises and track progress
 */

import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import ExerciseLibrary from './components/ExerciseLibrary';
import TodaysPlan from './components/TodaysPlan';
import WeeklySchedule from './components/WeeklySchedule';
import useFitnessData from './hooks/useFitnessData';
import './Fitness.css';
import WorkoutPlayer from './WorkoutPlayer';

const Fitness = ({ onCompleteWorkout }) => {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showAllLibrary, setShowAllLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
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
  } = useFitnessData();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Trigger confetti when workout is 100% complete
  useEffect(() => {
    if (completionRate === 100 && todaysPlan.exercises.length > 0) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ 
          particleCount: 3, 
          angle: 60, 
          spread: 55, 
          origin: { x: 0 }, 
          colors: [todaysPlan.color, '#ffffff'] 
        });
        confetti({ 
          particleCount: 3, 
          angle: 120, 
          spread: 55, 
          origin: { x: 1 }, 
          colors: [todaysPlan.color, '#ffffff'] 
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
    }
  }, [completionRate, todaysPlan]);

  const handleWatchTutorial = async (videoId) => {
    if (!navigator.onLine) {
      const { showNotification } = await import('../../utils/notification');
      return showNotification("📴 You are offline.", 'warning');
    }
    window.open(`https://youtu.be/${videoId}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div className="loading-screen">🔌 Personalizing your routine...</div>;

  return (
    <div className="fitness-container">
      {activeWorkout && (
        <WorkoutPlayer 
          workout={activeWorkout} 
          onClose={() => setActiveWorkout(null)} 
        />
      )}

      <header className="fitness-header">
        <div className="header-text">
          <h1>Fitness <span className="highlight-text">Workouts</span></h1>
          <p>{todaysPlan.exercises.length > 0 ? `Your ${todaysPlan.name} is ready.` : "It's time for some rest."}</p>
        </div>

        {!showAllLibrary && todaysPlan.exercises.length > 0 && (
          <div className="progress-card">
            <div className="progress-labels">
              <span>Goal Progress</span>
              <span style={{ color: todaysPlan.color, fontWeight: 'bold' }}>{completionRate}%</span>
              {saveStatus === 'saving' && <span className="save-status saving">Saving…</span>}
              {saveStatus === 'saved' && <span className="save-status saved">Saved</span>}
              {saveStatus === 'error' && <span className="save-status error">Save failed</span>}
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${completionRate}%`, backgroundColor: todaysPlan.color }} 
              />
            </div>
          </div>
        )}
      </header>

      <section className="fitness-section">
        <WeeklySchedule 
          days={days} 
          todayIndex={todayIndex} 
          todaysPlan={todaysPlan} 
        />
      </section>

      <section className="fitness-section main-content">
        <div className="section-header">
          <h3>{showAllLibrary ? "Exercise Library" : `Today's Focus: ${todaysPlan.name}`}</h3>
          <div className="header-actions">
            {showAllLibrary && (
              <input 
                type="text" 
                placeholder="Search..." 
                className="search-input"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            <button className="view-all-btn" onClick={() => setShowAllLibrary(!showAllLibrary)}>
              {showAllLibrary ? "Back to Plan" : "Exercise Library"}
            </button>
          </div>
        </div>

        <div className="exercise-list">
          {showAllLibrary ? (
            <ExerciseLibrary 
              exercises={exerciseLibrary}
              searchTerm={searchTerm}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onWatchTutorial={handleWatchTutorial}
            />
          ) : (
            <TodaysPlan 
              plan={todaysPlan}
              completedExercises={completedExercises}
              favorites={favorites}
              saveStatus={saveStatus}
              onToggleExercise={toggleExercise}
              onToggleFavorite={toggleFavorite}
              onWatchTutorial={handleWatchTutorial}
              onFinishWorkout={() => handleFinishWorkout(onCompleteWorkout)}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Fitness;
