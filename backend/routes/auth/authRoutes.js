/**
 * AUTH ROUTES
 * 
 * This file defines all authentication route endpoints.
 * Routes are connected to controller functions.
 * 
 * Public Routes (no authentication):
 * - POST /register - Create new account
 * - POST /login - Login to account
 * - POST /forgot-password - Request password reset
 * - POST /reset-password - Reset password with token
 * 
 * Protected Routes (authentication required):
 * - GET /me - Get current user info
 * - PUT /update-profile - Update user profile
 * - PUT /update-level - Update fitness level
 * - DELETE /delete-account - Delete user account
 */

const express = require("express");
const router = express.Router();
const authController = require("./authController");
const authMiddleware = require("../../middleware/authMiddleware");

// ========== PUBLIC ROUTES ==========
// No authentication required

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// ========== PROTECTED ROUTES ==========
// Authentication required (authMiddleware checks token)

router.get("/me", authMiddleware, authController.getCurrentUser);
router.put("/update-profile", authMiddleware, authController.updateProfile);
router.put("/update-level", authMiddleware, authController.updateLevel);
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
