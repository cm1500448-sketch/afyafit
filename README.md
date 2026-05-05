# AFYAFIT — Youth Fitness & Wellness System

A full-stack web application designed to promote healthy lifestyles among youth through fitness tracking, wellness monitoring, gamification, and multi-role oversight.

> Final Year Project — The Catholic University of Eastern Africa (CUEA)  
> Department of Computer & Information Science | SCI 320  
> Student: Cynthia Mueni Muli

---

## Features

- **Youth Dashboard** — tracks steps, sleep, water intake, calories, and mood daily
- **Fitness Module** — personalized workout plans based on fitness level, exercise library, workout logging
- **Wellness Tracking** — sleep, hydration, mood, and meal logging with weekly reports
- **Gamification** — points, badges, and streaks to motivate consistent healthy habits
- **Coach System** — coaches can be assigned to youth users, view their health data, and chat with them
- **Messaging** — real-time style chat between coach and youth with support for images, videos, and file attachments
- **Parent Monitoring** — parents can link to their child's account and view progress reports
- **Admin Dashboard** — user management, coach application approvals, coach assignments, system logs, analytics
- **In-App Notifications** — all roles receive relevant notifications (coach assigned, new message, application approved, etc.)
- **PDF Reports** — downloadable wellness and fitness reports for any date range
- **Age-Aware Health Targets** — sleep, water, calorie, and step goals automatically adjust based on the user's age using WHO/CDC/NASEM guidelines

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Recharts, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT (JSON Web Tokens), bcrypt |
| File Uploads | Multer |
| PDF Generation | PDFKit |

---

## Project Structure

```
afyafit/
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── scripts/
│   └── server.js
├── src/
│   ├── components/
│   └── utils/
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cm1500448-sketch/afyafit.git
   cd afyafit
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env` with your database credentials.

5. **Set up the database**

   Create a MySQL database named `youth_fitness`, then run:
   ```bash
   cd backend
   node scripts/seedRoles.js
   node scripts/seedBadges.js
   node scripts/seedMoreWorkouts.js
   node scripts/seedPrograms.js
   node scripts/seedCoachAdmin.js
   node scripts/migrateMessages.js
   node scripts/migrateNotifications.js
   ```

6. **Run the application**

   Backend (from `/backend`):
   ```bash
   node server.js
   ```

   Frontend (from root):
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## User Roles

| Role | Description |
|---|---|
| **Youth** | Primary user — tracks fitness, wellness, and earns achievements |
| **Parent** | Links to child's account to monitor progress |
| **Coach** | Assigned by admin — views athlete data, chats with users |
| **Admin** | Manages users, approves coach applications, assigns coaches |

---

## Health Guidelines Used

All health targets in this system are based on peer-reviewed, internationally recognised guidelines:

- **Sleep** — American Academy of Sleep Medicine (AASM) / CDC
- **Water intake** — National Academies of Sciences (NASEM) / AAP
- **Daily steps** — NIH / CDC Physical Activity Guidelines for Americans
- **Calorie targets** — USDA Dietary Guidelines 2020–2025
- **Youth age range** — African Union / Constitution of Kenya 2010 (ages 6–35)

---

## License

This project was developed as an academic final year project at The Catholic University of Eastern Africa.
