import api from '@/lib/axios';
import type { User } from '@/types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const res = await api.post('/auth/login', dto);
    return res.data.data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const res = await api.post('/auth/register', dto);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await api.post('/auth/refresh', null, {
      headers: { 'X-Refresh-Token': refreshToken },
    });
    return res.data.data;
  },
};
