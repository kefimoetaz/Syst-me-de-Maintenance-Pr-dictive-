const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'predictive_maintenance',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'viewer'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

async function createUsers() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Hash passwords
    console.log('🔐 Hashing passwords...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const techPassword = await bcrypt.hash('tech123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    console.log('✅ Passwords hashed\n');

    // Create users
    const users = [
      {
        email: 'admin@maintenance.com',
        password_hash: adminPassword,
        full_name: 'Administrateur Système',
        role: 'admin'
      },
      {
        email: 'technicien@maintenance.com',
        password_hash: techPassword,
        full_name: 'Technicien Principal',
        role: 'technician'
      },
      {
        email: 'viewer@maintenance.com',
        password_hash: viewerPassword,
        full_name: 'Observateur',
        role: 'viewer'
      }
    ];

    console.log('👥 Creating users...');
    for (const userData of users) {
      try {
        const [user, created] = await User.findOrCreate({
          where: { email: userData.email },
          defaults: userData
        });

        if (created) {
          console.log(`✅ Created: ${userData.email} (${userData.role})`);
        } else {
          console.log(`ℹ️  Already exists: ${userData.email} (${userData.role})`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      }
    }

    console.log('\n✅ User creation completed!');
    console.log('\n📋 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:      admin@maintenance.com / admin123');
    console.log('Technicien: technicien@maintenance.com / tech123');
    console.log('Viewer:     viewer@maintenance.com / viewer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();
