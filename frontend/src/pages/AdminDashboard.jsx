import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';
import courseService from '../services/courseService';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  BookMarked,
  X,
  Loader2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';
import {
  Button,
  Card,
  StatCard,
  Badge,
  Modal,
  Input,
  Select,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui';
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // New Course Modal state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    description: '',
    department: 'Computer Science',
    term: 'Fall 2026',
    credits: 4,
  });
  const [courseCreating, setCourseCreating] = useState(false);
  const [courseError, setCourseError] = useState(null);

  // Filters for recent submissions
  const [filters, setFilters] = useState({
    assignmentId: '',
    groupId: '',
    status: 'ALL',
  });

  // Fetch all analytics and course datasets concurrently
  const fetchAnalyticsData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [overviewRes, assignmentsRes, groupsRes, submissionsRes, coursesRes, profDashboardRes] =
        await Promise.all([
          analyticsService.getOverview().catch(() => null),
          analyticsService.getAssignments().catch(() => ({ data: { assignments: [] } })),
          analyticsService.getGroups().catch(() => ({ data: { groups: [] } })),
          analyticsService.getRecentSubmissions({ limit: 10 }).catch(() => ({ data: { submissions: [] } })),
          courseService.getCourses().catch(() => ({ data: { courses: [] } })),
          courseService.getProfessorDashboard().catch(() => null),
        ]);

      const profData = profDashboardRes?.data;
      setOverview(overviewRes?.data || profData || null);
      setAssignments(assignmentsRes.data?.assignments || []);
      setGroups(groupsRes.data?.groups || []);
      setSubmissions(submissionsRes.data?.submissions || profData?.recentSubmissions || []);
      setCourses(coursesRes.data?.courses || profData?.courses || []);
    } catch (err) {
      console.error('Failed to load analytics dashboard data:', err);
      setError(err?.message || 'Failed to communicate with analytics services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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

  // Handle Course Creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseError(null);

    if (!courseForm.code.trim() || !courseForm.title.trim()) {
      setCourseError('Course code and course title are required.');
      return;
    }

    try {
      setCourseCreating(true);
      await courseService.createCourse({
        code: courseForm.code.trim(),
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        department: courseForm.department.trim(),
        term: courseForm.term.trim(),
        credits: parseInt(courseForm.credits, 10) || 4,
      });

      setIsCourseModalOpen(false);
      setCourseForm({
        code: '',
        title: '',
        description: '',
        department: 'Computer Science',
        term: 'Fall 2026',
        credits: 4,
      });
      await fetchAnalyticsData(true);
    } catch (err) {
      setCourseError(err.message || 'Failed to create course.');
    } finally {
      setCourseCreating(false);
    }
  };

  // Real Metrics from Database (Overview / Professor Dashboard)
  const profData = overview?.courses ? overview : null;
  const totalStudents = profData?.totalStudents ?? overview?.totalStudents ?? (groups.reduce((acc, g) => acc + (parseInt(g.studentCount || g.memberCount, 10) || 0), 0));
  const totalAssignments = profData?.totalAssignments ?? overview?.totalAssignments ?? assignments.length;
  const confirmedSubmissions = profData?.submittedCount ?? overview?.confirmedSubmissions ?? 0;
  const pendingSubmissions = profData?.pendingCount ?? overview?.pendingSubmissions ?? 0;
  const overdueSubmissions = overview?.overdueSubmissions ?? 0;

  const [selectedTerm, setSelectedTerm] = useState('Fall 2026');
  const [matrixCourseFilter, setMatrixCourseFilter] = useState('ALL');
  const [matrixGroupFilter, setMatrixGroupFilter] = useState('ALL');

  // Real squad data for Submission Matrix computed from live groups
  const matrixSquads = groups.map((g, idx) => {
    const progress = Math.round(Number(g.progressPercentage ?? g.progress ?? 0));
    const dots = [
      progress >= 20 ? 'green' : 'amber',
      progress >= 40 ? 'green' : progress > 0 ? 'blue' : 'dash',
      progress >= 60 ? 'green' : progress >= 40 ? 'blue' : 'dash',
      progress >= 80 ? 'green' : progress >= 60 ? 'blue' : 'dash',
      progress === 100 ? 'green' : progress >= 80 ? 'blue' : 'dash',
    ];
    return {
      id: g.groupId || g.id || `group-${idx}`,
      name: g.groupName || g.name || `Squad 0${idx + 1}`,
      progress,
      dots,
    };
  });

  const filteredMatrixSquads = matrixSquads.filter((squad) => {
    if (matrixGroupFilter !== 'ALL' && squad.id !== matrixGroupFilter && squad.name !== matrixGroupFilter) {
      return false;
    }
    return true;
  });

  const renderStatusDot = (status) => {
    switch (status) {
      case 'green':
        return (
          <span
            className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-2xs cursor-pointer hover:scale-125 transition-transform"
            title="Submitted"
          />
        );
      case 'blue':
        return (
          <span
            className="inline-block w-3 h-3 rounded-full bg-[#1557D6] shadow-2xs cursor-pointer hover:scale-125 transition-transform"
            title="In Progress"
          />
        );
      case 'amber':
        return (
          <span
            className="inline-block w-3 h-3 rounded-full bg-amber-500 shadow-2xs cursor-pointer hover:scale-125 transition-transform"
            title="Pending"
          />
        );
      case 'red':
        return (
          <span
            className="inline-block w-3 h-3 rounded-full bg-rose-500 shadow-2xs cursor-pointer hover:scale-125 transition-transform"
            title="Overdue"
          />
        );
      default:
        return <span className="text-[#94A3B8] font-bold select-none">—</span>;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header (Reference 1: 06. Professor Workspace) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D9D5CA]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#172033] tracking-tight font-editorial">
            Professor Control Wall
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
            Track progress. Support students. Drive success.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Term Selector Pill (Reference 1) */}
          <div className="relative">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="appearance-none bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl px-4 py-2 pr-9 text-xs font-bold text-[#172033] shadow-2xs cursor-pointer focus:outline-none focus:border-[#1557D6]"
            >
              <option value="Fall 2026">Fall 2026</option>
              <option value="Spring 2026">Spring 2026</option>
              <option value="Summer 2026">Summer 2026</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Button
            onClick={() => setIsCourseModalOpen(true)}
            icon={PlusCircle}
            size="sm"
          >
            New Course
          </Button>

          <Link to="/admin/assignments/create">
            <Button size="sm" variant="secondary">
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      {/* REFERENCE 1: TOP 5 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-center">
          <div className="text-3xl sm:text-4xl font-black font-display text-[#172033] tracking-tight">
            {totalStudents}
          </div>
          <div className="text-xs font-semibold text-[#64748B] mt-1.5">
            Total Students
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-center">
          <div className="text-3xl sm:text-4xl font-black font-display text-[#1557D6] tracking-tight">
            {totalAssignments}
          </div>
          <div className="text-xs font-semibold text-[#64748B] mt-1.5">
            Assignments
          </div>
        </div>

        {/* Submitted */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-center">
          <div className="text-3xl sm:text-4xl font-black font-display text-[#16A34A] tracking-tight">
            {confirmedSubmissions}
          </div>
          <div className="text-xs font-semibold text-[#64748B] mt-1.5">
            Submitted
          </div>
        </div>

        {/* Pending */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-center">
          <div className="text-3xl sm:text-4xl font-black font-display text-[#EA580C] tracking-tight">
            {pendingSubmissions}
          </div>
          <div className="text-xs font-semibold text-[#64748B] mt-1.5">
            Pending
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-rose-50/20 rounded-2xl border border-rose-200 p-5 shadow-2xs flex flex-col justify-center">
          <div className="text-3xl sm:text-4xl font-black font-display text-[#DC2626] tracking-tight">
            {overdueSubmissions}
          </div>
          <div className="text-xs font-semibold text-[#DC2626] mt-1.5">
            Overdue
          </div>
        </div>
      </div>

      {/* REFERENCE 1: 2-COLUMN MAIN WORKBENCH (Submission Matrix vs Needs Attention) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 8 COLS: SUBMISSION MATRIX TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-6 shadow-paper space-y-4">
            {/* Card Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D5CA]/70 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#172033] font-editorial tracking-tight">
                  Submission Matrix
                </h2>
              </div>

              {/* Filters (All Courses & All Groups) */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <select
                    value={matrixCourseFilter}
                    onChange={(e) => setMatrixCourseFilter(e.target.value)}
                    className="appearance-none bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl px-3.5 py-1.5 pr-8 text-xs font-semibold text-[#172033] focus:outline-none focus:border-[#1557D6] cursor-pointer"
                  >
                    <option value="ALL">All Courses</option>
                    {courses.map((c, idx) => (
                      <option key={c.id || c._id || c.code || `course-${idx}`} value={c.id || c._id || c.code}>
                        {c.code || c.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={matrixGroupFilter}
                    onChange={(e) => setMatrixGroupFilter(e.target.value)}
                    className="appearance-none bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl px-3.5 py-1.5 pr-8 text-xs font-semibold text-[#172033] focus:outline-none focus:border-[#1557D6] cursor-pointer"
                  >
                    <option value="ALL">All Groups</option>
                    {groups.map((g, idx) => (
                      <option key={g.groupId || g.id || `group-${idx}`} value={g.groupId || g.id || g.name}>
                        {g.groupName || g.name || `Squad 0${idx + 1}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D9D5CA] text-[#475569] font-bold text-xs">
                    <th className="py-3 px-4 font-bold text-[#172033]">Group</th>
                    <th className="py-3 px-3 text-center font-bold text-[#172033]">A1</th>
                    <th className="py-3 px-3 text-center font-bold text-[#172033]">A2</th>
                    <th className="py-3 px-3 text-center font-bold text-[#172033]">A3</th>
                    <th className="py-3 px-3 text-center font-bold text-[#172033]">A4</th>
                    <th className="py-3 px-3 text-center font-bold text-[#172033]">A5</th>
                    <th className="py-3 px-4 text-center font-bold text-[#172033]">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D5CA]/50 font-medium">
                  {filteredMatrixSquads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#64748B]">
                        No student squads found. Form squads in the student portal to track progress here.
                      </td>
                    </tr>
                  ) : (
                    filteredMatrixSquads.map((sq, idx) => {
                      const squadId = sq.id || `squad-${idx}`;
                      const squadName = sq.name || `Squad 0${idx + 1}`;
                      const pct = sq.progress ?? 0;
                      const dots = sq.dots || ['dash', 'dash', 'dash', 'dash', 'dash'];

                      return (
                        <tr key={squadId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#172033]">
                            <Link
                              to={`/admin/groups/${squadId}`}
                              className="hover:text-[#1557D6] transition-colors"
                            >
                              {squadName}
                            </Link>
                          </td>

                          {dots.map((dotStatus, dIdx) => (
                            <td key={`dot-${squadId}-${dIdx}`} className="py-3 px-3 text-center">
                              {renderStatusDot(dotStatus)}
                            </td>
                          ))}

                          <td className="py-3 px-4 text-center font-bold text-[#172033]">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Matrix Legend (Reference 1 Bottom) */}
            <div className="pt-3 border-t border-[#D9D5CA]/70 flex flex-wrap items-center justify-start gap-5 text-xs text-[#475569] font-medium select-none">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Submitted</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1557D6]" />
                <span>In Progress</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Pending</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Overdue / Action Needed</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9D5CA]" />
                <span>Not Allocated</span>
              </span>
            </div>
          </div>

          {/* Bottom Left Architectural Drafting Sketch (Reference 1) */}
          <div className="pt-2 pl-2 select-none pointer-events-none opacity-40">
            <svg className="w-32 h-20 text-[#64748B]" viewBox="0 0 140 85" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M25 45 L55 28 L85 45 L55 62 Z" />
              <path d="M25 45 L25 68 L55 85 L55 62" />
              <path d="M85 45 L85 68 L55 85" />
              <path d="M55 28 L85 12 L115 28 L85 45" strokeDasharray="2,2" />
              <path d="M115 28 L115 50 L85 68" strokeDasharray="2,2" />
              <line x1="16" y1="42" x2="20" y2="48" />
              <line x1="18" y1="45" x2="18" y2="70" strokeDasharray="1,2" />
              <line x1="16" y1="67" x2="20" y2="73" />
            </svg>
          </div>
        </div>

        {/* RIGHT 4 COLS: NEEDS ATTENTION PANEL & HANDWRITTEN SCRIPT */}
        <div className="lg:col-span-4 space-y-5">
          {/* Needs Attention Card (Reference 1) */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-6 shadow-paper space-y-5">
            <h3 className="text-base font-bold font-display text-[#172033]">
              Needs Attention
            </h3>

            <div className="space-y-4">
              {groups.filter((g) => (g.progressPercentage ?? g.progress ?? 0) < 50).slice(0, 2).map((squad) => (
                <div key={squad.groupId || squad.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                    <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#172033]">
                      {squad.groupName || squad.name}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Coursework progress at {Math.round(Number(squad.progressPercentage ?? squad.progress ?? 0))}%
                    </p>
                    <p className="text-[10px] font-bold text-rose-600 mt-0.5">
                      Progress below 50% threshold
                    </p>
                  </div>
                </div>
              ))}

              {assignments.filter((a) => {
                if (!a.dueDate && !a.due_date) return false;
                const diffDays = (new Date(a.dueDate || a.due_date) - new Date()) / (1000 * 60 * 60 * 24);
                return diffDays >= 0 && diffDays <= 7;
              }).slice(0, 2).map((a) => (
                <div key={a.id || a.assignmentId} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                    <FileText className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#172033] line-clamp-1">
                      {a.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Due: {new Date(a.dueDate || a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-amber-600 mt-0.5">
                      Deadline this week
                    </p>
                  </div>
                </div>
              ))}

              {pendingSubmissions > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1557D6] text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#172033]">
                      {pendingSubmissions} Coursework Submissions
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Awaiting squad upload or leader confirmation
                    </p>
                  </div>
                </div>
              )}

              {groups.filter((g) => (g.progressPercentage ?? g.progress ?? 0) < 50).length === 0 &&
               assignments.filter((a) => {
                 if (!a.dueDate && !a.due_date) return false;
                 const diffDays = (new Date(a.dueDate || a.due_date) - new Date()) / (1000 * 60 * 60 * 24);
                 return diffDays >= 0 && diffDays <= 7;
               }).length === 0 &&
               pendingSubmissions === 0 && (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-emerald-800">All cohorts on track!</p>
                  <p className="text-[11px] text-emerald-700">No overdue coursework or stalled submissions.</p>
                </div>
              )}
            </div>
          </div>

          {/* Handwritten Quote with curved sketch underline (Reference 1 Bottom Right) */}
          <div className="pt-2 flex flex-col items-end select-none pr-1">
            <p className="font-handwritten text-xl sm:text-2xl text-[#1E293B]">
              "Support today, better learners tomorrow."
            </p>
            <svg
              className="w-44 h-4 text-[#1557D6]/60 mt-0.5"
              viewBox="0 0 180 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M5 6 Q65 12 145 5 Q160 3 168 8 Q158 12 138 10" />
            </svg>
          </div>
        </div>
      </div>

      {/* Professor Courses Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#172033] font-display">
              Academic Courses
            </h2>
            <p className="text-xs text-[#64748B]">
              Faculty-managed courses, student cohorts, and assignment allocations
            </p>
          </div>
          <Button
            onClick={() => setIsCourseModalOpen(true)}
            variant="outline"
            size="sm"
            icon={PlusCircle}
          >
            Create New Course
          </Button>
        </div>

        {courses.length === 0 ? (
          <Card className="p-8 text-center space-y-3 bg-white">
            <BookMarked className="w-8 h-8 text-[#1557D6] mx-auto" />
            <h3 className="text-sm font-bold text-[#172033]">No Courses Created Yet</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Create a course to organize coursework and student enrollments.
            </p>
            <Button onClick={() => setIsCourseModalOpen(true)} icon={PlusCircle} size="sm">
              Create First Course
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c, idx) => {
              const totalAssn = parseInt(c.assignment_count, 10) || 0;
              const stuCount = parseInt(c.student_count, 10) || 0;
              const courseId = c.id || c._id || `course-${idx}`;

              return (
                <Card
                  key={courseId}
                  className="bg-white p-5 hover:border-[#1557D6] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="academic">{c.code}</Badge>
                      {c.term && (
                        <span className="text-[10px] font-bold text-[#64748B] uppercase font-mono">
                          {c.term}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#172033] line-clamp-1 font-editorial">
                        {c.title}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                        {c.description || 'Curriculum covering fundamental principles and coursework.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D9D5CA]/70 flex items-center justify-between text-xs text-[#64748B] font-mono">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <strong className="text-[#172033]">{stuCount}</strong> Students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <strong className="text-[#172033]">{totalAssn}</strong> Assignments
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D9D5CA]/70">
                    <Link to={`/courses/${courseId}`} className="block">
                      <Button variant="secondary" className="w-full justify-center text-xs">
                        <span>Manage Course & Roster →</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubmissionStatusChart
            confirmed={confirmedSubmissions}
            pending={pendingSubmissions}
            overdue={overdueSubmissions}
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

      {/* Group Performance Component */}
      <GroupPerformanceChart groups={groups} loading={loading} />

      {/* Recent Submissions Table Component */}
      <RecentSubmissionsTable
        submissions={submissions}
        assignments={assignments}
        groups={groups}
        loading={tableLoading || loading}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* CREATE COURSE MODAL */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Create New Academic Course"
        subtitle="Establish an official curriculum space for assignment authoring and student enrollment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code *"
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              placeholder="e.g. CS-301"
              required
            />
            <Input
              label="Term / Semester"
              value={courseForm.term}
              onChange={(e) => setCourseForm({ ...courseForm, term: e.target.value })}
              placeholder="e.g. Fall 2026"
            />
          </div>

          <Input
            label="Course Title *"
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            placeholder="e.g. Web Development & Cloud Systems"
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-[#172033]">Course Description</label>
            <textarea
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Provide an overview of syllabus topics..."
              className="w-full rounded-xl bg-white border border-[#D9D5CA] text-xs sm:text-sm text-[#172033] p-3 outline-none focus:border-[#1557D6]"
            />
          </div>

          {courseError && (
            <p className="text-xs text-rose-600 font-medium">{courseError}</p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D5CA]">
            <Button
              variant="secondary"
              onClick={() => setIsCourseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={courseCreating}
            >
              Create Course
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
