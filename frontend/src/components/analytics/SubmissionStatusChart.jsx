import React from 'react';
import { CheckCircle2, Clock, PieChart as PieIcon } from 'lucide-react';

/**
 * Submission Status Donut/Pie Chart
 * Displays proportion of Confirmed vs Pending coursework submissions
 */
export const SubmissionStatusChart = ({ confirmed = 0, pending = 0, loading = false }) => {
  const total = confirmed + pending;
  const confirmedPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const pendingPct = total > 0 ? 100 - confirmedPct : 0;

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeDashoffset = total > 0 ? circumference - (confirmedPct / 100) * circumference : circumference;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500">Calculating submission statuses...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Submission Status</h3>
            <p className="text-xs text-slate-500">Overall confirmation split</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
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
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle (Pending / Track) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-amber-100"
                strokeWidth="18"
                fill="transparent"
              />
              {/* Foreground circle (Confirmed) */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="18"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {confirmedPct}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Confirmed
              </span>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 min-w-[170px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Confirmed</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black font-mono text-emerald-800">{confirmed}</span>
                <span className="text-[11px] text-emerald-600 ml-1">({confirmedPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-amber-50/60 border border-amber-100 min-w-[170px]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Pending</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black font-mono text-amber-800">{pending}</span>
                <span className="text-[11px] text-amber-600 ml-1">({pendingPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
        Real-time calculation based on assignment group allocations
      </div>
    </div>
  );
};

export default SubmissionStatusChart;
