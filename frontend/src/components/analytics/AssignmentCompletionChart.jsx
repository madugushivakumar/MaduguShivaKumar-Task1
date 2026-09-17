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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500">Loading assignment analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Assignment Completion</h3>
            <p className="text-xs text-slate-500">Group confirmation rate per coursework</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {assignments.length} Coursework
        </span>
      </div>

      {assignments.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
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
                ? 'bg-indigo-600'
                : pct > 0
                ? 'bg-amber-500'
                : 'bg-slate-300';

            const badgeColor =
              pct === 100
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : pct >= 50
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : pct > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={item.assignmentId}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-indigo-200 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/assignments/${item.assignmentId}`}
                      className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-1.5 truncate group-hover:underline"
                      title={item.title}
                    >
                      <span className="truncate">{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                    </Link>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      {item.confirmedGroups} of {item.totalGroups} groups confirmed
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
