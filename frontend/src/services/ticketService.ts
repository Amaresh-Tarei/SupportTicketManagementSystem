import { request } from './api';
import {
  ChangeStatusInput,
  CreateTicketInput,
  PagedResult,
  Ticket,
  TicketQueryParams,
  UpdateTicketInput,
} from '../types/ticket';
import { TicketStatusHistory } from '../types/history';

export const ticketService = {
  async getTickets(params: TicketQueryParams = {}): Promise<PagedResult<Ticket>> {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.assignedTo) query.append('assignedTo', params.assignedTo);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);
    if (params.page) query.append('page', params.page.toString());
    if (params.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString();
    const endpoint = queryString ? `/tickets?${queryString}` : '/tickets';
    return request<PagedResult<Ticket>>(endpoint);
  },

  async getTicketById(id: number): Promise<Ticket> {
    return request<Ticket>(`/tickets/${id}`);
  },

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    return request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status || 'Open',
        assignedTo: input.assignedTo || null,
        dueDate: input.dueDate || null,
      }),
    });
  },

  async updateTicket(id: number, input: UpdateTicketInput): Promise<Ticket> {
    return request<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        priority: input.priority,
        assignedTo: input.assignedTo || null,
        dueDate: input.dueDate || null,
      }),
    });
  },

  async changeTicketStatus(id: number, input: ChangeStatusInput): Promise<Ticket> {
    return request<Ticket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        newStatus: input.newStatus,
        changedBy: input.changedBy || 'User',
      }),
    });
  },

  async deleteTicket(id: number): Promise<void> {
    return request<void>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  },

  async getStatusHistory(ticketId: number): Promise<TicketStatusHistory[]> {
    return request<TicketStatusHistory[]>(`/tickets/${ticketId}/status-history`);
  },
};
