const { neon } = require("@neondatabase/serverless");

const sql = neon("postgresql://neondb_owner:npg_dgviO8Jb9CRQ@ep-bitter-mouse-ahguxato-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const result = await sql`SELECT NOW()`;
    console.log("SUCCESS:", result);
  } catch (error) {
    console.error("FAILED:", error);
  }
}

testConnection();
