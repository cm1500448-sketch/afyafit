const WeeklyReportSection = ({ weeklyData }) => {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="clean-card weekly-report-card">
        <h3 className="card-title">Weekly Report</h3>
        <p className="no-data-text">No weekly data available yet. Start logging your wellness to see your weekly report.</p>
      </div>
    );
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const sleepMax = Math.max(...weeklyData.map(d => d.sleep_hours || 0), 1);
  const waterMax = Math.max(...weeklyData.map(d => d.water_count || 0), 1);

  return (
    <div className="clean-card weekly-report-card">
      <h3 className="card-title">Weekly Report</h3>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>SLEEP (hrs)</p>
          <div className="weekly-chart">
            {weeklyData.map((day, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{ height: `${((day.sleep_hours || 0) / sleepMax) * 100}%`, background: '#00f2fe' }}
                  />
                </div>
                <span className="chart-label">
                  {day.log_date ? new Date(day.log_date).toLocaleDateString('en', { weekday: 'short' }) : days[index] || ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>WATER (cups)</p>
          <div className="weekly-chart">
            {weeklyData.map((day, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{ height: `${((day.water_count || 0) / waterMax) * 100}%`, background: '#0ea5e9' }}
                  />
                </div>
                <span className="chart-label">
                  {day.log_date ? new Date(day.log_date).toLocaleDateString('en', { weekday: 'short' }) : days[index] || ''}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeeklyReportSection;
