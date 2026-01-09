const { neon } = require("@neondatabase/serverless");

const sql = neon("postgresql://neondb_owner:npg_dgviO8Jb9CRQ@ep-bitter-mouse-ahguxato-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function listTables() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log("Database tables:");
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    console.log(`\nTotal tables: ${tables.length}`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

listTables();
