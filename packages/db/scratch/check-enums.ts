import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function check() {
  const enums =
    await sql`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'technician_role'`;
  console.log(
    "ENUMS:",
    enums.map((e) => e.enumlabel),
  );
}

check().catch(console.error);
