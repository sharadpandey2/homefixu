import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function fix() {
  await sql`UPDATE accounts SET account_id = '63sharadpandey@gmail.com' WHERE user_id = 'b0b5786a11d0dc07838a2086d046896f'`;

  // Also ensure admin_passwords is populated
  const existingPwd =
    await sql`SELECT id FROM admin_passwords WHERE user_id = 'b0b5786a11d0dc07838a2086d046896f'`;
  if (existingPwd.length === 0) {
    const acc =
      await sql`SELECT password FROM accounts WHERE user_id = 'b0b5786a11d0dc07838a2086d046896f' LIMIT 1`;
    if (acc.length > 0) {
      await sql`INSERT INTO admin_passwords (id, user_id, password_hash, created_at, updated_at) 
                    VALUES ('fix_' || gen_random_uuid(), 'b0b5786a11d0dc07838a2086d046896f', ${acc[0].password}, now(), now())`;
    }
  }

  console.log("✅ Fixed account_id and populated admin_passwords!");
}

fix().catch(console.error);
