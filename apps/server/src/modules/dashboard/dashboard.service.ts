import { db } from "@homebuddy-12/db";
import {
  bookings,
  healthReports,
  plans,
  properties,
  serviceDues,
  services,
  subscriptions,
} from "@homebuddy-12/db/schema";
import { Injectable } from "@nestjs/common";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

@Injectable()
export class DashboardService {
  async getDashboardOverview(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run queries concurrently for maximum performance
    const [
      propertiesResult,
      subResult,
      upcomingResult,
      recentResult,
      duesResult,
      reportResult,
    ] = await Promise.all([
      // 1. Total Properties
      db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(eq(properties.userId, userId)),

      // 2. Active Subscription
      db
        .select({
          status: subscriptions.status,
          servicesUsedThisMonth: subscriptions.servicesUsedThisMonth,
          planName: plans.name,
          servicesPerMonth: plans.servicesPerMonth,
        })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, "active"),
          ),
        )
        .limit(1),

      // 3. Upcoming Bookings
      db
        .select({
          id: bookings.id,
          scheduledDate: bookings.scheduledDate,
          scheduledSlot: bookings.scheduledSlot,
          status: bookings.status,
          serviceName: services.name,
          propertyName: properties.name,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(properties, eq(bookings.propertyId, properties.id))
        .where(
          and(eq(bookings.userId, userId), gte(bookings.scheduledDate, today)),
        )
        .orderBy(bookings.scheduledDate)
        .limit(3),

      // 4. Recent Bookings
      db
        .select({
          id: bookings.id,
          scheduledDate: bookings.scheduledDate,
          status: bookings.status,
          serviceName: services.name,
          propertyName: properties.name,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(properties, eq(bookings.propertyId, properties.id))
        .where(
          and(eq(bookings.userId, userId), lt(bookings.scheduledDate, today)),
        )
        .orderBy(desc(bookings.scheduledDate))
        .limit(3),

      // 5. Service Due Alerts
      db
        .select({
          id: serviceDues.id,
          nextDueDate: serviceDues.nextDueDate,
          isOverdue: serviceDues.isOverdue,
          serviceName: services.name,
          propertyName: properties.name,
        })
        .from(serviceDues)
        .innerJoin(services, eq(serviceDues.serviceId, services.id))
        .innerJoin(properties, eq(serviceDues.propertyId, properties.id))
        .where(eq(serviceDues.userId, userId))
        .orderBy(serviceDues.nextDueDate)
        .limit(4),

      // 6. Latest Health Report
      db
        .select({
          id: healthReports.id,
          score: healthReports.overallScore,
          status: healthReports.status,
          generatedAt: healthReports.generatedAt,
        })
        .from(healthReports)
        .where(eq(healthReports.userId, userId))
        .orderBy(desc(healthReports.createdAt))
        .limit(1),
    ]);

    const activeSub = subResult[0] ?? null;

    return {
      totalProperties: Number(propertiesResult[0]?.count || 0),
      servicesUsedThisMonth: activeSub?.servicesUsedThisMonth ?? 0,
      activeSubscription: activeSub
        ? {
            planName: activeSub.planName,
            status: activeSub.status,
            servicesPerMonth: activeSub.servicesPerMonth,
          }
        : null,
      upcomingBookings: upcomingResult,
      recentBookings: recentResult,
      serviceDueAlerts: duesResult,
      latestHealthReport: reportResult[0] ?? null,
    };
  }
}
