
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./routes/auth/authRoutes'); // Login, signup, password reset
const dashboardRoutes = require('./routes/dashboard'); // Dashboard data and statistics
const fitnessRoutes = require("./routes/fitness"); // Workout tracking and exercise data
const wellnessRoutes = require('./routes/wellnessRoutes'); // Sleep, nutrition, mental health
const progressRoutes = require('./routes/progress');
const gamificationRoutes = require('./routes/gamification');
const analyticsRoutes = require('./routes/analytics');
const parentRoutes = require('./routes/parent'); // Parent dashboard and monitoring
const reminderRoutes = require('./routes/reminders'); // Notification and reminder system
const adminRoutes = require('./routes/admin'); // Admin management features
const coachRoutes = require('./routes/coach'); // Coach dashboard and client management

// Reporting and Coaching System Routes
const reportsRoutes = require('./routes/reports');
const coachRequestsRoutes = require('./routes/coachRequests');
const adminCoachRoutes = require('./routes/adminCoach');
const coachDashboardRoutes = require('./routes/coachDashboard');
const programsRoutes = require('./routes/programs');
const messagesRoutes = require('./routes/messages');
const notificationsRoutes = require('./routes/notifications');

const app = express(); // Initialize Express application

app.use(cors());
app.use(express.json());

// Serve uploaded chat files (images, videos, documents)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes); // Authentication: /api/auth/login, /api/auth/signup .
app.use('/api/dashboard', dashboardRoutes); // Dashboard: /api/dashboard/stats,
app.use("/api/fitness", fitnessRoutes); // Fitness: /api/fitness/workouts, /api/fitness/exercises
app.use('/api/wellness', wellnessRoutes); // Wellness: /api/wellness/sleep, /api/wellness/nutrition
app.use('/api/progress', progressRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/parent', parentRoutes); // Parent: /api/parent/children, /api/parent/monitor
app.use('/api/reminders', reminderRoutes); // Reminders: /api/reminders/create, /api/reminders/list
app.use('/api/admin', adminRoutes); // Admin: /api/admin/users, /api/admin/manage
app.use('/api/coach', coachRoutes); // Coach: /api/coach/clients, /api/coach/programs

app.use('/api/reports', reportsRoutes);
app.use('/api/coach-requests', coachRequestsRoutes);
app.use('/api/admin', adminCoachRoutes);
app.use('/api/coach', coachDashboardRoutes);
app.use('/api/programs', programsRoutes); // Weekly workout programs
app.use('/api/messages', messagesRoutes);       // Coach-user messaging
app.use('/api/notifications', notificationsRoutes); // In-app notifications

db.execute("SELECT 1")
    .then(() => console.log(" Database connected successfully"))
    .catch(err => {
        console.error(" Database connection failed:", err.message);
        console.error("Please check your database configuration in the .env file");
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` API endpoints available at http://localhost:${PORT}/api`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});