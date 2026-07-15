const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/update-profile', authMiddleware, authController.updateProfile);
router.put('/update-level', authMiddleware, authController.updateLevel);
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

module.exports = router;
