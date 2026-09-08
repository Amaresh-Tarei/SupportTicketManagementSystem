export interface TicketComment {
  id: number;
  ticketId: number;
  commentText: string;
  createdDate: string;
  createdBy: string;
}

export interface CreateCommentInput {
  commentText: string;
  createdBy: string;
}
