import * as fs from "node:fs";
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const logMsg = `\n[${new Date().toISOString()}] GLOBAL ERROR caught:
URL: ${request.url}
STATUS: ${status}
ERROR: ${exception instanceof Error ? exception.message : JSON.stringify(exception)}
STACK: ${exception instanceof Error ? exception.stack : "N/A"}\n`;

    fs.appendFileSync(
      "c:\\Users\\63sha\\Desktop\\homebuddy\\homebuddy-12\\backend-error.log",
      logMsg,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        exception instanceof Error
          ? exception.message
          : "Internal server error",
    });
  }
}
