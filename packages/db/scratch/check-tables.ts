import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function check() {
  const tables =
    await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log(
    "TABLES:",
    tables.map((t) => t.table_name),
  );
}

check().catch(console.error);
