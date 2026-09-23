import React from 'react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'There are currently no records to display.',
  actionLabel,
  onAction,
  actionIcon,
  actionTo,
  className = '',
}) => {
  return (
    <div className={`paper-card p-10 sm:p-14 text-center flex flex-col items-center justify-center max-w-xl mx-auto ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#D9D5CA] text-[#1557D6] flex items-center justify-center mb-4 shadow-paper-sm">
          {React.isValidElement(Icon) ? Icon : <Icon className="w-7 h-7" />}
        </div>
      )}

      <h3 className="text-lg font-bold text-[#172033] font-display tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {(actionLabel && onAction) && (
        <div className="mt-6">
          <Button onClick={onAction} icon={actionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
