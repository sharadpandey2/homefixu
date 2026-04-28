import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function check() {
  const user =
    await sql`SELECT email, role FROM users WHERE email = '63sharadpandey@gmail.com'`;
  console.log("ADMIN USER ROLE:", user[0]);
}

check().catch(console.error);
