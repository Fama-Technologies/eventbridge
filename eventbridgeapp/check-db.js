const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_YKadnGL09Frh@ep-muddy-hall-ahigcu2u-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function checkDatabase() {
  console.log("Checking Neon database...\n");
  
  try {
    // Test connection
    const time = await pool.query("SELECT NOW()");
    console.log("Connection successful");
    console.log("   Server time:", time.rows[0].now, "\n");
    
    // List tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`Found ${tables.rows.length} tables:`);
    
    // Show each table structure
    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [table.table_name]);
      
      const count = await pool.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
      
      console.log(`\n  ${table.table_name} (${count.rows[0].count} rows):`);
      columns.rows.forEach(col => {
        console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : ''}`);
      });
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
    console.log("\nConnection closed");
  }
}

checkDatabase();
