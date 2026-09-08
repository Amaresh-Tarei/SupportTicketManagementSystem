import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface AlertBannerProps {
  type?: 'danger' | 'warning' | 'success' | 'info';
  message: string;
  errors?: Record<string, string[]>;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'danger',
  message,
  errors,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={18} style={{ flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ flexShrink: 0 }} />;
      case 'success':
        return <CheckCircle2 size={18} style={{ flexShrink: 0 }} />;
      case 'info':
      default:
        return <Info size={18} style={{ flexShrink: 0 }} />;
    }
  };

  return (
    <div className={`alert alert-${type}`}>
      {getIcon()}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{message}</div>
        {errors && Object.keys(errors).length > 0 && (
          <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem', fontSize: '0.8rem' }}>
            {Object.entries(errors).map(([field, msgs]) => (
              <li key={field}>
                <strong>{field}:</strong> {msgs.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.7,
            padding: 0,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
