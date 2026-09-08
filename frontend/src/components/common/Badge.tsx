import React from 'react';
import { TicketPriority, TicketStatus } from '../../types/ticket';
import {
  formatStatusLabel,
  getPriorityBadgeClasses,
  getStatusBadgeClasses,
} from '../../utils/formatters';

interface StatusBadgeProps {
  status: TicketStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`badge ${getStatusBadgeClasses(status)}`}>
      {formatStatusLabel(status)}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TicketPriority | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <span className={`badge ${getPriorityBadgeClasses(priority)}`}>
      {priority}
    </span>
  );
};
