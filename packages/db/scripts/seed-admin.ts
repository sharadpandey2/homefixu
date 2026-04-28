// ═══════════════════════════════════════════════════════════════════════════
// SEED ADMIN USER — Fixed for Better Auth Compatibility
// ═══════════════════════════════════════════════════════════════════════════

import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import * as bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@homebuddy.local";
const password = process.env.SEED_ADMIN_PASSWORD ?? "123456789";
const name = process.env.SEED_ADMIN_NAME ?? "Admin";

async function hash(pwd: string): Promise<string> {
  return await bcrypt.hash(pwd, 10);
}

function generateId(): string {
  return randomBytes(16).toString("hex");
}

async function main() {
  const sql = neon(DATABASE_URL!);

  console.log(`\n🌱 Seeding admin: ${email}\n`);

  // 1. Check if user already exists
  const existing =
    await sql`SELECT id, role FROM users WHERE email = ${email} LIMIT 1`;

  if (existing.length > 0) {
    const user = existing[0]!;
    if (user.role === "admin") {
      console.log(
        `✓ Admin already exists (userId=${user.id}). Updating password just in case...`,
      );
      const newHash = await hash(password);
      await sql`UPDATE accounts SET password = ${newHash} WHERE user_id = ${user.id}`;
      return;
    }
    await sql`UPDATE users SET role = 'admin' WHERE id = ${user.id}`;
    console.log(`✓ Promoted existing user ${user.id} to admin.`);
    return;
  }

  // 2. Create new admin user + credential account
  const userId = generateId();
  const accountId = generateId();
  const hashedPassword = await hash(password);
  const now = new Date();

  // Better Auth expects snake_case in DB but sometimes camelCase depending on your Drizzle setup.
  // Using the column names exactly as they appear in your previous successful run.
  await sql`
    INSERT INTO users (id, name, email, role, email_verified, created_at, updated_at)
    VALUES (${userId}, ${name}, ${email}, 'admin', true, ${now}, ${now})
  `;

  // Fix: account_id must be the email for the 'credential' provider in Better Auth
  await sql`
    INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES (${accountId}, ${email}, 'credential', ${userId}, ${hashedPassword}, ${now}, ${now})
  `;

  // Also populate the custom admin_passwords table as requested
  const adminPwdId = generateId();
  await sql`
    INSERT INTO admin_passwords (id, user_id, password_hash, created_at, updated_at)
    VALUES (${adminPwdId}, ${userId}, ${hashedPassword}, ${now}, ${now})
  `;

  console.log(`✓ Admin created: ${userId}`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("\n⚠️  The 401 should be resolved. Try logging in now.\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
