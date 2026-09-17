import React from 'react';
import { Database, Server, Code, Box, Heart } from 'lucide-react';

export const Footer = () => {
  const techPills = [
    { label: 'React + Vite', icon: Code },
    { label: 'Tailwind CSS', icon: Code },
    { label: 'Node.js Express', icon: Server },
    { label: 'PostgreSQL', icon: Database },
    { label: 'Docker Compose', icon: Box },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600 font-medium">
              Joineazy Technical Task Assignment — Task 1
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Full Stack Student, Group & Assignment Management System (Phase 1 Foundation)
            </p>
          </div>

          {/* Tech stack badge pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {techPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {pill.label}
                </span>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 text-center md:text-right">
            <span>Production-Oriented Monorepo Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
