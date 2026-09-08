import { request } from './api';
import { DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>('/dashboard/summary');
  },
};
