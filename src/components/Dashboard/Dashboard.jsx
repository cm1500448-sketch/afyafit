import { useNavigate } from 'react-router-dom';
import RecommendationsPanel from './components/RecommendationsPanel';
import ReportButton from '../Reports/ReportButton';
import AchievementsWidget from './components/AchievementsWidget';
import BMICard from './components/BMICard';
import MetricCard from './components/MetricCard';
import ProgressRing from './components/ProgressRing';
import QuickStat from './components/QuickStat';
import WeeklyReportSection from './components/WeeklyReportSection';
import './Dashboard.css';
import useDashboardData from './hooks/useDashboardData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { dbStats, achievements, weeklyData, loading, fetchError, refetch, saveSteps } = useDashboardData();

  const isDayActive = (dayOffset) => {
    if (!dbStats?.consistency) return false;
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1) + (dayOffset - 1);
    const dateToCheck = new Date(new Date().setDate(diff)).toISOString().split('T')[0];
    return dbStats.consistency.includes(dateToCheck);
  };

  if (loading) return <div className="loading">CONNECTING TO AFYAFIT...</div>;

  if (fetchError === 'auth' || fetchError === 'no_token') {
    return <div className="loading">SESSION EXPIRED. PLEASE RE-LOGIN.</div>;
  }

  if (!dbStats) {
    return (
      <div className="loading" style={{ flexDirection: 'column', gap: '1rem' }}>
        <p>Could not load dashboard data.</p>
        <button onClick={refetch} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer', background: '#4f46e5', color: '#fff', border: 'none' }}>
          Retry
        </button>
      </div>
    );
  }

  const sleepGoal = dbStats.sleepGoal || 9;
  const waterGoal = dbStats.waterGoal || 8;
  const stepsGoal = dbStats.stepsGoal || 10000;

  const sleepScore = Math.min((dbStats.sleep / sleepGoal) * 100, 100) || 0;
  const waterScore = Math.min((dbStats.waterIntake / waterGoal) * 100, 100) || 0;
  const moodScorePct = ((dbStats.mood_score ?? 0) / 4) * 100;

  const wellnessScore = Math.round((sleepScore * 0.4) + (waterScore * 0.4) + (moodScorePct * 0.2));
  const wellnessStatus = wellnessScore > 85 ? 'Glowing' : wellnessScore > 60 ? 'Balanced' : 'Needs Attention';
  const nutritionPercentage = Math.min((dbStats.caloriesConsumed / dbStats.calorieTarget) * 100, 100) || 0;
  const stepScore = Math.min((dbStats.steps / stepsGoal) * 100, 100) || 0;
  const averagePerformance = Math.round((stepScore + sleepScore + wellnessScore) / 3);

  return (
    <div className="dashboard-view-content">
      <header className="dashboard-header-plain">
        <div>
          <h1>Welcome, <span className="highlight-name">{dbStats.fullName}</span></h1>
          <p>
            Current Target: <span className="target-text">{dbStats.goalWeight}kg</span>
            {dbStats.ageGroup && <span className="age-group-badge"> · {dbStats.ageGroup}</span>}
            {' '}| Tracking your 24h cycle.
          </p>
        </div>
        <ReportButton />
      </header>

      <AchievementsWidget badges={achievements.badges} points={achievements.points} />

      <section className="goals-rings-container">
        <ProgressRing percentage={sleepScore} color="#00f2fe" label="SLEEP GOAL" subValue={`${dbStats.sleep} / ${sleepGoal} HRS`} />
        <ProgressRing percentage={nutritionPercentage} color="#ff9f43" label="NUTRITION" subValue={`${dbStats.caloriesConsumed} / ${dbStats.calorieTarget} kcal`} />
        <ProgressRing percentage={wellnessScore} color="#c084fc" label="WELLNESS" subValue={wellnessStatus} />
      </section>

      <div className="top-metrics-container">
        <BMICard weight={dbStats.weight} height={dbStats.height} bmi={dbStats.bmi} bmiCategory={dbStats.bmiCategory} />

        <div className="metric-column">
          <MetricCard label="CALORIES CONSUMED" value={dbStats.caloriesConsumed} unit="kcal" progress={nutritionPercentage} onClick={() => navigate('/wellness')} />
          <MetricCard label="HYDRATION" value={dbStats.waterIntake} unit={`/ ${waterGoal} cups`} progress={waterScore} onClick={() => navigate('/wellness')} />
        </div>

        <div className="metric-column">
          <MetricCard label={<span><span className="sensing-dot"></span>STEPS TODAY</span>} value={dbStats.steps} unit={`/ ${stepsGoal.toLocaleString()} steps`} progress={stepScore} showStepTracker={true} onStepsUpdate={saveSteps} />
          <MetricCard label="SLEEP QUALITY" value={dbStats.sleep} unit="hours" progress={sleepScore} onClick={() => navigate('/wellness')} />
        </div>
      </div>

      <div className="dashboard-lower-grid">
        <div className="clean-card">
          <h3 className="card-title">Performance Insight</h3>
          <div className="insight-content">
            <p>Hitting <strong>{averagePerformance}%</strong> of daily targets.</p>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${averagePerformance}%` }}></div>
            </div>
            <p className="tip-text">
              {wellnessScore < 50 ? 'Focus on hydration and mood today.' : 'Great energy management today!'}
            </p>
          </div>
        </div>

        <div className="clean-card">
          <h3 className="card-title">Weekly Consistency</h3>
          <div className="dots-container">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => (
              <div key={index} className={`dot ${isDayActive(index + 1) ? 'active' : ''}`}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <WeeklyReportSection weeklyData={weeklyData} />
      <RecommendationsPanel stats={dbStats} />

      <div className="quick-stats-grid">
        <QuickStat label="HEIGHT" value={`${dbStats.height} cm`} />
        <QuickStat label="WEIGHT" value={dbStats.weight > 0 ? `${dbStats.weight} kg` : 'Pending Log'} />
        <QuickStat label="TARGET" value={`${dbStats.goalWeight} kg`} />
        <QuickStat label="SYNERGY" value={`${Math.round(wellnessScore)}%`} />
      </div>
    </div>
  );
};

export default Dashboard;
