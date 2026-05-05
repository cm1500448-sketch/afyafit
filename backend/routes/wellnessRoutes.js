
const express = require('express');
const router = express.Router();
const wellnessController = require('./wellnessController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/daily-stats', authMiddleware, wellnessController.getDailyStats);
router.put('/update-daily-stats', authMiddleware, wellnessController.updateDailyStats);
router.post('/add-meal', authMiddleware, wellnessController.addMeal);
router.get('/get-meals', authMiddleware, wellnessController.getMeals);
router.get('/weekly-report', authMiddleware, wellnessController.getWeeklyReport);
module.exports = router;