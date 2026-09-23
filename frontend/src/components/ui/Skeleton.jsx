import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => (
  <div
    className={`bg-[#E5E0D8]/60 animate-pulse ${rounded} ${className}`}
  />
);

export const CardSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="paper-card p-5 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-5 rounded-lg" />
        <Skeleton className="w-full h-3 rounded-md" />
        <div className="pt-4 border-t border-[#D9D5CA]/60 flex items-center justify-between">
          <Skeleton className="w-20 h-4 rounded-md" />
          <Skeleton className="w-16 h-4 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="paper-card bg-white p-4 space-y-3">
    <div className="flex items-center justify-between border-b border-[#D9D5CA] pb-3">
      <Skeleton className="w-32 h-5 rounded-lg" />
      <Skeleton className="w-24 h-8 rounded-xl" />
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 py-2 border-b border-[#D9D5CA]/40 last:border-0">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
