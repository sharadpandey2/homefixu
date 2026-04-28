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

    app.useGlobalFilters(new AllExceptionsFilter());

    // Forces all controllers to start with /api
    app.setGlobalPrefix("api");

    app.enableCors({
      origin: [
        "http://localhost:3001",
        "http://tech.localhost:3001",
        "http://admin.localhost:3001",
        "http://127.0.0.1:3001",
        "https://www.homefixu.in",
        "https://homefixu.in",
        "https://api.homefixu.in",
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_SERVER_URL,
        process.env.CORS_ORIGIN,
      ].filter((o): o is string => !!o),
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie"],
      credentials: true,
    });

    const expressApp = app.getHttpAdapter().getInstance();
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
