
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/logs', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const [profileRows] = await db.execute(
            `SELECT weight_kg as weight, updated_at as created_at 
             FROM user_profiles 
             WHERE user_id = ? AND weight_kg IS NOT NULL
             ORDER BY updated_at DESC`,
            [userId]
        );
        
        const [wellnessRows] = await db.execute(
            `SELECT sleep_hours as sleep, notes as note, log_date as created_at 
             FROM daily_wellness_logs 
             WHERE user_id = ? AND sleep_hours IS NOT NULL
             ORDER BY log_date DESC`,
            [userId]
        );
        
        // Combine and format for frontend
        const logs = [
            ...profileRows.map(row => ({
                id: `weight_${row.created_at}`,
                weight: row.weight,
                sleep: null,
                note: '',
                created_at: row.created_at
            })),
            ...wellnessRows.map(row => ({
                id: `sleep_${row.created_at}`,
                weight: null,
                sleep: row.sleep,
                note: row.note || '',
                created_at: row.created_at
            }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json(logs);
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/add-log', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { weight, sleep, note } = req.body;
    
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const today = new Date(now - offset).toISOString().split('T')[0];

    try {
        if (weight) {
            await db.execute(
                "UPDATE user_profiles SET weight_kg = ? WHERE user_id = ?",
                [weight, userId]
            );
        }

        // 2. Save Sleep to daily_wellness_logs
        if (sleep) {
            await db.execute(
                `INSERT INTO daily_wellness_logs (user_id, log_date, sleep_hours, notes) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE sleep_hours = ?, notes = COALESCE(?, notes)`,
                [userId, today, sleep, note || '', sleep, note || '']
            );
        }

        res.json({ success: true, message: "Progress synchronized." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to sync data." });
    }
});

module.exports = router;
