import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Table as TableIcon, ArrowRight } from 'lucide-react';

/**
 * Group Performance Chart & Table Component
 * Defines group performance as assignment completion percentage based on database records
 */
export const GroupPerformanceChart = ({ groups = [], loading = false }) => {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'

  if (loading) {
    return (
      <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-[#1557D6] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">Calculating squad performance...</p>
      </div>
    );
  }

  // Sort groups by progress percentage descending for clear ranking
  const sortedGroups = [...groups].sort(
    (a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0)
  );

  return (
    <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1557D6] border border-blue-100 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-editorial text-[#172033] text-base">Group Performance</h3>
            <p className="text-xs text-[#5A6578]">
              Coursework completion rate per student team
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="inline-flex rounded-xl p-1 bg-[#FAF8F5] border border-[#D9D5CA]">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-white text-[#1557D6] shadow-2xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Chart</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#1557D6] shadow-2xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#D9D5CA] text-[#172033]">
            {groups.length} Teams
          </span>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#5A6578]">
          No group performance records available yet.
        </div>
      ) : viewMode === 'chart' ? (
        /* Chart View: Horizontal Ranking Bars */
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {sortedGroups.map((group, index) => {
            const pct = group.progressPercentage || 0;
            const barColor =
              pct === 100
                ? 'bg-emerald-500'
                : pct >= 60
                ? 'bg-[#1557D6]'
                : pct > 0
                ? 'bg-amber-500'
                : 'bg-slate-300';

            const badgeColor =
              pct === 100
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : pct >= 60
                ? 'bg-blue-50 text-[#1557D6] border-blue-200'
                : pct > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={group.groupId}
                className="p-3.5 rounded-2xl bg-[#FAF8F5]/80 border border-[#D9D5CA] hover:border-[#1557D6] transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#D9D5CA] text-[10px] font-mono font-black text-[#172033] flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/admin/groups/${group.groupId}`}
                        className="text-xs font-bold text-[#172033] hover:text-[#1557D6] transition-colors truncate block font-editorial text-sm"
                      >
                        {group.groupName}
                      </Link>
                      <span className="text-[11px] font-mono text-[#5A6578]">
                        {group.memberCount} members • {group.completedAssignments} /{' '}
                        {group.totalAssignments} completed
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeColor} flex-shrink-0`}
                  >
                    {pct}%
                  </span>
                </div>

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
      ) : (
        /* Table View */
        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left text-xs text-[#5A6578]">
            <thead className="bg-[#FAF8F5] text-[10px] font-mono uppercase font-bold text-[#8A7E72] tracking-wider sticky top-0 border-b border-[#D9D5CA]">
              <tr>
                <th className="px-3 py-2 rounded-l-lg">Team</th>
                <th className="px-3 py-2 text-center">Members</th>
                <th className="px-3 py-2 text-center">Coursework</th>
                <th className="px-3 py-2 text-right rounded-r-lg">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {sortedGroups.map((group) => (
                <tr key={group.groupId} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="px-3 py-2.5 font-bold font-editorial text-base text-[#172033]">
                    <Link
                      to={`/admin/groups/${group.groupId}`}
                      className="hover:text-[#1557D6] truncate block max-w-[160px]"
                    >
                      {group.groupName}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    {group.memberCount}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    {group.completedAssignments} / {group.totalAssignments}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] border ${
                        group.progressPercentage === 100
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-black'
                          : 'bg-blue-50 text-[#1557D6] border-blue-200'
                      }`}
                    >
                      {group.progressPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-[11px] font-mono text-[#5A6578]">
        <span>Paced by assignment verification ledger</span>
        <Link
          to="/admin/groups"
          className="font-bold text-[#1557D6] hover:text-[#0D3EA8] inline-flex items-center gap-1"
        >
          <span>All Squads</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default GroupPerformanceChart;

