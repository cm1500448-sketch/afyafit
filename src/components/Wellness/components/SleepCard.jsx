const SleepCard = ({ sleep, onUpdateSleep }) => {
  return (
    <div className="wellness-card sleep-card">
      <h3>Sleep Quality</h3>
      <div className="sleep-input-container">
        <span className="sleep-icon">◌</span>
        <input
          type="number"
          className="sleep-input"
          value={sleep}
          onChange={onUpdateSleep}
        />
        <span className="label">Hours</span>
      </div>
      <div className="sleep-status-bar">
         <div className="status-fill" style={{ width: `${(sleep / 9) * 100}%` }}></div>
      </div>
    </div>
  );
};

export default SleepCard;
