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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500">Calculating group performance...</p>
      </div>
    );
  }

  // Sort groups by progress percentage descending for clear ranking
  const sortedGroups = [...groups].sort(
    (a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Group Performance</h3>
            <p className="text-xs text-slate-500">
              Coursework completion rate per student team
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/60">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'chart'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Chart</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {groups.length} Teams
          </span>
        </div>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
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
                ? 'bg-indigo-600'
                : pct > 0
                ? 'bg-amber-500'
                : 'bg-slate-300';

            const badgeColor =
              pct === 100
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : pct >= 60
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : pct > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={group.groupId}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-purple-200 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-slate-200/80 text-[10px] font-mono font-black text-slate-600 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/admin/groups/${group.groupId}`}
                        className="text-xs font-bold text-slate-800 hover:text-purple-600 transition-colors truncate block group-hover:underline"
                      >
                        {group.groupName}
                      </Link>
                      <span className="text-[11px] text-slate-500">
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
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider sticky top-0">
              <tr>
                <th className="px-3 py-2 rounded-l-lg">Team</th>
                <th className="px-3 py-2 text-center">Members</th>
                <th className="px-3 py-2 text-center">Coursework</th>
                <th className="px-3 py-2 text-right rounded-r-lg">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedGroups.map((group) => (
                <tr key={group.groupId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-slate-900">
                    <Link
                      to={`/admin/groups/${group.groupId}`}
                      className="hover:text-purple-600 truncate block max-w-[160px]"
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
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        group.progressPercentage === 100
                          ? 'bg-emerald-50 text-emerald-700 font-black'
                          : 'bg-indigo-50 text-indigo-700'
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

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Performance strictly defined as assignment completion</span>
        <Link
          to="/admin/groups"
          className="font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
        >
          <span>All Groups</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default GroupPerformanceChart;
