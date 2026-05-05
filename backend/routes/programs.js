
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/available', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT wp.id, wp.name, wp.description, wp.difficulty,
              COUNT(DISTINCT wpw.id) as workout_count
       FROM weekly_programs wp
       LEFT JOIN weekly_program_workouts wpw ON wp.id = wpw.program_id
       WHERE wp.is_active = 1 AND (wp.is_public = 1 OR wp.created_by = ?)
       GROUP BY wp.id
       ORDER BY wp.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});


router.get('/enrolled', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT upe.id, upe.program_id, upe.start_date, upe.end_date, upe.is_active,
              wp.name, wp.description, wp.difficulty
       FROM user_program_enrollments upe
       JOIN weekly_programs wp ON upe.program_id = wp.id
       WHERE upe.user_id = ? AND upe.is_active = 1
       ORDER BY upe.start_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching enrolled programs:', err);
    res.status(500).json({ error: 'Failed to fetch enrolled programs' });
  }
});

router.post('/enroll', authMiddleware, async (req, res) => {
  try {
    const { programId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already enrolled
    const [existing] = await db.execute(
      `SELECT id FROM user_program_enrollments
       WHERE user_id = ? AND program_id = ? AND is_active = 1`,
      [req.user.id, programId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this program' });
    }
    
    // Deactivate any other active enrollments
    await db.execute(
      `UPDATE user_program_enrollments
       SET is_active = 0, end_date = CURDATE()
       WHERE user_id = ? AND is_active = 1`,
      [req.user.id]
    );
    
    // Create new enrollment
    await db.execute(
      `INSERT INTO user_program_enrollments (user_id, program_id, start_date, is_active)
       VALUES (?, ?, ?, 1)`,
      [req.user.id, programId, today]
    );
    
    res.json({ message: 'Successfully enrolled in program' });
  } catch (err) {
    console.error('Error enrolling in program:', err);
    res.status(500).json({ error: 'Failed to enroll in program' });
  }
});

router.get('/:id/details', authMiddleware, async (req, res) => {
  try {
    const programId = req.params.id;
    
    // Get program info
    const [programRows] = await db.execute(
      `SELECT wp.id, wp.name, wp.description, wp.difficulty, wp.created_at
       FROM weekly_programs wp
       WHERE wp.id = ? AND (wp.is_public = 1 OR wp.created_by = ?)`,
      [programId, req.user.id]
    );
    
    if (programRows.length === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }
    
    // Get weekly schedule
    const [scheduleRows] = await db.execute(
      `SELECT wpw.day_of_week, wpw.order_in_day, wpw.target_sets, wpw.target_reps, wpw.target_duration_min,
              wl.id as workout_id, wl.name as workout_name, wl.description as workout_description,
              wl.video_url, wl.difficulty as workout_difficulty
       FROM weekly_program_workouts wpw
       JOIN workout_library wl ON wpw.workout_id = wl.id
       WHERE wpw.program_id = ?
       ORDER BY wpw.day_of_week, wpw.order_in_day`,
      [programId]
    );
    
    // Organize by day
    const schedule = {};
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    scheduleRows.forEach(row => {
      const dayName = dayNames[row.day_of_week];
      if (!schedule[dayName]) {
        schedule[dayName] = [];
      }
      schedule[dayName].push({
        id: row.workout_id,
        name: row.workout_name,
        description: row.workout_description,
        video_url: row.video_url,
        difficulty: row.workout_difficulty,
        sets: row.target_sets,
        reps: row.target_reps,
        duration: row.target_duration_min
      });
    });
    
    res.json({
      program: programRows[0],
      schedule
    });
  } catch (err) {
    console.error('Error fetching program details:', err);
    res.status(500).json({ error: 'Failed to fetch program details' });
  }
});

router.get('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const programId = req.params.id;
    
    // Check if enrolled
    const [enrollment] = await db.execute(
      `SELECT upe.start_date, upe.end_date
       FROM user_program_enrollments upe
       WHERE upe.user_id = ? AND upe.program_id = ? AND upe.is_active = 1`,
      [req.user.id, programId]
    );
    
    if (enrollment.length === 0) {
      return res.status(404).json({ error: 'Not enrolled in this program' });
    }
    
    const startDate = new Date(enrollment[0].start_date);
    const today = new Date();
    const daysEnrolled = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Get program schedule
    const [scheduleRows] = await db.execute(
      `SELECT DISTINCT day_of_week FROM weekly_program_workouts WHERE program_id = ?`,
      [programId]
    );
    const totalWorkoutDays = scheduleRows.length;
    
    // Get completed workouts
    const [completedRows] = await db.execute(
      `SELECT COUNT(DISTINCT DATE(performed_at)) as completed_days
       FROM user_workout_logs
       WHERE user_id = ? AND program_id = ? AND performed_at >= ?`,
      [req.user.id, programId, enrollment[0].start_date]
    );
    
    const completedDays = completedRows[0]?.completed_days || 0;
    const progressPercentage = totalWorkoutDays > 0 
      ? Math.min((completedDays / (totalWorkoutDays * Math.ceil(daysEnrolled / 7))) * 100, 100)
      : 0;
    
    res.json({
      startDate: enrollment[0].start_date,
      daysEnrolled,
      totalWorkoutDays,
      completedDays,
      progressPercentage: Math.round(progressPercentage)
    });
  } catch (err) {
    console.error('Error fetching program progress:', err);
    res.status(500).json({ error: 'Failed to fetch program progress' });
  }
});

module.exports = router;
