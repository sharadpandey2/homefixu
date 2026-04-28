// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD MODULE - 3 Endpoints (Cloudflare R2)
// POST   /api/upload/image
// POST   /api/upload/document
// DELETE /api/upload/:key
//
// ENV VARS REQUIRED:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
//   R2_PUBLIC_URL (e.g. https://assets.homebuddy.in)
//
// INSTALL: pnpm add @aws-sdk/client-s3 multer && pnpm add -D @types/multer
// ═══════════════════════════════════════════════════════════════════════════════

import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  Module,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";

// ═══ CONSTANTS ═══

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
const DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

@Injectable()
class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: any = null;

  private getS3Client() {
    if (this.s3Client) return this.s3Client;

    const { S3Client } = require("@aws-sdk/client-s3");

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    return this.s3Client;
  }

  private get bucketName(): string {
    return process.env.R2_BUCKET_NAME || "homebuddy-uploads";
  }

  private get publicUrl(): string {
    return (
      process.env.R2_PUBLIC_URL ||
      `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`
    );
  }

  // ─── 1. UPLOAD IMAGE ─────────────────────────────────────────────────────

  async uploadImage(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${IMAGE_MIME_TYPES.join(", ")}`,
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException("File too large. Max 5MB for images");
    }

    const extension = file.originalname.split(".").pop() || "jpg";
    const key = `images/${userId}/${Date.now()}_${randomBytes(4).toString("hex")}.${extension}`;

    return this.uploadToR2(key, file.buffer, file.mimetype);
  }

  // ─── 2. UPLOAD DOCUMENT ──────────────────────────────────────────────────

  async uploadDocument(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    if (!DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${DOCUMENT_MIME_TYPES.join(", ")}`,
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      throw new BadRequestException("File too large. Max 10MB for documents");
    }

    const extension = file.originalname.split(".").pop() || "pdf";
    const key = `documents/${userId}/${Date.now()}_${randomBytes(4).toString("hex")}.${extension}`;

    return this.uploadToR2(key, file.buffer, file.mimetype);
  }

  // ─── 3. DELETE FILE ───────────────────────────────────────────────────────

  async deleteFile(key: string) {
    if (!key) {
      throw new BadRequestException("File key is required");
    }

    try {
      if (!process.env.R2_ACCOUNT_ID) {
        this.logger.warn(`[DEV MODE] Would delete: ${key}`);
        return { key, message: "File deleted (dev mode)" };
      }

      const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
      const client = this.getS3Client();

      await client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);

      return {
        key,
        message: "File deleted successfully",
      };
    } catch (error) {
      this.logger.error(
        `Delete failed for ${key}: ${(error as Error).message}`,
      );
      throw new InternalServerErrorException("Failed to delete file");
    }
  }

  // ─── HELPER: Upload to R2 ────────────────────────────────────────────────

  private async uploadToR2(key: string, buffer: Buffer, contentType: string) {
    try {
      if (!process.env.R2_ACCOUNT_ID) {
        this.logger.warn(`[DEV MODE] Would upload: ${key} (${contentType})`);
        return {
          key,
          url: `https://dev-placeholder.local/${key}`,
          contentType,
          size: buffer.length,
          message: "File uploaded (dev mode)",
        };
      }

      const { PutObjectCommand } = require("@aws-sdk/client-s3");
      const client = this.getS3Client();

      await client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      const url = `${this.publicUrl}/${key}`;

      this.logger.log(
        `File uploaded: ${key} (${contentType}, ${buffer.length} bytes)`,
      );

      return {
        key,
        url,
        contentType,
        size: buffer.length,
        message: "File uploaded successfully",
      };
    } catch (error) {
      this.logger.error(`Upload failed: ${(error as Error).message}`);
      throw new InternalServerErrorException("Failed to upload file");
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

@Controller("upload")
@UseGuards(AuthGuard)
class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("image")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(
    @CurrentUser("id") userId: string,
    @UploadedFile() file: any,
  ) {
    return this.uploadService.uploadImage(userId, file);
  }

  @Post("document")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @CurrentUser("id") userId: string,
    @UploadedFile() file: any,
  ) {
    return this.uploadService.uploadDocument(userId, file);
  }

  // ↓ UPDATED SYNTAX HERE ↓
  @Delete("*key")
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param("key") key: string) {
    return this.uploadService.deleteFile(key);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE
// ═══════════════════════════════════════════════════════════════════════════════

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
