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
    <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1557D6] border border-blue-100 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-editorial text-[#172033] text-base">
              Recent Submissions Summary
            </h3>
            <p className="text-xs text-[#5A6578]">
              Live submission confirmation ledger across assigned student teams
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-[#5A6578] font-bold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Filter by Assignment */}
          <select
            value={filters.assignmentId || ''}
            onChange={(e) => onFilterChange({ ...filters, assignmentId: e.target.value })}
            className="text-xs font-medium bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl px-2.5 py-1.5 text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 max-w-[180px]"
          >
            <option value="">All Coursework</option>
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
            className="text-xs font-medium bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl px-2.5 py-1.5 text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 max-w-[150px]"
          >
            <option value="">All Squads</option>
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
            className="text-xs font-medium bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl px-2.5 py-1.5 text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING">Pending</option>
          </select>

          {(filters.assignmentId || filters.groupId || (filters.status && filters.status !== 'ALL')) && (
            <button
              onClick={() => onFilterChange({ assignmentId: '', groupId: '', status: 'ALL' })}
              className="text-[11px] font-bold text-[#1557D6] hover:text-[#0D3EA8] px-2 py-1 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table / Content State */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#1557D6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
            Filtering submission ledger...
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-12 bg-[#FAF8F5]/50 rounded-2xl border border-dashed border-[#D9D5CA] text-center space-y-2">
          <Clock className="w-8 h-8 text-[#8A7E72] mx-auto opacity-40" />
          <p className="text-xs font-bold font-editorial text-[#172033] text-sm">No submission data available yet.</p>
          <p className="text-[11px] text-[#8A7E72] font-mono">
            No matching submissions found with the applied filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#D9D5CA]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[10px] font-mono uppercase font-bold text-[#8A7E72] tracking-wider border-b border-[#D9D5CA]">
              <tr>
                <th className="px-4 py-3">Coursework</th>
                <th className="px-4 py-3">Squad</th>
                <th className="px-4 py-3">Confirmed By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Confirmation Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] bg-white">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="px-4 py-3 font-bold font-editorial text-base text-[#172033]">
                    <Link
                      to={`/admin/assignments/${sub.assignmentId}`}
                      className="hover:text-[#1557D6] inline-flex items-center gap-1 truncate max-w-[220px]"
                      title={sub.assignmentTitle}
                    >
                      <span className="truncate">{sub.assignmentTitle}</span>
                      <ExternalLink className="w-3 h-3 text-[#8A7E72] flex-shrink-0" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#172033] font-mono">
                    <Link
                      to={`/admin/groups/${sub.groupId}`}
                      className="hover:text-[#1557D6] font-bold inline-flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-[#1557D6] flex-shrink-0" />
                      <span>{sub.groupName}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#5A6578]">
                    {sub.confirmedByName ? (
                      <div>
                        <span className="font-bold text-[#172033] block">
                          {sub.confirmedByName}
                        </span>
                        <span className="text-[10px] text-[#8A7E72] font-mono">
                          {sub.confirmedByEmail}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#8A7E72] italic font-mono">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {sub.status === 'CONFIRMED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] text-[#5A6578]">
                    <div className="flex items-center justify-end gap-1.5">
                      <Calendar className="w-3 h-3 text-[#8A7E72]" />
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
      <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#5A6578]">
        <span>Showing up to {submissions.length} filtered submission ledger items</span>
        <Link
          to="/admin/submissions"
          className="font-bold text-[#1557D6] hover:text-[#0D3EA8]"
        >
          View Full Monitoring Feed →
        </Link>
      </div>
    </div>
  );
};

export default RecentSubmissionsTable;

