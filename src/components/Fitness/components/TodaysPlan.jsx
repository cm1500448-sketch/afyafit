const TodaysPlan = ({
  plan,
  completedExercises,
  favorites,
  saveStatus,
  onToggleExercise,
  onToggleFavorite,
  onWatchTutorial,
  onFinishWorkout
}) => {
  if (plan.exercises.length === 0) {
    return (
      <div className="rest-day-card">
        <h4>🧘 Rest & Recovery</h4>
        <p>Enjoy your rest day! Your muscles are rebuilding.</p>
      </div>
    );
  }

  return (
    <>
      {plan.exercises.map((ex, i) => (
        <div key={i} className={`exercise-card ${completedExercises.includes(i) ? 'completed' : ''}`}>
          <div className="check-container">
            <button className="check-btn" onClick={() => onToggleExercise(i)}>
              {completedExercises.includes(i) ? '✓' : '○'}
            </button>
          </div>
          <div className="ex-details">
            <h4 className={completedExercises.includes(i) ? 'strikethrough' : ''}>{ex.name}</h4>
            <p>{ex.sets} x {ex.reps} • <span className="focus-tag">{ex.targetMuscle}</span></p>
          </div>
          <div className="ex-actions">
            <button onClick={() => onToggleFavorite(ex.name)} className="fav-icon">
              {favorites.includes(ex.name) ? '♥' : '♡'}
            </button>
            <button className="video-btn" onClick={() => onWatchTutorial(ex.youtubeId)}>
              Tutorial
            </button>
          </div>
        </div>
      ))}

      {completedExercises.length > 0 && (
        <div className="finish-workout-container">
          <button
            className="finish-workout-btn"
            onClick={onFinishWorkout}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' :
             saveStatus === 'saved' ? 'Saved!' :
             `Finish Workout (${completedExercises.length}/${plan.exercises.length})`}
          </button>
          <p className="finish-hint">
            {completedExercises.length === plan.exercises.length
              ? 'All exercises completed! Click to save your progress.'
              : `You've completed ${completedExercises.length} exercise${completedExercises.length > 1 ? 's' : ''}. Click to save your progress.`}
          </p>
        </div>
      )}
    </>
  );
};

export default TodaysPlan;
