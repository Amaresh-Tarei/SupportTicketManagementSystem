using SupportTicketManagementSystem.API.DTOs.Dashboard;

namespace SupportTicketManagementSystem.API.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
}
