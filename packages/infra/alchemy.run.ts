import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Load .env files BEFORE importing alchemy
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, ".env") });
config({ path: path.resolve(__dirname, "../../apps/web/.env") });

// NOW import alchemy
import alchemy from "alchemy";
import { Nextjs } from "alchemy/cloudflare";

const app = await alchemy("homebuddy-12");

export const web = await Nextjs("web", {
  cwd: "../../apps/web",
  bindings: {
    NEXT_PUBLIC_SERVER_URL: alchemy.env.NEXT_PUBLIC_SERVER_URL!,
    DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
  },
  dev: {
    env: {
      PORT: "3001",
    },
  },
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
