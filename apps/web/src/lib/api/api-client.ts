import type {
  Activity,
  ApiResponse,
  Booking,
  DashboardData,
  Notification,
  ServiceDue,
  SOSRequest,
} from "./types";

// Base API URL - adjust based on your environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://server-production-c3c4.up.railway.app";

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // Include cookies for session
      });

      // FIX: Explicitly cast to 'any' so TypeScript allows property access
      const data = (await response.json()) as any;

      if (!response.ok) {
        return {
          success: false,
          error: data.message || "An error occurred",
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // ... rest of your class methods remain exactly the same ...

  // ════════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════════
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.fetch<DashboardData>("/customer/dashboard");
  }

  // ════════════════════════════════════════════════════════════
  // BOOKINGS
  // ════════════════════════════════════════════════════════════
  async getUpcomingBookings(limit = 5): Promise<ApiResponse<Booking[]>> {
    return this.fetch<Booking[]>(`/customer/bookings/upcoming?limit=${limit}`);
  }

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return this.fetch<Booking>(`/customer/bookings/${id}`);
  }

  async createBooking(data: {
    serviceId: string;
    propertyId: string;
    scheduledAt: string;
    notes?: string;
  }): Promise<ApiResponse<Booking>> {
    return this.fetch<Booking>("/customer/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(id: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/bookings/${id}/cancel`, {
      method: "POST",
    });
  }

  async rescheduleBooking(
    id: string,
    scheduledAt: string,
  ): Promise<ApiResponse<Booking>> {
    return this.fetch<Booking>(`/bookings/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledAt }),
    });
  }

  // ════════════════════════════════════════════════════════════
  // COMPLAINTS / SUPPORT TICKETS (NEW)
  // ════════════════════════════════════════════════════════════
  async getComplaints(status?: string): Promise<ApiResponse<any[]>> {
    const query = status ? `?status=${status}` : "";
    return this.fetch<any[]>(`/complaints${query}`);
  }

  async getComplaintById(id: string): Promise<ApiResponse<any>> {
    return this.fetch<any>(`/complaints/${id}`);
  }

  async createComplaint(data: {
    title: string;
    description: string;
    category: string;
    priority: string;
  }): Promise<ApiResponse<any>> {
    return this.fetch<any>("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ════════════════════════════════════════════════════════════
  // PROPERTIES (NEW)
  // ════════════════════════════════════════════════════════════
  async getProperties(): Promise<ApiResponse<any[]>> {
    return this.fetch<any[]>("/properties");
  }

  async addProperty(data: {
    name: string;
    type: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  }): Promise<ApiResponse<any>> {
    return this.fetch<any>("/properties", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ════════════════════════════════════════════════════════════
  // SERVICE DUES
  // ════════════════════════════════════════════════════════════
  async getServiceDues(): Promise<ApiResponse<ServiceDue[]>> {
    return this.fetch<ServiceDue[]>("/services/dues");
  }

  async scheduleServiceDue(dueId: string): Promise<ApiResponse<Booking>> {
    return this.fetch<Booking>(`/services/dues/${dueId}/schedule`, {
      method: "POST",
    });
  }

  // ════════════════════════════════════════════════════════════
  // ACTIVITY & NOTIFICATIONS
  // ════════════════════════════════════════════════════════════
  async getRecentActivity(limit = 10): Promise<ApiResponse<Activity[]>> {
    return this.fetch<Activity[]>(`/activity?limit=${limit}`);
  }

  async getNotifications(
    unreadOnly = false,
  ): Promise<ApiResponse<Notification[]>> {
    return this.fetch<Notification[]>(
      `/notifications?unreadOnly=${unreadOnly}`,
    );
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/notifications/${id}/read`, {
      method: "POST",
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.fetch<void>("/notifications/read-all", {
      method: "POST",
    });
  }

  // ════════════════════════════════════════════════════════════
  // SOS EMERGENCY
  // ════════════════════════════════════════════════════════════
  async createSOS(data: {
    type: string;
    description: string;
    location?: string;
  }): Promise<ApiResponse<SOSRequest>> {
    return this.fetch<SOSRequest>("/sos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getActiveSOSRequests(): Promise<ApiResponse<SOSRequest[]>> {
    return this.fetch<SOSRequest[]>("/sos/active");
  }

  async cancelSOS(id: string): Promise<ApiResponse<void>> {
    return this.fetch<void>(`/sos/${id}/cancel`, {
      method: "POST",
    });
  }

  // ════════════════════════════════════════════════════════════
  // HEALTH SCORE / REPORTS
  // ════════════════════════════════════════════════════════════
  async getHealthScore(): Promise<ApiResponse<any>> {
    return this.fetch<any>("/health/score");
  }

  async refreshHealthScore(): Promise<ApiResponse<any>> {
    return this.fetch<any>("/health/score/refresh", {
      method: "POST",
    });
  }

  // ════════════════════════════════════════════════════════════
  // SERVICES
  // ════════════════════════════════════════════════════════════
  async getAvailableServices(): Promise<ApiResponse<any[]>> {
    return this.fetch<any[]>("/services");
  }

  async getServiceById(id: string): Promise<ApiResponse<any>> {
    return this.fetch<any>(`/services/${id}`);
  }

  // ════════════════════════════════════════════════════════════
  // PAYMENTS & SUBSCRIPTIONS
  // ════════════════════════════════════════════════════════════
  async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    return this.fetch<any[]>("/payments/history");
  }

  async createPaymentOrder(data: {
    bookingId?: string;
    planId?: string;
    amount: number;
  }): Promise<ApiResponse<any>> {
    return this.fetch<any>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<ApiResponse<any>> {
    return this.fetch<any>("/payments/verify", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;
