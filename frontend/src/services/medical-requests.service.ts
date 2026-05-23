import api from '@/lib/axios';
import type { MedicalRequest, PaginatedResponse } from '@/types';

export const medicalRequestsService = {
  async create(dto: {
    tontineId: string;
    title: string;
    description: string;
    amount: number;
    diagnosis?: string;
    hospitalName?: string;
    votingDeadline?: string;
  }): Promise<MedicalRequest> {
    const res = await api.post('/medical-requests', dto);
    return res.data.data;
  },

  async findAll(params?: {
    page?: number;
    limit?: number;
    tontineId?: string;
    status?: string;
  }): Promise<PaginatedResponse<MedicalRequest>> {
    const res = await api.get('/medical-requests', { params });
    return res.data;
  },

  async getMy(params?: { tontineId?: string; status?: string }): Promise<PaginatedResponse<MedicalRequest>> {
    const res = await api.get('/medical-requests/my', { params });
    return res.data;
  },

  async findOne(id: string): Promise<MedicalRequest> {
    const res = await api.get(`/medical-requests/${id}`);
    return res.data.data;
  },

  async uploadDocuments(id: string, files: File[]): Promise<MedicalRequest> {
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));
    const res = await api.post(`/medical-requests/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async vote(dto: {
    medicalRequestId: string;
    choice: 'FOR' | 'AGAINST' | 'ABSTAIN';
    comment?: string;
  }) {
    const res = await api.post('/votes', dto);
    return res.data.data;
  },

  async getVotes(requestId: string) {
    const res = await api.get(`/votes/request/${requestId}`);
    return res.data.data;
  },
};
