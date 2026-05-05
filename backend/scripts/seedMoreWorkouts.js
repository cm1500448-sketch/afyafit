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

// Comprehensive exercise library with variety for each day and fitness level
const exercises = [
  // BEGINNER EXERCISES
  // Chest & Arms
  { name: 'Wall Push-ups', focus: 'Chest', sets: 3, reps: 12, calories: 35, youtube_id: 'XeN4pEZZJNI', difficulty: 'Beginner' },
  { name: 'Knee Push-ups', focus: 'Chest', sets: 3, reps: 10, calories: 40, youtube_id: 'jWxvty2KROs', difficulty: 'Beginner' },
  { name: 'Arm Circles', focus: 'Shoulders', sets: 3, reps: 20, calories: 30, youtube_id: 'KJWio8yP1ns', difficulty: 'Beginner' },
  { name: 'Tricep Dips (Chair)', focus: 'Arms', sets: 3, reps: 10, calories: 45, youtube_id: 'tKjcgfu44sI', difficulty: 'Beginner' },
  
  // Legs
  { name: 'Bodyweight Squats', focus: 'Legs', sets: 3, reps: 15, calories: 50, youtube_id: 'aclHkVaku9U', difficulty: 'Beginner' },
  { name: 'Standing Lunges', focus: 'Legs', sets: 3, reps: 10, calories: 55, youtube_id: 'QOVaHwm-Q6U', difficulty: 'Beginner' },
  { name: 'Calf Raises', focus: 'Legs', sets: 3, reps: 20, calories: 40, youtube_id: 'gwLzBJYoWlI', difficulty: 'Beginner' },
  { name: 'Step-ups', focus: 'Legs', sets: 3, reps: 12, calories: 60, youtube_id: 'aajhW7DD1EA', difficulty: 'Beginner' },
  { name: 'Glute Bridges', focus: 'Legs', sets: 3, reps: 15, calories: 45, youtube_id: 'wPM8icPu6H8', difficulty: 'Beginner' },
  
  // Core
  { name: 'Basic Plank', focus: 'Core', sets: 3, reps: 1, duration: 30, calories: 35, youtube_id: 'pSHjTRCQxIw', difficulty: 'Beginner' },
  { name: 'Dead Bug', focus: 'Core', sets: 3, reps: 10, calories: 40, youtube_id: 'g_BYB0R-4Ws', difficulty: 'Beginner' },
  { name: 'Bird Dog', focus: 'Core', sets: 3, reps: 10, calories: 35, youtube_id: 'wiFNA3sqjCA', difficulty: 'Beginner' },
  { name: 'Bicycle Crunches', focus: 'Core', sets: 3, reps: 15, calories: 45, youtube_id: '9FGilxCbdz8', difficulty: 'Beginner' },
  
  // Cardio
  { name: 'Marching in Place', focus: 'Cardio', sets: 3, reps: 30, calories: 50, youtube_id: 'cMYOHojvJCQ', difficulty: 'Beginner' },
  { name: 'Side Steps', focus: 'Cardio', sets: 3, reps: 20, calories: 45, youtube_id: 'vuw_paFqzI0', difficulty: 'Beginner' },
  { name: 'Butt Kicks', focus: 'Cardio', sets: 3, reps: 20, calories: 55, youtube_id: 'R7MRFj_Vhqo', difficulty: 'Beginner' },
  { name: 'High Knees', focus: 'Cardio', sets: 3, reps: 20, calories: 60, youtube_id: 'YA_h8W_SgGQ', difficulty: 'Beginner' },
  
  // INTERMEDIATE EXERCISES
  // Chest & Arms
  { name: 'Standard Push-ups', focus: 'Chest', sets: 3, reps: 15, calories: 60, youtube_id: 'IODxDxX7oi4', difficulty: 'Intermediate' },
  { name: 'Wide Push-ups', focus: 'Chest', sets: 3, reps: 12, calories: 65, youtube_id: 'InAmmMa9J8s', difficulty: 'Intermediate' },
  { name: 'Diamond Push-ups', focus: 'Chest', sets: 3, reps: 10, calories: 70, youtube_id: 'J0DnG1_S92I', difficulty: 'Intermediate' },
  { name: 'Pike Push-ups', focus: 'Shoulders', sets: 3, reps: 10, calories: 65, youtube_id: '3UWi44yN-wM', difficulty: 'Intermediate' },
  { name: 'Decline Push-ups', focus: 'Chest', sets: 3, reps: 12, calories: 70, youtube_id: 'SKPab2YC8BE', difficulty: 'Intermediate' },
  
  // Legs
  { name: 'Jump Squats', focus: 'Legs', sets: 3, reps: 12, calories: 80, youtube_id: 'CVaEhXotLaQ', difficulty: 'Intermediate' },
  { name: 'Bulgarian Split Squats', focus: 'Legs', sets: 3, reps: 10, calories: 75, youtube_id: '2C-uNgKwPLE', difficulty: 'Intermediate' },
  { name: 'Walking Lunges', focus: 'Legs', sets: 3, reps: 15, calories: 70, youtube_id: 'L8fvypPrzzs', difficulty: 'Intermediate' },
  { name: 'Single Leg Deadlift', focus: 'Legs', sets: 3, reps: 10, calories: 65, youtube_id: 'vfKwjT5-86k', difficulty: 'Intermediate' },
  { name: 'Sumo Squats', focus: 'Legs', sets: 3, reps: 15, calories: 70, youtube_id: 'qJbelx-VHl0', difficulty: 'Intermediate' },
  
  // Core
  { name: 'Side Plank', focus: 'Core', sets: 3, reps: 1, duration: 30, calories: 50, youtube_id: 'K2VljzCC16g', difficulty: 'Intermediate' },
  { name: 'Russian Twists', focus: 'Core', sets: 3, reps: 20, calories: 55, youtube_id: 'wkD8rjkodUI', difficulty: 'Intermediate' },
  { name: 'Leg Raises', focus: 'Core', sets: 3, reps: 12, calories: 60, youtube_id: 'JB2oyawG9KI', difficulty: 'Intermediate' },
  { name: 'Plank to Downward Dog', focus: 'Core', sets: 3, reps: 10, calories: 55, youtube_id: 'kCWYBVIUE7E', difficulty: 'Intermediate' },
  { name: 'V-ups', focus: 'Core', sets: 3, reps: 12, calories: 65, youtube_id: '7UVgs18Y1P4', difficulty: 'Intermediate' },
  
  // Cardio & Full Body
  { name: 'Burpees', focus: 'Full Body', sets: 3, reps: 10, calories: 90, youtube_id: 'TU8QYVW0gDU', difficulty: 'Intermediate' },
  { name: 'Mountain Climbers', focus: 'Cardio', sets: 3, reps: 20, calories: 75, youtube_id: 'nmwgirgXLYM', difficulty: 'Intermediate' },
  { name: 'Jumping Lunges', focus: 'Legs', sets: 3, reps: 12, calories: 85, youtube_id: 'Y8Eb5eeXPuQ', difficulty: 'Intermediate' },
  { name: 'Skater Hops', focus: 'Cardio', sets: 3, reps: 15, calories: 80, youtube_id: 'qjfz8oCBW8s', difficulty: 'Intermediate' },
  { name: 'Plank Jacks', focus: 'Core', sets: 3, reps: 15, calories: 70, youtube_id: 'aZTHYi7eKKI', difficulty: 'Intermediate' },
  
  // ADVANCED EXERCISES
  // Chest & Arms
  { name: 'Clapping Push-ups', focus: 'Chest', sets: 3, reps: 10, calories: 85, youtube_id: 'qABfS61JpDs', difficulty: 'Advanced' },
  { name: 'Archer Push-ups', focus: 'Chest', sets: 3, reps: 8, calories: 90, youtube_id: 'y-K5gu_WLH8', difficulty: 'Advanced' },
  { name: 'Pseudo Planche Push-ups', focus: 'Chest', sets: 3, reps: 8, calories: 95, youtube_id: 'od1NMY-Ql3k', difficulty: 'Advanced' },
  { name: 'Handstand Push-ups', focus: 'Shoulders', sets: 3, reps: 6, calories: 100, youtube_id: 'KjI2Zf9Z2hE', difficulty: 'Advanced' },
  { name: 'One-Arm Push-ups', focus: 'Chest', sets: 3, reps: 5, calories: 95, youtube_id: 'Uk2LQ6KPDXQ', difficulty: 'Advanced' },
  
  // Legs
  { name: 'Pistol Squats', focus: 'Legs', sets: 3, reps: 8, calories: 90, youtube_id: 'YA3TYJ3C20I', difficulty: 'Advanced' },
  { name: 'Jump Lunges', focus: 'Legs', sets: 3, reps: 15, calories: 95, youtube_id: 'Y8Eb5eeXPuQ', difficulty: 'Advanced' },
  { name: 'Shrimp Squats', focus: 'Legs', sets: 3, reps: 8, calories: 85, youtube_id: 'BWf-8Nh_386', difficulty: 'Advanced' },
  { name: 'Box Jumps', focus: 'Legs', sets: 3, reps: 12, calories: 100, youtube_id: 'NBY9-kTuHEk', difficulty: 'Advanced' },
  { name: 'Nordic Curls', focus: 'Legs', sets: 3, reps: 6, calories: 80, youtube_id: 'YQHD8FA0Ih8', difficulty: 'Advanced' },
  
  // Core
  { name: 'Dragon Flags', focus: 'Core', sets: 3, reps: 6, calories: 85, youtube_id: 'moyFIvRrS0s', difficulty: 'Advanced' },
  { name: 'L-sit Hold', focus: 'Core', sets: 3, reps: 1, duration: 20, calories: 75, youtube_id: 'IUZJrTBkKBM', difficulty: 'Advanced' },
  { name: 'Hanging Leg Raises', focus: 'Core', sets: 3, reps: 12, calories: 80, youtube_id: 'Pr1ieGZ5atk', difficulty: 'Advanced' },
  { name: 'Ab Wheel Rollouts', focus: 'Core', sets: 3, reps: 10, calories: 85, youtube_id: 'EXm0BYpbTkw', difficulty: 'Advanced' },
  { name: 'Windshield Wipers', focus: 'Core', sets: 3, reps: 10, calories: 90, youtube_id: 'GP1MW3kx6Oo', difficulty: 'Advanced' },
  
  // Cardio & Full Body
  { name: 'Burpee Box Jumps', focus: 'Full Body', sets: 3, reps: 10, calories: 110, youtube_id: 'K792a0HfBMI', difficulty: 'Advanced' },
  { name: 'Muscle-ups', focus: 'Full Body', sets: 3, reps: 5, calories: 100, youtube_id: '1fN7Yq-wdCQ', difficulty: 'Advanced' },
  { name: 'Tuck Planche Hold', focus: 'Core', sets: 3, reps: 1, duration: 15, calories: 80, youtube_id: 'VmohR5Pqsqw', difficulty: 'Advanced' },
  { name: 'Explosive Burpees', focus: 'Full Body', sets: 3, reps: 12, calories: 105, youtube_id: 'JZQA08SlJnM', difficulty: 'Advanced' },
  { name: 'Sprawls', focus: 'Full Body', sets: 3, reps: 15, calories: 95, youtube_id: 'K792a0HfBMI', difficulty: 'Advanced' }
];

// Weekly workout plans - 5+ exercises per day, different each day, by fitness level
const weeklyPlans = {
  Beginner: {
    Monday: ['Wall Push-ups', 'Bodyweight Squats', 'Basic Plank', 'Arm Circles', 'Marching in Place'],
    Tuesday: ['Standing Lunges', 'Knee Push-ups', 'Dead Bug', 'Calf Raises', 'Side Steps'],
    Wednesday: ['Glute Bridges', 'Tricep Dips (Chair)', 'Bird Dog', 'Step-ups', 'Butt Kicks'],
    Thursday: ['Bodyweight Squats', 'Wall Push-ups', 'Bicycle Crunches', 'Arm Circles', 'High Knees'],
    Friday: ['Standing Lunges', 'Knee Push-ups', 'Basic Plank', 'Calf Raises', 'Marching in Place'],
    Saturday: ['Glute Bridges', 'Tricep Dips (Chair)', 'Dead Bug', 'Step-ups', 'Side Steps'],
    Sunday: [] // Rest day
  },
  Intermediate: {
    Monday: ['Standard Push-ups', 'Jump Squats', 'Side Plank', 'Mountain Climbers', 'Russian Twists'],
    Tuesday: ['Bulgarian Split Squats', 'Wide Push-ups', 'Leg Raises', 'Burpees', 'Plank Jacks'],
    Wednesday: ['Walking Lunges', 'Diamond Push-ups', 'V-ups', 'Skater Hops', 'Plank to Downward Dog'],
    Thursday: ['Sumo Squats', 'Pike Push-ups', 'Russian Twists', 'Jumping Lunges', 'Mountain Climbers'],
    Friday: ['Single Leg Deadlift', 'Decline Push-ups', 'Side Plank', 'Burpees', 'Leg Raises'],
    Saturday: ['Jump Squats', 'Standard Push-ups', 'V-ups', 'Plank Jacks', 'Skater Hops'],
    Sunday: [] // Rest day
  },
  Advanced: {
    Monday: ['Clapping Push-ups', 'Pistol Squats', 'Dragon Flags', 'Burpee Box Jumps', 'L-sit Hold'],
    Tuesday: ['Box Jumps', 'Archer Push-ups', 'Hanging Leg Raises', 'Muscle-ups', 'Ab Wheel Rollouts'],
    Wednesday: ['Shrimp Squats', 'Pseudo Planche Push-ups', 'Windshield Wipers', 'Explosive Burpees', 'Tuck Planche Hold'],
    Thursday: ['Jump Lunges', 'Handstand Push-ups', 'Dragon Flags', 'Sprawls', 'L-sit Hold'],
    Friday: ['Nordic Curls', 'One-Arm Push-ups', 'Hanging Leg Raises', 'Burpee Box Jumps', 'Ab Wheel Rollouts'],
    Saturday: ['Pistol Squats', 'Clapping Push-ups', 'Windshield Wipers', 'Muscle-ups', 'Tuck Planche Hold'],
    Sunday: [] // Rest day
  }
};

async function seedMoreWorkouts() {
  try {
    console.log('🌱 Seeding comprehensive workout database...\n');

    // Get a valid user ID for created_by field
    let creatorId = 1;
    try {
      const [users] = await db.execute('SELECT id FROM users LIMIT 1');
      if (users.length > 0) {
        creatorId = users[0].id;
        console.log(`✅ Using user ID ${creatorId} as creator\n`);
      }
    } catch (err) {
      console.log('⚠️  No users found, using default creator ID 1\n');
    }

    // Step 1: Insert all exercises into workout_library
    console.log('📦 Adding exercises to database...');
    const exerciseMap = {}; // Map exercise names to IDs
    
    for (const exercise of exercises) {
      const [existing] = await db.execute(
        'SELECT id FROM workout_library WHERE name = ?',
        [exercise.name]
      );
      
      if (existing.length === 0) {
        const [result] = await db.execute(
          `INSERT INTO workout_library (name, description, difficulty, video_url, is_active, created_by)
           VALUES (?, ?, ?, ?, 1, 1)`,
          [
            exercise.name,
            exercise.focus,
            exercise.difficulty,
            exercise.youtube_id
          ]
        );
        exerciseMap[exercise.name] = result.insertId;
        console.log(`  ✅ Added: ${exercise.name} (${exercise.difficulty})`);
      } else {
        exerciseMap[exercise.name] = existing[0].id;
        console.log(`  ⏭️  Already exists: ${exercise.name}`);
      }
    }

    // Step 2: Create or update weekly programs for each fitness level
    console.log('\n📋 Creating weekly programs...');
    
    // Clean up any programs with empty names (database issue)
    try {
      await db.execute(`DELETE FROM weekly_programs WHERE name = '' OR name IS NULL`);
      console.log('  🗑️  Cleaned up empty program names\n');
    } catch (err) {
      // Ignore if no empty names exist
    }
    
    const programDescriptions = {
      Beginner: 'Perfect for beginners! 5+ exercises per day, 6 days a week. Build strength and confidence with foundational movements.',
      Intermediate: 'Level up your fitness! 5+ challenging exercises per day with increased intensity and variety.',
      Advanced: 'Elite training program! 5+ advanced exercises per day designed to push your limits and maximize results.'
    };

    for (const [difficulty, weekPlan] of Object.entries(weeklyPlans)) {
      const programName = `Complete ${difficulty} Weekly Program`;
      
      console.log(`\n  🔍 Checking for program: "${programName}"`);
      
      // Check if program exists in weekly_programs table
      const [existing] = await db.execute(
        'SELECT id, name FROM weekly_programs WHERE name = ?',
        [programName]
      );
      
      let programId;
      if (existing.length === 0) {
        console.log(`  📝 Creating new program...`);
        const [result] = await db.execute(
          `INSERT INTO weekly_programs (name, description, difficulty, is_public, is_active, created_by)
           VALUES (?, ?, ?, 1, 1, ?)`,
          [programName, programDescriptions[difficulty], difficulty.toLowerCase(), creatorId]
        );
        programId = result.insertId;
        console.log(`  ✅ Created program: ${programName} (ID: ${programId})`);
      } else {
        programId = existing[0].id;
        console.log(`\n  ⏭️  Program already exists: ${programName}`);
        // Clear existing workouts for this program
        await db.execute('DELETE FROM weekly_program_workouts WHERE program_id = ?', [programId]);
        console.log(`  🗑️  Cleared old workouts for program`);
      }

      // Step 3: Link exercises to program by day
      console.log(`  📝 Adding workouts to ${difficulty} program...`);
      let workoutCount = 0;
      
      const dayMapping = {
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 7
      };

      for (const [day, exerciseNames] of Object.entries(weekPlan)) {
        if (exerciseNames.length === 0) {
          console.log(`     ${day}: Rest Day`);
          continue;
        }
        
        let orderInDay = 1;
        for (const exerciseName of exerciseNames) {
          const exerciseId = exerciseMap[exerciseName];
          if (exerciseId) {
            const exercise = exercises.find(e => e.name === exerciseName);
            await db.execute(
              `INSERT INTO weekly_program_workouts 
               (program_id, day_of_week, workout_id, order_in_day, target_sets, target_reps)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [programId, dayMapping[day], exerciseId, orderInDay, exercise.sets, exercise.reps]
            );
            workoutCount++;
            orderInDay++;
          }
        }
        console.log(`     ${day}: ${exerciseNames.length} exercises`);
      }
      
      console.log(`  ✅ Added ${workoutCount} workout sessions to ${difficulty} program`);
    }

    console.log('\n✨ Workout seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total exercises added: ${Object.keys(exerciseMap).length}`);
    console.log(`   - Beginner exercises: ${exercises.filter(e => e.difficulty === 'Beginner').length}`);
    console.log(`   - Intermediate exercises: ${exercises.filter(e => e.difficulty === 'Intermediate').length}`);
    console.log(`   - Advanced exercises: ${exercises.filter(e => e.difficulty === 'Advanced').length}`);
    console.log(`   - Weekly programs created: 3 (Beginner, Intermediate, Advanced)`);
    console.log(`   - Exercises per day: 5+ for each day (Monday-Saturday)`);
    console.log(`   - Rest day: Sunday`);
    console.log(`\n🎯 Each day has different exercises tailored to fitness level!`);
    console.log(`💪 Users can now access comprehensive workout plans in the app!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding workouts:', error);
    process.exit(1);
  }
}

seedMoreWorkouts();
