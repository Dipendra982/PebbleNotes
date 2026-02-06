import pg from 'pg';
const { Pool } = pg;

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'pebblenotes',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'roots',
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query executed in ${duration}ms`);
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

// Get a client from the pool for transactions
export const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);
  
  // Track query timing
  client.query = async (...args) => {
    const start = Date.now();
    const result = await originalQuery(...args);
    const duration = Date.now() - start;
    console.log(`📊 Transaction query executed in ${duration}ms`);
    return result;
  };
  
  // Auto-release with timeout
  const timeout = setTimeout(() => {
    console.error('⚠️ Client has been checked out for more than 5 seconds!');
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    return originalRelease();
  };
  
  return client;
};

// Transaction helper
export const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Health check
export const checkConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    return { connected: true, timestamp: result.rows[0].now };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

// Close pool (for graceful shutdown)
export const closePool = async () => {
  await pool.end();
  console.log('✅ Database pool closed');
};

export default pool;
