import React from 'react';

export const CircularProgress = ({
  percentage = 80,
  size = 110,
  strokeWidth = 9,
  title = 'This Week',
  color = '#1557D6',
  trackColor = '#E5E0D8',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl sm:text-2xl font-black text-[#172033] font-display tracking-tight leading-none">
          {percentage}%
        </span>
        {title && (
          <span className="text-[10px] text-[#64748B] font-medium mt-1 font-mono">
            {title}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;
