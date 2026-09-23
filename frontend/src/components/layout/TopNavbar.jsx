import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  Menu,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
  Calendar,
} from 'lucide-react';
import { UserAvatar } from '../ui';

export const TopNavbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isFaculty = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        isFaculty
          ? `/admin/assignments?search=${encodeURIComponent(searchQuery)}`
          : `/student/assignments?search=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Student Navigation Tabs
  const studentTabs = [
    { name: 'Today', to: '/student/dashboard' },
    { name: 'My Courses', to: '/student/dashboard#courses' },
    { name: 'Assignments', to: '/student/assignments' },
    { name: 'My Group', to: '/student/groups' },
    { name: 'Calendar', to: '/student/dashboard#calendar' },
  ];

  // Professor Navigation Tabs
  const professorTabs = [
    { name: 'Control Wall', to: '/admin/dashboard' },
    { name: 'Courses', to: '/admin/dashboard#courses' },
    { name: 'Assignments', to: '/admin/assignments' },
    { name: 'Students', to: '/admin/submissions' },
    { name: 'Analytics', to: '/admin/analytics' },
  ];

  const currentTabs = isFaculty ? professorTabs : studentTabs;

  const isGroupPage = location.pathname.includes('/groups');

  return (
    <div className="sticky top-0 z-30 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#D9D5CA] transition-colors">
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Mobile Logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onOpenSidebar}
            className="p-2 -ml-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-[#FAF8F5] cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to={isFaculty ? '/admin/dashboard' : '/student/dashboard'}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-xl bg-[#1557D6] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-[#172033] font-display">
              Joineazy
            </span>
          </Link>
        </div>

        {/* Center: Large Rounded Search Field (Prominent as in Reference) */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, assignments, people..."
              className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/15 focus:border-[#1557D6] shadow-2xs transition-all"
            />
          </form>
        </div>

        {/* Right: User Profile Area & Optional Pinned Sticky Note */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#FAF8F5] border border-transparent hover:border-[#D9D5CA] transition-all cursor-pointer"
            >
              <UserAvatar name={user?.name || 'Shiva Kumar'} size="sm" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#172033] leading-tight">
                  {user?.name || 'Shiva Kumar'}
                </span>
                <span className="text-[10px] text-[#64748B] font-medium leading-none mt-0.5">
                  {user?.role === 'PROFESSOR'
                    ? 'Professor'
                    : user?.role === 'ADMIN'
                    ? 'Admin'
                    : 'Student'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] shadow-paper-elevated py-2 z-50 animate-scale-up">
                <div className="px-4 py-2 border-b border-[#D9D5CA]/70">
                  <p className="text-xs font-bold text-[#172033] truncate">{user?.name || 'Shiva Kumar'}</p>
                  <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'shiva.kumar@university.edu'}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1557D6] border border-[#BFDBFE]">
                    {user?.role || 'STUDENT'}
                  </span>
                </div>

                <Link
                  to={isFaculty ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#334155] hover:bg-[#FAF8F5] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Sticky Note on Top Right for My Group (as in Reference 1) */}
          {isGroupPage && (
            <div className="hidden xl:block relative -mr-2 -my-2 select-none paper-clip">
              <div className="sticky-note px-3 py-2 rounded-lg text-center shadow-sticky max-w-[150px] rotate-2">
                <p className="font-handwritten text-xs font-bold text-[#451A03] leading-tight">
                  Collaboration<br />creates<br />Opportunities.
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Search Bar (under header on small screens) */}
      <div className="sm:hidden px-4 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, assignments, people..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033]"
          />
        </form>
      </div>
    </div>
  );
};

export default TopNavbar;
