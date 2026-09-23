import React from 'react';
import { Database, Server, Code, Box, BookOpen } from 'lucide-react';

export const Footer = () => {
  const techPills = [
    { label: 'React + Vite', icon: Code },
    { label: 'Tailwind CSS', icon: Code },
    { label: 'Node Express', icon: Server },
    { label: 'PostgreSQL', icon: Database },
    { label: 'Docker Compose', icon: Box },
  ];

  return (
    <footer className="bg-[#FFFDF7] border-t border-[#D9D5CA] mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-lg font-black text-[#172033]">Joineazy</span>
              <span className="text-[10px] font-mono font-bold text-[#1557D6] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                ACADEMIC OS
              </span>
            </div>
            <p className="text-xs text-[#5A6578] mt-1 font-sans">
              Autonomous Student Cohort, Coursework & Verification Architecture
            </p>
          </div>

          {/* Tech stack badge pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {techPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#FAF8F5] text-[#5A6578] border border-[#D9D5CA]"
                >
                  <Icon className="w-3.5 h-3.5 text-[#8A7E72]" />
                  {pill.label}
                </span>
              );
            })}
          </div>

          <div className="text-xs text-[#8A7E72] font-mono text-center md:text-right">
            <span>Production-Oriented Monorepo Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

