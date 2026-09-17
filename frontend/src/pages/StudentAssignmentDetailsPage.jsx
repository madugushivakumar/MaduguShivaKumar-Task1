import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  ShieldCheck,
  FolderOpen,
  Copy,
  Check,
  AlertTriangle,
  X,
  FileText,
  Lock,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const StudentAssignmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Group selection (in case student has multiple groups allocated to same assignment)
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    loading: false,
    error: null,
  });

  const [toastMessage, setToastMessage] = useState(null);

  const fetchAssignmentDetails = async (selectedGid = null) => {
    try {
      setLoading(true);
      setError(null);
      setErrorStatus(null);
      const res = await submissionService.getStudentAssignmentById(id, selectedGid);
      const data = res.data?.assignment;
      setAssignment(data);
      if (!activeGroupId && data?.group_id) {
        setActiveGroupId(data.group_id);
      }
    } catch (err) {
      console.error('Failed to retrieve assignment details:', err);
      setErrorStatus(err.response?.status);
      setError(
        err.response?.data?.message ||
          'Failed to load assignment details. You may not be assigned to this coursework.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const handleGroupSwitch = (gid) => {
    setActiveGroupId(gid);
    fetchAssignmentDetails(gid);
  };

  const handleCopyLink = () => {
    if (assignment?.onedrive_link) {
      navigator.clipboard.writeText(assignment.onedrive_link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

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

  const getDeadlineStatus = (dueDateStr, submissionStatus) => {
    if (submissionStatus === 'CONFIRMED') {
      return {
        label: 'Submitted',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeColor: 'bg-emerald-600',
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
      };
    }

    if (diffHours <= 48) {
      return {
        label: 'Due Soon',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeColor: 'bg-amber-600',
      };
    }

    return {
      label: 'Active',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badgeColor: 'bg-indigo-600',
    };
  };

  // Execute confirmation
  const handleExecuteConfirmation = async () => {
    if (!assignment || !assignment.group_id) return;

    try {
      setConfirmModal((prev) => ({ ...prev, loading: true, error: null }));

      const res = await submissionService.confirmSubmission(
        assignment.id,
        assignment.group_id
      );

      const returnedSubmission = res.data?.submission;
      const isAlready = res.data?.alreadyConfirmed;

      setAssignment((prev) => ({
        ...prev,
        submission_status: 'CONFIRMED',
        confirmed_at: returnedSubmission?.confirmed_at || new Date().toISOString(),
        confirmed_by: returnedSubmission?.confirmed_by || user?.id,
        confirmed_by_name: returnedSubmission?.confirmed_by_name || user?.name,
      }));

      setConfirmModal({ isOpen: false, loading: false, error: null });
      setToastMessage(
        isAlready
          ? 'Submission for this assignment was already confirmed.'
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Loading coursework instructions & submission status...
        </p>
      </div>
    );
  }

  // Error State Handling (403 Forbidden or 404 Not Found)
  if (error || !assignment) {
    const isForbidden = errorStatus === 403;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Coursework</span>
          </Link>
          <PhaseBadge phase="Phase 6" status="Submissions" />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm space-y-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
              isForbidden ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isForbidden ? <Lock className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {isForbidden ? 'Coursework Access Restricted' : 'Assignment Not Found'}
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {isForbidden
                ? 'This assignment has not been allocated to any project group in which you are a registered member. Only groups explicitly assigned by faculty can access coursework details.'
                : error || 'The requested assignment could not be found or has been removed.'}
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/student/assignments"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all"
            >
              View Enrolled Coursework
            </Link>
            <Link
              to="/student/groups"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Manage Your Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deadline = getDeadlineStatus(assignment.due_date, assignment.submission_status);
  const isConfirmed = assignment.submission_status === 'CONFIRMED';
  const hasMultipleGroups = assignment.student_groups && assignment.student_groups.length > 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Coursework List</span>
        </Link>
        <PhaseBadge phase="Phase 6" status="Submissions Active" />
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>{assignment.group_name}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${deadline.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${deadline.badgeColor}`} />
                {deadline.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {assignment.title}
            </h1>
          </div>

          {/* Direct OneDrive Launch Button */}
          <a
            href={assignment.onedrive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start md:self-auto group"
          >
            <FolderOpen className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
            <span>Open OneDrive Folder</span>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
          </a>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Deadline
              </p>
              <p className="font-bold text-slate-900 mt-0.5">{formatDate(assignment.due_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Faculty Instructor
              </p>
              <p className="font-bold text-slate-900 mt-0.5">
                {assignment.professor_name || 'Academic Faculty'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Group Status
              </p>
              <p
                className={`font-bold mt-0.5 ${
                  isConfirmed ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isConfirmed ? '✓ Confirmed by Team' : 'Pending Submission'}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Group Switcher (if enrolled in multiple groups allocated this coursework) */}
        {hasMultipleGroups && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Switch active group view:</span>
            {assignment.student_groups.map((sg) => (
              <button
                key={sg.id}
                onClick={() => handleGroupSwitch(sg.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  assignment.group_id === sg.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sg.name} ({sg.submission_status})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Instructions & Submission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Coursework Instructions</h2>
            </div>

            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {assignment.description || 'No detailed instructions provided by instructor.'}
            </div>
          </div>

          {/* External OneDrive Submission Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">OneDrive Submission Folder</h2>
                <p className="text-xs text-slate-500">
                  Course files must be deposited in the official instructor-managed folder
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Assignments are collected via the university's external Microsoft OneDrive repository.
              Upload your group's source code, documentation, and presentation files directly into
              the shared folder below.
            </p>

            {/* Folder Link Container */}
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={assignment.onedrive_link}
                className="bg-transparent text-xs font-mono text-slate-700 flex-grow focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-sm transition-all"
                title="Copy URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Explanatory note */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
              <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                The link opens directly in Microsoft OneDrive. You do not need to authenticate your
                personal Microsoft account with Joineazy; once uploaded to OneDrive, return here to
                confirm your group's submission.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Two-Step Submission Verification Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isConfirmed
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {isConfirmed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900">Submission Protocol</h2>
            </div>

            {/* State A: CONFIRMED */}
            {isConfirmed ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <h4 className="text-sm font-bold">Submission Confirmed</h4>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Coursework submission has been verified on behalf of group{' '}
                    <strong>{assignment.group_name}</strong>.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confirmed By:</span>
                    <span className="font-bold text-slate-800">
                      {assignment.confirmed_by_name || 'Group Member'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="font-mono text-slate-800">
                      {formatDate(assignment.confirmed_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Team Status:</span>
                    <span className="font-bold text-emerald-700">Synchronized (All Members)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  All members of {assignment.group_name} have completed this coursework. No further
                  action required.
                </p>
              </div>
            ) : (
              /* State B: PENDING (Two-Step Verification Protocol) */
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Upload to OneDrive</p>
                      <p className="text-slate-500 mt-0.5">
                        Open the folder link and drop your team's deliverables.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Confirm Submission</p>
                      <p className="text-slate-500 mt-0.5">
                        Click below to verify and record confirmation for your entire team.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 1 Trigger Button */}
                <button
                  onClick={() => setConfirmModal({ isOpen: true, loading: false, error: null })}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, I Have Submitted</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Only one team member needs to confirm. Submission applies to all members of{' '}
                  {assignment.group_name}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Step Verification Protocol Modal */}
      {confirmModal.isOpen && (
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
                onClick={() => setConfirmModal({ isOpen: false, loading: false, error: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <p className="font-semibold text-slate-500 uppercase tracking-wider">
                  Coursework Target
                </p>
                <p className="text-sm font-bold text-slate-900">{assignment.title}</p>
                <p className="text-slate-500">
                  Submitting on behalf of:{' '}
                  <strong className="text-indigo-700">{assignment.group_name}</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Have you uploaded your group's assignment to the provided OneDrive link?
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Confirming will notify your instructor and mark this assignment as complete for
                    all members of <strong>{assignment.group_name}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">Need to double-check?</span>
                <a
                  href={assignment.onedrive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-700"
                >
                  <span>Open OneDrive Folder</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

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
                onClick={() => setConfirmModal({ isOpen: false, loading: false, error: null })}
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

export default StudentAssignmentDetailsPage;
