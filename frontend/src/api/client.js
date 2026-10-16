import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (details) => {
    const { data } = await api.post('/auth/register', details);
    return data;
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  changePassword: async (passwords) => {
    await api.put('/auth/change-password', passwords);
  },
};

export const donationsApi = {
  getAvailable: async () => {
    const { data } = await api.get('/donations/available');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/donations/${id}`);
    return data;
  },
  getMy: async () => {
    const { data } = await api.get('/donations/my');
    return data;
  },
  create: async (donation) => {
    const { data } = await api.post('/donations', donation);
    return data;
  },
  update: async (id, donation) => {
    const { data } = await api.put(`/donations/${id}`, donation);
    return data;
  },
  cancel: async (id) => {
    await api.post(`/donations/${id}/cancel`);
  },
};

export const allocationsApi = {
  request: async (requestData) => {
    const { data } = await api.post('/allocations/request', requestData);
    return data;
  },
  getMy: async () => {
    const { data } = await api.get('/allocations/my');
    return data;
  },
  getDonorAllocations: async () => {
    const { data } = await api.get('/allocations/donor');
    return data;
  },
};

export const volunteerApi = {
  getAvailableDeliveries: async () => {
    const { data } = await api.get('/volunteers/deliveries/available');
    return data;
  },
  acceptDelivery: async (id) => {
    const { data } = await api.post(`/volunteers/deliveries/${id}/accept`);
    return data;
  },
  getMyAssignments: async () => {
    const { data } = await api.get('/volunteers/deliveries/my');
    return data;
  },
  updateStatus: async (id, status, notes) => {
    const { data } = await api.put(`/volunteers/deliveries/${id}/status`, { status, notes });
    return data;
  },
  getVehicle: async () => {
    const { data } = await api.get('/volunteers/vehicle');
    return data;
  },
  updateVehicle: async (vehicle) => {
    const { data } = await api.put('/volunteers/vehicle', vehicle);
    return data;
  },
  toggleAvailability: async () => {
    const { data } = await api.put('/volunteers/availability');
    return data;
  },
  getRewards: async () => {
    const { data } = await api.get('/volunteers/rewards');
    return data;
  },
};

export const routesApi = {
  getNodes: async () => {
    const { data } = await api.get('/routes/nodes');
    return data;
  },
  getEdges: async () => {
    const { data } = await api.get('/routes/edges');
    return data;
  },
  calculateRoute: async (sourceId, targetId) => {
    const { data } = await api.get(`/routes/calculate?source=${sourceId}&target=${targetId}`);
    return data;
  },
};

export const otpApi = {
  getOtpForDelivery: async (deliveryId) => {
    const { data } = await api.get(`/otp/${deliveryId}`);
    return data;
  },
  verifyOtp: async (deliveryId, otpCode) => {
    const { data } = await api.post('/otp/verify', { deliveryId, otpCode });
    return data.verified;
  },
};

export const notificationsApi = {
  getAll: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },
  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data.unreadCount;
  },
  markRead: async (id) => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    await api.put('/notifications/read-all');
  },
};

export const impactApi = {
  getSummary: async () => {
    const { data } = await api.get('/impact/summary');
    return data;
  },
  getMyWaste: async () => {
    const { data } = await api.get('/waste/my');
    return data;
  },
  logWaste: async (record) => {
    const { data } = await api.post('/waste/record', record);
    return data;
  },
};

export default api;
