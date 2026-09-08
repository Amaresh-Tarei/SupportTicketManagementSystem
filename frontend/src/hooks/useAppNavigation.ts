import { useEffect, useState } from 'react';

export type RouteType =
  | { name: 'dashboard' }
  | { name: 'ticket-list' }
  | { name: 'create-ticket' }
  | { name: 'ticket-detail'; ticketId: number }
  | { name: 'edit-ticket'; ticketId: number };

function parseHash(hash: string): RouteType {
  const cleanHash = hash.replace(/^#\/?/, '').trim();

  if (!cleanHash || cleanHash === 'dashboard') {
    return { name: 'dashboard' };
  }

  if (cleanHash === 'tickets') {
    return { name: 'ticket-list' };
  }

  if (cleanHash === 'tickets/new') {
    return { name: 'create-ticket' };
  }

  const editMatch = cleanHash.match(/^tickets\/(\d+)\/edit$/);
  if (editMatch) {
    return { name: 'edit-ticket', ticketId: parseInt(editMatch[1], 10) };
  }

  const detailMatch = cleanHash.match(/^tickets\/(\d+)$/);
  if (detailMatch) {
    return { name: 'ticket-detail', ticketId: parseInt(detailMatch[1], 10) };
  }

  return { name: 'dashboard' };
}

export function useAppNavigation() {
  const [route, setRoute] = useState<RouteType>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToDashboard = () => {
    window.location.hash = '#/';
  };

  const navigateToTickets = () => {
    window.location.hash = '#/tickets';
  };

  const navigateToCreateTicket = () => {
    window.location.hash = '#/tickets/new';
  };

  const navigateToTicketDetail = (id: number) => {
    window.location.hash = `#/tickets/${id}`;
  };

  const navigateToEditTicket = (id: number) => {
    window.location.hash = `#/tickets/${id}/edit`;
  };

  return {
    route,
    navigateToDashboard,
    navigateToTickets,
    navigateToCreateTicket,
    navigateToTicketDetail,
    navigateToEditTicket,
  };
}
