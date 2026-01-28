#!/usr/bin/env node
/**
 * Drop all tables in the database
 * 
 * Usage:
 *   tsx scripts/with-env.ts tsx scripts/drop-all-tables.ts
 */
import postgres from 'postgres';

async function dropAllTables() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  
  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    // Get all tables in public schema
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;

    if (tables.length === 0) {
      console.log('ℹ️  No tables found in public schema');
    } else {
      console.log(`📋 Found ${tables.length} tables to drop:`);
      tables.forEach((t) => console.log(`   - ${t.tablename}`));
      
      // Drop all tables with CASCADE
      console.log('\n🗑️  Dropping all tables...');
      
      for (const table of tables) {
        await sql`DROP TABLE IF EXISTS ${sql(table.tablename)} CASCADE`;
        console.log(`   ✓ Dropped ${table.tablename}`);
      }
      
      console.log('\n✅ All tables dropped successfully!');
    }

    // Also drop drizzle schema if exists
    console.log('\n🗑️  Dropping drizzle migration schema...');
    await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
    console.log('   ✓ Dropped drizzle schema');

    console.log('\n🎉 Database cleanup complete! You can now run db:migrate again.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

dropAllTables();
