import React from 'react';
import { Check, Clock, AlertTriangle, Layers, PlayCircle } from 'lucide-react';

/**
 * Reusable StatusBadge Component
 * Displays distinct visual styling and accessible labels for coursework & group statuses
 */
export const StatusBadge = ({ status = 'PENDING', customLabel, size = 'sm', className = '' }) => {
  const normalized = String(status).toUpperCase();

  const configs = {
    COMPLETED: {
      label: customLabel || '✓ Completed',
      icon: Check,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    CONFIRMED: {
      label: customLabel || '✓ Completed',
      icon: Check,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    PENDING: {
      label: customLabel || '⏳ Pending',
      icon: Clock,
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    OVERDUE: {
      label: customLabel || '⚠ Overdue',
      icon: AlertTriangle,
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
    IN_PROGRESS: {
      label: customLabel || 'In Progress',
      icon: PlayCircle,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
    },
    NOT_STARTED: {
      label: customLabel || 'Not Started',
      icon: Layers,
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[normalized] || configs.PENDING;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 font-bold',
    md: 'text-xs px-3 py-1 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${config.bg} ${sizeClasses[size] || sizeClasses.sm} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
