import { auth } from "@homebuddy-12/auth";
import { All, Controller, Req, Res } from "@nestjs/common";
import { toNodeHandler } from "better-auth/node";
import type { Request, Response } from "express";

const betterAuthHandler = toNodeHandler(auth);

@Controller("auth")
export class AuthController {
  @Get("test")
  test() {
    return "Auth Controller Working";
  }

  @All("*")
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return betterAuthHandler(req, res);
  }
}
