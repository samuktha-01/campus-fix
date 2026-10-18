/**
 * SmartCampus AI — API Client and Service Layer
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Ticket,
  TicketSubmissionResult,
  TicketStatusHistory,
  TicketAttachment,
} from '../types';

// Resolve API base URL matching backend v1 prefix
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api/v1';

/**
 * Pre-configured Axios instance with JWT interceptors
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach bearer access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: propagate structured error
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Safely extracts diagnostic error messages without disguising network
 * or server errors as invalid authentication credentials.
 */
export const extractErrorMessage = (err: any, fallbackMessage: string = 'An unexpected error occurred.'): string => {
  // 1. Network connectivity / server unavailable
  if (!err?.response) {
    if (err?.code === 'ECONNABORTED') {
      return 'Request timed out. Please verify that the backend server is responding.';
    }
    if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK') {
      return 'Unable to connect to the backend server. Please verify the API is running at ' + API_BASE_URL;
    }
    return err?.message || 'Network connectivity error. Unable to reach the server.';
  }

  const { status, data } = err.response;

  // 2. Custom backend application error: { success: false, error: { message: "...", code: "..." } }
  if (data?.error?.message) {
    return data.error.message;
  }

  // 3. Pydantic / FastAPI request validation error: { detail: [{ msg: "..." }] } or { detail: "..." }
  if (data?.detail) {
    if (Array.isArray(data.detail)) {
      const messages = data.detail.map((d: any) => d.msg || JSON.stringify(d)).filter(Boolean);
      if (messages.length > 0) return messages.join('; ');
    }
    if (typeof data.detail === 'string') {
      return data.detail;
    }
  }

  // 4. HTTP Status Code specific diagnostics
  switch (status) {
    case 400:
      return 'Invalid request. Please check the submitted information.';
    case 401:
      return 'Invalid email or password. Please verify your credentials.';
    case 403:
      return 'Access forbidden. Your account may be disabled or lack required role permissions.';
    case 404:
      return 'Requested resource or API endpoint was not found on the server.';
    case 409:
      return 'A conflict occurred. An account or ticket with this data already exists.';
    case 422:
      return 'Input validation failed. Please ensure password complexity (min 8 chars, uppercase, lowercase, digit/symbol).';
    case 500:
    case 502:
    case 503:
      return 'Backend service or database error occurred. Please verify database connectivity.';
    default:
      return fallbackMessage;
  }
};

/**
 * Ticket API endpoints used by Student Portal, Dashboard, and Complaints
 */
export const ticketApi = {
  /**
   * Fetch all complaints submitted by the authenticated student
   */
  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await apiClient.get<Ticket[]>('/tickets/my');
    return response.data;
  },

  /**
   * Fetch complete ticket details by ticket number or UUID
   */
  getTicketDetails: async (ticketIdOrNumber: string): Promise<Ticket> => {
    const response = await apiClient.get<Ticket>(`/tickets/${encodeURIComponent(ticketIdOrNumber)}`);
    return response.data;
  },

  /**
   * Submit a new student complaint (supports multipart FormData with media attachments or JSON)
   */
  submitComplaint: async (data: FormData | Record<string, any>): Promise<TicketSubmissionResult> => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const response = await apiClient.post<TicketSubmissionResult>('/tickets', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Post a student or staff comment on an active ticket
   */
  addComment: async (ticketIdOrNumber: string, comment: string): Promise<TicketStatusHistory> => {
    const response = await apiClient.post<TicketStatusHistory>(
      `/tickets/${encodeURIComponent(ticketIdOrNumber)}/comments`,
      { comment }
    );
    return response.data;
  },

  /**
   * Upload an image or video attachment to an existing ticket
   */
  addAttachment: async (ticketIdOrNumber: string, file: File): Promise<TicketAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<TicketAttachment>(
      `/tickets/${encodeURIComponent(ticketIdOrNumber)}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },
};

export default apiClient;
