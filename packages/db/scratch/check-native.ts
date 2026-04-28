import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function check() {
  const user =
    await sql`SELECT * FROM users WHERE email = 'temp-hash-check@homebuddy.in'`;
  console.log("USER:", user[0]);

  if (user[0]) {
    const acc = await sql`SELECT * FROM accounts WHERE user_id = ${user[0].id}`;
    console.log("ACCOUNTS:", acc);
  }
}

check().catch(console.error);
