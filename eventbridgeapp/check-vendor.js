const { neon } = require("@neondatabase/serverless");

const sql = neon("postgresql://neondb_owner:npg_dgviO8Jb9CRQ@ep-bitter-mouse-ahguxato-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function checkVendorProfile() {
  try {
    console.log("Checking vendor profile for user ID 1...");
    
    // 1. Check user
    const user = await sql`SELECT * FROM users WHERE id = 1`;
    console.log("User:", user[0]);
    
    // 2. Check vendor profile
    const vendorProfile = await sql`SELECT * FROM vendor_profiles WHERE user_id = 1`;
    console.log("Vendor Profile:", vendorProfile[0] || "None");
    
    // 3. Check onboarding progress
    const onboarding = await sql`SELECT * FROM onboarding_progress WHERE user_id = 1`;
    console.log("Onboarding Progress:", onboarding[0] || "None");
    
    // 4. Check verification documents
    const vendorIdResult = await sql`SELECT id FROM vendor_profiles WHERE user_id = 1`;
    if (vendorIdResult.length > 0) {
      const docs = await sql`SELECT * FROM verification_documents WHERE vendor_id = ${vendorIdResult[0].id}`;
      console.log("Verification Documents:", docs.length);
      docs.forEach(doc => console.log(`- ${doc.document_type}: ${doc.status}`));
    } else {
      console.log("Verification Documents: No vendor profile found");
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

checkVendorProfile();
