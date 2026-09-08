export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  priority: TicketPriority;
  priorityName: string;
  status: TicketStatus;
  statusName: string;
  assignedTo: string | null;
  createdDate: string;
  updatedDate: string | null;
  dueDate: string | null;
  resolvedDate: string | null;
  commentCount: number;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  status?: TicketStatus;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface ChangeStatusInput {
  newStatus: TicketStatus;
  changedBy?: string;
}

export interface TicketQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
