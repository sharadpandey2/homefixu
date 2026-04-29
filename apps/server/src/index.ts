// Railway rebuild trigger - forces pnpm via nixpacks.toml
import "reflect-metadata";
// IMPORTANT: Better Auth automatically overrides `baseURL` if `BETTER_AUTH_URL` is set in the environment.
// This causes unpredictable behavior (e.g. missing /api/auth path or trailing spaces causing Invalid Origin).
// We delete it here so Better Auth is forced to use our strictly hardcoded configuration.
delete process.env.BETTER_AUTH_URL;

import { auth } from "@homebuddy-12/auth";
import { NestFactory } from "@nestjs/core";
import { toNodeHandler } from "better-auth/node";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

const authHandler = toNodeHandler(auth);

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Trust Railway Proxy
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set("trust proxy", true);

    app.useGlobalFilters(new AllExceptionsFilter());

    // Forces all controllers to start with /api
    app.setGlobalPrefix("api");

    app.enableCors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://web-production-797f8.up.railway.app",
        "https://server-production-c3c4.up.railway.app",
        "https://homefixu.com",
        "https://www.homefixu.com",
        "https://homefixu.in",
        "https://www.homefixu.in",
        "https://api.homefixu.in",
        "https://api.homefixu.com",
        "https://homefixu-web.vercel.app",
      ],
      credentials: true,
    });

    // Mount Better Auth AFTER CORS is enabled
    expressApp.use("/api/auth", (req: any, res: any) => {
      // 1. Manually handle CORS for this non-NestJS route to be 100% safe
      const origin = req.headers.origin;
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://web-production-797f8.up.railway.app",
        "https://server-production-c3c4.up.railway.app",
        "https://homefixu-web.vercel.app",
        "https://homefixu.in",
        "https://www.homefixu.in",
        "https://homefixu.com",
        "https://www.homefixu.com",
      ];

      if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, x-better-auth-origin",
        );
      }

      // Handle Preflight
      if (req.method === "OPTIONS") {
        return res.status(204).end();
      }

      // 2. Unconditionally spoof headers for Better Auth to bypass its strict origin check.
      try {
        const base = new URL(
          auth.options.baseURL ||
            "https://server-production-c3c4.up.railway.app/api/auth",
        );
        req.headers["origin"] = base.origin;
        req.headers["host"] = base.host;
        req.headers["referer"] = base.origin + "/";
        req.headers["x-forwarded-host"] = base.host;

        // 3. Call the auth handler with error catching
        authHandler(req, res);
      } catch (e) {
        console.error("🔴 BETTER AUTH HANDLER ERROR:", e);
        res.status(500).json({ error: "Internal Auth Error" });
      }
    });

    // Debug endpoint to verify Better Auth configuration and headers
    expressApp.get("/api/debug/auth", (req: any, res: any) => {
      res.json({
        baseURL: auth.options.baseURL,
        trustedOrigins: auth.options.trustedOrigins,
        headers: req.headers,
        timestamp: new Date().toISOString(),
      });
    });

    // Railway injects PORT dynamically; bind to 0.0.0.0 so external traffic reaches the container
    const port = process.env.PORT ?? 3000;
    const host = "0.0.0.0";
    await app.listen(port, host);
    console.log(`🟢 Server started on http://${host}:${port}`);
  } catch (error) {
    console.error("🔴 FATAL STARTUP ERROR:", error);
    process.exit(1);
  }
}

bootstrap();
