const BreathingExercise = ({ isBreathing, onToggle }) => {
  return (
    <div className="wellness-card meditation-card">
      <h3>Mindful Breathing</h3>
      <div className={`breathing-circle ${isBreathing ? 'active' : ''}`}>
        <span className="breathe-text">{isBreathing ? 'Breathe...' : 'Ready?'}</span>
      </div>
      <button onClick={onToggle} className="play-btn">
        {isBreathing ? "Stop" : "▶ Start Exercise"}
      </button>
    </div>
  );
};

export default BreathingExercise;
