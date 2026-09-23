import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      children,
      className = '',
      id,
      name,
      ...props
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-[#172033] tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative rounded-xl">
          <select
            ref={ref}
            id={selectId}
            name={name}
            className={`w-full rounded-xl bg-[#FFFFFF] border transition-all text-xs sm:text-sm text-[#172033] py-2.5 pl-3.5 pr-10 appearance-none ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-[#D9D5CA] hover:border-[#CBD5E1] focus:border-[#1557D6] focus:ring-2 focus:ring-[#1557D6]/20'
            } outline-none cursor-pointer ${className}`}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#64748B]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p className="text-[11px] font-medium text-rose-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-[11px] text-[#64748B]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
