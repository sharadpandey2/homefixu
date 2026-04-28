import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bull";

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

export interface HealthReportJobData {
  propertyId: string;
  userId: string;
  inspectionData: any;
}

export interface NotificationJobData {
  userId: string;
  type: "booking" | "report" | "payment" | "general";
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue("email") private emailQueue: Queue,
    @InjectQueue("reports") private reportsQueue: Queue,
    @InjectQueue("notifications") private notificationsQueue: Queue,
  ) {}

  /**
   * Add email to queue
   */
  async addEmailJob(data: EmailJobData, priority = 5): Promise<void> {
    await this.emailQueue.add("send-email", data, {
      priority,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
  }

  /**
   * Add bulk emails to queue
   */
  async addBulkEmailJobs(emails: EmailJobData[]): Promise<void> {
    const jobs = emails.map((email) => ({
      name: "send-email",
      data: email,
      opts: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    }));

    await this.emailQueue.addBulk(jobs);
  }

  /**
   * Add health report generation job
   */
  async addHealthReportJob(data: HealthReportJobData): Promise<void> {
    await this.reportsQueue.add("generate-report", data, {
      attempts: 2,
      timeout: 60000, // 1 minute timeout
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    });
  }

  /**
   * Add notification job
   */
  async addNotificationJob(data: NotificationJobData): Promise<void> {
    await this.notificationsQueue.add("send-notification", data, {
      priority: data.type === "payment" ? 10 : 5,
      attempts: 3,
    });
  }

  /**
   * Schedule delayed email
   */
  async scheduleEmail(data: EmailJobData, delayMs: number): Promise<void> {
    await this.emailQueue.add("send-email", data, {
      delay: delayMs,
      attempts: 3,
    });
  }

  /**
   * Schedule recurring job (e.g., weekly health report reminders)
   */
  async scheduleRecurringEmail(
    data: EmailJobData,
    cronExpression: string,
  ): Promise<void> {
    await this.emailQueue.add("send-email", data, {
      repeat: {
        cron: cronExpression,
      },
    });
  }

  /**
   * Get queue stats
   */
  async getEmailQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  async getReportsQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.reportsQueue.getWaitingCount(),
      this.reportsQueue.getActiveCount(),
      this.reportsQueue.getCompletedCount(),
      this.reportsQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  /**
   * Clear all jobs from queue
   */
  async clearEmailQueue(): Promise<void> {
    await this.emailQueue.empty();
  }

  /**
   * Remove specific job
   */
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  /**
   * Retry failed jobs
   */
  async retryFailedJobs(queueName: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    const failed = await queue.getFailed();

    for (const job of failed) {
      await job.retry();
    }
  }

  private getQueueByName(name: string): Queue {
    switch (name) {
      case "email":
        return this.emailQueue;
      case "reports":
        return this.reportsQueue;
      case "notifications":
        return this.notificationsQueue;
      default:
        throw new Error(`Queue ${name} not found`);
    }
  }
}
