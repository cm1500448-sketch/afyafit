/**
 * BMI Card Component
 *
 * Displays BMI value and category.
 * Accepts pre-calculated bmi and bmiCategory from the API (calculated server-side
 * using WHO formula: weight(kg) / height(m)²).
 *
 * Falls back to client-side calculation if API values are not provided.
 *
 * BMI categories (WHO):
 *   < 18.5  = Underweight
 *   18.5–24.9 = Normal weight
 *   25–29.9 = Overweight
 *   ≥ 30    = Obese
 *
 * Note: For users under 18, BMI-for-age percentile is the clinical standard.
 * Raw BMI is shown here as a general indicator only.
 */

const BMICard = ({ weight, height, bmi: apiBmi, bmiCategory: apiCategory }) => {
  // Use API-provided values if available, otherwise calculate client-side
  let bmi = apiBmi;
  let category = apiCategory;

  if (!bmi && weight > 0 && height > 0) {
    const heightM = height / 100;
    bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
  }

  if (!category && bmi) {
    if (bmi < 18.5)     category = 'Underweight';
    else if (bmi < 25)  category = 'Normal weight';
    else if (bmi < 30)  category = 'Overweight';
    else                category = 'Obese';
  }

  // Color coding by category
  const categoryColor = {
    'Underweight': '#60a5fa',   // blue
    'Normal weight': '#4ade80', // green
    'Overweight': '#fb923c',    // orange
    'Obese': '#f87171',         // red
  };
  const color = categoryColor[category] || '#94a3b8';

  return (
    <div className="bmi-card">
      <h3>BMI</h3>
      <div className="bmi-value" style={{ color }}>
        {bmi ? bmi : '--'}
      </div>
      <p className="bmi-category" style={{ color }}>
        {category || 'Add height & weight'}
      </p>
      <p className="bmi-note">WHO formula · general indicator</p>
    </div>
  );
};

export default BMICard;
