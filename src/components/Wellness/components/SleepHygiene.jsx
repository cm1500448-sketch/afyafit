/**
 * SLEEP HYGIENE COMPONENT
 * 
 * Displays sleep hygiene checklist
 * Tracks healthy sleep habits
 */

const SleepHygiene = ({ habits, onToggleHabit }) => {
  const habitLabels = {
    noScreens: 'No screens 1hr before bed',
    schedule: 'Consistent schedule'
  };

  return (
    <div className="wellness-card habit-box">
      <h3>🌙 Sleep Hygiene</h3>
      {Object.keys(habitLabels).map(h => (
        <div key={h} className="habit-item" onClick={() => onToggleHabit(h)}>
          <div className={`checkbox ${habits[h] ? 'checked' : ''}`}></div>
          <span>{habitLabels[h]}</span>
        </div>
      ))}
    </div>
  );
};

export default SleepHygiene;
