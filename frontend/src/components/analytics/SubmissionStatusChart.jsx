import React from 'react';
import { CheckCircle2, Clock, PieChart as PieIcon } from 'lucide-react';

/**
 * Submission Status Donut/Pie Chart
 * Displays proportion of Confirmed vs Pending coursework submissions
 */
export const SubmissionStatusChart = ({ confirmed = 0, pending = 0, overdue = 0, loading = false }) => {
  const total = confirmed + pending + overdue;
  const confirmedPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const overduePct = total > 0 ? Math.max(0, 100 - confirmedPct - pendingPct) : 0;

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const confirmedDash = total > 0 ? (confirmed / total) * circumference : 0;
  const pendingDash = total > 0 ? (pending / total) * circumference : 0;
  const overdueDash = total > 0 ? (overdue / total) * circumference : 0;

  if (loading) {
    return (
      <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-[#1557D6] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">Calculating submission statuses...</p>
      </div>
    );
  }

  return (
    <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1557D6] border border-blue-100 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-editorial text-[#172033] text-base">Submission Overview</h3>
            <p className="text-xs text-[#5A6578]">Status breakdown across active coursework</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#D9D5CA] text-[#172033]">
          {total} Total
        </span>
      </div>

      {total === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No submission records available yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
          {/* SVG Donut */}
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
              {/* Base background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="18"
                fill="transparent"
              />
              {/* Confirmed / Submitted circle (Emerald) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-emerald-500 transition-all duration-700 ease-out"
                strokeWidth="18"
                strokeDasharray={`${confirmedDash} ${circumference}`}
                strokeDashoffset="0"
                fill="transparent"
              />
              {/* Pending circle (Amber) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-amber-400 transition-all duration-700 ease-out"
                strokeWidth="18"
                strokeDasharray={`${pendingDash} ${circumference}`}
                strokeDashoffset={-confirmedDash}
                fill="transparent"
              />
              {/* Overdue circle (Rose) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-rose-500 transition-all duration-700 ease-out"
                strokeWidth="18"
                strokeDasharray={`${overdueDash} ${circumference}`}
                strokeDashoffset={-(confirmedDash + pendingDash)}
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {confirmedPct}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Submitted
              </span>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="flex flex-col gap-2.5 w-full sm:w-auto">
            <div className="flex items-center justify-between gap-4 p-2.5 px-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 min-w-[170px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-900">Submitted</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-emerald-800">{confirmed}</span>
                <span className="text-[11px] text-emerald-600 ml-1">({confirmedPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-2.5 px-3 rounded-2xl bg-amber-50/70 border border-amber-100 min-w-[170px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-900">Pending</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-amber-800">{pending}</span>
                <span className="text-[11px] text-amber-600 ml-1">({pendingPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-2.5 px-3 rounded-2xl bg-rose-50/70 border border-rose-100 min-w-[170px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-rose-900">Overdue</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-rose-800">{overdue}</span>
                <span className="text-[11px] text-rose-600 ml-1">({overduePct}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Real-time calculation from PostgreSQL allocations
      </div>
    </div>
  );
};

export default SubmissionStatusChart;
