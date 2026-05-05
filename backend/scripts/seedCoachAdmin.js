const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'youth_fitness',
  waitForConnections: true,
  connectionLimit: 10,
});

const db = pool.promise();

const SEED_USERS = [
  { email: 'coach@afyafit.com', password: 'Coach123', role: 'coach', firstName: 'Blessing', lastName: 'Muli' },
  { email: 'admin@afyafit.com', password: 'Admin123', role: 'admin', firstName: 'Josy', lastName: 'P' },
];

async function seedCoachAdmin() {
  try {
    console.log(' Seeding coach and admin users...');

    for (const u of SEED_USERS) {
      const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length > 0) {
        console.log(`   ${u.role} (${u.email}) already exists`);
        continue;
      }

      const [roleRows] = await db.execute('SELECT id FROM roles WHERE name = ?', [u.role]);
      if (roleRows.length === 0) {
        await db.execute(
          'INSERT INTO roles (name, description) VALUES (?, ?)',
          [u.role, `${u.role} role`]
        );
        console.log(`  Created role: ${u.role}`);
      }

      const [roles] = await db.execute('SELECT id FROM roles WHERE name = ?', [u.role]);
      const roleId = roles[0].id;
      const hashedPassword = await bcrypt.hash(u.password, 10);

      const [userResult] = await db.execute(
        "INSERT INTO users (email, password_hash, status, primary_role_id) VALUES (?, ?, 'active', ?)",
        [u.email, hashedPassword, roleId]
      );
      const userId = userResult.insertId;

      await db.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name, timezone) VALUES (?, ?, ?, 'UTC')`,
        [userId, u.firstName, u.lastName]
      );

      await db.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, roleId]
      );

      console.log(`  ✅ Created ${u.role}: ${u.email} (password: ${u.password})`);
    }

    console.log('✨ Coach/Admin seeding completed!');
    console.log('\nLogin with:');
    console.log('  Coach: coach@afyafit.com / Coach123');
    console.log('  Admin: admin@afyafit.com / Admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedCoachAdmin();
