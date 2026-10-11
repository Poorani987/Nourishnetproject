import axios from 'axios';
import {
  AuthResponse,
  FoodDonation,
  FoodAllocation,
  Delivery,
  RoadNode,
  RoadEdge,
  RouteResponse,
  NotificationItem,
  ImpactSummary,
  WasteRecord,
  VolunteerReward,
  Vehicle,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to catch 401s and extract clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-clear on failed login attempt
      if (!error.config.url.includes('/login') && !error.config.url.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },
  register: async (details: any): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', details);
    return data;
  },
  me: async (): Promise<AuthResponse> => {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data;
  },
  changePassword: async (passwords: any): Promise<void> => {
    await api.put('/auth/change-password', passwords);
  },
};

export const donationsApi = {
  getAvailable: async (): Promise<FoodDonation[]> => {
    const { data } = await api.get<FoodDonation[]>('/donations/available');
    return data;
  },
  getById: async (id: number): Promise<FoodDonation> => {
    const { data } = await api.get<FoodDonation>(`/donations/${id}`);
    return data;
  },
  getMy: async (): Promise<FoodDonation[]> => {
    const { data } = await api.get<FoodDonation[]>('/donations/my');
    return data;
  },
  create: async (donation: any): Promise<FoodDonation> => {
    const { data } = await api.post<FoodDonation>('/donations', donation);
    return data;
  },
  update: async (id: number, donation: any): Promise<FoodDonation> => {
    const { data } = await api.put<FoodDonation>(`/donations/${id}`, donation);
    return data;
  },
  cancel: async (id: number): Promise<void> => {
    await api.post(`/donations/${id}/cancel`);
  },
};

export const allocationsApi = {
  request: async (requestData: any): Promise<FoodAllocation> => {
    const { data } = await api.post<FoodAllocation>('/allocations/request', requestData);
    return data;
  },
  getMy: async (): Promise<FoodAllocation[]> => {
    const { data } = await api.get<FoodAllocation[]>('/allocations/my');
    return data;
  },
  getDonorAllocations: async (): Promise<FoodAllocation[]> => {
    const { data } = await api.get<FoodAllocation[]>('/allocations/donor');
    return data;
  },
};

export const volunteerApi = {
  getAvailableDeliveries: async (): Promise<Delivery[]> => {
    const { data } = await api.get<Delivery[]>('/volunteers/deliveries/available');
    return data;
  },
  acceptDelivery: async (id: number): Promise<Delivery> => {
    const { data } = await api.post<Delivery>(`/volunteers/deliveries/${id}/accept`);
    return data;
  },
  getMyAssignments: async (): Promise<Delivery[]> => {
    const { data } = await api.get<Delivery[]>('/volunteers/deliveries/my');
    return data;
  },
  updateStatus: async (id: number, status: string, notes?: string): Promise<Delivery> => {
    const { data } = await api.put<Delivery>(`/volunteers/deliveries/${id}/status`, { status, notes });
    return data;
  },
  getVehicle: async (): Promise<Vehicle> => {
    const { data } = await api.get<Vehicle>('/volunteers/vehicle');
    return data;
  },
  updateVehicle: async (vehicle: Vehicle): Promise<Vehicle> => {
    const { data } = await api.put<Vehicle>('/volunteers/vehicle', vehicle);
    return data;
  },
  toggleAvailability: async (): Promise<{ isAvailable: boolean }> => {
    const { data } = await api.put<{ isAvailable: boolean }>('/volunteers/availability');
    return data;
  },
  getRewards: async (): Promise<VolunteerReward[]> => {
    const { data } = await api.get<VolunteerReward[]>('/volunteers/rewards');
    return data;
  },
};

export const routesApi = {
  getNodes: async (): Promise<RoadNode[]> => {
    const { data } = await api.get<RoadNode[]>('/routes/nodes');
    return data;
  },
  getEdges: async (): Promise<RoadEdge[]> => {
    const { data } = await api.get<RoadEdge[]>('/routes/edges');
    return data;
  },
  calculateRoute: async (sourceId: number, targetId: number): Promise<RouteResponse> => {
    const { data } = await api.get<RouteResponse>(`/routes/calculate?source=${sourceId}&target=${targetId}`);
    return data;
  },
};

export const otpApi = {
  getOtpForDelivery: async (deliveryId: number): Promise<{ plainOtp: string; expiresAt: string; isUsed: boolean }> => {
    const { data } = await api.get(`/otp/${deliveryId}`);
    return data;
  },
  verifyOtp: async (deliveryId: number, otpCode: string): Promise<boolean> => {
    const { data } = await api.post<{ verified: boolean }>('/otp/verify', { deliveryId, otpCode });
    return data.verified;
  },
};

export const notificationsApi = {
  getAll: async (): Promise<NotificationItem[]> => {
    const { data } = await api.get<NotificationItem[]>('/notifications');
    return data;
  },
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return data.unreadCount;
  },
  markRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};

export const impactApi = {
  getSummary: async (): Promise<ImpactSummary> => {
    const { data } = await api.get<ImpactSummary>('/impact/summary');
    return data;
  },
  getMyWaste: async (): Promise<WasteRecord[]> => {
    const { data } = await api.get<WasteRecord[]>('/waste/my');
    return data;
  },
  logWaste: async (record: any): Promise<WasteRecord> => {
    const { data } = await api.post<WasteRecord>('/waste/record', record);
    return data;
  },
};

export default api;
