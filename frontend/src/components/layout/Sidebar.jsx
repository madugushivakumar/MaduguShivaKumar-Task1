import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  BookOpen,
  FileText,
  Users,
  FileCheck,
  Calendar,
  MessageSquare,
  BarChart3,
  LogOut,
} from 'lucide-react';

export const JoineazyLogo = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="9" height="13" rx="4.5" fill="#3B82F6" />
    <rect x="18" y="4" width="13" height="9" rx="4.5" fill="#60A5FA" />
    <rect x="5" y="21" width="13" height="9" rx="4.5" fill="#1D4ED8" />
    <rect x="22" y="17" width="9" height="13" rx="4.5" fill="#2563EB" />
  </svg>
);

export const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isFaculty = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  // Student Navigation items matching Reference 1 & 2
  const studentNavItems = [
    { name: 'Home', to: '/student/dashboard', icon: Home },
    { name: 'My Courses', to: '/student/dashboard#courses', icon: BookOpen },
    { name: 'Assignments', to: '/student/assignments', icon: FileText },
    { name: 'My Group', to: '/student/groups', icon: Users },
    { name: 'Submissions', to: '/student/assignments', icon: FileCheck },
    { name: 'Calendar', to: '/student/dashboard#calendar', icon: Calendar },
    { name: 'Messages', to: '/student/groups', icon: MessageSquare },
  ];

  // Professor Navigation items matching Reference 1
  const professorNavItems = [
    { name: 'Home', to: '/admin/dashboard', icon: Home },
    { name: 'Courses', to: '/admin/dashboard', icon: BookOpen },
    { name: 'Assignments', to: '/admin/assignments', icon: FileText },
    { name: 'Students', to: '/admin/submissions', icon: Users },
    { name: 'Groups', to: '/admin/groups', icon: Users },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { name: 'Calendar', to: '/admin/dashboard#calendar', icon: Calendar },
    { name: 'Messages', to: '/admin/groups', icon: MessageSquare },
  ];

  const navItems = isFaculty ? professorNavItems : studentNavItems;

  const checkIsActive = (item) => {
    const p = location.pathname;
    const h = location.hash;

    if (item.name === 'My Group') {
      return p.startsWith('/student/groups') || p.startsWith('/groups');
    }
    if (item.name === 'My Courses') {
      return p.startsWith('/courses') || (p === '/student/dashboard' && h === '#courses');
    }
    if (item.name === 'Courses') {
      return (
        p.startsWith('/courses') ||
        (isFaculty && p === '/admin/dashboard') ||
        (p === '/student/dashboard' && h === '#courses')
      );
    }
    if (item.name === 'Home') {
      return !isFaculty && p === '/student/dashboard' && (!h || h === '#today');
    }
    if (item.name === 'Assignments') {
      return p.startsWith('/student/assignments') || p.startsWith('/admin/assignments');
    }
    if (item.name === 'Students') {
      return p.startsWith('/admin/submissions');
    }
    if (item.name === 'Groups') {
      return p.startsWith('/admin/groups');
    }
    if (item.name === 'Analytics') {
      return p.startsWith('/admin/analytics');
    }
    return p === item.to;
  };

  return (
    <aside className="w-[230px] lg:w-[240px] h-full bg-[#FFFDF7] border-r border-[#D9D5CA] flex flex-col justify-between flex-shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-[#D9D5CA]/70">
          <Link
            to={isFaculty ? '/admin/dashboard' : '/student/dashboard'}
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <JoineazyLogo className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold font-display text-[#172033] tracking-tight group-hover:text-[#1557D6] transition-colors">
              Joineazy
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = checkIsActive(item);

            return (
              <Link
                key={item.name + item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  active
                    ? 'bg-[#EFF6FF] text-[#1557D6] font-bold shadow-xs border border-[#BFDBFE]/60'
                    : 'text-[#475569] hover:bg-[#FAF8F5] hover:text-[#172033] border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? 'text-[#1557D6]' : 'text-[#64748B] group-hover:text-[#172033]'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Sign Out Card */}
      <div className="p-3.5 border-t border-[#D9D5CA]/70 space-y-2.5">
        {/* User Mini Card */}
        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#D9D5CA] flex items-center gap-2.5 shadow-paper-sm">
          <div className="w-8 h-8 rounded-full bg-[#1557D6] text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#172033] truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-[#64748B] truncate capitalize font-medium">
              {user?.role?.toLowerCase() || 'student'}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
