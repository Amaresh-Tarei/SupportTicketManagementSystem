import React, { useState } from 'react';
import { TicketQueryParams } from '../../types/ticket';
import { Search, RotateCcw, Filter } from 'lucide-react';

interface TicketFilterBarProps {
  initialFilters: TicketQueryParams;
  onFilterChange: (filters: TicketQueryParams) => void;
  onReset: () => void;
}

export const TicketFilterBar: React.FC<TicketFilterBarProps> = ({
  initialFilters,
  onFilterChange,
  onReset,
}) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || '');
  const [priority, setPriority] = useState(initialFilters.priority || '');
  const [assignedTo, setAssignedTo] = useState(initialFilters.assignedTo || '');
  const [fromDate, setFromDate] = useState(initialFilters.fromDate || '');
  const [toDate, setToDate] = useState(initialFilters.toDate || '');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...initialFilters,
      search: search.trim() || undefined,
      status: status || undefined,
      priority: priority || undefined,
      assignedTo: assignedTo.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page: 1, // Reset to page 1 on filter
    });
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setAssignedTo('');
    setFromDate('');
    setToDate('');
    onReset();
  };

  return (
    <form className="filter-bar" onSubmit={handleApply}>
      <div className="filter-row">
        <div className="filter-col" style={{ flex: 2, minWidth: '220px' }}>
          <label className="form-label">Search</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
          </div>
        </div>

        <div className="filter-col">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="filter-col">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="filter-col">
          <label className="form-label">Assigned User</label>
          <input
            type="text"
            className="form-input"
            placeholder="Filter by name..."
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-col">
          <label className="form-label">Created From</label>
          <input
            type="date"
            className="form-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-col">
          <label className="form-label">Created To</label>
          <input
            type="date"
            className="form-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div
          className="filter-col"
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            flex: 'none',
          }}
        >
          <button type="submit" className="btn btn-primary">
            <Filter size={15} />
            <span>Apply Filters</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </form>
  );
};
