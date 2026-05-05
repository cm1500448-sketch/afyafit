const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'youth_fitness',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Sample workouts for the library
const workouts = [
  // Beginner workouts
  { name: 'Jumping Jacks', description: 'Full body cardio exercise', difficulty: 'easy', video_url: 'https://www.youtube.com/watch?v=UpH7rm0cYbM' },
  { name: 'Push-ups', description: 'Upper body strength builder', difficulty: 'easy', video_url: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
  { name: 'Squats', description: 'Lower body strength exercise', difficulty: 'easy', video_url: 'https://www.youtube.com/watch?v=YaXPRqUwItQ' },
  { name: 'Plank', description: 'Core strengthening exercise', difficulty: 'easy', video_url: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
  { name: 'Lunges', description: 'Leg and glute workout', difficulty: 'easy', video_url: 'https://www.youtube.com/watch?v=QOVaEwmq6Uk' },
  { name: 'Mountain Climbers', description: 'Cardio and core exercise', difficulty: 'easy', video_url: 'https://www.youtube.com/watch?v=nmwgirgXLYM' },
  { name: 'Burpees', description: 'Full body high intensity exercise', difficulty: 'easy', video_url: 'https://www.youtube.com/watch?v=auBLPXO8Fww' },
  
  // Intermediate workouts
  { name: 'Pull-ups', description: 'Advanced upper body exercise', difficulty: 'medium', video_url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
  { name: 'Diamond Push-ups', description: 'Advanced push-up variation', difficulty: 'medium', video_url: 'https://www.youtube.com/watch?v=J0DnG1_S92I' },
  { name: 'Jump Squats', description: 'Explosive lower body exercise', difficulty: 'medium', video_url: 'https://www.youtube.com/watch?v=CVaEhXetLAM' },
  { name: 'Side Plank', description: 'Core and stability exercise', difficulty: 'medium', video_url: 'https://www.youtube.com/watch?v=K2VljzCC16g' },
  { name: 'Pike Push-ups', description: 'Shoulder strength builder', difficulty: 'medium', video_url: 'https://www.youtube.com/watch?v=3UWi44yN-wM' },
  
  // Advanced workouts
  { name: 'Muscle-ups', description: 'Advanced calisthenics movement', difficulty: 'hard', video_url: 'https://www.youtube.com/watch?v=1fN7Yq-wdCQ' },
  { name: 'Handstand Push-ups', description: 'Elite upper body exercise', difficulty: 'hard', video_url: 'https://www.youtube.com/watch?v=KjI2Zf9Z2hE' },
  { name: 'Pistol Squats', description: 'Single leg advanced squat', difficulty: 'hard', video_url: 'https://www.youtube.com/watch?v=YA3TYJ3C20I' },
];

// Sample weekly programs
const programs = [
  {
    name: 'Beginner Fitness Starter',
    description: 'Perfect for those just starting their fitness journey. This 4-week program focuses on building strength and endurance with simple, effective exercises.',
    difficulty: 'beginner',
    workouts: [
      // Monday - Full Body
      { day: 1, workouts: ['Jumping Jacks', 'Push-ups', 'Squats', 'Plank'] },
      // Tuesday - Cardio
      { day: 2, workouts: ['Jumping Jacks', 'Mountain Climbers', 'Burpees'] },
      // Wednesday - Rest
      { day: 3, workouts: [] },
      // Thursday - Strength
      { day: 4, workouts: ['Push-ups', 'Squats', 'Lunges', 'Plank'] },
      // Friday - Cardio
      { day: 5, workouts: ['Jumping Jacks', 'Burpees', 'Mountain Climbers'] },
      // Saturday - Active Recovery
      { day: 6, workouts: ['Plank', 'Squats'] },
      // Sunday - Rest
      { day: 7, workouts: [] }
    ]
  },
  {
    name: 'Intermediate Strength Builder',
    description: 'Take your fitness to the next level with this challenging 6-week program. Build muscle and improve your overall strength.',
    difficulty: 'intermediate',
    workouts: [
      // Monday - Upper Body
      { day: 1, workouts: ['Pull-ups', 'Diamond Push-ups', 'Pike Push-ups', 'Plank'] },
      // Tuesday - Lower Body
      { day: 2, workouts: ['Jump Squats', 'Lunges', 'Squats'] },
      // Wednesday - Cardio
      { day: 3, workouts: ['Burpees', 'Mountain Climbers', 'Jumping Jacks'] },
      // Thursday - Upper Body
      { day: 4, workouts: ['Pull-ups', 'Diamond Push-ups', 'Side Plank'] },
      // Friday - Full Body
      { day: 5, workouts: ['Jump Squats', 'Pike Push-ups', 'Burpees'] },
      // Saturday - Core Focus
      { day: 6, workouts: ['Plank', 'Side Plank', 'Mountain Climbers'] },
      // Sunday - Rest
      { day: 7, workouts: [] }
    ]
  },
  {
    name: 'Advanced Athlete Challenge',
    description: 'For experienced athletes ready to push their limits. This intense program will test your strength, endurance, and mental toughness.',
    difficulty: 'advanced',
    workouts: [
      // Monday - Upper Body Power
      { day: 1, workouts: ['Muscle-ups', 'Handstand Push-ups', 'Diamond Push-ups'] },
      // Tuesday - Lower Body Power
      { day: 2, workouts: ['Pistol Squats', 'Jump Squats', 'Lunges'] },
      // Wednesday - Cardio & Core
      { day: 3, workouts: ['Burpees', 'Mountain Climbers', 'Side Plank'] },
      // Thursday - Upper Body Strength
      { day: 4, workouts: ['Muscle-ups', 'Pull-ups', 'Pike Push-ups'] },
      // Friday - Full Body Challenge
      { day: 5, workouts: ['Handstand Push-ups', 'Pistol Squats', 'Burpees'] },
      // Saturday - Active Recovery
      { day: 6, workouts: ['Plank', 'Squats', 'Push-ups'] },
      // Sunday - Rest
      { day: 7, workouts: [] }
    ]
  },
  {
    name: 'Quick 15-Minute Daily',
    description: 'Perfect for busy schedules! Quick, effective workouts you can do anywhere, anytime. No equipment needed.',
    difficulty: 'beginner',
    workouts: [
      // Monday - Full Body Quick
      { day: 1, workouts: ['Jumping Jacks', 'Push-ups', 'Squats'] },
      // Tuesday - Cardio Blast
      { day: 2, workouts: ['Burpees', 'Mountain Climbers'] },
      // Wednesday - Strength Focus
      { day: 3, workouts: ['Push-ups', 'Squats', 'Plank'] },
      // Thursday - Cardio Blast
      { day: 4, workouts: ['Jumping Jacks', 'Burpees'] },
      // Friday - Full Body Quick
      { day: 5, workouts: ['Push-ups', 'Squats', 'Lunges'] },
      // Saturday - Active Recovery
      { day: 6, workouts: ['Plank', 'Squats'] },
      // Sunday - Rest
      { day: 7, workouts: [] }
    ]
  }
];

async function seedPrograms() {
  try {
    console.log('🌱 Seeding workouts and programs...\n');

    // Step 1: Get or create a coach/admin user to be the creator
    let creatorId;
    const [users] = await db.execute('SELECT id FROM users LIMIT 1');
    if (users.length > 0) {
      creatorId = users[0].id;
      console.log(`✅ Using existing user (ID: ${creatorId}) as program creator`);
    } else {
      console.log('⚠️  No users found. Please create a user first, then run this script again.');
      process.exit(1);
    }

    // Step 2: Insert workouts into workout_library
    const workoutMap = {}; // Map workout names to IDs
    console.log('\n📦 Adding workouts to library...');
    
    for (const workout of workouts) {
      const [existing] = await db.execute(
        'SELECT id FROM workout_library WHERE name = ?',
        [workout.name]
      );
      
      if (existing.length === 0) {
        const [result] = await db.execute(
          `INSERT INTO workout_library (name, description, difficulty, video_url, created_by, is_active)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [workout.name, workout.description, workout.difficulty, workout.video_url, creatorId]
        );
        workoutMap[workout.name] = result.insertId;
        console.log(`  ✅ Added: ${workout.name}`);
      } else {
        workoutMap[workout.name] = existing[0].id;
        console.log(`  ⏭️  Already exists: ${workout.name}`);
      }
    }

    // Step 3: Insert weekly programs
    console.log('\n📋 Creating weekly programs...');
    
    for (const program of programs) {
      const [existing] = await db.execute(
        'SELECT id FROM weekly_programs WHERE name = ?',
        [program.name]
      );
      
      let programId;
      if (existing.length === 0) {
        const [result] = await db.execute(
          `INSERT INTO weekly_programs (name, description, difficulty, is_public, is_active, created_by)
           VALUES (?, ?, ?, 1, 1, ?)`,
          [program.name, program.description, program.difficulty, creatorId]
        );
        programId = result.insertId;
        console.log(`\n  ✅ Created program: ${program.name}`);
      } else {
        programId = existing[0].id;
        console.log(`\n  ⏭️  Program already exists: ${program.name}`);
        // Clear existing workouts for this program
        await db.execute('DELETE FROM weekly_program_workouts WHERE program_id = ?', [programId]);
      }

      // Step 4: Link workouts to program
      console.log(`  📝 Adding workouts to program...`);
      let workoutCount = 0;
      
      for (const daySchedule of program.workouts) {
        if (daySchedule.workouts.length === 0) continue; // Skip rest days
        
        daySchedule.workouts.forEach((workoutName, index) => {
          const workoutId = workoutMap[workoutName];
          if (workoutId) {
            db.execute(
              `INSERT INTO weekly_program_workouts 
               (program_id, day_of_week, workout_id, order_in_day, target_sets, target_reps)
               VALUES (?, ?, ?, ?, 3, 10)`,
              [programId, daySchedule.day, workoutId, index + 1]
            );
            workoutCount++;
          }
        });
      }
      
      console.log(`  ✅ Added ${workoutCount} workout sessions to program`);
    }

    console.log('\n✨ Program seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Workouts in library: ${Object.keys(workoutMap).length}`);
    console.log(`   - Weekly programs created: ${programs.length}`);
    console.log(`\n🎯 You can now view programs at /programs in your app!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding programs:', error);
    process.exit(1);
  }
}

seedPrograms();
