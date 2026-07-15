const HydrationCard = ({ water, waterGoal, onAddWater }) => {
  const progressPercent = Math.min((water / waterGoal) * 100, 100);

  return (
    <div className="wellness-card water-card overflow-hidden">
      <div className="water-wave-bg" style={{ height: `${progressPercent}%` }}></div>
      <div className="card-content">
        <h3>Hydration</h3>
        <div className="water-display">
          <span className="big-number">{water}</span>
          <span className="goal-label">/ {waterGoal} cups</span>
        </div>
        <button className="add-water-btn" onClick={onAddWater}>+ Add Cup</button>
      </div>
    </div>
  );
};

export default HydrationCard;
