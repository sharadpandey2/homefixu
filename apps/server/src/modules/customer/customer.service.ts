// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER SERVICE - Updated with Day 1 additions
// Added: getServicesDue, getHealthReports, getHealthReport, getLatestHealthReport
// ═══════════════════════════════════════════════════════════════════════════════

import { randomUUID } from "node:crypto";
import { db } from "@homebuddy-12/db";
import {
  healthReports,
  properties,
  serviceDues,
  services,
} from "@homebuddy-12/db/schema";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type { CreatePropertyDto, UpdatePropertyDto } from "./dto/property.dto";

@Injectable()
export class CustomerService {
  // ==================== PROPERTIES ====================
  // (unchanged — keep your existing code for all 6 property endpoints)

  async createProperty(userId: string, data: CreatePropertyDto): Promise<any> {
    try {
      if (data.isDefault) {
        await db
          .update(properties)
          .set({ isDefault: false })
          .where(eq(properties.userId, userId) as any);
      }

      const [newProperty] = await db
        .insert(properties)
        .values({
          id: randomUUID(),
          userId,
          name: data.name,
          type: data.propertyType,
          addressLine1: data.address,
          addressLine2: null,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          yearBuilt: null,
          areaValue: data.areaValue,
          areaMeasurement: data.areaMeasurement,
          totalRooms: data.rooms || null,
          totalBathrooms: null,
          totalFloors: null,
          isDefault: data.isDefault || false,
        } as any)
        .returning();

      if (!newProperty) {
        throw new InternalServerErrorException("Failed to create property");
      }

      return this.mapProperty(newProperty);
    } catch (error) {
      console.error("Property creation error:", error);
      throw new BadRequestException(
        `Failed to create property: ${(error as Error).message}`,
      );
    }
  }

  async getProperties(userId: string): Promise<any[]> {
    const userProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.userId, userId) as any);

    return userProperties.map((prop: any) => this.mapProperty(prop));
  }

  async getProperty(userId: string, propertyId: string): Promise<any> {
    const [property] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.userId, userId),
        ) as any,
      )
      .limit(1);

    if (!property) throw new NotFoundException("Property not found");
    return this.mapProperty(property);
  }

  async updateProperty(
    userId: string,
    propertyId: string,
    data: UpdatePropertyDto,
  ): Promise<any> {
    await this.getProperty(userId, propertyId);

    if (data.isDefault) {
      await db
        .update(properties)
        .set({ isDefault: false })
        .where(eq(properties.userId, userId) as any);
    }

    const updateData: any = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.addressLine1 = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;
    if (data.propertyType !== undefined) updateData.type = data.propertyType;
    if (data.areaMeasurement !== undefined)
      updateData.areaMeasurement = data.areaMeasurement;
    if (data.areaValue !== undefined) updateData.areaValue = data.areaValue;
    if (data.rooms !== undefined) updateData.totalRooms = data.rooms;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    const [updated] = await db
      .update(properties)
      .set(updateData)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.userId, userId),
        ) as any,
      )
      .returning();

    if (!updated) throw new NotFoundException("Property not found");
    return this.mapProperty(updated);
  }

  async deleteProperty(userId: string, propertyId: string): Promise<void> {
    const property = await this.getProperty(userId, propertyId);

    await db
      .delete(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.userId, userId),
        ) as any,
      );

    if (property.isDefault) {
      const [firstProperty] = await db
        .select()
        .from(properties)
        .where(eq(properties.userId, userId) as any)
        .limit(1);

      if (firstProperty) {
        await db
          .update(properties)
          .set({ isDefault: true })
          .where(eq(properties.id, firstProperty.id) as any);
      }
    }
  }

  async setDefaultProperty(userId: string, propertyId: string): Promise<any> {
    await this.getProperty(userId, propertyId);

    await db
      .update(properties)
      .set({ isDefault: false })
      .where(eq(properties.userId, userId) as any);

    const [updated] = await db
      .update(properties)
      .set({ isDefault: true })
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.userId, userId),
        ) as any,
      )
      .returning();

    if (!updated) {
      throw new InternalServerErrorException("Failed to set default property");
    }

    return this.mapProperty(updated);
  }

  // ==================== SERVICES ====================

  async getServices() {
    const allServices = await db
      .select()
      .from(services)
      .where(eq(services.isActive, true) as any);
    return allServices;
  }

  async getService(serviceId: string) {
    const [service] = await db
      .select()
      .from(services)
      .where(
        and(eq(services.id, serviceId), eq(services.isActive, true)) as any,
      )
      .limit(1);

    if (!service) throw new NotFoundException("Service not found");
    return service;
  }

  // ==================== NEW: DUE SERVICES ====================

  async getServicesDue(userId: string) {
    const dues = await db
      .select({
        id: serviceDues.id,
        nextDueDate: serviceDues.nextDueDate,
        lastServiceDate: serviceDues.lastServiceDate,
        isOverdue: serviceDues.isOverdue,
        serviceName: services.name,
        serviceCategory: services.category,
        serviceFrequency: services.frequency,
        propertyName: properties.name,
        propertyId: properties.id,
      })
      .from(serviceDues)
      .innerJoin(services, eq(serviceDues.serviceId, services.id))
      .innerJoin(properties, eq(serviceDues.propertyId, properties.id))
      .where(eq(serviceDues.userId, userId))
      .orderBy(serviceDues.nextDueDate);

    // Mark overdue items dynamically
    const now = new Date();
    return dues.map((due) => ({
      ...due,
      isOverdue: due.nextDueDate < now,
      daysUntilDue: Math.ceil(
        (due.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  // ==================== NEW: HEALTH REPORTS ====================

  async getHealthReports(userId: string) {
    const reports = await db
      .select({
        id: healthReports.id,
        propertyId: healthReports.propertyId,
        propertyName: properties.name,
        status: healthReports.status,
        overallScore: healthReports.overallScore,
        summary: healthReports.summary,
        reportPeriodStart: healthReports.reportPeriodStart,
        reportPeriodEnd: healthReports.reportPeriodEnd,
        generatedAt: healthReports.generatedAt,
        createdAt: healthReports.createdAt,
      })
      .from(healthReports)
      .innerJoin(properties, eq(healthReports.propertyId, properties.id))
      .where(eq(healthReports.userId, userId))
      .orderBy(desc(healthReports.createdAt));

    return reports;
  }

  async getHealthReport(userId: string, reportId: string) {
    const [report] = await db
      .select()
      .from(healthReports)
      .where(
        and(eq(healthReports.id, reportId), eq(healthReports.userId, userId)),
      )
      .limit(1);

    if (!report) throw new NotFoundException("Health report not found");

    // Get property name
    const [property] = await db
      .select({ name: properties.name })
      .from(properties)
      .where(eq(properties.id, report.propertyId))
      .limit(1);

    return {
      ...report,
      propertyName: property?.name ?? null,
    };
  }

  async getLatestHealthReport(userId: string) {
    const [report] = await db
      .select()
      .from(healthReports)
      .where(eq(healthReports.userId, userId))
      .orderBy(desc(healthReports.createdAt))
      .limit(1);

    if (!report) throw new NotFoundException("No health reports found");

    const [property] = await db
      .select({ name: properties.name })
      .from(properties)
      .where(eq(properties.id, report.propertyId))
      .limit(1);

    return {
      ...report,
      propertyName: property?.name ?? null,
    };
  }

  // ==================== HELPER ====================

  private mapProperty(prop: any) {
    return {
      id: prop.id,
      userId: prop.userId,
      name: prop.name,
      address: prop.addressLine1,
      city: prop.city,
      state: prop.state,
      pincode: prop.pincode,
      propertyType: prop.type,
      areaMeasurement: prop.areaMeasurement,
      areaValue: prop.areaValue,
      rooms: prop.totalRooms,
      isDefault: prop.isDefault,
      createdAt: prop.createdAt,
      updatedAt: prop.updatedAt,
    };
  }
}
