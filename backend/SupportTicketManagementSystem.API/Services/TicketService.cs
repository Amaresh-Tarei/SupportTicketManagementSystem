using Microsoft.EntityFrameworkCore;
using SupportTicketManagementSystem.API.Data;
using SupportTicketManagementSystem.API.DTOs.Common;
using SupportTicketManagementSystem.API.DTOs.History;
using SupportTicketManagementSystem.API.DTOs.Tickets;
using SupportTicketManagementSystem.API.Exceptions;
using SupportTicketManagementSystem.API.Models;
using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.Services;

public class TicketService : ITicketService
{
    private readonly SupportTicketDbContext _context;

    public TicketService(SupportTicketDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<TicketDto>> GetTicketsAsync(TicketQueryParameters queryParameters)
    {
        var query = _context.Tickets.AsNoTracking().AsQueryable();

        // 1. Search by title or description
        if (!string.IsNullOrWhiteSpace(queryParameters.Search))
        {
            var search = queryParameters.Search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(search) || t.Description.ToLower().Contains(search));
        }

        // 2. Filter by status
        if (queryParameters.Status.HasValue)
        {
            query = query.Where(t => t.Status == queryParameters.Status.Value);
        }

        // 3. Filter by priority
        if (queryParameters.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == queryParameters.Priority.Value);
        }

        // 4. Filter by assigned user
        if (!string.IsNullOrWhiteSpace(queryParameters.AssignedTo))
        {
            var assignedTo = queryParameters.AssignedTo.Trim().ToLower();
            query = query.Where(t => t.AssignedTo != null && t.AssignedTo.ToLower().Contains(assignedTo));
        }

        // 5. Filter by date range (CreatedDate)
        if (queryParameters.FromDate.HasValue)
        {
            query = query.Where(t => t.CreatedDate >= queryParameters.FromDate.Value);
        }

        if (queryParameters.ToDate.HasValue)
        {
            // Include entire end date if time was not specified
            var toDate = queryParameters.ToDate.Value;
            if (toDate.TimeOfDay == TimeSpan.Zero)
            {
                toDate = toDate.Date.AddDays(1).AddTicks(-1);
            }
            query = query.Where(t => t.CreatedDate <= toDate);
        }

        // Total count before pagination
        var totalRecords = await query.CountAsync();

        // 6. Whitelisted sorting
        var sortBy = queryParameters.SortBy?.Trim().ToLowerInvariant() ?? "createddate";
        var isAscending = string.Equals(queryParameters.SortOrder?.Trim(), "asc", StringComparison.OrdinalIgnoreCase);

        query = sortBy switch
        {
            "ticketnumber" => isAscending ? query.OrderBy(t => t.TicketNumber) : query.OrderByDescending(t => t.TicketNumber),
            "title" => isAscending ? query.OrderBy(t => t.Title) : query.OrderByDescending(t => t.Title),
            "priority" => isAscending ? query.OrderBy(t => t.Priority) : query.OrderByDescending(t => t.Priority),
            "status" => isAscending ? query.OrderBy(t => t.Status) : query.OrderByDescending(t => t.Status),
            "assignedto" => isAscending ? query.OrderBy(t => t.AssignedTo) : query.OrderByDescending(t => t.AssignedTo),
            "duedate" => isAscending ? query.OrderBy(t => t.DueDate) : query.OrderByDescending(t => t.DueDate),
            "updateddate" => isAscending ? query.OrderBy(t => t.UpdatedDate) : query.OrderByDescending(t => t.UpdatedDate),
            _ => isAscending ? query.OrderBy(t => t.CreatedDate) : query.OrderByDescending(t => t.CreatedDate)
        };

        // 7. Pagination
        var skip = (queryParameters.Page - 1) * queryParameters.PageSize;
        var items = await query
            .Skip(skip)
            .Take(queryParameters.PageSize)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                TicketNumber = t.TicketNumber,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                Status = t.Status,
                AssignedTo = t.AssignedTo,
                CreatedDate = t.CreatedDate,
                UpdatedDate = t.UpdatedDate,
                DueDate = t.DueDate,
                ResolvedDate = t.ResolvedDate,
                CommentCount = t.Comments.Count
            })
            .ToListAsync();

        return new PagedResult<TicketDto>
        {
            Items = items,
            Page = queryParameters.Page,
            PageSize = queryParameters.PageSize,
            TotalRecords = totalRecords
        };
    }

    public async Task<TicketDto> GetTicketByIdAsync(int id)
    {
        var ticket = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.Id == id)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                TicketNumber = t.TicketNumber,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                Status = t.Status,
                AssignedTo = t.AssignedTo,
                CreatedDate = t.CreatedDate,
                UpdatedDate = t.UpdatedDate,
                DueDate = t.DueDate,
                ResolvedDate = t.ResolvedDate,
                CommentCount = t.Comments.Count
            })
            .FirstOrDefaultAsync();

        if (ticket == null)
        {
            throw new NotFoundException($"Ticket with ID {id} was not found.");
        }

        return ticket;
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketDto dto)
    {
        // Business Rule 2: A Critical-priority ticket must have a due date.
        if (dto.Priority == TicketPriority.Critical && !dto.DueDate.HasValue)
        {
            throw new BusinessRuleException("A due date is required for Critical priority tickets.");
        }

        // Business Rule 3: A DueDate cannot be earlier than the ticket creation date.
        if (dto.DueDate.HasValue && dto.DueDate.Value.Date < DateTime.UtcNow.Date)
        {
            throw new BusinessRuleException("Due date cannot be earlier than the ticket creation date.");
        }

        var ticketNumber = await GenerateUniqueTicketNumberAsync();

        var ticket = new Ticket
        {
            TicketNumber = ticketNumber,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Priority = dto.Priority,
            Status = dto.Status,
            AssignedTo = string.IsNullOrWhiteSpace(dto.AssignedTo) ? null : dto.AssignedTo.Trim(),
            CreatedDate = DateTime.UtcNow,
            DueDate = dto.DueDate
        };

        // If ticket was created directly in Resolved status (rare but possible), set ResolvedDate
        if (ticket.Status == TicketStatus.Resolved)
        {
            ticket.ResolvedDate = DateTime.UtcNow;
        }

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        return MapToDto(ticket, 0);
    }

    public async Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            throw new NotFoundException($"Ticket with ID {id} was not found.");
        }

        // Business Rule 1: A Closed ticket cannot be edited.
        if (ticket.Status == TicketStatus.Closed)
        {
            throw new BusinessRuleException("A Closed ticket cannot be edited.");
        }

        // Business Rule 2: A Critical-priority ticket must have a due date.
        if (dto.Priority == TicketPriority.Critical && !dto.DueDate.HasValue)
        {
            throw new BusinessRuleException("A due date is required for Critical priority tickets.");
        }

        // Business Rule 3: A DueDate cannot be earlier than the ticket creation date.
        if (dto.DueDate.HasValue && dto.DueDate.Value.Date < ticket.CreatedDate.Date)
        {
            throw new BusinessRuleException("Due date cannot be earlier than the ticket creation date.");
        }

        ticket.Title = dto.Title.Trim();
        ticket.Description = dto.Description.Trim();
        ticket.Priority = dto.Priority;
        ticket.AssignedTo = string.IsNullOrWhiteSpace(dto.AssignedTo) ? null : dto.AssignedTo.Trim();
        ticket.DueDate = dto.DueDate;
        ticket.UpdatedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(ticket, ticket.Comments.Count);
    }

    public async Task<TicketDto> ChangeTicketStatusAsync(int id, ChangeStatusDto dto)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            throw new NotFoundException($"Ticket with ID {id} was not found.");
        }

        // Business Rule 1: A Closed ticket cannot be edited (including status changes).
        if (ticket.Status == TicketStatus.Closed)
        {
            throw new BusinessRuleException("A Closed ticket cannot be edited or transitioned.");
        }

        if (ticket.Status == dto.NewStatus)
        {
            throw new BusinessRuleException($"Ticket is already in '{dto.NewStatus}' status.");
        }

        // Business Rule 4: A ticket cannot move directly from Open to Closed.
        if (ticket.Status == TicketStatus.Open && dto.NewStatus == TicketStatus.Closed)
        {
            throw new BusinessRuleException("A ticket cannot move directly from Open to Closed. It must be In Progress or Resolved first.");
        }

        var oldStatus = ticket.Status;
        ticket.Status = dto.NewStatus;
        ticket.UpdatedDate = DateTime.UtcNow;

        // Business Rule 5: When a ticket is moved to Resolved, store ResolvedDate.
        if (dto.NewStatus == TicketStatus.Resolved)
        {
            ticket.ResolvedDate = DateTime.UtcNow;
        }

        // Business Rule 6: When a resolved ticket is reopened, clear ResolvedDate.
        if (oldStatus == TicketStatus.Resolved && (dto.NewStatus == TicketStatus.Open || dto.NewStatus == TicketStatus.InProgress))
        {
            ticket.ResolvedDate = null;
        }

        // Business Rule 7: Every ticket status change must create a TicketStatusHistory record.
        var historyRecord = new TicketStatusHistory
        {
            TicketId = ticket.Id,
            OldStatus = oldStatus,
            NewStatus = dto.NewStatus,
            ChangedDate = DateTime.UtcNow,
            ChangedBy = string.IsNullOrWhiteSpace(dto.ChangedBy) ? "System" : dto.ChangedBy.Trim()
        };

        _context.TicketStatusHistories.Add(historyRecord);

        await _context.SaveChangesAsync();

        return MapToDto(ticket, ticket.Comments.Count);
    }

    public async Task DeleteTicketAsync(int id)
    {
        var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket == null)
        {
            throw new NotFoundException($"Ticket with ID {id} was not found.");
        }

        // Cascade delete on foreign keys will remove associated comments and history records
        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<TicketStatusHistoryDto>> GetStatusHistoryByTicketIdAsync(int ticketId)
    {
        var ticketExists = await _context.Tickets.AnyAsync(t => t.Id == ticketId);
        if (!ticketExists)
        {
            throw new NotFoundException($"Ticket with ID {ticketId} was not found.");
        }

        return await _context.TicketStatusHistories
            .AsNoTracking()
            .Where(h => h.TicketId == ticketId)
            .OrderBy(h => h.ChangedDate)
            .Select(h => new TicketStatusHistoryDto
            {
                Id = h.Id,
                TicketId = h.TicketId,
                OldStatus = h.OldStatus,
                NewStatus = h.NewStatus,
                ChangedDate = h.ChangedDate,
                ChangedBy = h.ChangedBy
            })
            .ToListAsync();
    }

    private async Task<string> GenerateUniqueTicketNumberAsync()
    {
        var lastTicket = await _context.Tickets
            .OrderByDescending(t => t.Id)
            .FirstOrDefaultAsync();

        int nextSequence = (lastTicket?.Id ?? 0) + 1;
        var candidate = $"TKT-{1000 + nextSequence}";

        while (await _context.Tickets.AnyAsync(t => t.TicketNumber == candidate))
        {
            nextSequence++;
            candidate = $"TKT-{1000 + nextSequence}";
        }

        return candidate;
    }

    private static TicketDto MapToDto(Ticket ticket, int commentCount)
    {
        return new TicketDto
        {
            Id = ticket.Id,
            TicketNumber = ticket.TicketNumber,
            Title = ticket.Title,
            Description = ticket.Description,
            Priority = ticket.Priority,
            Status = ticket.Status,
            AssignedTo = ticket.AssignedTo,
            CreatedDate = ticket.CreatedDate,
            UpdatedDate = ticket.UpdatedDate,
            DueDate = ticket.DueDate,
            ResolvedDate = ticket.ResolvedDate,
            CommentCount = commentCount
        };
    }
}
