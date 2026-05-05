/**
 * WEEKLY REPORT SECTION COMPONENT
 * 
 * Displays weekly summary with bar chart
 */

const WeeklyReportSection = ({ weeklyData }) => {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="clean-card weekly-report-card">
        <h3 className="card-title">Weekly Report</h3>
        <p className="no-data-text">No weekly data available yet.</p>
      </div>
    );
  }

  // Find max value for scaling bars
  const maxValue = Math.max(...weeklyData.map(d => d.value), 1);

  return (
    <div className="clean-card weekly-report-card">
      <h3 className="card-title">Weekly Report</h3>
      <div className="weekly-chart">
        {weeklyData.map((day, index) => (
          <div key={index} className="chart-bar-wrapper">
            <div className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ height: `${(day.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="chart-label">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyReportSection;
