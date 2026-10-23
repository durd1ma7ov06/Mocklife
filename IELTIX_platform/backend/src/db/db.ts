import { Pool, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';

// PostgreSQL Connection configuration for AWS RDS / Production / Local
const connectionString = process.env.DATABASE_URL;

const poolConfig: PoolConfig = connectionString
  ? {
      connectionString,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'mocklife_db',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

export const pool = new Pool(poolConfig);

let isDbConnected = false;

// Universal query wrapper with error resilience
export async function query(text: string, params?: any[]): Promise<any> {
  if (!isDbConnected && !connectionString) {
    // If not connected to a live Postgres server, log warning
    // and callers will use fallback storage
    throw new Error('NO_DB_CONNECTION');
  }
  return pool.query(text, params);
}

// Check database connection and run schema auto-migrations
export async function initDb(): Promise<boolean> {
  console.log('🔄 Checking PostgreSQL database connection...');
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully (AWS / RDS / Local Pool ready)!');
    isDbConnected = true;

    // Load and run schema.sql to ensure all tables exist
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('✅ PostgreSQL schema and indexes verified / migrated successfully.');
      }
    } catch (migrationErr: any) {
      console.warn('⚠️ Schema migration warning:', migrationErr.message);
    } finally {
      client.release();
    }
    return true;
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL server is not currently reachable:', err.message);
    console.warn('ℹ️ Running in memory-buffered mode. Set DATABASE_URL in .env to connect to your AWS RDS instance.');
    isDbConnected = false;
    return false;
  }
}

export function getDbStatus() {
  return {
    connected: isDbConnected,
    hasConnectionString: Boolean(connectionString),
    database: poolConfig.database || (connectionString ? 'configured via DATABASE_URL' : 'mocklife_db'),
  };
}
