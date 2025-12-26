// app/api/diagnose/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hash } from 'bcryptjs';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/drizzle/schema';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      database_url_exists: !!process.env.DATABASE_URL,
      database_url_length: process.env.DATABASE_URL?.length || 0,
      nextauth_url: process.env.NEXTAUTH_URL,
      app_url: process.env.NEXT_PUBLIC_APP_URL,
    },
    tests: [] as any[]
  };

  try {
    // Test 1: Database connection
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const dbTest = await sql`SELECT NOW() as time, version() as version`;
        results.tests.push({
          name: 'Database Connection',
          status: 'success',
          data: dbTest[0]
        });
      } catch (err: any) {
        results.tests.push({
          name: 'Database Connection',
          status: 'error',
          error: err.message,
          hint: 'Check DATABASE_URL format'
        });
      }
    }

    // Test 2: Bcrypt
    try {
      const testHash = await hash('test', 1);
      results.tests.push({
        name: 'Bcrypt',
        status: 'success',
        sample: testHash.substring(0, 20) + '...'
      });
    } catch (err: any) {
      results.tests.push({
        name: 'Bcrypt',
        status: 'error',
        error: err.message
      });
    }

    // Test 3: Users table
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const tableCheck = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          ) as exists;
        `;
        
        results.tests.push({
          name: 'Users Table Exists',
          status: 'success',
          exists: tableCheck[0]?.exists
        });

        if (tableCheck[0]?.exists) {
          const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
          `;
          results.tests.push({
            name: 'Table Structure',
            status: 'success',
            columns: columns
          });
        }
      } catch (err: any) {
        results.tests.push({
          name: 'Table Check',
          status: 'error',
          error: err.message
        });
      }
    }

    // Test 4: Drizzle
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql, { schema });
        const drizzleTest = await db.execute('SELECT 1 as test');
        results.tests.push({
          name: 'Drizzle Connection',
          status: 'success',
          data: drizzleTest.rows[0]
        });
      } catch (err: any) {
        results.tests.push({
          name: 'Drizzle Connection',
          status: 'error',
          error: err.message
        });
      }
    }

  } catch (error: any) {
    results.tests.push({
      name: 'Overall Diagnostic',
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }

  return NextResponse.json(results, { status: 200 });
}