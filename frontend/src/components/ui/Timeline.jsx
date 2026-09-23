import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';

export const Timeline = ({
  steps = [],
  orientation = 'vertical', // 'vertical' | 'horizontal'
  className = '',
}) => {
  if (orientation === 'horizontal') {
    return (
      <div className={`w-full py-4 overflow-x-auto ${className}`}>
        <div className="flex items-center justify-between min-w-[500px]">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isPending = step.status === 'pending';

            return (
              <React.Fragment key={step.id || index}>
                {/* Step Node */}
                <div className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#1557D6] text-white ring-4 ring-[#EFF6FF] shadow-xs'
                        : 'bg-[#FAF8F5] border-2 border-[#D9D5CA] text-[#94A3B8]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <span
                    className={`text-xs font-bold mt-2 font-display ${
                      isCurrent
                        ? 'text-[#1557D6]'
                        : isCompleted
                        ? 'text-[#172033]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.title}
                  </span>

                  {step.date && (
                    <span className="text-[10px] text-[#64748B] font-mono mt-0.5">
                      {step.date}
                    </span>
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-[#D9D5CA]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Timeline (Panel 04)
  return (
    <div className={`space-y-6 relative pl-6 ${className}`}>
      {/* Vertical Continuous Guide Line */}
      <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-[#D9D5CA]" />

      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        const isPending = step.status === 'pending';

        return (
          <div key={step.id || index} className="relative flex items-start gap-4">
            {/* Dot Indicator */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-[#1557D6] text-white animate-pulse'
                  : 'bg-[#FAF8F5] border-2 border-[#D9D5CA]'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3 h-3" />
              ) : isCurrent ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              ) : null}
            </div>

            {/* Step Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-[#1557D6]'
                      : isCompleted
                      ? 'text-[#172033]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {step.title}
                </h4>
                {step.badge && <div>{step.badge}</div>}
              </div>

              {step.description && (
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {step.description}
                </p>
              )}

              {step.date && (
                <p className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                  {step.date}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
