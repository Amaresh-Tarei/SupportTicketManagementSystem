using SupportTicketManagementSystem.API.DTOs.Comments;

namespace SupportTicketManagementSystem.API.Services;

public interface ICommentService
{
    Task<IReadOnlyList<TicketCommentDto>> GetCommentsByTicketIdAsync(int ticketId);
    Task<TicketCommentDto> AddCommentAsync(int ticketId, CreateTicketCommentDto dto);
}
