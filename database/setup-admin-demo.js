// ============================================
// Setup Admin Demo User via Node.js
// ============================================
// This script creates or updates the admin demo user
// with credentials: admin@gmail.com / admin@123
// Usage: node setup-admin-demo.js
// ============================================

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'pebblenotes',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'roots',
});

async function setupAdminDemo() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');

    // Hash the password (admin@123)
    const password = 'admin@123';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed successfully');

    // First, delete existing admin@gmail.com if it exists
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@gmail.com']);
    console.log('🧹 Cleaned up any existing admin@gmail.com user');

    // Insert admin demo user
    const result = await pool.query(`
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_verified,
        is_active,
        email_verified_at,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      RETURNING id, name, email, role, is_verified, created_at
    `, [
      'Admin Demo',
      'admin@gmail.com',
      passwordHash,
      'ADMIN',
      true,
      true,
      new Date(),
      new Date(),
      new Date()
    ]);

    console.log('\n✅ Admin Demo user created successfully!');
    console.log('📋 User Details:');
    console.log('   ID:', result.rows[0].id);
    console.log('   Name:', result.rows[0].name);
    console.log('   Email:', result.rows[0].email);
    console.log('   Role:', result.rows[0].role);
    console.log('   Verified:', result.rows[0].is_verified);
    console.log('   Created:', result.rows[0].created_at);
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin@123');
    console.log('\n🎉 You can now use the Admin Demo button on the login page!');

  } catch (error) {
    console.error('❌ Error setting up admin demo user:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running on port', process.env.DB_PORT || 5433);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupAdminDemo();
