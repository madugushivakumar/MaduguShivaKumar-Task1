import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import progressService from '../services/progressService';
import assignmentService from '../services/assignmentService';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  RefreshCw,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ProgressBar from '../components/common/ProgressBar';
import SubmissionStatus from '../components/common/SubmissionStatus';
import { SearchBar, EmptyState } from '../components/ui';

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
    const isAck = r.groupSubmissionStatus === 'ACKNOWLEDGED' || r.isAcknowledged;
    const isOverdue = r.groupSubmissionStatus === 'PENDING' && r.assignmentDueDate && new Date(r.assignmentDueDate) < new Date();
    const isPending = r.groupSubmissionStatus === 'PENDING' && !isOverdue;

    if (statusFilter === 'ACKNOWLEDGED') return isAck;
    if (statusFilter === 'CONFIRMED') return r.groupSubmissionStatus === 'CONFIRMED';
    if (statusFilter === 'SUBMITTED') return r.groupSubmissionStatus === 'SUBMITTED';
    if (statusFilter === 'OVERDUE') return isOverdue;
    if (statusFilter === 'PENDING') return isPending;
    return true;
  });

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
          SUBMISSION MATRIX
        </span>
      </div>

      {/* Banner */}
      <div className="paper-card bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#D9D5CA] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase tracking-wider">
                LEDGER OVERSIGHT
              </span>
              <span className="text-xs font-handwritten text-[#8A7E72] text-sm">
                Real-time verification audit
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-editorial tracking-tight text-[#172033]">
              Submissions & Confirmation Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6578] max-w-2xl leading-relaxed">
              Track coursework confirmations across squads and individual student cohorts.
              Distinguish between the student who executed the confirmation protocol and teammates covered by the submission.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="inline-flex bg-white p-1 rounded-2xl border border-[#D9D5CA] shadow-2xs self-start md:self-auto font-mono text-xs">
            <button
              onClick={() => setActiveTab('STUDENT_WISE')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'STUDENT_WISE'
                  ? 'bg-[#1557D6] text-white shadow-xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
            >
              Student-Wise Tracking
            </button>
            <button
              onClick={() => setActiveTab('ASSIGNMENT_WISE')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'ASSIGNMENT_WISE'
                  ? 'bg-[#1557D6] text-white shadow-xs'
                  : 'text-[#5A6578] hover:text-[#172033]'
              }`}
            >
              Assignment-Wise Matrix
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
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-80">
              <SearchBar
                placeholder="Search by student, email, ID, squad..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                onClear={() => setStudentSearch('')}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
              <div className="inline-flex bg-[#FAF8F5] p-1 rounded-xl border border-[#D9D5CA] flex-wrap gap-1">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-[#1557D6] shadow-2xs'
                      : 'text-[#5A6578] hover:text-[#172033]'
                  }`}
                >
                  All ({studentRecords.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACKNOWLEDGED')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'ACKNOWLEDGED'
                      ? 'bg-white text-purple-700 shadow-2xs'
                      : 'text-[#5A6578] hover:text-[#172033]'
                  }`}
                >
                  Acknowledged
                </button>
                <button
                  onClick={() => setStatusFilter('CONFIRMED')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'CONFIRMED'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-[#5A6578] hover:text-[#172033]'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => setStatusFilter('SUBMITTED')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'SUBMITTED'
                      ? 'bg-white text-sky-700 shadow-2xs'
                      : 'text-[#5A6578] hover:text-[#172033]'
                  }`}
                >
                  Submitted
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'PENDING'
                      ? 'bg-white text-amber-700 shadow-2xs'
                      : 'text-[#5A6578] hover:text-[#172033]'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('OVERDUE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'OVERDUE'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-[#5A6578] hover:text-[#172033]'
                  }`}
                >
                  Overdue
                </button>
              </div>

              <button
                onClick={fetchStudentWise}
                className="p-2 bg-[#FAF8F5] hover:bg-blue-50 text-[#1557D6] rounded-xl border border-[#D9D5CA] transition-colors cursor-pointer"
                title="Refresh records"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStudents ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Student Table */}
          {loadingStudents ? (
            <div className="py-16 text-center space-y-3 paper-card bg-white rounded-3xl border border-[#D9D5CA]">
              <div className="w-10 h-10 border-4 border-[#1557D6] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
                Loading student-wise verification records...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Student Records Found"
              description={
                studentSearch || statusFilter !== 'ALL'
                  ? 'No submission records match your search or status filter.'
                  : 'No student coursework allocations currently exist in the database.'
              }
            />
          ) : (
            <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#D9D5CA] text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">
                      <th className="py-4 px-6">Student Information</th>
                      <th className="py-4 px-4">Squad</th>
                      <th className="py-4 px-6">Coursework</th>
                      <th className="py-4 px-6">Confirmation Status & Signer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8] text-xs">
                    {filteredStudents.map((record, idx) => (
                      <tr key={`${record.studentId}-${record.assignmentId}-${idx}`} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        {/* Student Name & Institutional ID */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-[#172033] block font-editorial text-base">
                              {record.studentName}
                            </span>
                            <span className="text-[11px] text-[#5A6578] font-mono block mt-0.5">
                              {record.studentEmail}
                            </span>
                            <span className="text-[10px] text-[#1557D6] font-mono font-bold">
                              ID: {record.studentCode}
                            </span>
                          </div>
                        </td>

                        {/* Group Name */}
                        <td className="py-4 px-4">
                          <Link
                            to={`/admin/groups/${record.groupId}`}
                            className="inline-flex items-center gap-1.5 font-bold font-mono text-[#172033] hover:text-[#1557D6]"
                          >
                            <Users className="w-3.5 h-3.5 text-[#1557D6]" />
                            <span>{record.groupName}</span>
                          </Link>
                        </td>

                        {/* Assignment Title & Due Date */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-[#172033] font-editorial text-base block">
                              {record.assignmentTitle}
                            </span>
                            <span className="text-[11px] text-[#8A7E72] font-mono flex items-center gap-1 mt-0.5">
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
                            isAcknowledger={record.isAcknowledger}
                            isAcknowledged={record.isAcknowledged}
                            acknowledgedByName={record.acknowledgedByName}
                            acknowledgedAt={record.acknowledgedAt}
                            dueDate={record.assignmentDueDate}
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
            <div className="py-16 text-center space-y-3 paper-card bg-white rounded-3xl border border-[#D9D5CA]">
              <div className="w-10 h-10 border-4 border-[#1557D6] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
                Loading assignment-wise submission metrics...
              </p>
            </div>
          ) : assignmentRecords.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Assignments Found"
              description="Create assignments and allocate them to groups to view monitoring data."
            />
          ) : (
            <div className="space-y-4">
              {assignmentRecords.map((item) => {
                const a = item.assignment;
                const isExpanded = expandedAssignmentId === a.id;

                return (
                  <div
                    key={a.id}
                    className="paper-card bg-[#FFFDF7] rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-bold font-editorial text-[#172033]">{a.title}</h3>
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1557D6] border border-blue-200">
                            {item.completionPercentage}% Rate
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-[#5A6578]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#8A7E72]" />
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
                          <span>{item.assignedGroupsCount} squads allocated</span>
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-blue-50 text-[#1557D6] border border-[#D9D5CA] text-xs font-mono font-bold transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Squads' : 'View Squads'}</span>
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
                      <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#D9D5CA]">
                        <span className="text-[#8A7E72] block text-[10px] font-mono font-bold uppercase tracking-wider">
                          Assigned Squads
                        </span>
                        <span className="font-mono font-black text-[#172033] text-lg mt-0.5 block">
                          {item.assignedGroupsCount}
                        </span>
                      </div>
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
                        <span className="text-emerald-700 block text-[10px] font-mono font-bold uppercase tracking-wider">
                          Confirmed Squads
                        </span>
                        <span className="font-mono font-black text-emerald-800 text-lg mt-0.5 block">
                          {item.confirmedGroupsCount}
                        </span>
                      </div>
                      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                        <span className="text-amber-700 block text-[10px] font-mono font-bold uppercase tracking-wider">
                          Pending Squads
                        </span>
                        <span className="font-mono font-black text-amber-800 text-lg mt-0.5 block">
                          {item.pendingGroupsCount}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Group Roster */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#E5E0D8] space-y-2">
                        <h4 className="text-[10px] font-mono font-bold text-[#172033] uppercase tracking-wider mb-2">
                          Allocated Squads Submission Status
                        </h4>

                        {item.groups.length === 0 ? (
                          <p className="text-xs text-[#5A6578] italic">
                            No groups have been allocated to this assignment yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {item.groups.map((g) => {
                              const isAck = g.submission_status === 'ACKNOWLEDGED';
                              const isConfirmed = g.submission_status === 'CONFIRMED' || isAck;
                              return (
                                <div
                                  key={g.group_id}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                                    isAck
                                      ? 'bg-purple-50/40 border-purple-200/80'
                                      : isConfirmed
                                      ? 'bg-emerald-50/30 border-emerald-200/80'
                                      : 'bg-[#FAF8F5] border-[#D9D5CA]'
                                  }`}
                                >
                                  <div>
                                    <Link
                                      to={`/admin/groups/${g.group_id}`}
                                      className="font-bold font-editorial text-base text-[#172033] hover:text-[#1557D6]"
                                    >
                                      {g.group_name}
                                    </Link>
                                    {isAck ? (
                                      <span className="block text-[11px] font-mono text-purple-700 mt-0.5">
                                        Acknowledged by {g.confirmed_by_name || 'Leader'}
                                      </span>
                                    ) : isConfirmed ? (
                                      <span className="block text-[11px] font-mono text-emerald-700 mt-0.5">
                                        Confirmed by {g.confirmed_by_name}
                                      </span>
                                    ) : (
                                      <span className="block text-[11px] font-mono text-amber-700 mt-0.5">
                                        Awaiting submission
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    {isAck ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-purple-700 bg-purple-100/70 border border-purple-200 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Acknowledged</span>
                                      </span>
                                    ) : isConfirmed ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Confirmed</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
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

