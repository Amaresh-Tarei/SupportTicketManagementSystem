import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { ticketService } from '../services/ticketService';
import { DashboardSummary } from '../types/dashboard';
import { Ticket } from '../types/ticket';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { formatDateOnly, isOverdue } from '../utils/formatters';
import {
  Ticket as TicketIcon,
  Clock,
  RefreshCw,
  CheckCircle2,
  CheckSquare,
  AlertTriangle,
  Flame,
  PlusCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigateTickets: () => void;
  onNavigateCreate: () => void;
  onViewTicket: (id: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTickets,
  onNavigateCreate,
  onViewTicket,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, ticketsData] = await Promise.all([
        dashboardService.getSummary(),
        ticketService.getTickets({ page: 1, pageSize: 5, sortBy: 'createddate', sortOrder: 'desc' }),
      ]);
      setSummary(summaryData);
      setRecentTickets(ticketsData.items);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load dashboard metrics.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Loading dashboard summary..." large />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Ticket Dashboard</h1>
          <p className="page-subtitle">
            System overview and real-time support operational metrics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadDashboardData}
            title="Refresh metrics"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateCreate}
          >
            <PlusCircle size={15} />
            <span>Create Ticket</span>
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

      {/* Summary Metrics Grid */}
      {summary && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <TicketIcon size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Tickets</span>
              <span className="metric-value">{summary.totalTickets}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <Clock size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Open</span>
              <span className="metric-value">{summary.openTickets}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ backgroundColor: '#fefce8', color: '#a16207' }}>
              <RefreshCw size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">In Progress</span>
              <span className="metric-value">{summary.inProgressTickets}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Resolved</span>
              <span className="metric-value">{summary.resolvedTickets}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
              <CheckSquare size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Closed</span>
              <span className="metric-value">{summary.closedTickets}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <Flame size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Critical</span>
              <span className="metric-value">{summary.criticalTickets}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap" style={{ backgroundColor: '#fff1f2', color: '#be123c' }}>
              <AlertTriangle size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Overdue</span>
              <span className="metric-value">{summary.overdueTickets}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Tickets Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Tickets</h3>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.1rem' }}>
              Most recently created support requests
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onNavigateTickets}
          >
            <span>View All Tickets</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>View</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No tickets available.
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <span
                        onClick={() => onViewTicket(ticket.id)}
                        style={{
                          fontWeight: 600,
                          color: '#2563eb',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                        }}
                      >
                        {ticket.ticketNumber}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}
                        onClick={() => onViewTicket(ticket.id)}
                      >
                        {ticket.title}
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td>
                      {ticket.assignedTo || (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{formatDateOnly(ticket.dueDate)}</span>
                        {isOverdue(ticket.dueDate, ticket.status) && (
                          <span className="badge-overdue">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {formatDateOnly(ticket.createdDate)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="View Ticket"
                        onClick={() => onViewTicket(ticket.id)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
