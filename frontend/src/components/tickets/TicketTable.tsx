import React from 'react';
import { Ticket } from '../../types/ticket';
import { formatDateOnly, isOverdue } from '../../utils/formatters';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import {
  Eye,
  Edit2,
  Trash2,
  ArrowRightCircle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Inbox,
} from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onChangeStatus: (ticket: Ticket) => void;
  onDelete: (id: number, ticketNumber: string) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  sortBy = 'createddate',
  sortOrder = 'desc',
  onSort,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}) => {
  const renderSortIcon = (field: string) => {
    if (sortBy?.toLowerCase() !== field.toLowerCase()) {
      return <ArrowUpDown size={13} style={{ opacity: 0.4, marginLeft: '4px' }} />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={14} style={{ color: '#2563eb', marginLeft: '4px' }} />
    ) : (
      <ChevronDown size={14} style={{ color: '#2563eb', marginLeft: '4px' }} />
    );
  };

  if (tickets.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <Inbox className="empty-state-icon" />
          <h4 className="empty-state-title">No tickets found</h4>
          <p className="empty-state-desc">
            No support tickets matched your search or filter criteria. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => onSort('ticketnumber')}>
              Ticket #{renderSortIcon('ticketnumber')}
            </th>
            <th className="sortable" onClick={() => onSort('title')}>
              Title{renderSortIcon('title')}
            </th>
            <th className="sortable" onClick={() => onSort('priority')}>
              Priority{renderSortIcon('priority')}
            </th>
            <th className="sortable" onClick={() => onSort('status')}>
              Status{renderSortIcon('status')}
            </th>
            <th className="sortable" onClick={() => onSort('assignedto')}>
              Assigned To{renderSortIcon('assignedto')}
            </th>
            <th className="sortable" onClick={() => onSort('duedate')}>
              Due Date{renderSortIcon('duedate')}
            </th>
            <th className="sortable" onClick={() => onSort('createddate')}>
              Created{renderSortIcon('createddate')}
            </th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const ticketIsClosed = ticket.status === 'Closed';
            const ticketIsOverdue = isOverdue(ticket.dueDate, ticket.status);

            return (
              <tr key={ticket.id}>
                <td>
                  <span
                    onClick={() => onView(ticket.id)}
                    style={{
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                    }}
                    title="View details"
                  >
                    {ticket.ticketNumber}
                  </span>
                </td>
                <td style={{ maxWidth: '280px' }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}
                    onClick={() => onView(ticket.id)}
                  >
                    {ticket.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ticket.description}
                  </div>
                </td>
                <td>
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td>
                  <StatusBadge status={ticket.status} />
                </td>
                <td>
                  {ticket.assignedTo ? (
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {ticket.assignedTo}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                      Unassigned
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{formatDateOnly(ticket.dueDate)}</span>
                    {ticketIsOverdue && (
                      <span className="badge-overdue" title="Overdue">
                        Overdue
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {formatDateOnly(ticket.createdDate)}
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      title="View Ticket"
                      onClick={() => onView(ticket.id)}
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      className="btn-icon"
                      title={ticketIsClosed ? 'Closed tickets cannot be edited' : 'Edit Ticket'}
                      onClick={() => onEdit(ticket.id)}
                      disabled={ticketIsClosed}
                      style={{ opacity: ticketIsClosed ? 0.35 : 1 }}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      className="btn-icon"
                      title={ticketIsClosed ? 'Closed tickets cannot change status' : 'Change Status'}
                      onClick={() => onChangeStatus(ticket)}
                      disabled={ticketIsClosed}
                      style={{ opacity: ticketIsClosed ? 0.35 : 1 }}
                    >
                      <ArrowRightCircle size={15} />
                    </button>

                    <button
                      type="button"
                      className="btn-icon"
                      title="Delete Ticket"
                      onClick={() => onDelete(ticket.id, ticket.ticketNumber)}
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
