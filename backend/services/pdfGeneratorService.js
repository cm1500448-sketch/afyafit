const PDFDocument = require('pdfkit');
const { getCompleteReportData } = require('./reportDataService');

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDecimal(value, decimals = 1) {
  return parseFloat(value || 0).toFixed(decimals);
}

function formatPercentage(value) {
  return `${formatDecimal(value, 1)}%`;
}

function generateTitlePage(doc, reportData, userInfo) {
  doc.fontSize(28).text('AfyaFit Wellness Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(userInfo.name, { align: 'center' });
  doc.fontSize(12).text(userInfo.email, { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(
    `Report Period: ${formatDate(reportData.dateRange.startDate)} - ${formatDate(reportData.dateRange.endDate)}`,
    { align: 'center' }
  );
  doc.moveDown(2);
  doc.fontSize(10).text(`Generated on: ${formatDate(new Date().toISOString().split('T')[0])}`, { align: 'center' });
  doc.moveDown(3);
}

function generateWellnessSection(doc, wellnessData) {
  doc.fontSize(18).text('Wellness Summary', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Average Sleep: ${wellnessData.avgSleep} hours per night`);
  doc.text(`Average Water Intake: ${wellnessData.avgWater} cups per day`);
  doc.text(`Days Logged: ${wellnessData.daysLogged}`);
  doc.moveDown(2);
}

function generateFitnessSection(doc, fitnessData) {
  doc.fontSize(18).text('Fitness Summary', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Total Workouts Completed: ${fitnessData.totalWorkouts}`);
  doc.text(`Total Duration: ${fitnessData.totalDuration} minutes`);
  doc.text(`Average Workout Duration: ${fitnessData.avgDuration} minutes`);
  doc.text(`Unique Exercises: ${fitnessData.uniqueWorkouts}`);
  doc.moveDown(2);
}

function generateProgressSection(doc, progressData) {
  doc.fontSize(18).text('Progress Metrics', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Fitness Level: ${progressData.fitnessLevel}`);
  doc.text(`Starting Weight: ${progressData.startWeight} kg`);
  doc.text(`Current Weight: ${progressData.currentWeight} kg`);
  doc.text(`Weight Change: ${progressData.weightChange > 0 ? '+' : ''}${progressData.weightChange} kg`);
  doc.moveDown();
  doc.text(`Starting BMI: ${progressData.startBMI}`);
  doc.text(`Current BMI: ${progressData.currentBMI}`);
  doc.text(`BMI Change: ${progressData.bmiChange > 0 ? '+' : ''}${progressData.bmiChange}`);
  doc.moveDown(2);
}

function generateAchievementsSection(doc, achievementData) {
  doc.fontSize(18).text('Achievements', { underline: true });
  doc.moveDown();
  const badges = Array.isArray(achievementData) ? achievementData : (achievementData?.badges || []);
  if (badges.length === 0) {
    doc.fontSize(12).text('No badges earned during this period.');
  } else {
    doc.fontSize(12);
    badges.forEach((badge, index) => {
      doc.text(`${index + 1}. ${badge.name}`);
      doc.fontSize(10).text(`   ${badge.description}`, { indent: 20 });
      doc.fontSize(12);
    });
  }
  doc.moveDown(2);
}

function generateMoodSection(doc, moodData) {
  doc.fontSize(18).text('Mood Distribution', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Terrible: ${formatPercentage(moodData.terrible)}`);
  doc.text(`Bad: ${formatPercentage(moodData.bad)}`);
  doc.text(`Good: ${formatPercentage(moodData.good)}`);
  doc.text(`Great: ${formatPercentage(moodData.great)}`);
  doc.moveDown(2);
}

function generateCaloriesSection(doc, caloriesData) {
  doc.fontSize(18).text('Nutrition Summary', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Average Daily Calories: ${caloriesData.avgCalories} kcal`);
  doc.text(`Total Calories: ${caloriesData.totalCalories.toLocaleString()} kcal`);
  doc.text(`Days Logged: ${caloriesData.daysLogged}`);
  doc.moveDown(2);
}

function generateGamificationSection(doc, pointsData, streaksData) {
  doc.fontSize(18).text('Gamification Stats', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Total Points Earned: ${pointsData.totalPoints}`);
  doc.text(`Total Activities: ${pointsData.totalActivities}`);
  doc.moveDown();
  doc.text(`Wellness Streak: ${streaksData.wellness.current} days (Best: ${streaksData.wellness.longest})`);
  doc.text(`Workout Streak: ${streaksData.workout.current} days (Best: ${streaksData.workout.longest})`);
  doc.moveDown(2);
}

function generateFooter(doc, pageNumber) {
  doc.fontSize(8).text(
    `AfyaFit - Page ${pageNumber} - Generated ${new Date().toLocaleDateString()}`,
    50, doc.page.height - 50,
    { align: 'center' }
  );
}

async function generateReport(userId, startDate, endDate, userInfo, includeCharts = false) {
  try {
    const reportData = await getCompleteReportData(userId, startDate, endDate);
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    generateTitlePage(doc, reportData, userInfo);
    generateWellnessSection(doc, reportData.wellness);
    generateCaloriesSection(doc, reportData.calories);
    generateMoodSection(doc, reportData.mood);
    generateFitnessSection(doc, reportData.fitness);
    generateProgressSection(doc, reportData.progress);
    generateAchievementsSection(doc, reportData.achievements);
    generateGamificationSection(doc, reportData.points, reportData.streaks);
    generateFooter(doc, 1);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
}

module.exports = { generateReport, formatDate, formatDecimal, formatPercentage };
