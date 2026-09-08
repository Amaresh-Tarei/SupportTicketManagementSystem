import React, { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { commentService } from '../services/commentService';
import { Ticket, TicketStatus } from '../types/ticket';
import { TicketComment } from '../types/comment';
import { TicketStatusHistory } from '../types/history';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { CommentSection } from '../components/comments/CommentSection';
import { StatusHistoryTimeline } from '../components/history/StatusHistoryTimeline';
import { StatusChangeModal } from '../components/tickets/StatusChangeModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';
import { formatDate, formatDateOnly, isOverdue } from '../utils/formatters';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  ArrowRightCircle,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface TicketDetailPageProps {
  ticketId: number;
  onBack: () => void;
  onEditTicket: (id: number) => void;
  onTicketDeleted: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticketId,
  onBack,
  onEditTicket,
  onTicketDeleted,
}) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [statusHistory, setStatusHistory] = useState<TicketStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTicketDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ticketData, commentsData, historyData] = await Promise.all([
        ticketService.getTicketById(ticketId),
        commentService.getComments(ticketId),
        ticketService.getStatusHistory(ticketId),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
      setStatusHistory(historyData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load ticket details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const handleStatusChangeSubmit = async (newStatus: TicketStatus, changedBy: string) => {
    setIsUpdatingStatus(true);
    try {
      await ticketService.changeTicketStatus(ticketId, { newStatus, changedBy });
      setIsStatusModalOpen(false);
      await loadTicketDetails();
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async (commentText: string, createdBy: string) => {
    const newComment = await commentService.addComment(ticketId, {
      commentText,
      createdBy,
    });
    setComments((prev) => [...prev, newComment]);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await ticketService.deleteTicket(ticketId);
      setIsDeleteModalOpen(false);
      onTicketDeleted();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete ticket.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading ticket details..." large />;
  }

  if (!ticket) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Tickets</span>
        </button>
        <div style={{ marginTop: '1.5rem' }}>
          <AlertBanner type="danger" message={error || 'Ticket not found.'} />
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === 'Closed';
  const ticketIsOverdue = isOverdue(ticket.dueDate, ticket.status);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top action header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Tickets</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsStatusModalOpen(true)}
            disabled={isClosed}
            title={isClosed ? 'Closed tickets cannot transition' : 'Change Status'}
          >
            <ArrowRightCircle size={14} />
            <span>Update Status</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onEditTicket(ticket.id)}
            disabled={isClosed}
            title={isClosed ? 'Closed tickets cannot be edited' : 'Edit Ticket'}
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ color: '#dc2626' }}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {error && (
        <AlertBanner
          type="danger"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Main Ticket Information Card */}
      <div className="card">
        <div className="card-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#2563eb' }}>
                {ticket.ticketNumber}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              {ticketIsOverdue && (
                <span className="badge-overdue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertTriangle size={12} />
                  Overdue
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
              {ticket.title}
            </h2>
          </div>
        </div>

        <div className="card-body">
          {/* Metadata Grid */}
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Assigned To</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} color="#64748b" />
                <span className="detail-value">
                  {ticket.assignedTo || <em style={{ color: '#94a3b8' }}>Unassigned</em>}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Created Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="#64748b" />
                <span className="detail-value">{formatDate(ticket.createdDate)}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Due Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} color="#64748b" />
                <span className="detail-value">
                  {ticket.dueDate ? formatDateOnly(ticket.dueDate) : <em style={{ color: '#94a3b8' }}>None</em>}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Resolved Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={15} color={ticket.resolvedDate ? '#059669' : '#94a3b8'} />
                <span className="detail-value">
                  {ticket.resolvedDate ? (
                    formatDate(ticket.resolvedDate)
                  ) : (
                    <em style={{ color: '#94a3b8' }}>Not resolved</em>
                  )}
                </span>
              </div>
            </div>

            {ticket.updatedDate && (
              <div className="detail-item">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value">{formatDate(ticket.updatedDate)}</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <span className="detail-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Description
            </span>
            <div
              style={{
                fontSize: '0.925rem',
                color: '#334155',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #f1f5f9',
              }}
            >
              {ticket.description}
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Status Audit History */}
      <StatusHistoryTimeline history={statusHistory} />

      {/* Comments Section */}
      <CommentSection
        comments={comments}
        isLoading={isLoading}
        onAddComment={handleAddComment}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={isStatusModalOpen}
        ticket={ticket}
        isLoading={isUpdatingStatus}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusChangeSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Ticket"
        message={`Are you sure you want to delete ${ticket.ticketNumber}? All comments and status history entries will be permanently deleted.`}
        confirmLabel="Delete Ticket"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
