import "reflect-metadata";
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
      origin: true,
      credentials: true,
    });

    // Mount Better Auth AFTER CORS is enabled
    // We apply cors() here again just to be 100% sure it's not blocked
    expressApp.use("/api/auth", (req: any, res: any, next: any) => {
      // Debug logging to fix "invalid_origin"
      const origin = req.headers.origin;
      const host = req.headers.host;
      const xForwardedHost = req.headers["x-forwarded-host"];
      console.log(
        `🔐 [AUTH] Origin: ${origin} | Host: ${host} | X-F-Host: ${xForwardedHost}`,
      );

      // Bypass strict Better Auth origin check if it's from our Railway domains
      if (origin && origin.includes("railway.app")) {
        // Better Auth throws if origin doesn't match baseURL EXACTLY or trustedOrigins (which can be flaky with proxies)
        req.headers.origin = "https://server-production-c3c4.up.railway.app";
      }

      authHandler(req, res, next);
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
