import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, BookOpen, Clock } from 'lucide-react';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';

/**
 * Reusable GroupProgressCard Component
 * Displays a group's coursework progress, member count, and direct navigation
 */
export const GroupProgressCard = ({
  group,
  linkPrefix = '/student/groups',
  className = '',
}) => {
  if (!group) return null;

  const total = group.totalAssignments || 0;
  const completed = group.completedAssignments || 0;
  const pending = group.pendingAssignments || 0;
  const percentage = group.progressPercentage || 0;

  let status = 'NOT_STARTED';
  if (total > 0) {
    if (completed === total) {
      status = 'COMPLETED';
    } else if (completed > 0) {
      status = 'IN_PROGRESS';
    }
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${className}`}
    >
      <div className="space-y-3">
        {/* Header: Name & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 leading-snug truncate">
              {group.name || group.groupName}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>{group.memberCount ?? 1} members</span>
              </span>
            </div>
          </div>

          <StatusBadge status={status} size="sm" />
        </div>

        {/* Progress Bar */}
        <div className="pt-1">
          <ProgressBar
            value={percentage}
            total={total}
            completed={completed}
            emptyText="No coursework allocated yet"
            size="md"
          />
        </div>

        {/* Quick Details breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Completed
              </span>
              <span className="font-bold text-slate-800">
                {completed} / {total}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Pending
              </span>
              <span className="font-bold text-slate-800">{pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          to={`${linkPrefix}/${group.id || group.groupId}`}
          className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>View Group Roster & Work</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default GroupProgressCard;
