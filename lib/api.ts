export interface ApiError extends Error {
  status?: number;
  data?: any;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      // In a real app, get token from NextAuth session or localStorage
      return null;
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error: ApiError = new Error(body.error || body.message || 'Request failed');
        error.status = response.status;
        error.data = body;
        throw error;
      }

      return {
        data: (body.data !== undefined ? body.data : body) as T,
        success: body.success ?? true,
        message: body.message,
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      const apiError: ApiError = new Error(
        error instanceof Error ? error.message : 'Network error'
      );
      apiError.status = 0;
      throw apiError;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error: ApiError = new Error(data.message || 'Upload failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return { data, success: true, message: data.message };
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      const apiError: ApiError = new Error(
        error instanceof Error ? error.message : 'Network error'
      );
      apiError.status = 0;
      throw apiError;
    }
  }
}

export const api = new ApiClient();

// Convenience functions for common API calls
export const complaintsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number; userId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.userId) searchParams.set('userId', params.userId);
    return api.get(`/api/complaints?${searchParams.toString()}`);
  },

  getById: (id: string) => api.get(`/api/complaints/${id}`),

  create: (data: {
    title: string;
    description: string;
    category: string;
    severity: string;
    location: { latitude: number; longitude: number; address: string };
    images?: string[];
    voiceTranscript?: string;
    aiAnalysis?: any;
  }) => api.post('/api/complaints', data),
};

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),
};

export const aiApi = {
  analyze: (data: {
    description: string;
    images?: string[];
    voiceTranscript?: string;
  }) => api.post('/api/ai/analyze', data),
};

export const organizationsApi = {
  getAll: () => api.get('/api/organizations'),
  getById: (id: string) => api.get(`/api/organizations/${id}`),
};

export const userApi = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data: { name?: string; phone?: string; language?: string }) =>
    api.patch('/api/user/profile', data),
};

export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getComplaints: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    return api.get(`/api/admin/complaints?${searchParams.toString()}`);
  },
  updateComplaintStatus: (id: string, status: string, adminNotes?: string) =>
    api.patch(`/api/admin/complaints/${id}`, { status, adminNotes }),
  getOrganizations: () => api.get('/api/admin/organizations'),
  createOrganization: (data: {
    name: string;
    nameUrdu: string;
    city: string;
    email: string;
    phone: string;
    categories: string[];
  }) => api.post('/api/admin/organizations', data),
};

// React hook for API calls with error handling
import { useState, useCallback } from 'react';

export function useApi<T>(apiCall: () => Promise<ApiResponse<T>>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { data, error, loading, execute, setData };
}