import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2 shadow-sm',
    lg: 'px-6 py-3 text-sm sm:text-base rounded-xl gap-2.5 shadow-md',
  };

  const variantStyles = {
    primary:
      'bg-[#1557D6] hover:bg-[#0D3EA8] text-white shadow-academic-600/20 border border-transparent',
    secondary:
      'bg-[#FFFDF7] hover:bg-[#F5F1E8] text-[#172033] border border-[#D9D5CA] shadow-paper-sm',
    action:
      'bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#1557D6] border border-[#BFDBFE] hover:border-[#93C5FD] shadow-paper-sm font-semibold',
    outline:
      'bg-transparent hover:bg-[#EFF6FF] text-[#1557D6] border border-[#BFDBFE]',
    ghost:
      'bg-transparent hover:bg-[#FAF8F5] text-[#64748B] hover:text-[#172033] border border-transparent shadow-none',
    danger:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-paper-sm',
    amber:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-paper-sm border border-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 flex-shrink-0" />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 flex-shrink-0" />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
