
const QuickStat = ({ label, value }) => {
  return (
    <div className="quick-stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
};

export default QuickStat;
