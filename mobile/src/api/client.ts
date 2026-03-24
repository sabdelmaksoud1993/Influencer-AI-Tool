import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';

const TOKEN_KEY = 'glowpass_token';
const USER_KEY = 'glowpass_user';

class ApiClient {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  async saveUser(user: Record<string, unknown>): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }

  async getSavedUser(): Promise<Record<string, unknown> | null> {
    const data = await SecureStore.getItemAsync(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = (errorBody as { error?: string }).error || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
