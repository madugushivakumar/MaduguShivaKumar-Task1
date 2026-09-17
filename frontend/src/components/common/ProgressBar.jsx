import React from 'react';

/**
 * Reusable Accessible ProgressBar Component
 *
 * Enforces strict 0–100 bounds, screen reader attributes, responsive width,
 * customizable size & color gradients, and safe empty state rendering.
 */
export const ProgressBar = ({
  value = 0,
  size = 'md',
  color = 'dynamic',
  showLabel = true,
  label,
  emptyText,
  completed,
  total,
  className = '',
}) => {
  // Clamp value strictly between 0 and 100
  const numericValue = Number(value);
  const clampedValue = isNaN(numericValue)
    ? 0
    : Math.min(100, Math.max(0, Math.round(numericValue)));

  // Size styles
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Color resolver
  const getColorClasses = () => {
    if (color === 'emerald') {
      return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    }
    if (color === 'indigo') {
      return 'bg-gradient-to-r from-indigo-500 to-indigo-600';
    }
    if (color === 'amber') {
      return 'bg-gradient-to-r from-amber-400 to-amber-500';
    }

    // Dynamic color gradient based on percentage completion
    if (clampedValue === 100) {
      return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    }
    if (clampedValue >= 50) {
      return 'bg-gradient-to-r from-indigo-500 to-indigo-600';
    }
    if (clampedValue > 0) {
      return 'bg-gradient-to-r from-amber-400 to-amber-500';
    }
    return 'bg-slate-300';
  };

  const isZeroTotal = total !== undefined && total === 0;

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600 truncate">
            {label ? (
              label
            ) : isZeroTotal && emptyText ? (
              <span className="text-slate-400 italic">{emptyText}</span>
            ) : completed !== undefined && total !== undefined ? (
              <span>
                {completed} / {total} assignments completed
              </span>
            ) : (
              <span>Progress</span>
            )}
          </span>

          <span
            className={`font-mono font-bold ${
              clampedValue === 100
                ? 'text-emerald-700'
                : clampedValue > 0
                ? 'text-indigo-700'
                : 'text-slate-400'
            }`}
          >
            {clampedValue}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={label || `${clampedValue}% completed`}
        className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 p-0.5 ${sizeClasses[size] || sizeClasses.md}`}
      >
        <div
          style={{ width: `${clampedValue}%` }}
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClasses()}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
