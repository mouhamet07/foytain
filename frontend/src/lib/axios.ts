import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

// Helper — only runs in browser
const isBrowser = typeof window !== 'undefined';

function getToken(key: string): string | null {
  if (!isBrowser) return null;
  try {
    // Read from cookie directly (js-cookie not needed here)
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)'),
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function setToken(key: string, value: string, maxAgeSecs: number) {
  if (!isBrowser) return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Max-Age=${maxAgeSecs}; Path=/; SameSite=Lax${secure}`;
}

function removeToken(key: string) {
  if (!isBrowser) return;
  document.cookie = `${encodeURIComponent(key)}=; Max-Age=0; Path=/; SameSite=Lax`;
}

// Attach access token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auto-refresh on 401
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry || !isBrowser) {
      return Promise.reject(error);
    }

    const refreshToken = getToken('refresh_token');
    if (!refreshToken) {
      removeToken('access_token');
      removeToken('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            if (original.headers) original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { headers: { 'X-Refresh-Token': refreshToken } },
      );

      const { accessToken, refreshToken: newRefreshToken } = data.data ?? data;

      setToken('access_token', accessToken, 15 * 60);         // 15 min
      setToken('refresh_token', newRefreshToken, 7 * 24 * 3600); // 7 days

      if (original.headers) {
        original.headers.Authorization = `Bearer ${accessToken}`;
      }

      processQueue(null, accessToken);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      removeToken('access_token');
      removeToken('refresh_token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
