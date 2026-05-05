
const ProgressRing = ({ percentage = 0, color, label, subValue }) => {
  // Calculate SVG circle properties
  const radius = 35; // Circle radius
  const dashArray = 2 * Math.PI * radius; // Full circle circumference
  
  // Ensure percentage is between 0 and 100
  const validPercentage = Math.min(Math.max(percentage || 0, 0), 100);
  
  // Calculate how much of the circle to fill
  // dashOffset determines where the stroke ends
  const dashOffset = dashArray - (dashArray * validPercentage) / 100;

  return (
    <div className="ring-card">
      {/* SVG circle visualization */}
      <div className="ring-wrapper">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Background circle (gray) */}
          <circle className="ring-bg" cx="50" cy="50" r={radius} />
          
          {/* Progress circle (colored) */}
          <circle
            className="ring-fill" cx="50" cy="50" r={radius}
            style={{
              strokeDasharray: dashArray,
              strokeDashoffset: isNaN(dashOffset) ? dashArray : dashOffset,
              stroke: color
            }}
          />
        </svg>
        
        {/* Percentage text in center */}
        <span className="ring-text-center">{Math.round(validPercentage)}%</span>
      </div>
      
      {/* Label and additional info below ring */}
      <div className="ring-info">
        <h4>{label}</h4>
        <p>{subValue}</p>
      </div>
    </div>
  );
};

export default ProgressRing;
