import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

// Query keys
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  bookings: {
    all: ["bookings"] as const,
    upcoming: (limit?: number) => ["bookings", "upcoming", limit] as const,
    detail: (id: string) => ["bookings", id] as const,
  },
  serviceDues: ["service-dues"] as const,
  activity: (limit?: number) => ["activity", limit] as const,
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
  },
  sos: {
    active: ["sos", "active"] as const,
    detail: (id: string) => ["sos", id] as const,
  },
  healthScore: ["health-score"] as const,
  services: {
    all: ["services"] as const,
    detail: (id: string) => ["services", id] as const,
  },
};

// Dashboard Hook
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const response = await apiClient.getDashboardData();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch dashboard data");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Bookings Hooks
export function useUpcomingBookings(limit = 5) {
  return useQuery({
    queryKey: queryKeys.bookings.upcoming(limit),
    queryFn: async () => {
      const response = await apiClient.getUpcomingBookings(limit);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch bookings");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: async () => {
      const response = await apiClient.getBookingById(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch booking");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      serviceId: string;
      propertyId: string;
      scheduledAt: string;
      notes?: string;
    }) => {
      const response = await apiClient.createBooking(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create booking");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.cancelBooking(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to cancel booking");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      scheduledAt,
    }: {
      id: string;
      scheduledAt: string;
    }) => {
      const response = await apiClient.rescheduleBooking(id, scheduledAt);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to reschedule booking");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

// Service Dues Hooks
export function useServiceDues() {
  return useQuery({
    queryKey: queryKeys.serviceDues,
    queryFn: async () => {
      const response = await apiClient.getServiceDues();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch service dues");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useScheduleServiceDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dueId: string) => {
      const response = await apiClient.scheduleServiceDue(dueId);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to schedule service");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceDues });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// Activity Hook
export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: queryKeys.activity(limit),
    queryFn: async () => {
      const response = await apiClient.getRecentActivity(limit);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch activity");
      }
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// Notifications Hooks
export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: unreadOnly
      ? queryKeys.notifications.unread
      : queryKeys.notifications.all,
    queryFn: async () => {
      const response = await apiClient.getNotifications(unreadOnly);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch notifications");
      }
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.markNotificationAsRead(id);
      if (!response.success) {
        throw new Error(
          response.error || "Failed to mark notification as read",
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.markAllNotificationsAsRead();
      if (!response.success) {
        throw new Error(
          response.error || "Failed to mark all notifications as read",
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// SOS Hooks
export function useCreateSOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: string;
      description: string;
      location?: string;
    }) => {
      const response = await apiClient.createSOS(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create SOS request");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sos.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useActiveSOSRequests() {
  return useQuery({
    queryKey: queryKeys.sos.active,
    queryFn: async () => {
      const response = await apiClient.getActiveSOSRequests();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch SOS requests");
      }
      return response.data;
    },
    staleTime: 1000 * 10, // 10 seconds for critical data
    refetchInterval: 1000 * 30, // Auto-refresh every 30 seconds
  });
}

export function useCancelSOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.cancelSOS(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to cancel SOS request");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sos.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

// Health Score Hooks
export function useHealthScore() {
  return useQuery({
    queryKey: queryKeys.healthScore,
    queryFn: async () => {
      const response = await apiClient.getHealthScore();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch health score");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useRefreshHealthScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.refreshHealthScore();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to refresh health score");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.healthScore });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// Services Hooks
export function useServices() {
  return useQuery({
    queryKey: queryKeys.services.all,
    queryFn: async () => {
      const response = await apiClient.getAvailableServices();
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch services");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: async () => {
      const response = await apiClient.getServiceById(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch service");
      }
      return response.data;
    },
    enabled: !!id,
  });
}
