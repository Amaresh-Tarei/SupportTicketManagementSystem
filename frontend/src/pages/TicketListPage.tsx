import React, { useEffect, useState } from 'react';
import { ticketService } from '../services/ticketService';
import { PagedResult, Ticket, TicketQueryParams, TicketStatus } from '../types/ticket';
import { TicketFilterBar } from '../components/tickets/TicketFilterBar';
import { TicketTable } from '../components/tickets/TicketTable';
import { Pagination } from '../components/common/Pagination';
import { StatusChangeModal } from '../components/tickets/StatusChangeModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AlertBanner } from '../components/common/AlertBanner';
import { PlusCircle, RefreshCw } from 'lucide-react';

interface TicketListPageProps {
  onNavigateCreate: () => void;
  onViewTicket: (id: number) => void;
  onEditTicket: (id: number) => void;
}

export const TicketListPage: React.FC<TicketListPageProps> = ({
  onNavigateCreate,
  onViewTicket,
  onEditTicket,
}) => {
  const [result, setResult] = useState<PagedResult<Ticket>>({
    items: [],
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [queryParams, setQueryParams] = useState<TicketQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createddate',
    sortOrder: 'desc',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change Modal state
  const [statusModalTicket, setStatusModalTicket] = useState<Ticket | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete Confirmation Modal state
  const [deleteModalData, setDeleteModalData] = useState<{ id: number; ticketNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTickets = async (params: TicketQueryParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTickets(params);
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch tickets.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(queryParams);
  }, [queryParams]);

  const handleFilterChange = (newFilters: TicketQueryParams) => {
    setQueryParams((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setQueryParams({
      page: 1,
      pageSize: queryParams.pageSize || 10,
      sortBy: 'createddate',
      sortOrder: 'desc',
    });
  };

  const handleSort = (field: string) => {
    setQueryParams((prev) => {
      const isSameField = prev.sortBy?.toLowerCase() === field.toLowerCase();
      const newOrder = isSameField && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        sortBy: field,
        sortOrder: newOrder,
        page: 1,
      };
    });
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setQueryParams((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1,
    }));
  };

  const handleStatusChangeSubmit = async (newStatus: TicketStatus, changedBy: string) => {
    if (!statusModalTicket) return;

    setIsUpdatingStatus(true);
    try {
      await ticketService.changeTicketStatus(statusModalTicket.id, {
        newStatus,
        changedBy,
      });
      setStatusModalTicket(null);
      await fetchTickets(queryParams);
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalData) return;

    setIsDeleting(true);
    try {
      await ticketService.deleteTicket(deleteModalData.id);
      setDeleteModalData(null);
      await fetchTickets(queryParams);
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">
            Manage, filter, and track support requests across all queues
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchTickets(queryParams)}
            title="Refresh ticket list"
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
            <span>New Ticket</span>
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

      {/* Filter Component */}
      <TicketFilterBar
        initialFilters={queryParams}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table & Pagination */}
      {isLoading ? (
        <LoadingSpinner label="Loading tickets..." />
      ) : (
        <>
          <TicketTable
            tickets={result.items}
            sortBy={queryParams.sortBy}
            sortOrder={queryParams.sortOrder}
            onSort={handleSort}
            onView={onViewTicket}
            onEdit={onEditTicket}
            onChangeStatus={(ticket) => setStatusModalTicket(ticket)}
            onDelete={(id, ticketNumber) => setDeleteModalData({ id, ticketNumber })}
          />

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            totalRecords={result.totalRecords}
            totalPages={result.totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Status Change Quick Modal */}
      <StatusChangeModal
        isOpen={statusModalTicket !== null}
        ticket={statusModalTicket}
        isLoading={isUpdatingStatus}
        onClose={() => setStatusModalTicket(null)}
        onSubmit={handleStatusChangeSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalData !== null}
        title="Confirm Ticket Deletion"
        message={`Are you sure you want to permanently delete ticket ${deleteModalData?.ticketNumber}? This will remove all associated comments and status audit history records. This action cannot be undone.`}
        confirmLabel="Delete Ticket"
        cancelLabel="Cancel"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalData(null)}
      />
    </div>
  );
};
