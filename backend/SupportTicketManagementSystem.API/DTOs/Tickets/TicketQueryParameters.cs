using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.DTOs.Tickets;

public class TicketQueryParameters
{
    private const int MaxPageSize = 100;
    private int _page = 1;
    private int _pageSize = 10;

    public string? Search { get; set; }
    public TicketStatus? Status { get; set; }
    public TicketPriority? Priority { get; set; }
    public string? AssignedTo { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 10 : value);
    }

    public string? SortBy { get; set; } = "CreatedDate";
    public string? SortOrder { get; set; } = "desc";
}
