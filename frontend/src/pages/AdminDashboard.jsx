import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import {
  Shield,
  BookPlus,
  Users,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Server,
  BookOpen,
  CheckCircle2,
  Clock,
  Activity,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';
import StatsCard from '../components/common/StatsCard';
import ProgressBar from '../components/common/ProgressBar';
import SubmissionStatusChart from '../components/analytics/SubmissionStatusChart';
import AssignmentCompletionChart from '../components/analytics/AssignmentCompletionChart';
import GroupPerformanceChart from '../components/analytics/GroupPerformanceChart';
import RecentSubmissionsTable from '../components/analytics/RecentSubmissionsTable';

export const AdminDashboard = () => {
  const { user } = useAuth();

  // State
  const [overview, setOverview] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for recent submissions
  const [filters, setFilters] = useState({
    assignmentId: '',
    groupId: '',
    status: 'ALL',
  });

  // Fetch all analytics datasets concurrently
  const fetchAnalyticsData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [overviewRes, assignmentsRes, groupsRes, submissionsRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getAssignments(),
        analyticsService.getGroups(),
        analyticsService.getRecentSubmissions({ limit: 10 }),
      ]);

      setOverview(overviewRes.data);
      setAssignments(assignmentsRes.data?.assignments || []);
      setGroups(groupsRes.data?.groups || []);
      setSubmissions(submissionsRes.data?.submissions || []);
    } catch (err) {
      console.error('Failed to load analytics dashboard data:', err);
      setError(err?.message || 'Failed to communicate with analytics services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch filtered submissions when filter changes
  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    try {
      setTableLoading(true);
      const res = await analyticsService.getRecentSubmissions({
        limit: 10,
        assignmentId: newFilters.assignmentId || undefined,
        groupId: newFilters.groupId || undefined,
        status: newFilters.status !== 'ALL' ? newFilters.status : undefined,
      });
      setSubmissions(res.data?.submissions || []);
    } catch (err) {
      console.error('Failed to filter submissions:', err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Derived values from overview
  const totalStudents = overview?.totalStudents;
  const totalGroups = overview?.totalGroups;
  const totalAssignments = overview?.totalAssignments;
  const confirmedSubmissions = overview?.confirmedSubmissions ?? 0;
  const pendingSubmissions = overview?.pendingSubmissions ?? 0;
  const overallPercentage = overview?.overallCompletionPercentage ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Admin Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Professor / Admin
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-0.5">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span>
                  Faculty Authority:{' '}
                  <strong className="text-white">Full Administrative Privileges</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  JWT Session Authenticated
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3">
            <PhaseBadge phase="Phase 8" status="Analytics Active" />
            <button
              onClick={() => fetchAnalyticsData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all border border-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Analytics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Analytics Synchronization Error</p>
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchAnalyticsData(true)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Summary Cards (Requirement 4 & 17) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            System Summary & Workload Metrics
          </h2>
          <span className="text-[11px] text-slate-400">
            Real-time calculations from PostgreSQL
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 h-28 animate-pulse flex flex-col justify-between"
              >
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-7 w-12 bg-slate-300 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatsCard
              title="Total Students"
              value={totalStudents ?? '—'}
              icon={Users}
              color="indigo"
            />
            <StatsCard
              title="Total Groups"
              value={totalGroups ?? '—'}
              icon={Users}
              color="purple"
            />
            <StatsCard
              title="Total Assignments"
              value={totalAssignments ?? '—'}
              icon={BookOpen}
              color="indigo"
            />
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Completion Rate
                </p>
                <p className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono tracking-tight mt-1">
                  {overallPercentage}%
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <ProgressBar value={overallPercentage} showLabel={false} size="sm" />
              </div>
            </div>
            <StatsCard
              title="Confirmed"
              value={confirmedSubmissions}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatsCard
              title="Pending"
              value={pendingSubmissions}
              icon={Clock}
              color="amber"
            />
          </div>
        )}
      </div>

      {/* Main Charts Row: Submission Status [Chart] + Assignment Completion [Chart] (Requirement 5, 6, 7, 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubmissionStatusChart
            confirmed={confirmedSubmissions}
            pending={pendingSubmissions}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-2">
          <AssignmentCompletionChart
            assignments={assignments}
            loading={loading}
          />
        </div>
      </div>

      {/* Group Performance [Chart/Table] (Requirement 8, 17) */}
      <div>
        <GroupPerformanceChart
          groups={groups}
          loading={loading}
        />
      </div>

      {/* Recent Submission Summary [Table] (Requirement 17) */}
      <div>
        <RecentSubmissionsTable
          submissions={submissions}
          assignments={assignments}
          groups={groups}
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={tableLoading}
        />
      </div>

      {/* Quick Action Navigation Cards (Preserves all existing monitoring & coursework routes) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <BookPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Assignment Management</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create assignments, set deadlines, provide OneDrive submission links, and manage group allocations.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/admin/assignments"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Manage Coursework</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Phase 5 Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Submissions Monitoring</h3>
            <p className="text-xs text-slate-500 mt-1">
              Student-wise confirmation matrix, group progress rosters, and individual confirmer audit logs.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/admin/submissions"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              <span>View Monitoring Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Phase 7 Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Database & System Health</h3>
            <p className="text-xs text-slate-500 mt-1">
              Live PostgreSQL connection pool latency, relational integrity checks, and API server status.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/#health-section"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              <span>System Health</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
