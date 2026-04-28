// Dashboard data types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface HealthMetric {
  category: string;
  score: number;
  status: "good" | "warning" | "critical";
  lastChecked: string;
  details?: string;
}

export interface HomeHealthScore {
  overallScore: number;
  metrics: HealthMetric[];
  lastUpdated: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  completedJobs: number;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  scheduledAt: string;
  completedAt?: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  provider?: ServiceProvider;
  amount: number;
  notes?: string;
}

export interface ServiceDue {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  frequency: string;
  estimatedCost: number;
}

export interface Activity {
  id: string;
  userId: string;
  type:
    | "booking_created"
    | "booking_confirmed"
    | "booking_completed"
    | "booking_cancelled"
    | "payment_completed"
    | "alert"
    | "sos_triggered"
    | "health_check"
    | "notification";
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SOSRequest {
  id: string;
  userId: string;
  type: "plumbing" | "electrical" | "security" | "medical" | "other";
  description: string;
  location: string;
  status: "active" | "responded" | "resolved" | "cancelled";
  createdAt: string;
  respondedAt?: string;
  resolvedAt?: string;
  responder?: ServiceProvider;
}

export interface DashboardData {
  user: User;
  healthScore: HomeHealthScore;
  upcomingBookings: Booking[];
  serviceDues: ServiceDue[];
  recentActivity: Activity[];
  unreadNotifications: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
