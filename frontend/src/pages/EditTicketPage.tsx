import React, { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { Ticket, TicketPriority, UpdateTicketInput } from '../types/ticket';
import { AlertBanner } from '../components/common/AlertBanner';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft, Save, Lock } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface EditTicketPageProps {
  ticketId: number;
  onBack: () => void;
  onTicketUpdated: (id: number) => void;
}

export const EditTicketPage: React.FC<EditTicketPageProps> = ({
  ticketId,
  onBack,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<UpdateTicketInput>({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setIsLoading(true);
      setServerError(null);
      try {
        const data = await ticketService.getTicketById(ticketId);
        setTicket(data);
        setFormData({
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignedTo: data.assignedTo || '',
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setServerError(err.message);
        } else {
          setServerError('Failed to load ticket for editing.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required.';
    } else if (formData.title.length > 200) {
      errors.title = 'Title cannot exceed 200 characters.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required.';
    } else if (formData.description.length > 4000) {
      errors.description = 'Description cannot exceed 4000 characters.';
    }

    if (!formData.priority) {
      errors.priority = 'Priority is required.';
    }

    // Business Rule 2: Critical ticket must have a due date
    if (formData.priority === 'Critical' && !formData.dueDate) {
      errors.dueDate = 'Business Rule Violation: A due date is required for Critical priority tickets.';
    }

    // Business Rule 3: Due date cannot be earlier than ticket creation date
    if (formData.dueDate && ticket?.createdDate) {
      const selected = new Date(formData.dueDate);
      const created = new Date(ticket.createdDate);
      created.setHours(0, 0, 0, 0);

      if (selected < created) {
        errors.dueDate = `Business Rule Violation: Due date cannot be earlier than ticket creation date (${formatDate(ticket.createdDate)}).`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Business Rule 1 check: Closed ticket cannot be edited
    if (ticket?.status === 'Closed') {
      setServerError('Business Rule Violation: A Closed ticket cannot be edited.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await ticketService.updateTicket(ticketId, formData);
      onTicketUpdated(ticketId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Failed to update ticket.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading ticket details..." />;
  }

  const isClosed = ticket?.status === 'Closed';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Edit Ticket: {ticket?.ticketNumber}</h2>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.1rem' }}>
              Created on {formatDate(ticket?.createdDate)}
            </p>
          </div>
          {isClosed && (
            <span className="badge badge-status-closed" style={{ gap: '0.35rem' }}>
              <Lock size={13} />
              Closed (Read Only)
            </span>
          )}
        </div>

        <div className="card-body">
          {/* Business Rule 1 UI notice */}
          {isClosed && (
            <AlertBanner
              type="warning"
              message="This ticket is Closed. According to system business rules, Closed tickets are locked and cannot be edited."
            />
          )}

          {serverError && (
            <AlertBanner
              type="danger"
              message={serverError}
              onClose={() => setServerError(null)}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Title</label>
              <input
                type="text"
                className={`form-input ${fieldErrors.title ? 'is-invalid' : ''}`}
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
                }}
                disabled={isClosed}
              />
              {fieldErrors.title && <div className="form-error">{fieldErrors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required">Description</label>
              <textarea
                className={`form-textarea ${fieldErrors.description ? 'is-invalid' : ''}`}
                rows={4}
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
                }}
                disabled={isClosed}
              />
              {fieldErrors.description && (
                <div className="form-error">{fieldErrors.description}</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label required">Priority</label>
                <select
                  className={`form-select ${fieldErrors.priority ? 'is-invalid' : ''}`}
                  value={formData.priority}
                  onChange={(e) => {
                    const newPriority = e.target.value as TicketPriority;
                    setFormData({ ...formData, priority: newPriority });
                    if (fieldErrors.priority) setFieldErrors({ ...fieldErrors, priority: '' });
                    if (newPriority !== 'Critical' && fieldErrors.dueDate) {
                      setFieldErrors({ ...fieldErrors, dueDate: '' });
                    }
                  }}
                  disabled={isClosed}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Due date mandatory)</option>
                </select>
                {fieldErrors.priority && <div className="form-error">{fieldErrors.priority}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  disabled={isClosed}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className={`form-label ${formData.priority === 'Critical' ? 'required' : ''}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  className={`form-input ${fieldErrors.dueDate ? 'is-invalid' : ''}`}
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    if (fieldErrors.dueDate) setFieldErrors({ ...fieldErrors, dueDate: '' });
                  }}
                  disabled={isClosed}
                />
                {fieldErrors.dueDate ? (
                  <div className="form-error">{fieldErrors.dueDate}</div>
                ) : (
                  formData.priority === 'Critical' && (
                    <div className="form-help" style={{ color: '#dc2626' }}>
                      Required for Critical priority tickets.
                    </div>
                  )
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || isClosed}
              >
                <Save size={15} />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
