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

const roles = [
  { name: 'youth', description: 'Default role for youth users' },
  { name: 'coach', description: 'Fitness coach role' },
  { name: 'admin', description: 'System administrator role' },
  { name: 'parent', description: 'Parent role for monitoring youth activities' }
];

async function seedRoles() {
  try {
    console.log('🌱 Seeding roles...');
    
    for (const role of roles) {
      const [existing] = await db.execute(
        'SELECT id FROM roles WHERE name = ?',
        [role.name]
      );
      
      if (existing.length === 0) {
        await db.execute(
          'INSERT INTO roles (name, description) VALUES (?, ?)',
          [role.name, role.description]
        );
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`⏭️  Role already exists: ${role.name}`);
      }
    }
    
    console.log('✨ Role seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();
