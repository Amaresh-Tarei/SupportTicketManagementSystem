using Microsoft.EntityFrameworkCore;
using SupportTicketManagementSystem.API.Data;
using SupportTicketManagementSystem.API.DTOs.Comments;
using SupportTicketManagementSystem.API.DTOs.Tickets;
using SupportTicketManagementSystem.API.Exceptions;
using SupportTicketManagementSystem.API.Models;
using SupportTicketManagementSystem.API.Models.Enums;
using SupportTicketManagementSystem.API.Services;
using Xunit;

namespace SupportTicketManagementSystem.Tests;

public class BusinessRuleTests
{
    private SupportTicketDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<SupportTicketDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new SupportTicketDbContext(options);
    }

    // Business Rule 1: A Closed ticket cannot be edited.
    [Fact]
    public async Task UpdateTicket_WhenTicketIsClosed_ShouldThrowBusinessRuleException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "Closed Ticket Issue",
            Description = "Initial description",
            Priority = TicketPriority.Medium,
            Status = TicketStatus.Closed,
            CreatedDate = DateTime.UtcNow.AddDays(-5)
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var updateDto = new UpdateTicketDto
        {
            Title = "Attempted Update",
            Description = "Updated description",
            Priority = TicketPriority.High
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.UpdateTicketAsync(ticket.Id, updateDto));

        Assert.Equal("A Closed ticket cannot be edited.", ex.Message);
    }

    [Fact]
    public async Task ChangeStatus_WhenTicketIsClosed_ShouldThrowBusinessRuleException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "Closed Ticket Issue",
            Description = "Initial description",
            Priority = TicketPriority.Medium,
            Status = TicketStatus.Closed,
            CreatedDate = DateTime.UtcNow.AddDays(-5)
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var statusDto = new ChangeStatusDto
        {
            NewStatus = TicketStatus.Open,
            ChangedBy = "Support Lead"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.ChangeTicketStatusAsync(ticket.Id, statusDto));

        Assert.Contains("Closed ticket cannot be edited or transitioned", ex.Message);
    }

    // Business Rule 2: A Critical-priority ticket must have a due date.
    [Fact]
    public async Task CreateTicket_WhenCriticalWithoutDueDate_ShouldThrowBusinessRuleException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var dto = new CreateTicketDto
        {
            Title = "Critical Outage",
            Description = "Complete service outage",
            Priority = TicketPriority.Critical,
            DueDate = null
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.CreateTicketAsync(dto));

        Assert.Equal("A due date is required for Critical priority tickets.", ex.Message);
    }

    [Fact]
    public async Task UpdateTicket_WhenCriticalWithoutDueDate_ShouldThrowBusinessRuleException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "Standard Ticket",
            Description = "Normal priority ticket",
            Priority = TicketPriority.Low,
            Status = TicketStatus.Open,
            CreatedDate = DateTime.UtcNow.AddDays(-1)
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var updateDto = new UpdateTicketDto
        {
            Title = "Escalated Outage",
            Description = "Now critical outage",
            Priority = TicketPriority.Critical,
            DueDate = null // Missing due date
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.UpdateTicketAsync(ticket.Id, updateDto));

        Assert.Equal("A due date is required for Critical priority tickets.", ex.Message);
    }

    // Business Rule 3: A DueDate cannot be earlier than the ticket creation date.
    [Fact]
    public async Task CreateTicket_WhenDueDateEarlierThanCreation_ShouldThrowBusinessRuleException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var dto = new CreateTicketDto
        {
            Title = "Invalid Due Date Ticket",
            Description = "Due date in past",
            Priority = TicketPriority.High,
            DueDate = DateTime.UtcNow.AddDays(-2)
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.CreateTicketAsync(dto));

        Assert.Equal("Due date cannot be earlier than the ticket creation date.", ex.Message);
    }

    [Fact]
    public async Task UpdateTicket_WhenDueDateEarlierThanCreatedDate_ShouldThrowBusinessRuleException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "Existing Ticket",
            Description = "Existing description",
            Priority = TicketPriority.Medium,
            Status = TicketStatus.Open,
            CreatedDate = DateTime.UtcNow.AddDays(-3)
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var updateDto = new UpdateTicketDto
        {
            Title = "Updated Ticket",
            Description = "Updated description",
            Priority = TicketPriority.Medium,
            DueDate = DateTime.UtcNow.AddDays(-4) // Before CreatedDate
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.UpdateTicketAsync(ticket.Id, updateDto));

        Assert.Equal("Due date cannot be earlier than the ticket creation date.", ex.Message);
    }

    // Business Rule 4: A ticket cannot move directly from Open to Closed.
    [Fact]
    public async Task ChangeStatus_FromOpenToClosed_ShouldThrowBusinessRuleException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "Open Ticket",
            Description = "Still in open status",
            Priority = TicketPriority.Medium,
            Status = TicketStatus.Open,
            CreatedDate = DateTime.UtcNow
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var statusDto = new ChangeStatusDto
        {
            NewStatus = TicketStatus.Closed,
            ChangedBy = "Support Agent"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() =>
            service.ChangeTicketStatusAsync(ticket.Id, statusDto));

        Assert.Contains("A ticket cannot move directly from Open to Closed", ex.Message);
    }

    // Business Rule 5: When a ticket is moved to Resolved, store ResolvedDate.
    [Fact]
    public async Task ChangeStatus_ToResolved_ShouldSetResolvedDate()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "In Progress Bug",
            Description = "Being fixed",
            Priority = TicketPriority.High,
            Status = TicketStatus.InProgress,
            CreatedDate = DateTime.UtcNow.AddDays(-1),
            ResolvedDate = null
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var statusDto = new ChangeStatusDto
        {
            NewStatus = TicketStatus.Resolved,
            ChangedBy = "Developer Alex"
        };

        // Act
        var result = await service.ChangeTicketStatusAsync(ticket.Id, statusDto);

        // Assert
        Assert.Equal(TicketStatus.Resolved, result.Status);
        Assert.NotNull(result.ResolvedDate);

        var dbTicket = await context.Tickets.FindAsync(ticket.Id);
        Assert.NotNull(dbTicket!.ResolvedDate);
    }

    // Business Rule 6: When a resolved ticket is reopened, clear ResolvedDate.
    [Fact]
    public async Task ChangeStatus_ReopenResolvedTicket_ShouldClearResolvedDate()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "Previously Resolved Issue",
            Description = "Issue recurred",
            Priority = TicketPriority.Medium,
            Status = TicketStatus.Resolved,
            CreatedDate = DateTime.UtcNow.AddDays(-3),
            ResolvedDate = DateTime.UtcNow.AddDays(-1)
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var statusDto = new ChangeStatusDto
        {
            NewStatus = TicketStatus.InProgress,
            ChangedBy = "QA Tester"
        };

        // Act
        var result = await service.ChangeTicketStatusAsync(ticket.Id, statusDto);

        // Assert
        Assert.Equal(TicketStatus.InProgress, result.Status);
        Assert.Null(result.ResolvedDate);

        var dbTicket = await context.Tickets.FindAsync(ticket.Id);
        Assert.Null(dbTicket!.ResolvedDate);
    }

    // Business Rule 7: Every ticket status change must create a TicketStatusHistory record.
    [Fact]
    public async Task ChangeStatus_ShouldCreateTicketStatusHistoryRecord()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        var ticket = new Ticket
        {
            TicketNumber = "TKT-1001",
            Title = "Workflow Ticket",
            Description = "Testing history tracking",
            Priority = TicketPriority.Low,
            Status = TicketStatus.Open,
            CreatedDate = DateTime.UtcNow
        };
        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        var statusDto = new ChangeStatusDto
        {
            NewStatus = TicketStatus.InProgress,
            ChangedBy = "Engineer Sarah"
        };

        // Act
        await service.ChangeTicketStatusAsync(ticket.Id, statusDto);

        // Assert
        var historyRecords = await service.GetStatusHistoryByTicketIdAsync(ticket.Id);
        Assert.Single(historyRecords);

        var record = historyRecords[0];
        Assert.Equal(ticket.Id, record.TicketId);
        Assert.Equal(TicketStatus.Open, record.OldStatus);
        Assert.Equal(TicketStatus.InProgress, record.NewStatus);
        Assert.Equal("Engineer Sarah", record.ChangedBy);
    }

    [Fact]
    public async Task SearchAndFilter_ShouldReturnMatchingTickets()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var service = new TicketService(context);

        context.Tickets.AddRange(
            new Ticket { TicketNumber = "TKT-1001", Title = "Payment Gateway Failure", Description = "Stripe webhook", Priority = TicketPriority.Critical, Status = TicketStatus.Open, CreatedDate = DateTime.UtcNow },
            new Ticket { TicketNumber = "TKT-1002", Title = "UI Font Styling", Description = "Header typography", Priority = TicketPriority.Low, Status = TicketStatus.InProgress, CreatedDate = DateTime.UtcNow },
            new Ticket { TicketNumber = "TKT-1003", Title = "Payment Refund Error", Description = "PayPal integration", Priority = TicketPriority.High, Status = TicketStatus.Resolved, CreatedDate = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        // Search by "payment"
        var query = new TicketQueryParameters { Search = "payment" };
        var result = await service.GetTicketsAsync(query);

        Assert.Equal(2, result.TotalRecords);
        Assert.All(result.Items, item => Assert.Contains("payment", item.Title, StringComparison.OrdinalIgnoreCase));
    }
}
