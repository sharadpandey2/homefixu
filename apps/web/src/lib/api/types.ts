// apps/web/src/lib/api/types.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardData {
  totalBookings: number;
  activeProperties: number;
  healthScore: number;
  upcomingDues: number;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  serviceId: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  scheduledDate: string;
  scheduledSlot: string;
  totalPricePaise: number;
  notes?: string;
  technicianName?: string;
  technicianPhone?: string;
}

export interface ServiceDue {
  id: string;
  propertyId: string;
  serviceId: string;
  lastServiceDate?: string;
  nextDueDate: string;
  isOverdue: boolean;
}

export interface Activity {
  id: string;
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface SOSRequest {
  id: string;
  propertyId?: string;
  category: string;
  status:
    | "triggered"
    | "acknowledged"
    | "dispatched"
    | "resolved"
    | "cancelled";
  description?: string;
  createdAt: string;
}
