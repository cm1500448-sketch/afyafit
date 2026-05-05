/**
 * PDF GENERATION SERVICE
 * 
 * This service generates PDF reports for user wellness and fitness data.
 * Uses PDFKit library to create formatted PDF documents with sections for:
 * - Title page with user info and date range
 * - Wellness summary (sleep, water, mood)
 * - Fitness summary (workouts, duration)
 * - Progress metrics (weight, BMI changes)
 * - Achievements (badges earned)
 * 
 * IMPORTANT: Requires pdfkit package
 * Install with: npm install pdfkit
 */

const PDFDocument = require('pdfkit');
const { getCompleteReportData } = require('./reportDataService');

/**
 * Format date to readable string
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date (e.g., "January 15, 2024")
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Format decimal number
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatDecimal(value, decimals = 1) {
  return parseFloat(value || 0).toFixed(decimals);
}

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage (e.g., "75.5%")
 */
function formatPercentage(value) {
  return `${formatDecimal(value, 1)}%`;
}

/**
 * Generate title page
 * @param {PDFDocument} doc - PDF document
 * @param {Object} reportData - Complete report data
 * @param {Object} userInfo - User information
 */
function generateTitlePage(doc, reportData, userInfo) {
  doc.fontSize(28).text('AfyaFit Wellness Report', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(16).text(`${userInfo.name}`, { align: 'center' });
  doc.fontSize(12).text(`${userInfo.email}`, { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(14).text(
    `Report Period: ${formatDate(reportData.dateRange.startDate)} - ${formatDate(reportData.dateRange.endDate)}`,
    { align: 'center' }
  );
  doc.moveDown(2);
  
  doc.fontSize(10).text(`Generated on: ${formatDate(new Date().toISOString().split('T')[0])}`, { align: 'center' });
  doc.moveDown(3);
}

/**
 * Generate wellness section
 * @param {PDFDocument} doc - PDF document
 * @param {Object} wellnessData - Wellness summary data
 */
function generateWellnessSection(doc, wellnessData) {
  doc.fontSize(18).text('Wellness Summary', { underline: true });
  doc.moveDown();
  
  doc.fontSize(12);
  doc.text(`Average Sleep: ${wellnessData.avgSleep} hours per night`);
  doc.text(`Average Water Intake: ${wellnessData.avgWater} cups per day`);
  doc.text(`Days Logged: ${wellnessData.daysLogged}`);
  doc.moveDown(2);
}

/**
 * Generate fitness section
 * @param {PDFDocument} doc - PDF document
 * @param {Object} fitnessData - Fitness summary data
 */
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

/**
 * Generate progress section
 * @param {PDFDocument} doc - PDF document
 * @param {Object} progressData - Progress metrics data
 */
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

/**
 * Generate achievements section
 * @param {PDFDocument} doc - PDF document
 * @param {Array} achievementData - Badges earned
 */
function generateAchievementsSection(doc, achievementData) {
  doc.fontSize(18).text('Achievements', { underline: true });
  doc.moveDown();

  // achievementData is { badges: [], totalBadges: number }
  const badges = Array.isArray(achievementData) ? achievementData : (achievementData?.badges || []);

  if (badges.length === 0) {
    doc.fontSize(12).text('No badges earned during this period.');
  } else {
    doc.fontSize(12);
    badges.forEach((badge, index) => {
      doc.text(`${index + 1}. ${badge.icon || '🏆'} ${badge.name}`);
      doc.fontSize(10).text(`   ${badge.description}`, { indent: 20 });
      doc.fontSize(12);
    });
  }
  doc.moveDown(2);
}

/**
 * Generate mood distribution section
 * @param {PDFDocument} doc - PDF document
 * @param {Object} moodData - Mood distribution data
 */
function generateMoodSection(doc, moodData) {
  doc.fontSize(18).text('Mood Distribution', { underline: true });
  doc.moveDown();
  
  doc.fontSize(12);
  doc.text(`😢 Terrible: ${formatPercentage(moodData.terrible)}`);
  doc.text(`😕 Bad: ${formatPercentage(moodData.bad)}`);
  doc.text(`🙂 Good: ${formatPercentage(moodData.good)}`);
  doc.text(`😄 Great: ${formatPercentage(moodData.great)}`);
  doc.moveDown(2);
}

/**
 * Generate calories section
 * @param {PDFDocument} doc - PDF document
 * @param {Object} caloriesData - Calorie summary data
 */
function generateCaloriesSection(doc, caloriesData) {
  doc.fontSize(18).text('Nutrition Summary', { underline: true });
  doc.moveDown();
  
  doc.fontSize(12);
  doc.text(`Average Daily Calories: ${caloriesData.avgCalories} kcal`);
  doc.text(`Total Calories: ${caloriesData.totalCalories.toLocaleString()} kcal`);
  doc.text(`Days Logged: ${caloriesData.daysLogged}`);
  doc.moveDown(2);
}

/**
 * Generate points and streaks section
 * @param {PDFDocument} doc - PDF document
 * @param {Object} pointsData - Points summary
 * @param {Object} streaksData - Streaks data
 */
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

/**
 * Generate footer
 * @param {PDFDocument} doc - PDF document
 * @param {number} pageNumber - Current page number
 */
function generateFooter(doc, pageNumber) {
  doc.fontSize(8).text(
    `AfyaFit - Page ${pageNumber} - Generated ${new Date().toLocaleDateString()}`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  );
}

/**
 * Generate complete PDF report
 * @param {number} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} userInfo - User information (name, email)
 * @param {boolean} includeCharts - Whether to include charts (not implemented yet)
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateReport(userId, startDate, endDate, userInfo, includeCharts = false) {
  try {
    // Get all report data
    const reportData = await getCompleteReportData(userId, startDate, endDate);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Buffer to store PDF
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Generate PDF content
    generateTitlePage(doc, reportData, userInfo);
    
    // Add sections
    generateWellnessSection(doc, reportData.wellness);
    generateCaloriesSection(doc, reportData.calories);
    generateMoodSection(doc, reportData.mood);
    generateFitnessSection(doc, reportData.fitness);
    generateProgressSection(doc, reportData.progress);
    generateAchievementsSection(doc, reportData.achievements);
    generateGamificationSection(doc, reportData.points, reportData.streaks);
    
    // Add footer
    generateFooter(doc, 1);
    
    // Finalize PDF
    doc.end();
    
    // Return PDF as buffer
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
}

/**
 * Generate wellness trend chart (placeholder)
 * @param {Object} wellnessData - Wellness data over time
 * @returns {Buffer} Chart image buffer
 */
function generateWellnessTrendChart(wellnessData) {
  // TODO: Implement chart generation using chart library
  // For now, return null
  return null;
}

/**
 * Generate workout frequency chart (placeholder)
 * @param {Object} fitnessData - Fitness data over time
 * @returns {Buffer} Chart image buffer
 */
function generateWorkoutFrequencyChart(fitnessData) {
  // TODO: Implement chart generation using chart library
  // For now, return null
  return null;
}

/**
 * Generate progress trend chart (placeholder)
 * @param {Object} progressData - Progress data over time
 * @returns {Buffer} Chart image buffer
 */
function generateProgressTrendChart(progressData) {
  // TODO: Implement chart generation using chart library
  // For now, return null
  return null;
}

module.exports = {
  generateReport,
  generateWellnessTrendChart,
  generateWorkoutFrequencyChart,
  generateProgressTrendChart,
  formatDate,
  formatDecimal,
  formatPercentage
};
