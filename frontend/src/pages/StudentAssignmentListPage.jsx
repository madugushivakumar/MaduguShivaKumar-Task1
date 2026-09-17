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

  // Due date status evaluation
  const getDeadlineStatus = (dueDateStr, submissionStatus) => {
    if (submissionStatus === 'CONFIRMED') {
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

      const res = await submissionService.confirmSubmission(
        assignment.id,
        assignment.group_id
      );

      const returnedSubmission = res.data?.submission;
      const isAlready = res.data?.alreadyConfirmed;

      // Update in local state in place
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === assignment.id && item.group_id === assignment.group_id
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
          : `✓ Successfully confirmed submission for "${assignment.title}" on behalf of ${assignment.group_name}!`
      );

      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      console.error('Submission confirmation failed:', err);
      setConfirmModal((prev) => ({
        ...prev,
        loading: false,
        error:
          err.response?.data?.message ||
          'Failed to record submission confirmation. Please try again.',
      }));
    }
  };

  // Metrics computation
  const totalCount = assignments.length;
  const confirmedCount = assignments.filter((a) => a.submission_status === 'CONFIRMED').length;
  const pendingCount = totalCount - confirmedCount;

  // Group list for filtering
  const distinctGroups = Array.from(
    new Set(assignments.map((a) => a.group_name).filter(Boolean))
  );

  // Filtered dataset
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.professor_name && a.professor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.group_name && a.group_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CONFIRMED' && a.submission_status === 'CONFIRMED') ||
      (statusFilter === 'PENDING' && a.submission_status !== 'CONFIRMED');

    const matchesGroup =
      selectedGroupFilter === 'ALL' || a.group_name === selectedGroupFilter;

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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PhaseBadge phase="Phase 6" status="Submissions Active" />
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                Student Coursework Portal
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Coursework & Submissions
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Discover assignments allocated to your project teams. Access official OneDrive
              submission folders and confirm your group's submission through the two-step
              verification protocol.
            </p>
          </div>

          <button
            onClick={fetchAssignments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-200 border border-slate-700 text-xs font-semibold self-start md:self-auto transition-all"
            title="Refresh coursework feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Feed</span>
          </button>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Enrolled Coursework
              </p>
              <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Pending Submissions
              </p>
              <p className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Confirmed Submissions
              </p>
              <p className="text-2xl font-black text-emerald-300 mt-1">{confirmedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coursework, groups, professors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Controls: Status Tabs & Group Selector */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status Tabs */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('CONFIRMED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'CONFIRMED'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Submitted ({confirmedCount})
              </button>
            </div>

            {/* Group Selector */}
            {distinctGroups.length > 1 && (
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="ALL">All Enrolled Groups</option>
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
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Querying allocated coursework for your groups...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAssignments.length === 0 && (
        <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Coursework Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'ALL' || selectedGroupFilter !== 'ALL'
              ? 'No assignments match your active filters. Try adjusting your search query or status.'
              : 'Your project groups currently have no coursework assigned by faculty. When professors allocate assignments to your groups, they will appear here.'}
          </p>
          <div className="pt-2">
            <Link
              to="/student/groups"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
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
            const isConfirmed = assignment.submission_status === 'CONFIRMED';

            return (
              <div
                key={`${assignment.id}-${assignment.group_id}`}
                className={`bg-white rounded-2xl border p-6 shadow-sm transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                  isConfirmed ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header: Group Pill & Deadline Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{assignment.group_name}</span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${deadline.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${deadline.badgeColor}`} />
                      {deadline.label}
                    </span>
                  </div>

                  {/* Assignment Title & Description */}
                  <div>
                    <Link
                      to={`/student/assignments/${assignment.id}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
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
                        <p className="font-bold">Group Submission Confirmed</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Confirmed by {assignment.confirmed_by_name || 'Team member'} on{' '}
                          {formatDate(assignment.confirmed_at)}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Awaiting group submission to OneDrive</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  {/* OneDrive External Link Button */}
                  <a
                    href={assignment.onedrive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all group"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span>OneDrive Folder</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Two-Step Verification Trigger Button */}
                    {!isConfirmed ? (
                      <button
                        onClick={() => handleOpenConfirmModal(assignment)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-100 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Submission</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 px-2 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </span>
                    )}

                    {/* View Details Link */}
                    <Link
                      to={`/student/assignments/${assignment.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-600 text-xs font-bold transition-colors"
                    >
                      <span>Details</span>
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Confirm Group Submission
                  </h3>
                  <span className="text-xs text-indigo-600 font-semibold">
                    Two-Step Verification Protocol (Step 2 of 2)
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, assignment: null, loading: false, error: null })
                }
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Explicit Confirmation Prompts */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Coursework Target
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {confirmModal.assignment.title}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    <Users className="w-3 h-3" />
                    {confirmModal.assignment.group_name}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    Due {formatDate(confirmModal.assignment.due_date)}
                  </span>
                </div>
              </div>

              {/* Explicit Verification Question */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Have you uploaded your files to OneDrive?</p>
                  <p className="text-amber-800 leading-relaxed">
                    Please ensure that your group's completed assignment has been uploaded to the
                    designated OneDrive folder before confirming. Confirming notifies your faculty
                    and syncs the submission state for all members of{' '}
                    <strong>{confirmModal.assignment.group_name}</strong>.
                  </p>
                </div>
              </div>

              {/* Quick OneDrive check link */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">Need to check your files?</span>
                <a
                  href={confirmModal.assignment.onedrive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-700"
                >
                  <span>Open OneDrive Folder</span>
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
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, assignment: null, loading: false, error: null })
                }
                disabled={confirmModal.loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteConfirmation}
                disabled={confirmModal.loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-100 transition-all disabled:opacity-50"
              >
                {confirmModal.loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Recording Confirmation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Confirm Submission</span>
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
