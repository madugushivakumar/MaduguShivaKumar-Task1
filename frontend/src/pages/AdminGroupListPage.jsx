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
} from 'lucide-react';
import ProgressBar from '../components/common/ProgressBar';
import { SearchBar, EmptyState } from '../components/ui';

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
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#5A6578] hover:text-[#1557D6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Control Wall</span>
        </Link>
        <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
          COHORT TELEMETRY
        </span>
      </div>

      {/* Banner */}
      <div className="paper-card bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#D9D5CA] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase tracking-wider">
                FACULTY MONITORING
              </span>
              <span className="text-xs font-handwritten text-[#8A7E72] text-sm">
                Squad performance matrix
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-editorial tracking-tight text-[#172033]">
              Group Progress & Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6578] max-w-2xl leading-relaxed">
              Track real-time coursework completion rates across all student project teams. Monitor submission progress, assigned workload, and member participation.
            </p>
          </div>

          <button
            onClick={fetchGroups}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#172033] border border-[#D9D5CA] text-xs font-mono font-bold self-start md:self-auto transition-all shadow-2xs cursor-pointer"
            title="Refresh groups feed"
          >
            <RefreshCw className={`w-4 h-4 text-[#1557D6] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E5E0D8] text-xs">
          <div className="bg-white/80 p-3.5 rounded-xl border border-[#D9D5CA]">
            <span className="text-[#8A7E72] block text-[10px] font-mono font-bold uppercase tracking-wider">Total Teams</span>
            <span className="text-2xl font-black font-mono text-[#172033] mt-0.5 block">{totalGroups}</span>
          </div>
          <div className="bg-white/80 p-3.5 rounded-xl border border-[#D9D5CA]">
            <span className="text-emerald-700 block text-[10px] font-mono font-bold uppercase tracking-wider">100% Completed</span>
            <span className="text-2xl font-black font-mono text-emerald-700 mt-0.5 block">{completedGroups}</span>
          </div>
          <div className="bg-white/80 p-3.5 rounded-xl border border-[#D9D5CA]">
            <span className="text-[#1557D6] block text-[10px] font-mono font-bold uppercase tracking-wider">In Progress</span>
            <span className="text-2xl font-black font-mono text-[#1557D6] mt-0.5 block">{inProgressGroups}</span>
          </div>
          <div className="bg-white/80 p-3.5 rounded-xl border border-[#D9D5CA]">
            <span className="text-[#8A7E72] block text-[10px] font-mono font-bold uppercase tracking-wider">Not Started</span>
            <span className="text-2xl font-black font-mono text-[#5A6578] mt-0.5 block">{notStartedGroups}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80">
            <SearchBar
              placeholder="Search groups by squad title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          <div className="inline-flex bg-[#FAF8F5] p-1 rounded-xl border border-[#D9D5CA] w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-[#1557D6] shadow-2xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
            >
              All ({totalGroups})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === 'COMPLETED'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-white text-[#1557D6] shadow-2xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('NOT_STARTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === 'NOT_STARTED'
                  ? 'bg-white text-[#172033] shadow-2xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
            >
              Not Started
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#D9D5CA] paper-card">
          <div className="w-10 h-10 border-4 border-[#1557D6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
            Querying cohort progress metrics...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && groups.length === 0 && (
        <EmptyState
          icon={Users}
          title="No Groups Found"
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'No groups match your active search or status filters.'
              : 'There are currently no student project groups registered in the system.'
          }
        />
      )}

      {/* Responsive Table / Cards */}
      {!loading && groups.length > 0 && (
        <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#D9D5CA] text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">
                  <th className="py-4 px-6">Group Moniker</th>
                  <th className="py-4 px-4">Cadre</th>
                  <th className="py-4 px-4">Assigned Briefs</th>
                  <th className="py-4 px-4">Completed</th>
                  <th className="py-4 px-4">Pending</th>
                  <th className="py-4 px-6 min-w-[200px]">Submission Pace</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8] text-xs">
                {groups.map((g) => (
                  <tr key={g.groupId} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    {/* Group Name & Creator */}
                    <td className="py-4 px-6">
                      <div>
                        <Link
                          to={`/admin/groups/${g.groupId}`}
                          className="font-bold text-[#172033] hover:text-[#1557D6] transition-colors font-editorial text-base"
                        >
                          {g.groupName}
                        </Link>
                        <span className="block text-[11px] text-[#8A7E72] font-mono mt-0.5">
                          Lead: {g.creatorName}
                        </span>
                      </div>
                    </td>

                    {/* Member Count */}
                    <td className="py-4 px-4 font-mono font-bold text-[#172033]">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#1557D6]" />
                        <span>{g.memberCount}</span>
                      </span>
                    </td>

                    {/* Total Assigned */}
                    <td className="py-4 px-4 font-mono font-bold text-[#172033]">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#8A7E72]" />
                        <span>{g.totalAssignments}</span>
                      </span>
                    </td>

                    {/* Completed */}
                    <td className="py-4 px-4 font-mono">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {g.completedAssignments}
                      </span>
                    </td>

                    {/* Pending */}
                    <td className="py-4 px-4 font-mono">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-blue-50 text-[#1557D6] border border-[#D9D5CA] font-mono font-bold transition-all text-xs"
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

