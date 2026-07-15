const CATEGORIES = {
  fitness:   { label: 'Fitness',   color: '#4f46e5' },
  nutrition: { label: 'Nutrition', color: '#f97316' },
  sleep:     { label: 'Sleep',     color: '#06b6d4' },
  mental:    { label: 'Mental',    color: '#8b5cf6' },
  hydration: { label: 'Hydration', color: '#0ea5e9' },
};

function generateRecommendations(stats) {
  if (!stats) return [];

  const {
    sleep = 0, sleepGoal = 9, waterIntake = 0, waterGoal = 8,
    mood_score = 2, caloriesConsumed = 0, calorieTarget = 2000,
    steps = 0, stepsGoal = 10000, bmi = null,
    weight = 0, goalWeight = 0, fitness_level = 'Beginner', consistency = []
  } = stats;

  const recs = [];
  const goalDir = weight > goalWeight ? 'lose' : weight < goalWeight ? 'gain' : 'maintain';

  if (sleep < sleepGoal * 0.75) {
    recs.push({ category: 'sleep', priority: 1, title: 'Increase your sleep duration', detail: `You slept ${sleep}h but your target is ${sleepGoal}h. Try going to bed 30 minutes earlier tonight.` });
  } else if (sleep >= sleepGoal) {
    recs.push({ category: 'sleep', priority: 3, title: 'Sleep goal achieved', detail: `You hit your ${sleepGoal}h sleep target. Consistent sleep improves muscle recovery and mental focus.` });
  }

  if (waterIntake < waterGoal * 0.5) {
    recs.push({ category: 'hydration', priority: 1, title: 'Critical: drink more water', detail: `Only ${waterIntake} of ${waterGoal} cups consumed. Set a reminder to drink every hour.` });
  } else if (waterIntake < waterGoal) {
    recs.push({ category: 'hydration', priority: 2, title: 'Boost hydration before end of day', detail: `You need ${waterGoal - waterIntake} more cups to reach your daily goal.` });
  }

  if (goalDir === 'lose' && caloriesConsumed > calorieTarget * 1.1) {
    recs.push({ category: 'nutrition', priority: 1, title: 'Reduce calorie intake to support weight loss', detail: `You consumed ${caloriesConsumed} kcal, exceeding your ${calorieTarget} kcal target. Consider swapping high-calorie snacks with fruits or vegetables.` });
  } else if (goalDir === 'gain' && caloriesConsumed < calorieTarget * 0.8) {
    recs.push({ category: 'nutrition', priority: 2, title: 'Eat more to support weight gain', detail: `Add nutrient-dense foods like nuts, avocados, whole grains or protein shakes to your meals.` });
  } else if (caloriesConsumed === 0) {
    recs.push({ category: 'nutrition', priority: 2, title: 'Log your meals today', detail: `No meals logged yet. Tracking nutrition helps you stay on target.` });
  }

  if (steps < stepsGoal * 0.3) {
    recs.push({ category: 'fitness', priority: 2, title: 'Get moving — steps are very low', detail: `Only ${steps.toLocaleString()} steps taken. A 15-minute walk adds 1,500+ steps and boosts mood.` });
  } else if (steps >= stepsGoal) {
    recs.push({ category: 'fitness', priority: 3, title: 'Step goal reached', detail: `Great work hitting ${stepsGoal.toLocaleString()} steps today.` });
  }

  if (fitness_level === 'Beginner') {
    recs.push({ category: 'fitness', priority: 3, title: 'Focus on form over intensity', detail: `Master correct technique to prevent injury. Complete your workout at a comfortable pace.` });
  } else if (fitness_level === 'Intermediate') {
    recs.push({ category: 'fitness', priority: 3, title: 'Add progressive overload', detail: `Gradually increase reps, sets or resistance each week to keep improving.` });
  } else if (fitness_level === 'Advanced') {
    recs.push({ category: 'fitness', priority: 3, title: 'Prioritise recovery days', detail: `Include at least 1–2 full rest days per week to avoid overtraining.` });
  }

  if (bmi !== null) {
    if (bmi < 18.5) {
      recs.push({ category: 'nutrition', priority: 1, title: 'BMI is below healthy range', detail: `Your BMI of ${bmi} is underweight. Focus on calorie-dense, nutritious foods.` });
    } else if (bmi >= 25 && bmi < 30) {
      recs.push({ category: 'fitness', priority: 2, title: 'BMI indicates overweight range', detail: `BMI ${bmi} — regular cardio and calorie-controlled eating can bring this into the healthy range.` });
    } else if (bmi >= 30) {
      recs.push({ category: 'fitness', priority: 1, title: 'BMI in obese range — take action', detail: `BMI ${bmi} indicates elevated health risk. Start with low-impact activities like walking.` });
    }
  }

  if (mood_score <= 1) {
    recs.push({ category: 'mental', priority: 1, title: 'Your mood needs attention', detail: `Try the breathing exercise in Wellness, take a short walk, or talk to someone you trust.` });
  } else if (mood_score >= 3) {
    recs.push({ category: 'mental', priority: 3, title: 'Great mental state today', detail: `High mood scores correlate with better workout performance. Use this energy to tackle your goals.` });
  }

  const activeDays = Array.isArray(consistency) ? consistency.length : 0;
  if (activeDays <= 1) {
    recs.push({ category: 'fitness', priority: 2, title: 'Build your weekly consistency', detail: `Only ${activeDays} active day(s) this week. Aim for at least 4 active days.` });
  } else if (activeDays >= 5) {
    recs.push({ category: 'fitness', priority: 3, title: 'Excellent weekly consistency', detail: `${activeDays} active days this week. Consistency is the most important factor for long-term health.` });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

const RecommendationsPanel = ({ stats }) => {
  const recs = generateRecommendations(stats);
  if (!stats || recs.length === 0) return null;

  const priorityLabel = (p) => {
    if (p === 1) return { text: 'Action needed', bg: '#fee2e2', color: '#dc2626' };
    if (p === 2) return { text: 'Suggestion', bg: '#fef3c7', color: '#d97706' };
    return { text: 'Well done', bg: '#dcfce7', color: '#16a34a' };
  };

  return (
    <div className="recommendations-panel">
      <h3 className="rec-title">Personalised Recommendations</h3>
      <p className="rec-subtitle">Based on your data today</p>
      <div className="rec-list">
        {recs.map((rec, i) => {
          const cat = CATEGORIES[rec.category];
          const badge = priorityLabel(rec.priority);
          return (
            <div key={i} className="rec-card" style={{ borderLeft: `4px solid ${cat.color}` }}>
              <div className="rec-card-header">
                <span className="rec-category" style={{ color: cat.color }}>{cat.label}</span>
                <span className="rec-badge" style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>
              </div>
              <p className="rec-card-title">{rec.title}</p>
              <p className="rec-card-detail">{rec.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
