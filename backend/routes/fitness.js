// Fitness routes — workout plan generation, exercise library, and completion logging
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get("/generate-plan", authMiddleware, async (req, res) => {
    try {
        const [userProfile] = await db.execute(
            `SELECT up.*, up.fitness_level, r.name as role_name 
             FROM user_profiles up
             JOIN users u ON up.user_id = u.id
             LEFT JOIN roles r ON u.primary_role_id = r.id
             WHERE u.id = ?`,
            [req.user.id]
        );

        const fitnessLevel = userProfile[0]?.fitness_level || 'Beginner';
        let difficulty = 'easy';
        let difficultyAlt = 'Beginner';
        let exerciseCount = 4;

        if (fitnessLevel === 'Intermediate') { difficulty = 'medium'; difficultyAlt = 'Intermediate'; exerciseCount = 6; }
        else if (fitnessLevel === 'Advanced') { difficulty = 'hard'; difficultyAlt = 'Advanced'; exerciseCount = 8; }

        let [plan] = await db.execute(
            `SELECT id, name, description as focus, video_url as youtube_id, difficulty
             FROM workout_library
             WHERE is_active = 1 AND (difficulty = ? OR difficulty = ?)
             ORDER BY RAND()
             LIMIT ?`,
            [difficulty, difficultyAlt, exerciseCount]
        );

        // Backfill with any exercises if not enough
        if (plan.length < exerciseCount) {
            const [additional] = await db.execute(
                `SELECT id, name, description as focus, video_url as youtube_id, difficulty
                 FROM workout_library 
                 WHERE is_active = 1 AND difficulty NOT IN (?, ?)
                 ORDER BY RAND()
                 LIMIT ?`,
                [difficulty, difficultyAlt, exerciseCount - plan.length]
            );
            plan = [...plan, ...additional];
        }

        if (plan.length === 0) {
            return res.json({ level: fitnessLevel, plan: [], planName: "Rest Day", planColor: "#94a3b8" });
        }

        const setsRepsMap = {
            'Beginner': { sets: 2, reps: 10 },
            'Intermediate': { sets: 3, reps: 12 },
            'Advanced': { sets: 4, reps: 15 }
        };
        const { sets, reps } = setsRepsMap[fitnessLevel] || setsRepsMap['Beginner'];

        const mappedPlan = plan.map(workout => ({
            id: workout.id,
            name: workout.name,
            sets: `${sets} Sets`,
            reps: reps.toString(),
            focus: workout.focus || workout.name,
            youtube_id: workout.youtube_id,
            plan_name: `${fitnessLevel} Workout`,
            color: fitnessLevel === 'Beginner' ? "#4ade80" : fitnessLevel === 'Intermediate' ? "#3b82f6" : "#f59e0b",
            // Estimated calories per exercise set based on MET values for youth (ACSM guidelines):
            // Beginner: ~50 kcal per exercise (light effort, 2 sets)
            // Intermediate: ~70 kcal per exercise (moderate effort, 3 sets)
            // Advanced: ~100 kcal per exercise (vigorous effort, 4 sets)
            calories: fitnessLevel === 'Beginner' ? 50 : fitnessLevel === 'Intermediate' ? 70 : 100
        }));

        res.json({
            level: fitnessLevel,
            plan: mappedPlan,
            planName: `${fitnessLevel} Workout`,
            planColor: fitnessLevel === 'Beginner' ? "#4ade80" : fitnessLevel === 'Intermediate' ? "#3b82f6" : "#f59e0b"
        });
    } catch (err) {
        console.error("Generate plan error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.get("/exercise-library", authMiddleware, async (req, res) => {
    try {
        const [exercises] = await db.execute(
            `SELECT id, name, description as focus, video_url as youtube_id, difficulty
             FROM workout_library
             WHERE is_active = 1
             ORDER BY name ASC`
        );

        const mappedExercises = exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            focus: ex.focus || ex.name,
            youtube_id: ex.youtube_id,
            difficulty: ex.difficulty,
            // Average estimated calories per exercise session (moderate effort, ~30 min)
            // Based on ACSM MET values for youth aged 10-18
            calories: ex.difficulty === 'hard' || ex.difficulty === 'Advanced' ? 100
                    : ex.difficulty === 'medium' || ex.difficulty === 'Intermediate' ? 70
                    : 50
        }));

        res.json(mappedExercises);
    } catch (err) {
        console.error("Exercise library error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.get("/today-completed", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await db.execute(
            `SELECT workout_id FROM user_workout_logs 
             WHERE user_id = ? AND DATE(performed_at) = ? AND workout_id IS NOT NULL`,
            [userId, today]
        );
        res.json(rows.map(r => r.workout_id));
    } catch (err) {
        console.error("Today completed error:", err.message);
        res.status(500).json({ error: "Failed to fetch today's completions" });
    }
});

router.post("/complete-workout", authMiddleware, async (req, res) => {
    try {
        const { calories, workoutId, duration } = req.body;
        const userId = req.user.id;

        const [result] = await db.execute(
            `INSERT INTO user_workout_logs (user_id, workout_id, performed_at, duration_min, notes) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, workoutId || null, new Date(), duration || 30, `Calories burned: ${calories || 50}`]
        );

        const { awardPoints, checkWorkoutAchievements } = require('../utils/gamificationHelper');
        await awardPoints(userId, 10, 'Completed workout', 'workout', result.insertId);
        await checkWorkoutAchievements(userId);

        res.json({ message: "Progress saved to database!" });
    } catch (err) {
        console.error("Log Workout Error:", err.message);
        res.status(500).json({ error: "Failed to log workout" });
    }
});

module.exports = router;
