import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function check() {
  const users =
    await sql`SELECT id, email, role FROM users WHERE email = '63sharadpandey@gmail.com'`;
  console.log("Users:", users);

  if (users.length > 0) {
    const accounts =
      await sql`SELECT id, user_id, account_id, provider_id, password FROM accounts WHERE user_id = ${users[0].id}`;
    console.log("Accounts:", accounts);
  }
}

check().catch(console.error);
