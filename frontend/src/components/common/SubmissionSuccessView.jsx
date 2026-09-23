import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code,
  Calendar,
  Check,
  ExternalLink,
} from 'lucide-react';
import { UserAvatar } from '../ui';
import { JoineazyLogo } from '../layout/Sidebar';

export const SubmissionSuccessView = ({
  assignment,
  user,
  statusInfo,
  onViewAssignment,
  onBackToCourse,
}) => {
  const navigate = useNavigate();

  const formattedSubmissionDate = statusInfo?.confirmedAt || assignment?.confirmed_at
    ? new Date(statusInfo?.confirmedAt || assignment?.confirmed_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const formattedSubmissionTime = statusInfo?.confirmedAt || assignment?.confirmed_at
    ? new Date(statusInfo?.confirmedAt || assignment?.confirmed_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

  const submitterName =
    statusInfo?.confirmedByName ||
    assignment?.confirmed_by_name ||
    user?.name ||
    'Student Leader';

  const courseTitle =
    assignment?.course_title ||
    assignment?.course_name ||
    assignment?.course_code ||
    'Academic Course';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F5F1E8] blueprint-grid flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-8 select-none">
      {/* Top Header: Logo + Sticky Note (Reference 2) */}
      <div className="max-w-5xl w-full mx-auto flex items-start justify-between relative z-10">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <JoineazyLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold font-display text-[#172033] tracking-tight group-hover:text-[#1557D6] transition-colors">
            Joineazy
          </span>
        </Link>

        {/* Top-Right Pinned Sticky Note with Paperclip (Reference 2) */}
        <div className="hidden sm:block relative paper-clip -mt-2 -mr-2">
          <div className="sticky-note px-4 py-3 rounded-xl text-center shadow-sticky rotate-2 max-w-[170px]">
            <p className="font-handwritten text-lg sm:text-xl font-bold text-[#451A03] leading-tight">
              Well Done!<br />
              Keep<br />
              Building!
            </p>
          </div>
        </div>
      </div>

      {/* Main Success Container */}
      <div className="max-w-4xl w-full mx-auto my-6 sm:my-8 bg-white/95 backdrop-blur-xs rounded-3xl border border-[#D9D5CA] shadow-paper p-6 sm:p-10 relative overflow-hidden text-center space-y-8 z-10">
        {/* Decorative Festive Confetti Particles Floating around */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <span className="absolute top-10 left-16 w-2 h-2 rounded-full bg-amber-400 opacity-80" />
          <span className="absolute top-16 left-28 w-3 h-1 rounded-full bg-emerald-500 rotate-45 opacity-80" />
          <span className="absolute top-8 right-32 w-2 h-2 rounded-full bg-[#1557D6] opacity-80" />
          <span className="absolute top-20 right-20 w-3 h-1 rounded-full bg-rose-400 -rotate-30 opacity-80" />
          <span className="absolute top-24 left-1/4 w-2 h-1 rounded-full bg-indigo-500 rotate-12 opacity-70" />
          <span className="absolute top-28 right-1/4 w-2 h-2 rounded-full bg-amber-500 opacity-70" />
        </div>

        {/* Left Handwritten Script Annotation (Reference 2) */}
        <div className="hidden md:block absolute top-12 left-6 text-left pointer-events-none">
          <span className="font-handwritten text-2xl sm:text-3xl text-[#1E293B] -rotate-12 block">
            Another<br />Step<br />forward!
          </span>
        </div>

        {/* Green Rubber Stamp (Reference 2 Center Top) */}
        <div className="pt-2 flex justify-center">
          <div className="inline-block border-3 border-emerald-600 rounded-2xl px-6 sm:px-8 py-2 -rotate-3 shadow-2xs bg-emerald-50/40 select-none">
            <span className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-emerald-700 uppercase">
              SUBMITTED
            </span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#172033] font-editorial tracking-tight">
            Assignment Submitted!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Your assignment has been successfully submitted to the provided{' '}
            {assignment?.onedrive_link ? (
              <a
                href={assignment.onedrive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1557D6] hover:underline inline-flex items-center gap-1"
              >
                <span>OneDrive folder</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            ) : (
              <span className="font-semibold text-[#172033]">official submission repository</span>
            )}
            .
          </p>
        </div>

        {/* 4-Step Horizontal Progress Stepper (Reference 2 Core) */}
        <div className="pt-4 max-w-3xl mx-auto">
          <div className="relative flex items-center justify-between">
            {/* Connecting Green Line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-emerald-500 -z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10 text-center w-1/4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs ring-4 ring-white">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#172033] mt-2 block whitespace-nowrap">
                Group Created
              </span>
              <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
                {statusInfo?.groupCreatedAt
                  ? new Date(statusInfo.groupCreatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Sep 10'}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10 text-center w-1/4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs ring-4 ring-white">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#172033] mt-2 block whitespace-nowrap">
                Members Added
              </span>
              <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
                {statusInfo?.membersAddedAt
                  ? new Date(statusInfo.membersAddedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Sep 11'}
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10 text-center w-1/4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs ring-4 ring-white">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#172033] mt-2 block whitespace-nowrap">
                Work Uploaded
              </span>
              <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
                {statusInfo?.uploadedAt
                  ? new Date(statusInfo.uploadedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : formattedSubmissionDate}
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center relative z-10 text-center w-1/4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs ring-4 ring-white">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#172033] mt-2 block whitespace-nowrap">
                Submission Confirmed
              </span>
              <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
                {formattedSubmissionDate}, {formattedSubmissionTime}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Information Cards Row (Reference 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          {/* Card 1: Assignment */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#D9D5CA] p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1557D6] flex items-center justify-center flex-shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono text-[#64748B] font-bold block leading-tight">
                Assignment
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-[#172033] truncate mt-0.5">
                {assignment?.title || 'Course Milestone'}
              </h4>
              <p className="text-[11px] text-[#64748B] truncate font-medium">
                {courseTitle}
              </p>
            </div>
          </div>

          {/* Card 2: Submitted By */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#D9D5CA] p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-full flex-shrink-0">
              <UserAvatar name={submitterName} size="md" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono text-[#64748B] font-bold block leading-tight">
                Submitted By
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-[#172033] truncate mt-0.5">
                {submitterName}
              </h4>
              <p className="text-[11px] text-[#1557D6] font-semibold truncate">
                (Group Leader)
              </p>
            </div>
          </div>

          {/* Card 3: Submitted On */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#D9D5CA] p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1557D6] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono text-[#64748B] font-bold block leading-tight">
                Submitted On
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-[#172033] truncate mt-0.5 font-mono">
                {formattedSubmissionDate}
              </h4>
              <p className="text-[11px] text-[#64748B] font-mono">
                {formattedSubmissionTime}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons (Reference 2) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onViewAssignment || (() => navigate(`/student/assignments/${assignment?.id}`))}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#D9D5CA] text-xs sm:text-sm font-bold text-[#172033] shadow-2xs transition-all cursor-pointer"
          >
            View Assignment
          </button>

          <button
            type="button"
            onClick={
              onBackToCourse ||
              (() =>
                navigate(
                  assignment?.course_id
                    ? `/courses/${assignment.course_id}`
                    : '/student/assignments'
                ))
            }
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#172033] hover:bg-[#0F172A] text-xs sm:text-sm font-bold text-white shadow-paper transition-all cursor-pointer"
          >
            Back to Course
          </button>
        </div>
      </div>

      {/* Bottom Potted Plant Graphic & Subtle Footer Linework (Reference 2) */}
      <div className="max-w-4xl w-full mx-auto flex items-end justify-between select-none pointer-events-none opacity-90 px-4">
        <div className="text-[11px] font-mono text-[#94A3B8]">
          Official Academic Submission Record · 2026
        </div>

        {/* Botanical Plant on Stacked Books SVG Graphic */}
        <div className="hidden sm:block -mb-2">
          <svg className="w-28 h-36" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Plant Leaves */}
            <path d="M60 40 C50 25 35 22 30 18 C32 30 42 42 58 45" fill="#047857" opacity="0.8" />
            <path d="M60 40 C70 25 85 22 90 18 C88 30 78 42 62 45" fill="#059669" />
            <path d="M60 30 C58 15 60 5 60 0 C62 5 64 15 62 30" fill="#10B981" />
            <path d="M60 55 C45 45 30 48 24 45 C30 55 45 60 58 58" fill="#047857" opacity="0.9" />
            <path d="M60 55 C75 45 90 48 96 45 C90 55 75 60 62 58" fill="#10B981" />
            <path d="M60 70 C48 62 38 65 30 62 C38 72 50 75 58 72" fill="#059669" />
            <path d="M60 70 C72 62 82 65 90 62 C82 72 70 75 62 72" fill="#047857" />
            {/* Plant Stem */}
            <path d="M60 10 L60 85" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" />
            {/* Ceramic Planter Pot */}
            <path d="M48 85 L72 85 L68 105 L52 105 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
            <rect x="46" y="82" width="28" height="4" rx="1.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
            {/* Stacked Books underneath */}
            <rect x="35" y="106" width="50" height="10" rx="2" fill="#FAF8F5" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M35 111 L85 111" stroke="#E2E8F0" strokeWidth="1" />
            <rect x="30" y="117" width="60" height="12" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
            <rect x="34" y="120" width="52" height="1.5" fill="#F59E0B" />
            <rect x="25" y="130" width="70" height="14" rx="2.5" fill="#FAF8F5" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M25 137 L95 137" stroke="#CBD5E1" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccessView;
