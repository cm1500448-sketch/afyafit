/**
 * MEAL LOGGER COMPONENT
 * 
 * Displays meal logging form and meal history
 * Shows total calories consumed
 */

const MealLogger = ({ meals, newMeal, totalCalories, onMealChange, onAddMeal }) => {
  return (
    <section className="wellness-section nutrition-hub">
      <div className="section-header">
        <h3>Daily Food Log</h3>
        <span className="calorie-badge">Total: {totalCalories} kcal</span>
      </div>
      <div className="wellness-card food-log-card">
        <form onSubmit={onAddMeal} className="meal-form">
          <input 
            type="date" 
            value={newMeal.date} 
            onChange={(e) => onMealChange({...newMeal, date: e.target.value})} 
          />
          <input 
            placeholder="What did you eat?" 
            value={newMeal.name} 
            onChange={(e) => onMealChange({...newMeal, name: e.target.value})} 
          />
          <input 
            type="number" 
            placeholder="kcal" 
            value={newMeal.calories} 
            onChange={(e) => onMealChange({...newMeal, calories: e.target.value})} 
          />
          <button type="submit" className="add-btn">Add Meal</button>
        </form>
        <table className="nutrition-table">
          <thead>
            <tr><th>Date</th><th>Meal Item</th><th>Calories</th></tr>
          </thead>
          <tbody>
            {meals.map((meal, i) => (
              <tr key={meal.id || i}>
                <td>{new Date(meal.entry_date).toLocaleDateString()}</td>
                <td>{meal.meal_name}</td> 
                <td>{meal.calories} kcal</td>
              </tr>
            ))}
          </tbody>
        </table>
        {meals.length === 0 && <p className="empty-msg" style={{textAlign: 'center', padding: '20px'}}>No meals logged for today.</p>}
      </div>
    </section>
  );
};

export default MealLogger;
