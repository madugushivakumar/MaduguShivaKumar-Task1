import React from 'react';
import { CheckCircle2, Users, Clock } from 'lucide-react';

/**
 * Reusable SubmissionStatus Component
 * Strictly distinguishes between:
 * 1. Individual Confirmer (Student who actually performed the two-step verification)
 * 2. Team Member (Covered by group confirmation, but did not individually execute it)
 * 3. Pending Group Submission
 */
export const SubmissionStatus = ({
  groupStatus = 'PENDING',
  isConfirmer = false,
  confirmedByName = null,
  confirmedAt = null,
  compact = false,
}) => {
  const isConfirmed = groupStatus === 'CONFIRMED';

  if (!isConfirmed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>Pending</span>
      </span>
    );
  }

  // State A: Individual student who directly confirmed
  if (isConfirmer) {
    return (
      <div className="inline-flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>✓ Confirmed by This Student</span>
        </span>
        {!compact && confirmedAt && (
          <span className="text-[10px] text-slate-400 font-mono pl-1">
            {new Date(confirmedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    );
  }

  // State B: Group confirmed, but another teammate executed it
  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
        <Users className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
        <span>✓ Team Submission Confirmed</span>
      </span>
      {!compact && confirmedByName && (
        <span className="text-[10px] text-slate-500 pl-1">
          Confirmed by <strong>{confirmedByName}</strong>
        </span>
      )}
    </div>
  );
};

export default SubmissionStatus;
