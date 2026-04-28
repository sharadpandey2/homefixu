import "reflect-metadata";
import { auth } from "@homebuddy-12/auth";
import { NestFactory } from "@nestjs/core";
import { toNodeHandler } from "better-auth/node";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

console.log("0. File loaded, initializing Better Auth handler...");
const authHandler = toNodeHandler(auth);

async function bootstrap() {
  try {
    console.log("1. Starting NestFactory...");
    const app = await NestFactory.create(AppModule);
    console.log("2. NestFactory created successfully!");

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
      ].filter((o): o is string => !!o),
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cookie"],
      credentials: true,
    });

    const expressApp = app.getHttpAdapter().getInstance();
    // Mount Better Auth AFTER CORS is enabled
    expressApp.use("/api/auth", authHandler);

    console.log("3. Server initialization continues...");

    console.log("4. Attempting to listen on port 3000...");
    await app.listen(3000);
    console.log("🟢 5. SERVER SUCCESSFULLY STARTED on http://localhost:3000");
  } catch (error) {
    console.error("🔴 FATAL STARTUP ERROR CAUGHT:", error);
    process.exit(1);
  }
}

bootstrap();
