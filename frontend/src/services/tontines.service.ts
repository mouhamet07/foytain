import api from '@/lib/axios';
import type { Tontine, PaginatedResponse } from '@/types';

export interface CreateTontineDto {
  name: string;
  description?: string;
  type: 'PUBLIC' | 'PRIVATE';
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';
  contributionAmount: number;
  currency?: string;
  maxMembers?: number;
  startDate: string;
  endDate?: string;
  rules?: string;
}

export interface TontineFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export const tontinesService = {
  async create(dto: CreateTontineDto): Promise<Tontine> {
    const res = await api.post('/tontines', dto);
    return res.data.data;
  },

  async findAll(filters: TontineFilters = {}): Promise<PaginatedResponse<Tontine>> {
    const res = await api.get('/tontines', { params: filters });
    return res.data;
  },

  async findOne(idOrSlug: string): Promise<Tontine> {
    const res = await api.get(`/tontines/${idOrSlug}`);
    return res.data.data;
  },

  async getMyTontines(): Promise<Tontine[]> {
    const res = await api.get('/tontines/my');
    return res.data.data;
  },

  async update(id: string, dto: Partial<CreateTontineDto>): Promise<Tontine> {
    const res = await api.put(`/tontines/${id}`, dto);
    return res.data.data;
  },

  async activate(id: string): Promise<Tontine> {
    const res = await api.patch(`/tontines/${id}/activate`);
    return res.data.data;
  },

  async cancel(id: string): Promise<Tontine> {
    const res = await api.patch(`/tontines/${id}/cancel`);
    return res.data.data;
  },
};
