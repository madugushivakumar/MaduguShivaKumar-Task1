import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Sparkles, Crown } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'neutral', // 'completed' | 'in-progress' | 'pending' | 'overdue' | 'upcoming' | 'leader' | 'academic' | 'stamp' | 'stamp-navy' | 'neutral'
  size = 'sm', // 'xs' | 'sm' | 'md'
  icon = true,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs font-bold',
  };

  const variantStyles = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'in-progress': 'bg-[#EFF6FF] text-[#1557D6] border-[#BFDBFE]',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    upcoming: 'bg-slate-50 text-slate-700 border-slate-200',
    leader: 'bg-amber-100/70 text-amber-800 border-amber-300 font-bold',
    academic: 'bg-[#1557D6] text-white border-transparent font-bold',
    neutral: 'bg-[#FAF8F5] text-[#475569] border-[#D9D5CA]',
    stamp: 'rubber-stamp px-2.5 py-1 text-[11px] bg-white/90',
    'stamp-navy': 'rubber-stamp-navy px-2.5 py-1 text-[11px] bg-white/90',
  };

  const getIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    switch (variant) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 flex-shrink-0" />;
      case 'in-progress':
        return <span className="w-1.5 h-1.5 rounded-full bg-[#1557D6] animate-pulse flex-shrink-0" />;
      case 'pending':
        return <Clock className="w-3 h-3 flex-shrink-0" />;
      case 'overdue':
        return <AlertCircle className="w-3 h-3 flex-shrink-0" />;
      case 'leader':
        return <Crown className="w-3 h-3 text-amber-600 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${
        sizeStyles[size] || sizeStyles.sm
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
      {...props}
    >
      {getIcon()}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
