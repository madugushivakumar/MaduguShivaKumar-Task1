import React from 'react';
import Breadcrumb from './Breadcrumb';

export const PageHeader = ({
  title,
  subtitle,
  handwrittenNote,
  backTo,
  backLabel,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div className={`space-y-2 mb-6 ${className}`}>
      {backTo && <Breadcrumb backTo={backTo} backLabel={backLabel} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] font-editorial tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
            {handwrittenNote && (
              <span className="font-handwritten text-lg sm:text-xl text-[#1557D6] -rotate-1 hidden md:inline-block">
                "{handwrittenNote}"
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
