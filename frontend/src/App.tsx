import React from 'react';
import { useAppNavigation } from './hooks/useAppNavigation';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TicketListPage } from './pages/TicketListPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { EditTicketPage } from './pages/EditTicketPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

export const App: React.FC = () => {
  const {
    route,
    navigateToDashboard,
    navigateToTickets,
    navigateToCreateTicket,
    navigateToTicketDetail,
    navigateToEditTicket,
  } = useAppNavigation();

  return (
    <div className="app-container">
      <Navbar
        currentRoute={route}
        onNavigateDashboard={navigateToDashboard}
        onNavigateTickets={navigateToTickets}
        onNavigateCreate={navigateToCreateTicket}
      />

      <main className="main-content">
        {route.name === 'dashboard' && (
          <DashboardPage
            onNavigateTickets={navigateToTickets}
            onNavigateCreate={navigateToCreateTicket}
            onViewTicket={navigateToTicketDetail}
          />
        )}

        {route.name === 'ticket-list' && (
          <TicketListPage
            onNavigateCreate={navigateToCreateTicket}
            onViewTicket={navigateToTicketDetail}
            onEditTicket={navigateToEditTicket}
          />
        )}

        {route.name === 'create-ticket' && (
          <CreateTicketPage
            onBack={navigateToTickets}
            onTicketCreated={(id) => navigateToTicketDetail(id)}
          />
        )}

        {route.name === 'edit-ticket' && (
          <EditTicketPage
            ticketId={route.ticketId}
            onBack={() => navigateToTicketDetail(route.ticketId)}
            onTicketUpdated={(id) => navigateToTicketDetail(id)}
          />
        )}

        {route.name === 'ticket-detail' && (
          <TicketDetailPage
            ticketId={route.ticketId}
            onBack={navigateToTickets}
            onEditTicket={navigateToEditTicket}
            onTicketDeleted={navigateToTickets}
          />
        )}
      </main>

      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#94a3b8',
          backgroundColor: '#ffffff',
        }}
      >
        Support Ticket Management System • Enterprise IT Operations
      </footer>
    </div>
  );
};
