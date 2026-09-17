import React from 'react';

export const PhaseBadge = ({ phase = 'Phase 1', status = 'active', className = '' }) => {
  const isPhase1 = phase.includes('Phase 1');
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
        isPhase1
          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPhase1 ? 'bg-indigo-600 animate-pulse' : 'bg-amber-500'
        }`}
      />
      {phase} {status && `• ${status}`}
    </span>
  );
};

export default PhaseBadge;
