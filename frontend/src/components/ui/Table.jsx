import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto rounded-2xl border border-[#D9D5CA] bg-[#FFFFFF] shadow-paper-sm ${className}`}>
    <table className="w-full text-left text-xs border-collapse">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-[#FAF8F5] border-b border-[#D9D5CA] text-[#64748B] font-mono text-[11px] uppercase tracking-wider ${className}`}>
    {children}
  </thead>
);

export const TableRow = ({ children, isClickable = false, className = '', ...props }) => (
  <tr
    className={`border-b border-[#D9D5CA]/60 last:border-b-0 transition-colors ${
      isClickable ? 'hover:bg-[#FAF8F5] cursor-pointer' : 'hover:bg-[#FAF8F5]/50'
    } ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }) => (
  <th className={`py-3.5 px-4 font-bold ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`py-3 px-4 text-[#172033] align-middle ${className}`} {...props}>
    {children}
  </td>
);

export default Table;
