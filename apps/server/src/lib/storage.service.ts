import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Injectable } from "@nestjs/common";

/**
 * Local File Storage Service (MVP)
 * For production, use Cloudflare R2 or AWS S3
 */
@Injectable()
export class StorageService {
  private uploadDir = join(process.cwd(), "uploads");

  constructor() {
    this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload file to local storage
   * @param file - File buffer
   * @param filename - Desired filename
   * @returns URL path to access file
   */
  async uploadFile(file: Buffer, filename: string): Promise<string> {
    const filepath = join(this.uploadDir, filename);
    await writeFile(filepath, file);

    // Return URL path (served via static middleware)
    return `/uploads/${filename}`;
  }

  /**
   * Generate unique filename
   */
  generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = originalName.split(".").pop();
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Delete file from storage
   * @param filename - File to delete
   */
  async deleteFile(filename: string): Promise<void> {
    const filepath = join(this.uploadDir, filename);
    if (existsSync(filepath)) {
      const { unlink } = await import("node:fs/promises");
      await unlink(filepath);
    }
  }
}
