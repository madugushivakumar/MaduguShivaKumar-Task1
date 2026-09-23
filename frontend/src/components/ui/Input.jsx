import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = '',
      id,
      name,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-[#172033] tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-xl">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`w-full rounded-xl bg-[#FFFFFF] border transition-all text-xs sm:text-sm text-[#172033] placeholder:text-[#94A3B8] py-2.5 ${
              LeftIcon ? 'pl-10' : 'pl-3.5'
            } ${RightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D9D5CA] hover:border-[#CBD5E1] focus:border-[#1557D6] focus:ring-2 focus:ring-[#1557D6]/20'
            } outline-none ${className}`}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8]">
              {RightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p className="text-[11px] text-[#64748B]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
