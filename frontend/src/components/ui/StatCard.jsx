import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue', // 'blue' | 'green' | 'amber' | 'rose' | 'neutral'
  className = '',
}) => {
  const iconVariants = {
    blue: 'bg-[#EFF6FF] text-[#1557D6] border-[#BFDBFE]',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-[#FAF8F5] text-[#172033] border-[#D9D5CA]',
  };

  const valueColors = {
    blue: 'text-[#172033]',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
    rose: 'text-rose-700',
    neutral: 'text-[#172033]',
  };

  return (
    <div className={`paper-card p-4 sm:p-5 bg-white flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
              iconVariants[variant] || iconVariants.blue
            }`}
          >
            {React.isValidElement(Icon) ? Icon : <Icon className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${valueColors[variant] || valueColors.blue}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-[#64748B] mt-1 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
