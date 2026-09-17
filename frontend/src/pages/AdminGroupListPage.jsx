import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import progressService from '../services/progressService';
import {
  Users,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';

export const AdminGroupListPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await progressService.getAdminGroups({
        search: searchQuery,
        status: statusFilter,
      });
      setGroups(res.data?.groups || []);
    } catch (err) {
      console.error('Failed to load admin groups monitoring list:', err);
      setError(err.response?.data?.message || 'Failed to load student groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Aggregate metrics across listed groups
  const totalGroups = groups.length;
  const completedGroups = groups.filter((g) => g.status === 'COMPLETED').length;
  const inProgressGroups = groups.filter((g) => g.status === 'IN_PROGRESS').length;
  const notStartedGroups = groups.filter((g) => g.status === 'NOT_STARTED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Dashboard</span>
        </Link>
        <PhaseBadge phase="Phase 7" status="Group Monitoring" />
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Professor / Admin Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Group Progress Monitoring
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track real-time coursework completion rates across all student project teams. Monitor
              submission progress, assigned workload, and member participation.
            </p>
          </div>

          <button
            onClick={fetchGroups}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-200 border border-slate-700 text-xs font-semibold self-start md:self-auto transition-all"
            title="Refresh groups feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Teams</span>
            <span className="text-xl font-black text-white mt-0.5 block">{totalGroups}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-emerald-400 block text-[10px] uppercase font-semibold">100% Completed</span>
            <span className="text-xl font-black text-emerald-300 mt-0.5 block">{completedGroups}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-indigo-400 block text-[10px] uppercase font-semibold">In Progress</span>
            <span className="text-xl font-black text-indigo-300 mt-0.5 block">{inProgressGroups}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Not Started / Empty</span>
            <span className="text-xl font-black text-slate-300 mt-0.5 block">{notStartedGroups}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search groups by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({totalGroups})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('NOT_STARTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'NOT_STARTED'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Not Started
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Querying group progress metrics...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && groups.length === 0 && (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Groups Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No groups match your active search or status filters.'
              : 'There are currently no student project groups registered in the system.'}
          </p>
        </div>
      )}

      {/* Responsive Table / Cards */}
      {!loading && groups.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Group Name</th>
                  <th className="py-4 px-4">Members</th>
                  <th className="py-4 px-4">Assigned Work</th>
                  <th className="py-4 px-4">Completed</th>
                  <th className="py-4 px-4">Pending</th>
                  <th className="py-4 px-6 min-w-[200px]">Progress</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {groups.map((g) => (
                  <tr key={g.groupId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Group Name & Creator */}
                    <td className="py-4 px-6">
                      <div>
                        <Link
                          to={`/admin/groups/${g.groupId}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-sm"
                        >
                          {g.groupName}
                        </Link>
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          Created by {g.creatorName}
                        </span>
                      </div>
                    </td>

                    {/* Member Count */}
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{g.memberCount}</span>
                      </span>
                    </td>

                    {/* Total Assigned */}
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{g.totalAssignments}</span>
                      </span>
                    </td>

                    {/* Completed */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {g.completedAssignments}
                      </span>
                    </td>

                    {/* Pending */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        {g.pendingAssignments}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-4 px-6">
                      <ProgressBar
                        value={g.progressPercentage}
                        total={g.totalAssignments}
                        completed={g.completedAssignments}
                        emptyText="No coursework"
                        size="md"
                      />
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/admin/groups/${g.groupId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-600 font-bold transition-all text-xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroupListPage;
