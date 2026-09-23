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
  isAcknowledger = false,
  isAcknowledged = false,
  confirmedByName = null,
  confirmedAt = null,
  acknowledgedByName = null,
  acknowledgedAt = null,
  dueDate = null,
  compact = false,
}) => {
  const isAck = groupStatus === 'ACKNOWLEDGED' || isAcknowledged;
  const isConfirmed = groupStatus === 'CONFIRMED' || isAck;
  const isSubmitted = groupStatus === 'SUBMITTED';
  const isOverdue = groupStatus === 'PENDING' && dueDate && new Date(dueDate) < new Date();

  // State 1: Acknowledged by Leader
  if (isAck) {
    if (isAcknowledger || isConfirmer) {
      return (
        <div className="inline-flex flex-col items-start gap-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span>✓ Acknowledged by Leader</span>
          </span>
          {!compact && (acknowledgedAt || confirmedAt) && (
            <span className="text-[10px] text-[#8A7E72] font-mono pl-1">
              {new Date(acknowledgedAt || confirmedAt).toLocaleDateString('en-US', {
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

    return (
      <div className="inline-flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <Users className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span>✓ Team Acknowledged</span>
        </span>
        {!compact && (acknowledgedByName || confirmedByName) && (
          <span className="text-[10px] text-[#5A6578] font-mono pl-1">
            Acknowledged by <strong>{acknowledgedByName || confirmedByName}</strong>
          </span>
        )}
      </div>
    );
  }

  // State 2: Confirmed
  if (isConfirmed) {
    if (isConfirmer) {
      return (
        <div className="inline-flex flex-col items-start gap-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>✓ Confirmed by This Student</span>
          </span>
          {!compact && confirmedAt && (
            <span className="text-[10px] text-[#8A7E72] font-mono pl-1">
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

    return (
      <div className="inline-flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-[#1557D6] border border-blue-200">
          <Users className="w-3.5 h-3.5 text-[#1557D6] flex-shrink-0" />
          <span>✓ Team Submission Confirmed</span>
        </span>
        {!compact && confirmedByName && (
          <span className="text-[10px] text-[#5A6578] font-mono pl-1">
            Confirmed by <strong>{confirmedByName}</strong>
          </span>
        )}
      </div>
    );
  }

  // State 3: Submitted (Awaiting Acknowledgment)
  if (isSubmitted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
        <Clock className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
        <span>Submitted (Pending Ack)</span>
      </span>
    );
  }

  // State 4: Overdue
  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <Clock className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
        <span>Overdue</span>
      </span>
    );
  }

  // State 5: Pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
      <span>Pending</span>
    </span>
  );
};

export default SubmissionStatus;

