require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth/authRoutes');
const dashboardRoutes = require('./routes/dashboard');
const fitnessRoutes = require('./routes/fitness');
const wellnessRoutes = require('./routes/wellnessRoutes');
const progressRoutes = require('./routes/progress');
const gamificationRoutes = require('./routes/gamification');
const analyticsRoutes = require('./routes/analytics');
const parentRoutes = require('./routes/parent');
const reminderRoutes = require('./routes/reminders');
const adminRoutes = require('./routes/admin');
const coachRoutes = require('./routes/coach');
const reportsRoutes = require('./routes/reports');
const coachRequestsRoutes = require('./routes/coachRequests');
const adminCoachRoutes = require('./routes/adminCoach');
const coachDashboardRoutes = require('./routes/coachDashboard');
const programsRoutes = require('./routes/programs');
const messagesRoutes = require('./routes/messages');
const notificationsRoutes = require('./routes/notifications');

const app = express();

app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

app.use(globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/resend-otp', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/coach-requests', coachRequestsRoutes);
app.use('/api/admin', adminCoachRoutes);
app.use('/api/coach', coachDashboardRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);

db.execute('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
