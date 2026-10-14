import React from 'react';
import { Clock, Eye, Award, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  Applied: {
    label: 'Applied',
    icon: Clock,
    bg: 'var(--primary-50, #eff6ff)',
    color: 'var(--primary, #2563eb)',
    border: 'var(--primary-light, #bfdbfe)',
  },
  Reviewing: {
    label: 'Under Review',
    icon: Eye,
    bg: '#fef3c7',
    color: '#d97706',
    border: '#fde68a',
  },
  Shortlisted: {
    label: 'Shortlisted',
    icon: Award,
    bg: '#f3e8ff',
    color: '#7c3aed',
    border: '#ddd6fe',
  },
  Selected: {
    label: 'Selected / Hired',
    icon: CheckCircle2,
    bg: '#dcfce7',
    color: '#15803d',
    border: '#bbf7d0',
  },
  Rejected: {
    label: 'Not Selected',
    icon: XCircle,
    bg: '#fee2e2',
    color: '#b91c1c',
    border: '#fecaca',
  },
};

const StatusBadge = ({ status, size = 'normal', showIcon = true }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
  const Icon = config.icon;

  const isSmall = size === 'small';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.3rem' : '0.45rem',
        padding: isSmall ? '0.2rem 0.55rem' : '0.35rem 0.75rem',
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: isSmall ? '0.75rem' : '0.85rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      {showIcon && <Icon size={isSmall ? 13 : 15} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
