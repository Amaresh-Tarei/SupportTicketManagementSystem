import { request } from './api';
import { CreateCommentInput, TicketComment } from '../types/comment';

export const commentService = {
  async getComments(ticketId: number): Promise<TicketComment[]> {
    return request<TicketComment[]>(`/tickets/${ticketId}/comments`);
  },

  async addComment(ticketId: number, input: CreateCommentInput): Promise<TicketComment> {
    return request<TicketComment>(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        commentText: input.commentText,
        createdBy: input.createdBy,
      }),
    });
  },
};
