import React, { useState } from 'react';
import { TicketComment } from '../../types/comment';
import { formatDate } from '../../utils/formatters';
import { MessageSquare, Send, User } from 'lucide-react';
import { AlertBanner } from '../common/AlertBanner';

interface CommentSectionProps {
  comments: TicketComment[];
  isLoading: boolean;
  onAddComment: (commentText: string, createdBy: string) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  isLoading,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!commentText.trim()) {
      setError('Comment text cannot be empty.');
      return;
    }

    if (!createdBy.trim()) {
      setError('Please provide your name.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddComment(commentText.trim(), createdBy.trim());
      setCommentText('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to post comment.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="#2563eb" />
          <h3 className="card-title">Comments ({comments.length})</h3>
        </div>
      </div>

      <div className="card-body">
        {/* Comment list */}
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '0.875rem' }}>No comments yet. Start the conversation below.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                      }}
                    >
                      <User size={14} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                      {comment.createdBy}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {formatDate(comment.createdDate)}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#334155',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {comment.commentText}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>
            Add a Comment
          </h4>

          {error && (
            <AlertBanner
              type="danger"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label required">Your Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex Rivera"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Comment Message</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Write an internal note or update..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoading}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
