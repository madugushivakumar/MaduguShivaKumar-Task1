import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import progressService from '../services/progressService';
import assignmentService from '../services/assignmentService';
import {
  BookOpen,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  RefreshCw,
  UserCheck,
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';
import ProgressBar from '../components/common/ProgressBar';
import SubmissionStatus from '../components/common/SubmissionStatus';

export const AdminSubmissionsPage = () => {
  const [activeTab, setActiveTab] = useState('STUDENT_WISE'); // 'STUDENT_WISE' | 'ASSIGNMENT_WISE'

  // Student-wise tracking state
  const [studentRecords, setStudentRecords] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Assignment-wise monitoring state
  const [assignmentRecords, setAssignmentRecords] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);

  // Filter lists
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CONFIRMED, PENDING

  const fetchStudentWise = async () => {
    try {
      setLoadingStudents(true);
      const res = await progressService.getStudentWiseSubmissions({
        search: studentSearch,
      });
      setStudentRecords(res.data?.records || []);
    } catch (err) {
      console.error('Failed to load student-wise submissions:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAssignmentWise = async () => {
    try {
      setLoadingAssignments(true);
      const listRes = await assignmentService.getAssignments();
      const assignments = listRes.data?.assignments || [];

      // Fetch monitoring detail for each assignment in parallel
      const detailedPromises = assignments.map(async (a) => {
        try {
          const mRes = await progressService.getAssignmentSubmissions(a.id);
          return mRes.data;
        } catch (e) {
          return {
            assignment: a,
            assignedGroupsCount: a.assigned_groups_count || 0,
            confirmedGroupsCount: 0,
            pendingGroupsCount: a.assigned_groups_count || 0,
            completionPercentage: 0,
            groups: [],
          };
        }
      });

      const detailed = await Promise.all(detailedPromises);
      setAssignmentRecords(detailed);
    } catch (err) {
      console.error('Failed to load assignment-wise monitoring:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'STUDENT_WISE') {
      const timer = setTimeout(() => {
        fetchStudentWise();
      }, 250);
      return () => clearTimeout(timer);
    } else {
      fetchAssignmentWise();
    }
  }, [activeTab, studentSearch]);

  // Filter student records by status
  const filteredStudents = studentRecords.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.groupSubmissionStatus === statusFilter;
  });

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
        <PhaseBadge phase="Phase 7" status="Submission Monitoring" />
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
              Submissions & Confirmation Monitoring
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track coursework confirmations across groups and individual student cohorts.
              Distinguish between the student who committed the confirmation and teammates covered
              by the submission.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="inline-flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('STUDENT_WISE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'STUDENT_WISE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Student-Wise Tracking
            </button>
            <button
              onClick={() => setActiveTab('ASSIGNMENT_WISE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ASSIGNMENT_WISE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Assignment-Wise Monitoring
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STUDENT-WISE CONFIRMATION TRACKING                 */}
      {/* ========================================================= */}
      {activeTab === 'STUDENT_WISE' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, email, student ID, group..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({studentRecords.length})
                </button>
                <button
                  onClick={() => setStatusFilter('CONFIRMED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusFilter === 'CONFIRMED'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    statusFilter === 'PENDING'
                      ? 'bg-white text-amber-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
              </div>

              <button
                onClick={fetchStudentWise}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200"
                title="Refresh records"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStudents ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Student Table */}
          {loadingStudents ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Loading student-wise confirmation tracking records...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Student Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {studentSearch || statusFilter !== 'ALL'
                  ? 'No submission records match your search or status filter.'
                  : 'No student coursework allocations currently exist in the database.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Student Information</th>
                      <th className="py-4 px-4">Group</th>
                      <th className="py-4 px-6">Coursework</th>
                      <th className="py-4 px-6">Confirmation Status & Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.map((record, idx) => (
                      <tr key={`${record.studentId}-${record.assignmentId}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                        {/* Student Name & Institutional ID */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              {record.studentName}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {record.studentEmail}
                            </span>
                            <span className="text-[10px] text-indigo-600 font-mono font-semibold">
                              ID: {record.studentCode}
                            </span>
                          </div>
                        </td>

                        {/* Group Name */}
                        <td className="py-4 px-4">
                          <Link
                            to={`/admin/groups/${record.groupId}`}
                            className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-indigo-600"
                          >
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{record.groupName}</span>
                          </Link>
                        </td>

                        {/* Assignment Title & Due Date */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {record.assignmentTitle}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Due:{' '}
                                {new Date(record.assignmentDueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </span>
                          </div>
                        </td>

                        {/* Individual vs Group Confirmation Distinction */}
                        <td className="py-4 px-6">
                          <SubmissionStatus
                            groupStatus={record.groupSubmissionStatus}
                            isConfirmer={record.isConfirmer}
                            confirmedByName={record.confirmedByName}
                            confirmedAt={record.confirmedAt}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ASSIGNMENT-WISE MONITORING                         */}
      {/* ========================================================= */}
      {activeTab === 'ASSIGNMENT_WISE' && (
        <div className="space-y-4">
          {loadingAssignments ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Loading assignment-wise submission metrics...
              </p>
            </div>
          ) : assignmentRecords.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Assignments Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create assignments and allocate them to groups to view monitoring data.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignmentRecords.map((item) => {
                const a = item.assignment;
                const isExpanded = expandedAssignmentId === a.id;

                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {item.completionPercentage}% Completed
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Due:{' '}
                              {new Date(a.due_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </span>
                          <span>•</span>
                          <span>{item.assignedGroupsCount} groups allocated</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-48 hidden sm:block">
                          <ProgressBar
                            value={item.completionPercentage}
                            showLabel={false}
                            size="md"
                          />
                        </div>

                        <button
                          onClick={() =>
                            setExpandedAssignmentId(isExpanded ? null : a.id)
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-600 text-xs font-bold transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Groups' : 'View Groups'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Breakdown Row */}
                    <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Assigned Groups
                        </span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                          {item.assignedGroupsCount}
                        </span>
                      </div>
                      <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-emerald-700 block text-[10px] uppercase font-semibold">
                          Confirmed Groups
                        </span>
                        <span className="font-bold text-emerald-900 text-sm mt-0.5 block">
                          {item.confirmedGroupsCount}
                        </span>
                      </div>
                      <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                        <span className="text-amber-700 block text-[10px] uppercase font-semibold">
                          Pending Groups
                        </span>
                        <span className="font-bold text-amber-900 text-sm mt-0.5 block">
                          {item.pendingGroupsCount}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Group Roster */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Allocated Teams Submission Status
                        </h4>

                        {item.groups.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No groups have been allocated to this assignment yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.groups.map((g) => {
                              const isConfirmed = g.submission_status === 'CONFIRMED';
                              return (
                                <div
                                  key={g.group_id}
                                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                                    isConfirmed
                                      ? 'bg-emerald-50/30 border-emerald-200/80'
                                      : 'bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  <div>
                                    <Link
                                      to={`/admin/groups/${g.group_id}`}
                                      className="font-bold text-slate-900 hover:text-indigo-600"
                                    >
                                      {g.group_name}
                                    </Link>
                                    {isConfirmed ? (
                                      <span className="block text-[11px] text-emerald-700">
                                        Confirmed by {g.confirmed_by_name}
                                      </span>
                                    ) : (
                                      <span className="block text-[11px] text-amber-700">
                                        Awaiting submission
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    {isConfirmed ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Confirmed</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                                        <Clock className="w-3 h-3" />
                                        <span>Pending</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionsPage;
