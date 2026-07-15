import { Award, ChevronDown, ChevronUp, TrendingUp, Trophy } from 'lucide-react';
import { useState } from 'react';

const AchievementsWidget = ({ badges, points }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="achievements-widget">
      <div className="widget-header" onClick={() => setExpanded(!expanded)}>
        <div className="widget-title">
          <Award size={20} />
          <h3>Achievements</h3>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      <div className="widget-stats">
        <div className="achievement-stat">
          <TrendingUp size={18} />
          <span>{points.toLocaleString()} Points</span>
        </div>
        <div className="achievement-stat">
          <Award size={18} />
          <span>{badges.length} Badges</span>
        </div>
      </div>

      {expanded && badges.length > 0 && (
        <div className="badges-preview">
          {badges.slice(0, 6).map((badge) => (
            <div key={badge.id} className="badge-mini">
              <Trophy size={16} />
              <span>{badge.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsWidget;
