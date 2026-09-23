import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export const Breadcrumb = ({
  backTo,
  backLabel = 'Back',
  items = [],
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold text-[#64748B] ${className}`}>
      {backTo ? (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 hover:text-[#1557D6] transition-colors py-1 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel}</span>
        </Link>
      ) : (
        items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3 h-3 text-[#CBD5E1]" />}
            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-[#1557D6] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#172033] font-bold">{item.label}</span>
            )}
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default Breadcrumb;
