import { TicketPriority, TicketStatus } from '../types/ticket';

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateOnly(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatStatusLabel(status: TicketStatus | string): string {
  switch (status) {
    case 'InProgress':
      return 'In Progress';
    default:
      return status;
  }
}

export function getStatusBadgeClasses(status: TicketStatus | string): string {
  switch (status) {
    case 'Open':
      return 'badge-status-open';
    case 'InProgress':
      return 'badge-status-inprogress';
    case 'Resolved':
      return 'badge-status-resolved';
    case 'Closed':
      return 'badge-status-closed';
    default:
      return 'badge-status-default';
  }
}

export function getPriorityBadgeClasses(priority: TicketPriority | string): string {
  switch (priority) {
    case 'Low':
      return 'badge-priority-low';
    case 'Medium':
      return 'badge-priority-medium';
    case 'High':
      return 'badge-priority-high';
    case 'Critical':
      return 'badge-priority-critical';
    default:
      return 'badge-priority-default';
  }
}

export function isOverdue(dueDate: string | null | undefined, status: TicketStatus | string): boolean {
  if (!dueDate) return false;
  if (status === 'Resolved' || status === 'Closed') return false;
  return new Date(dueDate).getTime() < new Date().getTime();
}
