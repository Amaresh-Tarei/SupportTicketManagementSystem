import React from 'react';
import { RouteType } from '../../hooks/useAppNavigation';
import { Ticket as TicketIcon, LayoutDashboard, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentRoute: RouteType;
  onNavigateDashboard: () => void;
  onNavigateTickets: () => void;
  onNavigateCreate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigateDashboard,
  onNavigateTickets,
  onNavigateCreate,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={onNavigateDashboard}>
          <div className="brand-icon">
            <TicketIcon size={18} />
          </div>
          <span>Support Desk</span>
        </div>

        <nav className="navbar-nav">
          <button
            type="button"
            className={`nav-link ${currentRoute.name === 'dashboard' ? 'active' : ''}`}
            onClick={onNavigateDashboard}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-link ${
              currentRoute.name === 'ticket-list' ||
              currentRoute.name === 'ticket-detail' ||
              currentRoute.name === 'edit-ticket'
                ? 'active'
                : ''
            }`}
            onClick={onNavigateTickets}
          >
            <TicketIcon size={16} />
            <span>Tickets</span>
          </button>

          <button
            type="button"
            className={`nav-link ${currentRoute.name === 'create-ticket' ? 'active' : ''}`}
            onClick={onNavigateCreate}
          >
            <PlusCircle size={16} />
            <span>Create Ticket</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
