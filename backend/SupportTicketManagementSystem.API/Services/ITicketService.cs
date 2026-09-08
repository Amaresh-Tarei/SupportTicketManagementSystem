using SupportTicketManagementSystem.API.DTOs.Common;
using SupportTicketManagementSystem.API.DTOs.History;
using SupportTicketManagementSystem.API.DTOs.Tickets;

namespace SupportTicketManagementSystem.API.Services;

public interface ITicketService
{
    Task<PagedResult<TicketDto>> GetTicketsAsync(TicketQueryParameters queryParameters);
    Task<TicketDto> GetTicketByIdAsync(int id);
    Task<TicketDto> CreateTicketAsync(CreateTicketDto dto);
    Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto);
    Task<TicketDto> ChangeTicketStatusAsync(int id, ChangeStatusDto dto);
    Task DeleteTicketAsync(int id);
    Task<IReadOnlyList<TicketStatusHistoryDto>> GetStatusHistoryByTicketIdAsync(int ticketId);
}
