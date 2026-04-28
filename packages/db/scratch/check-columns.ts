import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function check() {
  const columns =
    await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'technician_accounts'`;
  console.log("COLUMNS:", columns);
}

check().catch(console.error);
