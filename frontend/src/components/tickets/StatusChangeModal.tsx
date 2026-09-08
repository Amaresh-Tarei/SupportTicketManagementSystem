import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../../types/ticket';
import { formatStatusLabel } from '../../utils/formatters';
import { X, ArrowRightCircle } from 'lucide-react';
import { AlertBanner } from '../common/AlertBanner';

interface StatusChangeModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (newStatus: TicketStatus, changedBy: string) => Promise<void>;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  ticket,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('InProgress');
  const [changedBy, setChangedBy] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (ticket.status === selectedStatus) {
      setValidationError(`Ticket is already in '${formatStatusLabel(selectedStatus)}' status.`);
      return;
    }

    // Business Rule 4 validation: Open -> Closed forbidden
    if (ticket.status === 'Open' && selectedStatus === 'Closed') {
      setValidationError('Business Rule Violation: A ticket cannot move directly from Open to Closed. Move to In Progress or Resolved first.');
      return;
    }

    try {
      await onSubmit(selectedStatus, changedBy.trim() || 'Support Agent');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightCircle size={18} color="#2563eb" />
            <h3 className="modal-title">Update Status: {ticket.ticketNumber}</h3>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {validationError && (
              <AlertBanner
                type="danger"
                message={validationError}
                onClose={() => setValidationError(null)}
              />
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>Current Status:</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                {formatStatusLabel(ticket.status)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">New Status</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as TicketStatus);
                  setValidationError(null);
                }}
              >
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              {ticket.status === 'Open' && (
                <div className="form-help" style={{ color: '#d97706' }}>
                  Note: Moving directly from Open to Closed is prohibited by business rules.
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Changed By</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name (e.g., Alex Rivera)"
                value={changedBy}
                onChange={(e) => setChangedBy(e.target.value)}
              />
              <div className="form-help">
                Used to log this transition in the ticket audit history.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
