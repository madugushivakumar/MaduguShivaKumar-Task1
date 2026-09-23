import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';

/**
 * Assignment Completion Horizontal Bar Chart
 * Displays completion percentages for assignments with readable titles and counts
 */
export const AssignmentCompletionChart = ({ assignments = [], loading = false }) => {
  if (loading) {
    return (
      <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-[#1557D6] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">Loading coursework metrics...</p>
      </div>
    );
  }

  return (
    <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1557D6] border border-blue-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-editorial text-[#172033] text-base">Assignment Completion</h3>
            <p className="text-xs text-[#5A6578]">Squad confirmation rate per coursework</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#D9D5CA] text-[#172033]">
          {assignments.length} Coursework
        </span>
      </div>

      {assignments.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#5A6578]">
          No assignment data available yet.
        </div>
      ) : (
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {assignments.map((item) => {
            const pct = item.completionPercentage || 0;
            const barColor =
              pct === 100
                ? 'bg-emerald-500'
                : pct >= 50
                ? 'bg-[#1557D6]'
                : pct > 0
                ? 'bg-amber-500'
                : 'bg-slate-300';

            const badgeColor =
              pct === 100
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : pct >= 50
                ? 'bg-blue-50 text-[#1557D6] border-blue-200'
                : pct > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={item.assignmentId}
                className="p-3.5 rounded-2xl bg-[#FAF8F5]/80 border border-[#D9D5CA] hover:border-[#1557D6] transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/assignments/${item.assignmentId}`}
                      className="text-xs font-bold text-[#172033] hover:text-[#1557D6] transition-colors flex items-center gap-1.5 truncate font-editorial text-sm"
                      title={item.title}
                    >
                      <span className="truncate">{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-[#8A7E72] group-hover:text-[#1557D6] flex-shrink-0" />
                    </Link>
                    <span className="block text-[11px] font-mono text-[#5A6578] mt-0.5">
                      {item.confirmedGroups} of {item.totalGroups} squads verified
                      {item.pendingGroups > 0 && ` (${item.pendingGroups} pending)`}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeColor} flex-shrink-0`}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${Math.max(pct, 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Completion based on confirmed team submissions</span>
        <Link
          to="/admin/assignments"
          className="font-bold text-indigo-600 hover:text-indigo-700"
        >
          View All
        </Link>
      </div>
    </div>
  );
};

export default AssignmentCompletionChart;
