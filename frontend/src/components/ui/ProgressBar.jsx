import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  color = 'blue', // 'blue' | 'green' | 'amber' | 'rose'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorStyles = {
    blue: 'bg-[#1557D6]',
    green: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-semibold text-[#172033]">{label}</span>}
          {showPercentage && (
            <span className="font-mono font-bold text-[#64748B] ml-auto">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-[#FAF8F5] border border-[#D9D5CA] rounded-full overflow-hidden p-0.5 ${
          heightStyles[size] || heightStyles.md
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            colorStyles[color] || colorStyles.blue
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
