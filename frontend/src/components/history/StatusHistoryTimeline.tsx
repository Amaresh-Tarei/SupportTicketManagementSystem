import React from 'react';
import { TicketStatusHistory } from '../../types/history';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';
import { History, ArrowRight } from 'lucide-react';

interface StatusHistoryTimelineProps {
  history: TicketStatusHistory[];
}

export const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({ history }) => {
  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="#2563eb" />
          <h3 className="card-title">Status Transition Audit Trail ({history.length})</h3>
        </div>
      </div>

      <div className="card-body">
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '0.875rem' }}>
              No status transitions recorded yet. The ticket remains in its original created state.
            </p>
          </div>
        ) : (
          <div className="timeline">
            {history.map((record) => (
              <div key={record.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-header">
                  <StatusBadge status={record.oldStatus} />
                  <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                  <StatusBadge status={record.newStatus} />
                </div>
                <div className="timeline-meta">
                  <span>Changed by <strong>{record.changedBy}</strong></span>
                  <span style={{ margin: '0 0.35rem' }}>•</span>
                  <span>{formatDate(record.changedDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
