const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'predictive_maintenance',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123'
});

async function setupAuth() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up authentication system...\n');
    
    // Create users table
    console.log('1️⃣ Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'technician', 'viewer')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created\n');
    
    // Create indexes
    console.log('2️⃣ Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    console.log('✅ Indexes created\n');
    
    // Check if users already exist
    const existingUsers = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      console.log('⚠️  Users already exist. Skipping user creation.');
      console.log('   To recreate users, delete them first or use create-users.js\n');
      return;
    }
    
    // Create demo users
    console.log('3️⃣ Creating demo users...');
    
    const users = [
      {
        email: 'admin@maintenance.com',
        password: 'admin123',
        full_name: 'Administrateur Système',
        role: 'admin'
      },
      {
        email: 'technicien@maintenance.com',
        password: 'tech123',
        full_name: 'Technicien Principal',
        role: 'technician'
      },
      {
        email: 'viewer@maintenance.com',
        password: 'viewer123',
        full_name: 'Observateur',
        role: 'viewer'
      }
    ];
    
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await client.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
        [user.email, passwordHash, user.full_name, user.role]
      );
      console.log(`✅ Created: ${user.email} (${user.role})`);
    }
    
    console.log('\n✅ Authentication system setup complete!\n');
    console.log('📋 Demo accounts:');
    console.log('   Admin:      admin@maintenance.com / admin123');
    console.log('   Technicien: technicien@maintenance.com / tech123');
    console.log('   Viewer:     viewer@maintenance.com / viewer123\n');
    
  } catch (error) {
    console.error('❌ Error setting up authentication:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupAuth()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
