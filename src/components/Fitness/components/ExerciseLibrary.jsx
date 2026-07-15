const ExerciseLibrary = ({ exercises, searchTerm, favorites, onToggleFavorite, onWatchTutorial }) => {
  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (exercises.length === 0) {
    return <p className="info-text">No exercises found in the library.</p>;
  }

  return (
    <div className="library-grid">
      {filteredExercises.map((ex, i) => (
        <div key={i} className="exercise-card">
          <div className="ex-details">
            <h4>{ex.name}</h4>
            <p>{ex.targetMuscle} • <span className="focus-tag">{ex.calories} kcal</span></p>
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
    </div>
  );
};

export default ExerciseLibrary;
