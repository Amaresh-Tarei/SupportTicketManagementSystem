using Microsoft.AspNetCore.Mvc;
using SupportTicketManagementSystem.API.DTOs.Comments;
using SupportTicketManagementSystem.API.DTOs.Common;
using SupportTicketManagementSystem.API.DTOs.History;
using SupportTicketManagementSystem.API.DTOs.Tickets;
using SupportTicketManagementSystem.API.Services;

namespace SupportTicketManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly ICommentService _commentService;

    public TicketsController(ITicketService ticketService, ICommentService commentService)
    {
        _ticketService = ticketService;
        _commentService = commentService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TicketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<TicketDto>>> GetAll([FromQuery] TicketQueryParameters queryParameters)
    {
        var result = await _ticketService.GetTicketsAsync(queryParameters);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> GetById(int id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);
        return Ok(ticket);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TicketDto>> Create([FromBody] CreateTicketDto dto)
    {
        var ticket = await _ticketService.CreateTicketAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> Update(int id, [FromBody] UpdateTicketDto dto)
    {
        var ticket = await _ticketService.UpdateTicketAsync(id, dto);
        return Ok(ticket);
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(TicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketDto>> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var ticket = await _ticketService.ChangeTicketStatusAsync(id, dto);
        return Ok(ticket);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await _ticketService.DeleteTicketAsync(id);
        return NoContent();
    }

    [HttpGet("{id:int}/comments")]
    [ProducesResponseType(typeof(IReadOnlyList<TicketCommentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<TicketCommentDto>>> GetComments(int id)
    {
        var comments = await _commentService.GetCommentsByTicketIdAsync(id);
        return Ok(comments);
    }

    [HttpPost("{id:int}/comments")]
    [ProducesResponseType(typeof(TicketCommentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketCommentDto>> AddComment(int id, [FromBody] CreateTicketCommentDto dto)
    {
        var comment = await _commentService.AddCommentAsync(id, dto);
        return CreatedAtAction(nameof(GetComments), new { id }, comment);
    }

    [HttpGet("{id:int}/status-history")]
    [ProducesResponseType(typeof(IReadOnlyList<TicketStatusHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<TicketStatusHistoryDto>>> GetStatusHistory(int id)
    {
        var history = await _ticketService.GetStatusHistoryByTicketIdAsync(id);
        return Ok(history);
    }
}
