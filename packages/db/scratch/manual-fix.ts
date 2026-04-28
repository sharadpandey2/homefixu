import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function finalFix() {
  const email = "63sharadpandey@gmail.com";
  const passwordHash =
    "de4b0c8faf6ca22d220f9cd885fda47f:135897425727dd58e5eaeb02322b83ceee6fda266b527dbb3fbbb473eb6c5dd4dd3641902df3e89d0ea830bff3e8c87278220ebf9f96720d233e8a74bf977813";

  // 1. Get user
  const users = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (users.length === 0) {
    console.log("Admin user not found. Creating...");
    // ... skip for now, better to let the user exist
    return;
  }
  const userId = users[0].id;

  // 2. Update Account
  // Note: We use userId as account_id as observed in the native Better Auth signup!
  await sql`UPDATE accounts SET 
            account_id = ${userId}, 
            password = ${passwordHash} 
            WHERE user_id = ${userId} AND provider_id = 'credential'`;

  // 3. Ensure role is admin
  await sql`UPDATE users SET role = 'admin' WHERE id = ${userId}`;

  console.log("✅ Database record updated with native Better Auth format!");
  console.log("Email: 63sharadpandey@gmail.com");
  console.log("Password: 123456789");
}

finalFix().catch(console.error);
