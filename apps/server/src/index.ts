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
      origin: true, // Temporarily allow all for debugging
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie"],
      credentials: true,
    });

    // Debug logging to see what the browser is actually sending
    expressApp.use((req: any, res: any, next: any) => {
      if (req.url.includes("auth")) {
        console.log(`[AUTH-DEBUG] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
      }
      next();
    });

    // Mount Better Auth AFTER CORS is enabled
    expressApp.use("/api/auth", authHandler);

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
