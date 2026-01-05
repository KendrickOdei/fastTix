import { apiFetch } from "../../../utils/apiClient";

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTicketsSold: number;
  actualTicketsQty: number;
  totalRevenue: number;
}

export interface User {
  _id: string;
  fullName?: string;
  userName?: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin';
  organizationName?: string;
  location?: string;
  country?: string;
  phone?: number;
  isVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  totalAttendees: number;
  totalOrganizers: number;
  totalAdmins: number;
  newUsers: number;
  unverifiedUsers: number;
}

export interface UserActivity {
  eventsCreated?: number;
  totalTicketsSold?: number;
  totalRevenue?: number;
  events?: any[];
  ticketsPurchased?: number;
  totalSpent?: number;
  recentBookings?: any[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<ApiResponse<AdminStats>> => {
    return apiFetch<ApiResponse<AdminStats>>('/api/admin/dashboard-stats');
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    return apiFetch<ApiResponse<UserStats>>('/api/admin/users/stats');
  },

  /**
   * Get all users with filters and pagination
   */
  getAllUsers: async (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ users: User[]; pagination: any }>> => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiFetch<ApiResponse<{ users: User[]; pagination: any }>>(url);
  },

  /**
   * Get single user details with activity
   */
  getUserById: async (userId: string): Promise<ApiResponse<{ user: User; activity: UserActivity }>> => {
    return apiFetch<ApiResponse<{ user: User; activity: UserActivity }>>(`/api/admin/users/${userId}`);
  },

  /**
   * Update user details
   */
  updateUser: async (userId: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    return apiFetch<ApiResponse<User>>(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Change user role
   */
  changeUserRole: async (userId: string, role: 'attendee' | 'organizer' | 'admin'): Promise<ApiResponse<User>> => {
    return apiFetch<ApiResponse<User>>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  /**
   * Manually verify a user
   */
  verifyUser: async (userId: string): Promise<ApiResponse<User>> => {
    return apiFetch<ApiResponse<User>>(`/api/admin/users/${userId}/verify`, {
      method: 'PUT',
    });
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    return apiFetch<ApiResponse<null>>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update event status (approve, reject, etc.)
   */
  updateEventStatus: async (eventId: string, status: string): Promise<ApiResponse<any>> => {
    return apiFetch<ApiResponse<any>>(`/api/admin/events/${eventId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Get all events (for admin management)
   */
  getAllEvents: async (): Promise<ApiResponse<any[]>> => {
    return apiFetch<ApiResponse<any[]>>('/api/admin/events');
  },

  /**
   * Delete an event by ID
   */
  deleteEvent: async (eventId: string): Promise<ApiResponse<null>> => {
    return apiFetch<ApiResponse<null>>(`/api/admin/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};