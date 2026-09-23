import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import submissionService from '../services/submissionService';
import SubmissionSuccessView from '../components/common/SubmissionSuccessView';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Users,
  FolderOpen,
  Copy,
  Check,
  X,
  FileText,
  Lock,
  User,
  Award,
  Box,
  Crown,
  ShieldCheck,
  Sparkles,
  Loader2,
  Send,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Timeline,
  Modal,
  Breadcrumb,
} from '../components/ui';

export const StudentAssignmentDetailsPage = ({ forceSuccessView = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [statusInfo, setStatusInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Success view state (08. Submission Success)
  const [showSuccessView, setShowSuccessView] = useState(
    forceSuccessView ||
    Boolean(new URLSearchParams(window.location.search).get('success')) ||
    window.location.pathname.endsWith('/success')
  );

  // Group selection (if student in multiple teams)
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Modals state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  // Individual submission inputs
  const [submissionLinkInput, setSubmissionLinkInput] = useState('');
  const [submissionNotesInput, setSubmissionNotesInput] = useState('');

  const fetchAssignmentDetails = useCallback(
    async (selectedGid = null) => {
      try {
        setLoading(true);
        setError(null);
        setErrorStatus(null);

        const res = await submissionService.getStudentAssignmentById(id, selectedGid);
        const data = res.data?.assignment;
        setAssignment(data);

        const currentGid = selectedGid || data?.group_id;
        if (!activeGroupId && currentGid) {
          setActiveGroupId(currentGid);
        }

        try {
          const statusRes = await submissionService.getStatus(id, currentGid);
          setStatusInfo(statusRes.data);
        } catch (sErr) {
          console.warn('Fallback to assignment status data:', sErr.message);
        }
      } catch (err) {
        console.error('Failed to retrieve assignment details:', err);
        setErrorStatus(err.status || err.response?.status);
        setError(
          err.message ||
            err.response?.data?.message ||
            'Failed to load assignment details. You may not be assigned to this coursework.'
        );
      } finally {
        setLoading(false);
      }
    },
    [id, activeGroupId]
  );

  useEffect(() => {
    fetchAssignmentDetails();
  }, [fetchAssignmentDetails]);

  const handleCopyLink = () => {
    if (assignment?.onedrive_link) {
      navigator.clipboard.writeText(assignment.onedrive_link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Split due date into clean date and time components matching reference
  const formatDueDate = (dateStr) => {
    if (!dateStr) return { date: 'No due date', time: '' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const date = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return { date, time };
  };

  const formatTimelineDate = (dateStr, fallback = 'Completed') => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Execution of Confirmation (Panel 04 & 08 action)
  const handleExecuteConfirmation = async () => {
    if (!assignment) return;
    const isGroup = assignment.submission_type === 'GROUP';

    try {
      setIsSubmittingConfirm(true);
      setConfirmError(null);

      if (isGroup) {
        await submissionService.acknowledgeAssignment(assignment.id, assignment.group_id);
      } else {
        if (submissionLinkInput.trim() || submissionNotesInput.trim()) {
          await submissionService.submitAssignment(assignment.id, {
            submissionLink: submissionLinkInput.trim(),
            submissionText: submissionNotesInput.trim(),
          });
        }
        await submissionService.acknowledgeAssignment(assignment.id);
      }

      // Close confirmation modal and open full-page celebration (08. Submission Success)
      setIsConfirmModalOpen(false);
      setShowSuccessView(true);

      // Refresh data in background
      await fetchAssignmentDetails(assignment.group_id);
    } catch (err) {
      console.error('Submission acknowledgment failed:', err);
      const errMsg =
        err.message ||
        err.data?.message ||
        err.response?.data?.message ||
        'Failed to record submission confirmation.';
      setConfirmError(errMsg);
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  // Smart requirements & deliverables extraction: uses structured data if present,
  // or domain-specific coursework checklist matching the assignment title & description.
  const getCourseworkChecklists = (assign) => {
    if (assign?.requirements && Array.isArray(assign.requirements) && assign.requirements.length > 0) {
      return {
        requirements: assign.requirements,
        deliverables: assign.deliverables || [],
      };
    }

    const titleLower = (assign?.title || '').toLowerCase();
    const descLower = (assign?.description || '').toLowerCase();

    if (titleLower.includes('rest api') || descLower.includes('rest api') || descLower.includes('express')) {
      return {
        requirements: [
          'Use Node.js + Express',
          'Implement CRUD operations',
          'Connect to PostgreSQL',
          'Proper error handling',
        ],
        deliverables: [
          'Working API (deployed)',
          'GitHub repository link',
          'Documentation (README)',
          'Postman collection (optional)',
        ],
      };
    }

    if (titleLower.includes('consensus') || titleLower.includes('cs401') || descLower.includes('raft') || descLower.includes('paxos')) {
      return {
        requirements: [
          'Implement Paxos or Raft consensus protocol',
          'Ensure leader election & log replication safety',
          'Simulate network partitions & failover',
          'Deterministic state machine replication',
        ],
        deliverables: [
          'Production Go/Node.js source code bundle',
          'Academic architecture report (PDF)',
          'Automated benchmark suite & logs',
          'OneDrive submission archive link',
        ],
      };
    }

    if (titleLower.includes('cloud') || titleLower.includes('cs402') || descLower.includes('terraform')) {
      return {
        requirements: [
          'Multi-region high-availability topology',
          'Automated health checks & auto-scaling groups',
          'Terraform / IaC configuration manifests',
          'Zero-downtime deployment pipeline',
        ],
        deliverables: [
          'Terraform infrastructure repository',
          'Architecture diagram & failover analysis',
          'Load testing benchmark report',
          'Shared OneDrive deliverable link',
        ],
      };
    }

    if (titleLower.includes('indexing') || titleLower.includes('cs403') || titleLower.includes('query') || descLower.includes('postgres')) {
      return {
        requirements: [
          'Analyze slow query logs & execution plans',
          'Design B-tree / GiST index strategies',
          'Measure latency reduction under concurrent load',
          'Demonstrate 10x throughput improvement',
        ],
        deliverables: [
          'Optimized PostgreSQL schema migrations',
          'EXPLAIN (ANALYZE, BUFFERS) comparative report',
          'Query tuning benchmark scripts',
          'OneDrive archive containing test database',
        ],
      };
    }

    // Default academic checklist based on standard coursework requirements
    return {
      requirements: [
        'Adhere to coursework specification & standards',
        'Implement core business logic & validation',
        'Provide test coverage & edge-case handling',
        'Clear documentation & setup instructions',
      ],
      deliverables: [
        'Verified OneDrive deliverables upload',
        'Source code repository / archive',
        'Technical report / documentation',
        'Postman collection or execution guide',
      ],
    };
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#1557D6] animate-spin" />
        <p className="text-xs text-[#64748B] font-mono tracking-wider uppercase">
          Initializing Assignment Dossier...
        </p>
      </div>
    );
  }

  if (error || !assignment) {
    const isForbidden = errorStatus === 403;
    return (
      <Card className="max-w-md mx-auto my-12 p-8 text-center bg-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          {isForbidden ? <Lock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        <h2 className="text-lg font-bold text-[#172033] font-display">
          {isForbidden ? 'Coursework Access Restricted' : 'Assignment Dossier Not Found'}
        </h2>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
          {isForbidden
            ? 'This assignment has not been allocated to your cohort or enrolled course.'
            : error || 'The requested assignment could not be found.'}
        </p>
        <Link to="/student/assignments">
          <Button size="sm" icon={ArrowLeft}>
            Return to Assignments
          </Button>
        </Link>
      </Card>
    );
  }

  const isGroup = assignment.submission_type === 'GROUP';
  const isConfirmed =
    assignment.submission_status === 'CONFIRMED' ||
    assignment.submission_status === 'ACKNOWLEDGED' ||
    statusInfo?.isAcknowledged === true;

  const isGroupLeader = statusInfo ? statusInfo.isGroupLeader : (assignment.is_group_leader ?? true);
  const leaderName = statusInfo?.leaderName || 'the Group Leader';

  // Render Full-Page Submission Celebration (08. Submission Success)
  if (showSuccessView) {
    return (
      <SubmissionSuccessView
        assignment={assignment}
        user={user}
        statusInfo={statusInfo}
        onViewAssignment={() => setShowSuccessView(false)}
        onBackToCourse={() =>
          navigate(
            assignment?.course_id
              ? `/courses/${assignment.course_id}`
              : '/student/assignments'
          )
        }
      />
    );
  }

  const dueDateFormatted = formatDueDate(assignment.due_date);
  const { requirements, deliverables } = getCourseworkChecklists(assignment);

  // Timeline dates
  const groupCreatedDate = formatTimelineDate(
    statusInfo?.groupCreatedAt || assignment.assigned_at || assignment.created_at,
    'Sep 10, 2026, 10:30 AM'
  );
  const membersAddedDate = formatTimelineDate(
    assignment.assigned_at || assignment.created_at,
    'Sep 11, 2026, 11:20 AM'
  );

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* DOSSIER SHEET CANVAS (Warm paper background with authentic academic editorial styling) */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#D9D5CA] p-6 sm:p-8 lg:p-10 shadow-paper-elevated relative overflow-hidden">
        {/* Subtle decorative top paper margin accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1557D6]/20 via-[#D9D5CA] to-[#1557D6]/20" />

        {/* TOP ROW: Back Link, Status Pill, and Academic Stamp */}
        <div className="flex items-center justify-between gap-4 relative">
          {/* Back Navigation */}
          <Link
            to={assignment.course_id ? `/courses/${assignment.course_id}` : '/student/assignments'}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#334155] hover:text-[#1557D6] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-[#64748B] group-hover:text-[#1557D6]" />
            <span>Back to Assignments</span>
          </Link>

          {/* Right Top Status Pill */}
          <div className="flex items-center gap-3">
            {isConfirmed ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Completed</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#DBEAFE]/80 border border-[#93C5FD] text-[#1557D6] text-xs font-bold shadow-2xs">
                <span>In Progress</span>
                <span className="text-sm leading-none font-bold">→</span>
              </div>
            )}
          </div>
        </div>

        {/* HEADER SECTION WITH ROTATED CIRCULAR ACADEMIC STAMP */}
        <div className="relative mt-5">
          {/* Circular Academic Stamp (Desktop positioned to right of title area, matching reference) */}
          <div className="hidden sm:block absolute right-4 lg:right-12 -top-2 select-none pointer-events-none opacity-85 -rotate-6">
            <svg className="w-24 h-24 lg:w-28 lg:h-28 text-[#475569]" viewBox="0 0 100 100" fill="none">
              {/* Outer dashed circular rim */}
              <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
              {/* Inner double solid rims */}
              <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="50" cy="50" r="33" stroke="currentColor" strokeWidth="0.8" />
              {/* Circular curved text path */}
              <path id="academicSealPath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text className="text-[6.2px] font-mono uppercase tracking-[0.16em] fill-[#475569] font-bold">
                <textPath href="#academicSealPath" startOffset="50%" textAnchor="middle">
                  ACADEMIC EVALUATION • OFFICIAL BRIEF •
                </textPath>
              </text>
              {/* Distressed center stamp text */}
              <g opacity="0.9">
                <path
                  d="M50 37 L52 43.5 L58.5 43.5 L53.2 47.5 L55.2 54 L50 50 L44.8 54 L46.8 47.5 L41.5 43.5 L48 43.5 Z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <text x="50" y="62" textAnchor="middle" className="text-[6px] font-mono font-black uppercase tracking-widest fill-[#475569]">
                  EXAM
                </text>
                <text x="50" y="69" textAnchor="middle" className="text-[5px] font-mono uppercase tracking-wider fill-[#475569]">
                  PORTAL 2026
                </text>
              </g>
            </svg>
          </div>

          {/* Dossier Uppercase Subtitle */}
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#64748B] uppercase font-bold">
            ASSIGNMENT DOSSIER
          </p>

          {/* Assignment Title */}
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-black text-[#172033] tracking-tight leading-tight mt-1 max-w-2xl">
            {assignment.title}
          </h1>

          {/* Course and Assignment Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <span className="px-3.5 py-1 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#1557D6] shadow-2xs">
              {assignment.course_name || assignment.course_title || 'Web Development'}
            </span>
            <span className="px-3.5 py-1 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#1557D6] shadow-2xs">
              {isGroup ? 'Group Assignment' : 'Individual Assignment'}
            </span>
          </div>
        </div>

        {/* METADATA ROW: 4 COMPACT STRUCTURED BLOCKS */}
        <div className="bg-white rounded-2xl border border-[#D9D5CA] p-4 sm:p-5 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D9D5CA]/70 mt-6">
          {/* Block 1: Due Date */}
          <div className="flex items-start gap-3 sm:pr-4">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA] flex items-center justify-center shrink-0 text-[#64748B]">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                Due Date
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#172033] mt-0.5 truncate">
                {dueDateFormatted.date}
              </p>
              {dueDateFormatted.time && (
                <p className="text-[11px] text-[#64748B] font-mono">
                  {dueDateFormatted.time}
                </p>
              )}
            </div>
          </div>

          {/* Block 2: Max Marks */}
          <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:px-4">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA] flex items-center justify-center shrink-0 text-[#64748B]">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                Max Marks
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#172033] mt-0.5 font-mono">
                {assignment.max_score || 100}
              </p>
            </div>
          </div>

          {/* Block 3: Assigned By */}
          <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:px-4">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA] flex items-center justify-center shrink-0 text-[#64748B]">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                Assigned By
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#172033] mt-0.5 truncate">
                {assignment.professor_name || assignment.instructor_name || 'Dr. Amit Sharma'}
              </p>
            </div>
          </div>

          {/* Block 4: Submission Type */}
          <div className="flex items-start gap-3 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA] flex items-center justify-center shrink-0 text-[#1557D6]">
              <Box className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                Submission Type
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#1557D6] mt-0.5 truncate">
                {isGroup ? (assignment.group_name || 'Group') : 'Individual'}
              </p>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN WORKBENCH: LEFT (Description + Checklists + Buttons) / RIGHT (Timeline + Sticky Note) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mt-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-[#172033] font-display mb-2">
                Description
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {assignment.description ||
                  'Build a REST API using Node.js and Express. Implement CRUD operations, proper error handling, and connect it with a PostgreSQL database. Deploy the API and share the endpoint.'}
              </p>
            </div>

            {/* Side-by-side Requirements & Deliverables Checklists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
              {/* Requirements Column */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#172033] font-display">
                  Requirements
                </h3>
                <ul className="space-y-2.5">
                  {requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#334155]">
                      <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-500 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                        ✓
                      </span>
                      <span className="leading-snug">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deliverables Column */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#172033] font-display">
                  Deliverables
                </h3>
                <ul className="space-y-2.5">
                  {deliverables.map((deliv, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#334155]">
                      <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-400 text-slate-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                        ✓
                      </span>
                      <span className="leading-snug">{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons: Primary Blue + Secondary Outlined */}
            <div className="pt-6 flex flex-wrap items-center gap-4">
              {assignment.onedrive_link ? (
                <a
                  href={assignment.onedrive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 bg-[#1557D6] hover:bg-[#0D3EA8] text-white px-7 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
                >
                  <span>Open OneDrive Folder</span>
                  <span className="text-base font-bold leading-none">→</span>
                </a>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-slate-200 text-slate-500 px-6 py-3 rounded-xl font-semibold text-xs cursor-not-allowed"
                >
                  <span>No Folder Link Provided</span>
                </button>
              )}

              {isConfirmed ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold shadow-2xs">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Submission Confirmed</span>
                  </div>
                  <button
                    onClick={() => setShowSuccessView(true)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF8F5] border border-[#1557D6] text-[#1557D6] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                  >
                    View Receipt
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF8F5] border-2 border-[#1557D6] text-[#1557D6] px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-2xs transition-all transform active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#1557D6] stroke-[2.5]" />
                  <span>I've Submitted</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Submission Progress + Pinned Sticky Note */}
          <div className="lg:col-span-5 space-y-6">
            {/* Submission Progress Container */}
            <div className="bg-white rounded-2xl border border-[#D9D5CA] p-6 sm:p-7 shadow-2xs">
              <h2 className="text-sm font-bold text-[#172033] font-display mb-6">
                Submission Progress
              </h2>

              {/* Vertical Stepper Timeline */}
              <div className="relative pl-1 space-y-7">
                {/* Step 1: Group Created / Coursework Brief */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[13px] top-[26px] bottom-[-28px] w-0.5 bg-emerald-500" />
                  <div className="relative z-10 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs font-bold text-[#172033]">
                      {isGroup ? 'Group Created' : 'Coursework Assigned'}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">{groupCreatedDate}</p>
                  </div>
                </div>

                {/* Step 2: Members Added / Workspace Ready */}
                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[13px] top-[26px] bottom-[-28px] w-0.5 bg-emerald-500" />
                  <div className="relative z-10 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs font-bold text-[#172033]">
                      {isGroup ? 'Members Added' : 'Workspace Configured'}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">{membersAddedDate}</p>
                  </div>
                </div>

                {/* Step 3: Work Uploaded */}
                <div className="relative flex items-start gap-4">
                  <div className={`absolute left-[13px] top-[26px] bottom-[-28px] w-0.5 ${isConfirmed ? 'bg-emerald-500' : 'bg-[#D9D5CA]'}`} />
                  <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs">
                    {isConfirmed ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs animate-checkmark">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-[#1557D6] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1557D6] animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs font-bold text-[#172033]">Work Uploaded</p>
                    {isConfirmed ? (
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5 animate-badge">
                        Uploaded to OneDrive
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-[#1557D6] mt-0.5">
                        In Progress
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 4: Confirm Submission */}
                <div className="relative flex items-start gap-4">
                  <div className={`absolute left-[13px] top-[26px] bottom-[-28px] w-0.5 ${isConfirmed ? 'bg-emerald-500' : 'bg-[#D9D5CA]'}`} />
                  <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                    {isConfirmed ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs animate-checkmark">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                        <Crown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs font-bold text-[#172033]">Confirm Submission</p>
                    {isConfirmed ? (
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5 animate-badge">
                        Confirmed by {isGroup ? 'Group Leader' : 'Student'}
                      </p>
                    ) : (
                      <div className="mt-0.5 space-y-0.5">
                        <p className="text-xs font-bold text-amber-600">Pending</p>
                        {isGroup && (
                          <p className="text-[11px] text-rose-500 font-medium">
                            (Only group leader can confirm)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 5: Acknowledged */}
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                    {isConfirmed ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs animate-checkmark">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white border-2 border-[#475569] text-[#475569] flex items-center justify-center text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#475569]" />
                      </div>
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs font-bold text-[#172033]">Acknowledged</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {isConfirmed ? 'Recorded by Faculty' : 'Not yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PINNED YELLOW STICKY NOTE WITH METALLIC PAPERCLIP (Matching Reference Bottom Right) */}
            <div className="flex justify-end pt-2">
              <div className="relative w-48 sm:w-56 bg-[#FEF9C3] rounded-2xl p-5 border border-amber-300/80 shadow-sticky transform rotate-2 hover:rotate-0 transition-transform duration-200">
                {/* Realistic Metallic Paperclip (Positioned at Top-Right matching reference image) */}
                <div className="absolute -top-3 right-5 w-6 h-12 pointer-events-none drop-shadow-sm select-none z-20">
                  <svg viewBox="0 0 24 48" fill="none" className="w-full h-full">
                    <path
                      d="M7 12 V34 C7 38 10 42 14 42 C18 42 21 38 21 34 V8 C21 3.5 17.5 0 13 0 C8.5 0 5 3.5 5 8 V35 C5 41 9.5 46 15.5 46 C21.5 46 26 41 26 35 V12"
                      stroke="#64748B"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 12 V34 C7 38 10 42 14 42 C18 42 21 38 21 34 V8 C21 3.5 17.5 0 13 0 C8.5 0 5 3.5 5 8 V35 C5 41 9.5 46 15.5 46 C21.5 46 26 41 26 35 V12"
                      stroke="#CBD5E1"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="font-handwritten text-xl sm:text-2xl text-[#78350F] leading-tight pr-2">
                  Good work takes time. Keep going!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL (Strictly preserving 100% of existing logic and two-step verification) */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Coursework Submission"
        subtitle={`Assignment: ${assignment.title}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteConfirmation}
              loading={isSubmittingConfirm}
              icon={CheckCircle2}
            >
              Yes, I Have Submitted
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-[#475569]">
          <p>
            Please ensure you have uploaded your final deliverables to the official OneDrive submission folder before confirming.
          </p>

          {!isGroup && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-bold mb-1">
                  Submission Repository / Link (Optional)
                </label>
                <input
                  type="url"
                  value={submissionLinkInput}
                  onChange={(e) => setSubmissionLinkInput(e.target.value)}
                  placeholder="https://github.com/your-username/your-repo"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA] text-xs text-[#172033] focus:outline-none focus:border-[#1557D6]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-bold mb-1">
                  Submission Notes (Optional)
                </label>
                <textarea
                  value={submissionNotesInput}
                  onChange={(e) => setSubmissionNotesInput(e.target.value)}
                  placeholder="Add any specific notes or instructions for faculty..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA] text-xs text-[#172033] focus:outline-none focus:border-[#1557D6]"
                />
              </div>
            </div>
          )}

          {isGroup && !isGroupLeader && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <span className="font-bold">Group Notice: </span>
              Only the group leader ({leaderName}) has official confirmation rights for the group. Your confirmation will be recorded as a member endorsement.
            </div>
          )}

          {confirmError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {confirmError}
            </div>
          )}
        </div>
      </Modal>

      {/* PANEL 08: CELEBRATION SUCCESS MODAL */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Assignment Submitted!"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center gap-3 w-full justify-between">
            <Button
              variant="secondary"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              View Assignment
            </Button>
            <Button
              onClick={() => navigate('/student/assignments')}
            >
              Back to Course
            </Button>
          </div>
        }
      >
        <div className="space-y-6 text-center py-2">
          <div className="flex items-center justify-between">
            <span className="font-handwritten text-xl text-[#1557D6] -rotate-2">
              Another step forward!
            </span>
            <div className="rubber-stamp text-xs px-3 py-1 font-mono">
              ★ SUBMITTED ★
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[#172033] font-editorial tracking-tight">
              Assignment Submitted!
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Your assignment has been successfully submitted to the provided OneDrive folder.
            </p>
          </div>

          <div className="pt-2">
            <Timeline
              orientation="horizontal"
              steps={[
                { id: 1, title: 'Group Created', date: 'Sep 10', status: 'completed' },
                { id: 2, title: 'Members Added', date: 'Sep 11', status: 'completed' },
                { id: 3, title: 'Work Uploaded', date: 'Sep 20', status: 'completed' },
                { id: 4, title: 'Submission Confirmed', date: 'Sep 23', status: 'completed' },
              ]}
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D9D5CA] text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-[#D9D5CA]/60 pb-2">
              <span className="text-[#64748B]">Assignment:</span>
              <span className="font-bold text-[#172033]">{assignment.title}</span>
            </div>
            <div className="flex justify-between border-b border-[#D9D5CA]/60 pb-2">
              <span className="text-[#64748B]">Submitted By:</span>
              <span className="font-bold text-[#172033]">{user?.name} ({isGroup ? 'Group Leader' : 'Student'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Submitted On:</span>
              <span className="font-bold text-[#172033] font-mono">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="sticky-note p-3 rounded-xl max-w-xs mx-auto text-center shadow-sticky">
            <p className="font-handwritten text-lg text-[#451A03]">
              "Well Done! Keep Building!"
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentAssignmentDetailsPage;
