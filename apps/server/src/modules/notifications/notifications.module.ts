// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS MODULE - 3 Endpoints
// GET    /api/notifications           — List user notifications
// PATCH  /api/notifications/:id/read  — Mark single as read
// DELETE /api/notifications/:id       — Delete notification
// ═══════════════════════════════════════════════════════════════════════════════

import { db } from "@homebuddy-12/db";
import { notifications } from "@homebuddy-12/db/schema";
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  Module,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

@Injectable()
class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // ─── 1. LIST NOTIFICATIONS ────────────────────────────────────────────────

  async listNotifications(userId: string) {
    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50); // Cap at 50 most recent

    const unreadCount = results.filter((n) => !n.isRead).length;

    return {
      notifications: results.map((n) => ({
        id: n.id,
        type: n.type,
        channel: n.channel,
        title: n.title,
        body: n.body,
        isRead: n.isRead,
        relatedEntityType: n.relatedEntityType,
        relatedEntityId: n.relatedEntityId,
        sentAt: n.sentAt,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
      unreadCount,
      total: results.length,
    };
  }

  // ─── 2. MARK AS READ ─────────────────────────────────────────────────────

  async markAsRead(userId: string, notificationId: string) {
    const [existing] = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException("Notification not found");
    }

    if (existing.isRead) {
      return {
        id: existing.id,
        isRead: true,
        message: "Already marked as read",
      };
    }

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId))
      .returning();

    if (!updated) {
      throw new InternalServerErrorException(
        "Failed to mark notification as read",
      );
    }

    return {
      id: updated.id,
      isRead: true,
      message: "Notification marked as read",
    };
  }

  // ─── 3. DELETE NOTIFICATION ───────────────────────────────────────────────

  async deleteNotification(userId: string, notificationId: string) {
    const [existing] = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException("Notification not found");
    }

    await db.delete(notifications).where(eq(notifications.id, notificationId));

    this.logger.log(`Notification ${notificationId} deleted by user ${userId}`);

    return {
      id: notificationId,
      message: "Notification deleted",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════════

@Controller("notifications")
@UseGuards(AuthGuard)
class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listNotifications(@CurrentUser("id") userId: string) {
    return this.notificationsService.listNotifications(userId);
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  async markAsRead(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.notificationsService.deleteNotification(userId, id);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE
// ═══════════════════════════════════════════════════════════════════════════════

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
