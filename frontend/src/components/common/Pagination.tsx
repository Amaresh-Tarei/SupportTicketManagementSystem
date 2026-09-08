import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalRecords,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalRecords === 0) return null;

  const startEntry = (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, totalRecords);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of{' '}
        <strong>{totalRecords}</strong> results
      </div>

      <div className="pagination-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Per page:</span>
          <select
            className="form-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={15} />
          <span>Prev</span>
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 500, padding: '0 0.5rem' }}>
          Page {page} of {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <span>Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
