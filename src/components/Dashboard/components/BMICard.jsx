const BMICard = ({ weight, height, bmi: apiBmi, bmiCategory: apiCategory }) => {
  let bmi = apiBmi;
  let category = apiCategory;

  if (!bmi && weight > 0 && height > 0) {
    const heightM = height / 100;
    bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
  }

  if (!category && bmi) {
    if (bmi < 18.5)    category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else               category = 'Obese';
  }

  const categoryColor = {
    'Underweight':   '#60a5fa',
    'Normal weight': '#4ade80',
    'Overweight':    '#fb923c',
    'Obese':         '#f87171'
  };
  const color = categoryColor[category] || '#94a3b8';

  return (
    <div className="bmi-card">
      <h3>BMI</h3>
      <div className="bmi-value" style={{ color }}>{bmi || '--'}</div>
      <p className="bmi-category" style={{ color }}>{category || 'Add height & weight'}</p>
    </div>
  );
};

export default BMICard;
