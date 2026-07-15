import { useMemo, useState } from 'react';

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const groupByDate = (meals) => {
  const map = {};
  meals.forEach((m) => {
    const key = m.entry_date?.split('T')[0] ?? m.entry_date;
    if (!map[key]) map[key] = [];
    map[key].push(m);
  });

  return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
};

const localToday = () => {
  const now = new Date();
  const off = now.getTimezoneOffset() * 60000;
  return new Date(now - off).toISOString().split('T')[0];
};

const lastNDays = (meals, n) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - n + 1);
  cutoff.setHours(0, 0, 0, 0);
  return meals.filter((m) => new Date(m.entry_date) >= cutoff);
};

const inMonth = (meals, year, month) =>
  meals.filter((m) => {
    const d = new Date(m.entry_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

const DailySummary = ({ dateStr, dayMeals }) => {
  const total = dayMeals.reduce((s, m) => s + Number(m.calories), 0);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 600,
          padding: '6px 0',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '4px',
        }}
      >
        <span>{fmt(dateStr)}</span>
        <span style={{ color: '#4f46e5' }}>{total} kcal</span>
      </div>
      {dayMeals.map((meal, i) => (
        <div
          key={meal.id || i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: '#64748b',
            padding: '2px 8px',
          }}
        >
          <span>{meal.meal_name}</span>
          <span>{meal.calories} kcal</span>
        </div>
      ))}
    </div>
  );
};

const TABS = ['Today', 'Weekly', 'Monthly'];

const MealLogger = ({ meals, newMeal, totalCalories, onMealChange, onAddMeal }) => {
  const [activeTab, setActiveTab] = useState('Today');

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const weeklyMeals = useMemo(() => lastNDays(meals, 7), [meals]);
  const monthlyMeals = useMemo(
    () => inMonth(meals, selectedYear, selectedMonth),
    [meals, selectedYear, selectedMonth]
  );

  const weeklyTotal = weeklyMeals.reduce((s, m) => s + Number(m.calories), 0);
  const weeklyAvg = weeklyMeals.length
    ? Math.round(weeklyTotal / new Set(weeklyMeals.map((m) => m.entry_date?.split('T')[0])).size)
    : 0;

  const monthlyTotal = monthlyMeals.reduce((s, m) => s + Number(m.calories), 0);
  const monthlyDays = new Set(monthlyMeals.map((m) => m.entry_date?.split('T')[0])).size;
  const monthlyAvg = monthlyDays ? Math.round(monthlyTotal / monthlyDays) : 0;

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
    else setSelectedMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
    if (isCurrentMonth) return;
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
    else setSelectedMonth((m) => m + 1);
  };
  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleString(undefined, {
    month: 'long', year: 'numeric',
  });

  return (
    <section className="wellness-section nutrition-hub">
      <div className="section-header" style={{ marginBottom: '0.75rem' }}>
        <h3>Nutrition Hub</h3>
        <span className="calorie-badge">Today: {totalCalories} kcal</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: activeTab === tab ? '#4f46e5' : '#e2e8f0',
              color: activeTab === tab ? '#fff' : '#475569',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="wellness-card food-log-card">

        {activeTab === 'Today' && (
          <>
            <form onSubmit={onAddMeal} className="meal-form">
              <input
                type="date"
                value={newMeal.date}
                onChange={(e) => onMealChange({ ...newMeal, date: e.target.value })}
              />
              <input
                placeholder="What did you eat?"
                value={newMeal.name}
                onChange={(e) => onMealChange({ ...newMeal, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="kcal"
                value={newMeal.calories}
                onChange={(e) => onMealChange({ ...newMeal, calories: e.target.value })}
              />
              <button type="submit" className="add-btn">Add Meal</button>
            </form>

            <table className="nutrition-table">
              <thead>
                <tr><th>Date</th><th>Meal Item</th><th>Calories</th></tr>
              </thead>
              <tbody>
                {meals
                  .filter((m) => (m.entry_date?.split('T')[0] ?? m.entry_date) === localToday())
                  .map((meal, i) => (
                    <tr key={meal.id || i}>
                      <td>{fmt(meal.entry_date)}</td>
                      <td>{meal.meal_name}</td>
                      <td>{meal.calories} kcal</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {meals.filter((m) => (m.entry_date?.split('T')[0] ?? m.entry_date) === localToday()).length === 0 && (
              <p className="empty-msg" style={{ textAlign: 'center', padding: '20px' }}>
                No meals logged for today.
              </p>
            )}
          </>
        )}
        {activeTab === 'Weekly' && (
          <>
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '10px',
                marginBottom: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL (7 DAYS)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5' }}>{weeklyTotal} kcal</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>AVG / DAY</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5' }}>{weeklyAvg} kcal</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>MEALS LOGGED</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5' }}>{weeklyMeals.length}</div>
              </div>
            </div>

            {groupByDate(weeklyMeals).length === 0 ? (
              <p className="empty-msg" style={{ textAlign: 'center', padding: '20px' }}>
                No meals logged in the last 7 days.
              </p>
            ) : (
              groupByDate(weeklyMeals).map(([date, dayMeals]) => (
                <DailySummary key={date} dateStr={date} dayMeals={dayMeals} />
              ))
            )}
          </>
        )}
        {activeTab === 'Monthly' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <button
                onClick={prevMonth}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#4f46e5' }}
              >
                ‹
              </button>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{monthLabel}</span>
              <button
                onClick={nextMonth}
                disabled={selectedYear === now.getFullYear() && selectedMonth === now.getMonth()}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                  color: selectedYear === now.getFullYear() && selectedMonth === now.getMonth()
                    ? '#cbd5e1' : '#4f46e5',
                }}
              >
                ›
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '10px',
                marginBottom: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL THIS MONTH</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5' }}>{monthlyTotal} kcal</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>AVG / DAY</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5' }}>{monthlyAvg} kcal</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>DAYS WITH DATA</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5' }}>{monthlyDays}</div>
              </div>
            </div>

            {groupByDate(monthlyMeals).length === 0 ? (
              <p className="empty-msg" style={{ textAlign: 'center', padding: '20px' }}>
                No meals logged for {monthLabel}.
              </p>
            ) : (
              groupByDate(monthlyMeals).map(([date, dayMeals]) => (
                <DailySummary key={date} dateStr={date} dayMeals={dayMeals} />
              ))
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MealLogger;
