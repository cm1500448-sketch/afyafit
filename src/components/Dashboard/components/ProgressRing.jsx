const ProgressRing = ({ percentage = 0, color, label, subValue }) => {
  const radius = 35;
  const dashArray = 2 * Math.PI * radius;
  const validPercentage = Math.min(Math.max(percentage || 0, 0), 100);
  const dashOffset = dashArray - (dashArray * validPercentage) / 100;

  return (
    <div className="ring-card">
      <div className="ring-wrapper">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle className="ring-bg" cx="50" cy="50" r={radius} />
          <circle
            className="ring-fill" cx="50" cy="50" r={radius}
            style={{
              strokeDasharray: dashArray,
              strokeDashoffset: isNaN(dashOffset) ? dashArray : dashOffset,
              stroke: color
            }}
          />
        </svg>
        <span className="ring-text-center">{Math.round(validPercentage)}%</span>
      </div>
      <div className="ring-info">
        <h4>{label}</h4>
        <p>{subValue}</p>
      </div>
    </div>
  );
};

export default ProgressRing;
