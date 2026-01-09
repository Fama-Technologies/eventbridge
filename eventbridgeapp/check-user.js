const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_dgviO8Jb9CRQ@ep-bitter-mouse-ahguxato-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function checkUser() {
  try {
    const result = await sql`SELECT email FROM users WHERE email = 'wattsryaneric@gmail.com'`;
    console.log('User exists:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();