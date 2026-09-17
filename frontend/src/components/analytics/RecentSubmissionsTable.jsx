import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  Calendar,
} from 'lucide-react';

/**
 * Format timestamp into standard human-readable format
 */
const formatDateTime = (isoString) => {
  if (!isoString) return 'Pending Confirmation';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Recent Submission Summary Table with filters for assignment, group, and status
 */
export const RecentSubmissionsTable = ({
  submissions = [],
  assignments = [],
  groups = [],
  filters = { assignmentId: '', groupId: '', status: 'ALL' },
  onFilterChange,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Submissions Summary
            </h3>
            <p className="text-xs text-slate-500">
              Live submission confirmation ledger across assigned student teams
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Filter by Assignment */}
          <select
            value={filters.assignmentId || ''}
            onChange={(e) => onFilterChange({ ...filters, assignmentId: e.target.value })}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[180px]"
          >
            <option value="">All Assignments</option>
            {assignments.map((a) => (
              <option key={a.assignmentId || a.id} value={a.assignmentId || a.id}>
                {a.title}
              </option>
            ))}
          </select>

          {/* Filter by Group */}
          <select
            value={filters.groupId || ''}
            onChange={(e) => onFilterChange({ ...filters, groupId: e.target.value })}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[150px]"
          >
            <option value="">All Groups</option>
            {groups.map((g) => (
              <option key={g.groupId || g.id} value={g.groupId || g.id}>
                {g.groupName || g.name}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
          </select>

          {(filters.assignmentId || filters.groupId || (filters.status && filters.status !== 'ALL')) && (
            <button
              onClick={() => onFilterChange({ assignmentId: '', groupId: '', status: 'ALL' })}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-700 px-2 py-1 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table / Content State */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Filtering submission records...
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600">No submission data available yet.</p>
          <p className="text-[11px] text-slate-400">
            No matching submissions found with the applied filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Assignment</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Confirmed By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Confirmation Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <Link
                      to={`/admin/assignments/${sub.assignmentId}`}
                      className="hover:text-indigo-600 inline-flex items-center gap-1 truncate max-w-[220px]"
                      title={sub.assignmentTitle}
                    >
                      <span className="truncate">{sub.assignmentTitle}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <Link
                      to={`/admin/groups/${sub.groupId}`}
                      className="hover:text-purple-600 font-medium inline-flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{sub.groupName}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sub.confirmedByName ? (
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {sub.confirmedByName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sub.confirmedByEmail}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {sub.status === 'CONFIRMED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-600">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDateTime(sub.confirmedAt)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer link to Submissions Monitoring */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Showing up to {submissions.length} filtered submission ledger items</span>
        <Link
          to="/admin/submissions"
          className="font-bold text-teal-600 hover:text-teal-700"
        >
          View Full Monitoring Feed →
        </Link>
      </div>
    </div>
  );
};

export default RecentSubmissionsTable;
