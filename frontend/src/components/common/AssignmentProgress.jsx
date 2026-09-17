import React from 'react';
import ProgressBar from './ProgressBar';
import { BookOpen, Users, CheckCircle2, Clock } from 'lucide-react';

/**
 * Reusable AssignmentProgress Component
 * Visualizes assignment-level progress across all assigned student groups
 */
export const AssignmentProgress = ({
  assignment,
  assignedCount = 0,
  confirmedCount = 0,
  completionPercentage = 0,
  className = '',
}) => {
  const pendingCount = Math.max(0, assignedCount - confirmedCount);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {assignment?.title || 'Assignment Progress'}
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Allocated across {assignedCount} {assignedCount === 1 ? 'group' : 'groups'}
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          {completionPercentage}% Done
        </span>
      </div>

      <ProgressBar
        value={completionPercentage}
        completed={confirmedCount}
        total={assignedCount}
        label={`${confirmedCount} of ${assignedCount} groups submitted`}
        size="md"
      />

      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="text-slate-600">
            Confirmed: <strong className="text-slate-900">{confirmedCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-slate-600">
            Pending: <strong className="text-slate-900">{pendingCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentProgress;
