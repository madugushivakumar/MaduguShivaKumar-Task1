import React from 'react';

export const Card = ({
  children,
  className = '',
  elevated = false,
  warm = false,
  sticky = false,
  stickyOrange = false,
  padding = 'p-5 sm:p-6',
  ...props
}) => {
  let styleClass = 'paper-card';
  if (elevated) styleClass = 'paper-card-elevated';
  if (warm) styleClass = 'paper-card-warm';
  if (sticky) styleClass = 'sticky-note';
  if (stickyOrange) styleClass = 'sticky-note-orange';

  return (
    <div className={`${styleClass} ${padding} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, icon: Icon, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#D9D5CA]/70 ${className}`}>
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1557D6] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="min-w-0">
        {title && (
          <h3 className="text-base font-bold text-[#172033] font-display tracking-tight truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-[#64748B] mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-3 border-t border-[#D9D5CA]/70 flex items-center justify-between text-xs ${className}`}>
    {children}
  </div>
);

export default Card;
