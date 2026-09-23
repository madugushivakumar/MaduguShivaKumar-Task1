import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import {
  X,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  User,
  BarChart3,
} from 'lucide-react';

export const AppShell = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isFaculty = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';

  // Mobile Bottom Navigation Links (Panel 09)
  const mobileStudentLinks = [
    { name: 'Home', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Courses', to: '/student/dashboard#courses', icon: BookOpen },
    { name: 'Tasks', to: '/student/assignments', icon: FileText },
    { name: 'Group', to: '/student/groups', icon: Users },
    { name: 'Profile', to: '/student/dashboard', icon: User },
  ];

  const mobileFacultyLinks = [
    { name: 'Control', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Courses', to: '/admin/dashboard#courses', icon: BookOpen },
    { name: 'Assignments', to: '/admin/assignments', icon: FileText },
    { name: 'Students', to: '/admin/submissions', icon: Users },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  ];

  const mobileLinks = isFaculty ? mobileFacultyLinks : mobileStudentLinks;

  return (
    <div className="min-h-screen bg-[#F5F1E8] blueprint-grid flex text-[#172033] antialiased font-sans selection:bg-[#1557D6] selection:text-white relative">
      {/* Desktop Sidebar (Fixed Left) */}
      <div className="hidden lg:block w-[240px] flex-shrink-0 h-screen sticky top-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer & Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[260px] max-w-[80vw] h-full bg-[#FFFDF7] border-r border-[#D9D5CA] shadow-2xl flex flex-col z-10 animate-slide-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 text-[#94A3B8] hover:text-[#172033] p-1.5 rounded-lg cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Right Column: Top Navigation + Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Panel 09 Responsive) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FFFDF7] border-t border-[#D9D5CA] z-40 flex items-center justify-around px-2 shadow-lg">
        {mobileLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name + item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-[#1557D6] font-extrabold'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AppShell;
