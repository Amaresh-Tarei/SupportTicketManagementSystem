using System.ComponentModel.DataAnnotations;
using SupportTicketManagementSystem.API.Models.Enums;

namespace SupportTicketManagementSystem.API.DTOs.Tickets;

public class ChangeStatusDto
{
    [Required(ErrorMessage = "New status is required.")]
    public TicketStatus NewStatus { get; set; }

    [StringLength(100, ErrorMessage = "Changed by name cannot exceed 100 characters.")]
    public string? ChangedBy { get; set; }
}
