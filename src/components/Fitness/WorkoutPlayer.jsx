import { CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import './WorkoutPlayer.css';

const WorkoutPlayer = ({ workout, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!workout || !workout.exercises || workout.exercises.length === 0) {
    return (
      <div className="workout-player-overlay">
        <div className="player-card immersive">
           <button className="close-btn" onClick={onClose}><X size={28} /></button>
           <p className="text-white">No exercises found for this session.</p>
        </div>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentIndex];
  const progress = ((currentIndex + 1) / workout.exercises.length) * 100;

  const handleNext = () => {
    if (currentIndex < workout.exercises.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="workout-player-overlay">
      <div className="player-card immersive">

        <div className="player-header">
          <button className="close-btn" onClick={onClose}>
            <X size={28} color="white" />
          </button>
          <div className="progress-wrapper">
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="step-counter">Step {currentIndex + 1} of {workout.exercises.length}</span>
          </div>
        </div>

        <div className="exercise-display">
          <div className="exercise-video-container">
            {currentExercise.youtubeId ? (
              <iframe
                className="exercise-video"
                src={`https://www.youtube.com/embed/${currentExercise.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${currentExercise.youtubeId}&controls=0&modestbranding=1&rel=0`}
                title="Tutorial"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="video-placeholder">
                <span className="text-4xl">{currentExercise.icon || '💪'}</span>
                <p>Tutorial coming soon...</p>
              </div>
            )}

            <div className="exercise-info-overlay">
              <h1 className="exercise-name">{currentExercise.name}</h1>
              <div className="exercise-stats-row">
                <div className="stat-pill glass">
                  <span className="stat-label">Sets</span>
                  <span className="stat-value">{currentExercise.sets || '1'}</span>
                </div>

                <div className="stat-pill glass">
                  <span className="stat-label">Reps/Time</span>
                  <span className="stat-value">{currentExercise.reps || currentExercise.target || 'To Failure'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="player-footer">
          <button
            onClick={handlePrev}
            className="nav-btn-secondary"
            style={{ opacity: currentIndex === 0 ? 0 : 1, pointerEvents: currentIndex === 0 ? 'none' : 'auto' }}
          >
            <ChevronLeft size={24} /> <span>Back</span>
          </button>

          {currentIndex === workout.exercises.length - 1 ? (
            <button className="finish-btn" onClick={onClose}>
              <span>Finish</span> <CheckCircle size={24} />
            </button>
          ) : (
            <button onClick={handleNext} className="nav-btn-primary">
              <span>Next</span> <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlayer;
