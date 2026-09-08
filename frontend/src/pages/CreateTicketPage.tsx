import React, { useState } from 'react';
import { ticketService } from '../services/ticketService';
import { CreateTicketInput, TicketPriority, TicketStatus } from '../types/ticket';
import { AlertBanner } from '../components/common/AlertBanner';
import { ArrowLeft, Save } from 'lucide-react';

interface CreateTicketPageProps {
  onBack: () => void;
  onTicketCreated: (id: number) => void;
}

export const CreateTicketPage: React.FC<CreateTicketPageProps> = ({
  onBack,
  onTicketCreated,
}) => {
  const [formData, setFormData] = useState<CreateTicketInput>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignedTo: '',
    dueDate: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Business Rule 2: Critical priority ticket must have a due date
    if (formData.priority === 'Critical' && !formData.dueDate) {
      errors.dueDate = 'Business Rule Violation: A due date is required for Critical priority tickets.';
    }

    // Business Rule 3: Due date cannot be earlier than creation date (today)
    if (formData.dueDate) {
      const selected = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        errors.dueDate = 'Business Rule Violation: Due date cannot be earlier than today.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await ticketService.createTicket(formData);
      onTicketCreated(created.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred while creating the ticket.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onBack}
        >
          <ArrowLeft size={14} />
          <span>Back to Tickets</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Create New Ticket</h2>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.1rem' }}>
              Fill in the details below. Critical tickets require an assigned due date.
            </p>
          </div>
        </div>

        <div className="card-body">
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
                placeholder="Brief summary of the issue or request"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
                }}
              />
              {fieldErrors.title && <div className="form-error">{fieldErrors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required">Description</label>
              <textarea
                className={`form-textarea ${fieldErrors.description ? 'is-invalid' : ''}`}
                rows={4}
                placeholder="Provide comprehensive details, reproduction steps, or context..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
                }}
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
                    // Clear due date error if no longer critical
                    if (newPriority !== 'Critical' && fieldErrors.dueDate) {
                      setFieldErrors({ ...fieldErrors, dueDate: '' });
                    }
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical (Due date mandatory)</option>
                </select>
                {fieldErrors.priority && <div className="form-error">{fieldErrors.priority}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })}
                >
                  <option value="Open">Open</option>
                  <option value="InProgress">In Progress</option>
                </select>
                <div className="form-help">New tickets typically begin as Open.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Assigned To</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. David Chen"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                />
              </div>

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
                disabled={isSubmitting}
              >
                <Save size={15} />
                <span>{isSubmitting ? 'Creating...' : 'Create Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
