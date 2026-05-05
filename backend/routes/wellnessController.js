
const db = require('../db');
const { getHealthTargets } = require('../utils/healthTargets');

exports.getDailyStats = async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const today = new Date(now - offset).toISOString().split('T')[0];

    try {
        // Fetch wellness log and user profile (for age-aware targets)
        const [rows] = await db.execute(
            "SELECT water_ml, sleep_hours, mood_score FROM daily_wellness_logs WHERE user_id = ? AND log_date = ?",
            [userId, today]
        );

        const [profileRows] = await db.execute(
            "SELECT date_of_birth, weight_kg, goal_weight_kg FROM user_profiles WHERE user_id = ?",
            [userId]
        );
        const profile = profileRows[0] || {};
        const targets = getHealthTargets(
            profile.date_of_birth,
            profile.weight_kg || 0,
            profile.goal_weight_kg || 0
        );

        // If no row exists yet for today, return defaults with age-aware targets
        if (rows.length === 0) {
            return res.json({
                water_count: 0,
                sleep_hours: 0,
                mood_score: 2,
                steps: 0,
                targets
            });
        }

        const row = rows[0];
        const waterCups = Math.floor((row.water_ml || 0) / 250);

        res.json({
            water_count: waterCups,
            sleep_hours: row.sleep_hours || 0,
            mood_score: row.mood_score || 2,
            steps: 0,
            targets  // age-aware goals included in every response
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch daily stats" });
    }
};

exports.updateDailyStats = async (req, res) => {
    const userId = req.user.id;
    const { water_count, sleep_hours, mood_score } = req.body;
    
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const today = new Date(now - offset).toISOString().split('T')[0];

    try {
        // 1 cup = 250ml. Daily target: 8 cups (2000ml) per National Academies / AAP guidelines for youth
        const waterMl = water_count ? water_count * 250 : null;
        
        await db.execute(
            `INSERT INTO daily_wellness_logs (user_id, log_date, water_ml, sleep_hours, mood_score) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
                water_ml = COALESCE(?, water_ml),
                sleep_hours = COALESCE(?, sleep_hours),
                mood_score = COALESCE(?, mood_score)`,
            [
                userId, today, 
                waterMl, sleep_hours || null, mood_score || null,
                waterMl, sleep_hours || null, mood_score || null
            ]
        );
        
        // Award points and check achievements
        const { awardPoints, checkWellnessAchievements } = require('../utils/gamificationHelper');
        await awardPoints(userId, 5, 'Logged wellness data', 'wellness', null);
        await checkWellnessAchievements(userId);
        
        res.json({ message: "Stats synced successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update daily logs" });
    }
};

exports.addMeal = async (req, res) => {
    const userId = req.user.id;
    const { meal_name, calories, entry_date } = req.body;

    try {
        // Determine meal_type from time of day or default to 'snack'
        const mealDate = entry_date || new Date().toISOString().split('T')[0];
        const hour = new Date().getHours();
        let mealType = 'snack';
        if (hour >= 6 && hour < 11) mealType = 'breakfast';
        else if (hour >= 11 && hour < 16) mealType = 'lunch';
        else if (hour >= 16 && hour < 21) mealType = 'dinner';

        const [result] = await db.execute(
            `INSERT INTO user_meals (user_id, meal_date, meal_type, description, calories_kcal) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, mealDate, mealType, meal_name, parseInt(calories) || 0]
        );
        
        // Award points for meal logging
        const { awardPoints } = require('../utils/gamificationHelper');
        await awardPoints(userId, 3, 'Logged meal', 'meal', result.insertId);
        
        res.json({ message: "Meal logged successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to log meal" });
    }
};

exports.getMeals = async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const today = new Date(now - offset).toISOString().split('T')[0];

    try {
        const [rows] = await db.execute(
            `SELECT id, description as meal_name, calories_kcal as calories, meal_date as entry_date 
             FROM user_meals 
             WHERE user_id = ? AND meal_date = ? 
             ORDER BY id DESC`,
            [userId, today]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch meals" });
    }
};

exports.getWeeklyReport = async (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            d.log_date,
            d.sleep_hours,
            d.water_ml,
            COALESCE(SUM(m.calories_kcal), 0) AS total_daily_calories
        FROM 
            daily_wellness_logs d
        LEFT JOIN 
            user_meals m ON d.user_id = m.user_id AND d.log_date = m.meal_date
        WHERE 
            d.user_id = ? 
            AND d.log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY 
            d.log_date
        ORDER BY 
            d.log_date ASC;
    `;

    try {
        const [rows] = await db.execute(query, [userId]);
        
        // Calculate dynamic insights based on the weekly data
        const totalWaterMl = rows.reduce((sum, day) => sum + (day.water_ml || 0), 0);
        const avgSleep = rows.length > 0 
            ? (rows.reduce((sum, day) => sum + (day.sleep_hours || 0), 0) / rows.length).toFixed(1) 
            : 0;

        // Convert water_ml to cups for frontend
        const rowsWithCups = rows.map(day => ({
            ...day,
            water_count: Math.floor((day.water_ml || 0) / 250),
            steps: 0  // Steps not in new schema
        }));

        res.json({
            success: true,
            data: rowsWithCups,
            summary: {
                totalWaterCups: Math.floor(totalWaterMl / 250),
                avgSleep,
                daysTracked: rows.length
            }
        });
    } catch (err) {
        console.error("Weekly Report Error:", err);
        res.status(500).json({ success: false, message: "Could not generate report." });
    }
};
