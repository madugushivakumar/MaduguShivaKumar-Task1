import React from 'react';

/**
 * Reusable StatsCard Component
 * Displays summary KPIs, trends, and metrics across dashboards
 */
export const StatsCard = ({
  title,
  value,
  icon: Icon,
  subtext,
  badge,
  badgeColor = 'emerald',
  color = 'indigo',
  className = '',
}) => {
  const iconColorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const badgeColorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
              iconColorClasses[color] || iconColorClasses.indigo
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-500 truncate">{subtext}</span>}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                badgeColorClasses[badgeColor] || badgeColorClasses.emerald
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
