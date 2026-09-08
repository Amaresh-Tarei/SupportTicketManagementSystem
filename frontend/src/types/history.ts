import { TicketStatus } from './ticket';

export interface TicketStatusHistory {
  id: number;
  ticketId: number;
  oldStatus: TicketStatus;
  oldStatusName: string;
  newStatus: TicketStatus;
  newStatusName: string;
  changedDate: string;
  changedBy: string;
}
