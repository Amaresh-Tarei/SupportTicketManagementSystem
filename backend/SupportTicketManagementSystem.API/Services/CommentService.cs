using Microsoft.EntityFrameworkCore;
using SupportTicketManagementSystem.API.Data;
using SupportTicketManagementSystem.API.DTOs.Comments;
using SupportTicketManagementSystem.API.Exceptions;
using SupportTicketManagementSystem.API.Models;

namespace SupportTicketManagementSystem.API.Services;

public class CommentService : ICommentService
{
    private readonly SupportTicketDbContext _context;

    public CommentService(SupportTicketDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<TicketCommentDto>> GetCommentsByTicketIdAsync(int ticketId)
    {
        var ticketExists = await _context.Tickets.AnyAsync(t => t.Id == ticketId);
        if (!ticketExists)
        {
            throw new NotFoundException($"Ticket with ID {ticketId} was not found.");
        }

        return await _context.Comments
            .AsNoTracking()
            .Where(c => c.TicketId == ticketId)
            .OrderBy(c => c.CreatedDate)
            .Select(c => new TicketCommentDto
            {
                Id = c.Id,
                TicketId = c.TicketId,
                CommentText = c.CommentText,
                CreatedDate = c.CreatedDate,
                CreatedBy = c.CreatedBy
            })
            .ToListAsync();
    }

    public async Task<TicketCommentDto> AddCommentAsync(int ticketId, CreateTicketCommentDto dto)
    {
        var ticketExists = await _context.Tickets.AnyAsync(t => t.Id == ticketId);
        if (!ticketExists)
        {
            throw new NotFoundException($"Ticket with ID {ticketId} was not found.");
        }

        var comment = new TicketComment
        {
            TicketId = ticketId,
            CommentText = dto.CommentText.Trim(),
            CreatedBy = dto.CreatedBy.Trim(),
            CreatedDate = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return new TicketCommentDto
        {
            Id = comment.Id,
            TicketId = comment.TicketId,
            CommentText = comment.CommentText,
            CreatedDate = comment.CreatedDate,
            CreatedBy = comment.CreatedBy
        };
    }
}
