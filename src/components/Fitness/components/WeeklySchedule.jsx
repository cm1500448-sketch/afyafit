/**
 * WEEKLY SCHEDULE COMPONENT
 * 
 * Displays 7-day workout schedule
 * Highlights current day and shows plan names
 */

const WeeklySchedule = ({ days, todayIndex, todaysPlan }) => {
  return (
    <div className="schedule-row">
      {days.map((dayName, index) => {
        const status = index < todayIndex ? 'completed' : index === todayIndex ? 'current' : 'pending';
        return (
          <div key={dayName} className={`schedule-box ${status}`}>
            <span className="day-name">{dayName.substring(0, 3)}</span>
            <span className="activity-name">{index === todayIndex ? todaysPlan.name : "Plan"}</span>
            {index === todayIndex && <div className="indicator" style={{backgroundColor: todaysPlan.color}}></div>}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklySchedule;
