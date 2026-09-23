import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import submissionService from '../services/submissionService';
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  Info,
  X,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const StudentAssignmentListPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, CONFIRMED
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  // Confirmation Modal State (Two-Step Verification Protocol)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    assignment: null,
    loading: false,
    error: null,
  });

  // Success Notification Banner
  const [toastMessage, setToastMessage] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await submissionService.getStudentAssignments();
      setAssignments(res.data?.assignments || []);
    } catch (err) {
      console.error('Failed to load student assignments:', err);
      setError(err.response?.data?.message || 'Failed to load coursework assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isSubmissionConfirmed = (status) =>
    status === 'CONFIRMED' || status === 'SUBMITTED' || status === 'ACKNOWLEDGED';

  // Due date status evaluation
  const getDeadlineStatus = (dueDateStr, submissionStatus) => {
    if (isSubmissionConfirmed(submissionStatus)) {
      return {
        label: 'Submitted',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeColor: 'bg-emerald-600',
        isComplete: true,
      };
    }

    const now = new Date();
    const due = new Date(dueDateStr);
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return {
        label: 'Overdue',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeColor: 'bg-rose-600',
        isComplete: false,
      };
    }

    if (diffHours <= 48) {
      return {
        label: 'Due Soon',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeColor: 'bg-amber-600',
        isComplete: false,
      };
    }

    return {
      label: 'Active',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badgeColor: 'bg-indigo-600',
      isComplete: false,
    };
  };

  // Two-step verification step 1: Open verification prompt
  const handleOpenConfirmModal = (assignment) => {
    setConfirmModal({
      isOpen: true,
      assignment,
      loading: false,
      error: null,
    });
  };

  // Two-step verification step 2: Execute confirmation
  const handleExecuteConfirmation = async () => {
    const { assignment } = confirmModal;
    if (!assignment) return;

    try {
      setConfirmModal((prev) => ({ ...prev, loading: true, error: null }));

      let returnedSubmission;
      let isAlready = false;

      const isIndividual =
        assignment.submission_type === 'INDIVIDUAL' || !assignment.group_id;

      if (isIndividual) {
        // Individual coursework submission
        const res = await submissionService.submitAssignment(assignment.id, {
          groupId: null,
          submissionLink: assignment.onedrive_link || '',
        });
        returnedSubmission = res.data;

        // Auto-acknowledge individual coursework
        try {
          const ackRes = await submissionService.acknowledgeAssignment(assignment.id);
          if (ackRes?.data) returnedSubmission = ackRes.data;
        } catch {
          // Acknowledgment optional if already submitted
        }
      } else {
        // Group coursework confirmation via 2-step protocol
        try {
          const res = await submissionService.confirmSubmission(
            assignment.id,
            assignment.group_id
          );
          returnedSubmission = res.data?.submission;
          isAlready = res.data?.alreadyConfirmed;
        } catch (groupConfirmErr) {
          // If group confirm failed and student is group leader, attempt direct acknowledgment protocol
          if (assignment.is_group_leader) {
            const ackRes = await submissionService.acknowledgeAssignment(
              assignment.id,
              assignment.group_id
            );
            returnedSubmission = ackRes.data;
          } else {
            throw groupConfirmErr;
          }
        }
      }

      // Update in local state in place
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === assignment.id &&
          (item.group_id === assignment.group_id || (!item.group_id && !assignment.group_id))
            ? {
                ...item,
                submission_status: 'CONFIRMED',
                confirmed_at: returnedSubmission?.confirmed_at || new Date().toISOString(),
                confirmed_by: returnedSubmission?.confirmed_by || user?.id,
                confirmed_by_name: returnedSubmission?.confirmed_by_name || user?.name,
              }
            : item
        )
      );

      setConfirmModal({ isOpen: false, assignment: null, loading: false, error: null });
      setToastMessage(
        isAlready
          ? `Submission for "${assignment.title}" was already confirmed.`
          : `✓ Successfully confirmed submission for "${assignment.title}"${
              assignment.group_name ? ` on behalf of ${assignment.group_name}` : ''
            }!`
      );

      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Submission confirmation failed:', err);
      setConfirmModal((prev) => ({
        ...prev,
        loading: false,
        error:
          err.response?.data?.message ||
          err.message ||
          'Failed to record submission confirmation. Please try again.',
      }));
    }
  };

  // Metrics computation
  const totalCount = assignments.length;
  const confirmedCount = assignments.filter((a) => isSubmissionConfirmed(a.submission_status)).length;
  const pendingCount = totalCount - confirmedCount;

  // Group list for filtering
  const distinctGroups = Array.from(
    new Set(assignments.map((a) => a.group_name).filter(Boolean))
  );
  const hasIndividualAssignments = assignments.some(
    (a) => !a.group_name || a.submission_type === 'INDIVIDUAL'
  );

  // Filtered dataset
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.professor_name && a.professor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.group_name && a.group_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const isConfirmedItem = isSubmissionConfirmed(a.submission_status);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CONFIRMED' && isConfirmedItem) ||
      (statusFilter === 'PENDING' && !isConfirmedItem);

    const matchesGroup =
      selectedGroupFilter === 'ALL' ||
      (selectedGroupFilter === 'INDIVIDUAL' && (!a.group_name || a.submission_type === 'INDIVIDUAL')) ||
      a.group_name === selectedGroupFilter;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-600/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-emerald-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner (Warm Paper) */}
      <div className="paper-card bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xs border border-[#E5E0D8] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 uppercase tracking-wider">
                COURSEWORK DOSSIER
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">
                • Student Mission Hub
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-editorial tracking-tight text-slate-900">
              Coursework & Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Discover assignments allocated to your project teams. Access official OneDrive
              submission folders and confirm your group's submission through the verified protocol.
            </p>
          </div>

          <button
            onClick={fetchAssignments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-[#E5E0D8] text-xs font-bold self-start md:self-auto transition-all shadow-2xs cursor-pointer"
            title="Refresh coursework feed"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feed</span>
          </button>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#E5E0D8]">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Enrolled Coursework
              </p>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-mono">
                Pending Submissions
              </p>
              <p className="text-2xl font-black font-mono text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                Confirmed Submissions
              </p>
              <p className="text-2xl font-black font-mono text-emerald-600 mt-1">{confirmedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="paper-card bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coursework, groups, professors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Controls: Status Tabs & Group Selector */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status Tabs */}
            <div className="inline-flex bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8]">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'PENDING'
                    ? 'bg-white text-amber-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('CONFIRMED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'CONFIRMED'
                    ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Submitted ({confirmedCount})
              </button>
            </div>

            {/* Group Selector */}
            {(distinctGroups.length > 0 || hasIndividualAssignments) && (
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-[#E5E0D8] text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="ALL">All Cohort Allocations</option>
                {hasIndividualAssignments && (
                  <option value="INDIVIDUAL">Individual Coursework</option>
                )}
                {distinctGroups.map((gName) => (
                  <option key={gName} value={gName}>
                    {gName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#E5E0D8] paper-card">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Querying allocated coursework for your groups...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAssignments.length === 0 && (
        <div className="py-16 text-center space-y-4 paper-card bg-white rounded-3xl border border-[#E5E0D8] p-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-editorial text-xl">No Coursework Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'ALL' || selectedGroupFilter !== 'ALL'
              ? 'No assignments match your active filters. Try adjusting your search query or status.'
              : 'Your project groups currently have no coursework assigned by faculty. When professors allocate assignments to your groups, they will appear here.'}
          </p>
          <div className="pt-2">
            <Link
              to="/student/groups"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>View Your Project Groups</span>
            </Link>
          </div>
        </div>
      )}

      {/* Coursework Card Grid */}
      {!loading && !error && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredAssignments.map((assignment) => {
            const deadline = getDeadlineStatus(
              assignment.due_date,
              assignment.submission_status
            );
            const isConfirmed = isSubmissionConfirmed(assignment.submission_status);

            return (
              <div
                key={`${assignment.id}-${assignment.group_id || 'indiv'}`}
                className={`paper-card bg-white rounded-2xl border p-6 shadow-2xs transition-all duration-200 flex flex-col justify-between hover:shadow-xs ${
                  isConfirmed ? 'border-emerald-300/80 bg-emerald-50/15' : 'border-[#E5E0D8]'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header: Group / Individual Pill & Deadline Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {assignment.group_name ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold font-mono">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>{assignment.group_name}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold font-mono">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Individual Coursework</span>
                      </div>
                    )}

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border font-mono ${deadline.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${deadline.badgeColor}`} />
                      {deadline.label}
                    </span>
                  </div>

                  {/* Assignment Title & Description */}
                  <div>
                    <Link
                      to={`/student/assignments/${assignment.id}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 font-editorial text-lg"
                    >
                      {assignment.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {assignment.description || 'No detailed instructions provided.'}
                    </p>
                  </div>

                  {/* Metadata Row: Professor and Due Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>
                        Due: <strong className="text-slate-700">{formatDate(assignment.due_date)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        Faculty: <strong className="text-slate-700">{assignment.professor_name || 'Faculty'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Submission Status Highlight Banner */}
                  {isConfirmed ? (
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">
                          {assignment.group_name ? 'Group Submission Confirmed' : 'Individual Submission Confirmed'}
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Confirmed by {assignment.confirmed_by_name || 'Student'} on{' '}
                          {formatDate(assignment.confirmed_at)}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          {assignment.group_name
                            ? 'Awaiting group submission to OneDrive'
                            : 'Awaiting individual submission to OneDrive'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2.5">
                  {/* OneDrive External Link Button */}
                  <a
                    href={assignment.onedrive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-blue-50/60 border border-[#D9D5CA] text-[#172033] text-xs font-semibold font-mono transition-all group"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#1557D6] group-hover:scale-110 transition-transform" />
                    <span>OneDrive Vault</span>
                    <ExternalLink className="w-3 h-3 text-[#8A7E72]" />
                  </a>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Two-Step Verification Trigger Button */}
                    {!isConfirmed ? (
                      <button
                        onClick={() => handleOpenConfirmModal(assignment)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1557D6] hover:bg-[#0D3EA8] active:bg-[#0A2E80] text-white text-xs font-bold font-mono transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Submission</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}

                    {/* View Details Link */}
                    <Link
                      to={`/student/assignments/${assignment.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-blue-50 text-[#1557D6] border border-[#D9D5CA] text-xs font-bold transition-colors font-mono"
                    >
                      <span>Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Two-Step Verification Protocol Modal */}
      {confirmModal.isOpen && confirmModal.assignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#172033]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="paper-card bg-[#FFFDF7] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D9D5CA] space-y-6 animate-scale-up relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#1557D6] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-editorial text-[#172033] leading-tight">
                    Confirm Group Submission
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#1557D6]">
                    Two-Step Verification Protocol (Step 2 of 2)
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, assignment: null, loading: false, error: null })
                }
                className="text-[#8A7E72] hover:text-[#172033] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Explicit Confirmation Prompts */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D9D5CA] space-y-2">
                <p className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">
                  Target Coursework
                </p>
                <p className="text-base font-bold font-editorial text-[#172033]">
                  {confirmModal.assignment.title}
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1557D6] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    <Users className="w-3 h-3" />
                    {confirmModal.assignment.group_name}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[#5A6578]">
                    Due {formatDate(confirmModal.assignment.due_date)}
                  </span>
                </div>
              </div>

              {/* Explicit Verification Question */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Have you uploaded your files to OneDrive?</p>
                  <p className="text-amber-800 leading-relaxed">
                    Please ensure that your completed assignment deliverables have been placed in the
                    designated OneDrive folder before verifying. Confirming updates the institutional ledger and notifies faculty
                    {confirmModal.assignment.group_name ? (
                      <> on behalf of <strong>{confirmModal.assignment.group_name}</strong>.</>
                    ) : (
                      <> for your individual submission.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Quick OneDrive check link */}
              <div className="flex items-center justify-between text-xs px-1 font-mono">
                <span className="text-[#5A6578]">Need to check repository?</span>
                <a
                  href={confirmModal.assignment.onedrive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1557D6] font-bold hover:text-[#0D3EA8]"
                >
                  <span>Open OneDrive Vault</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Error state inside modal */}
              {confirmModal.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{confirmModal.error}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, assignment: null, loading: false, error: null })
                }
                disabled={confirmModal.loading}
                className="px-4 py-2.5 rounded-xl border border-[#D9D5CA] text-[#5A6578] hover:bg-[#FAF8F5] text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteConfirmation}
                disabled={confirmModal.loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold shadow-md shadow-emerald-100 transition-all disabled:opacity-50 cursor-pointer"
              >
                {confirmModal.loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing Protocol...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Sign Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentListPage;
