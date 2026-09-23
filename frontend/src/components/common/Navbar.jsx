import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Users,
  BookOpen,
  LogIn,
  LogOut,
  UserPlus,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import PhaseBadge from './PhaseBadge';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isFaculty = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';

  const navItems = [
    { name: 'Home', to: '/', icon: Layers },
    ...(isAuthenticated
      ? [
          {
            name: isFaculty
              ? user?.role === 'PROFESSOR'
                ? 'Professor Portal'
                : 'Admin Portal'
              : 'Student Portal',
            to: isFaculty ? '/admin/dashboard' : '/student/dashboard',
            icon: LayoutDashboard,
          },
          ...(isFaculty
            ? [
                {
                  name: 'Coursework',
                  to: '/admin/assignments',
                  icon: BookOpen,
                },
                {
                  name: 'Group Progress',
                  to: '/admin/groups',
                  icon: Users,
                  badge: 'Active',
                },
                {
                  name: 'Submissions',
                  to: '/admin/submissions',
                  icon: ShieldCheck,
                },
              ]
            : []),
          ...(user?.role === 'STUDENT'
            ? [
                {
                  name: 'My Groups',
                  to: '/student/groups',
                  icon: Users,
                  badge: 'Active',
                },
                {
                  name: 'Coursework',
                  to: '/student/assignments',
                  icon: BookOpen,
                  badge: 'Active',
                },
              ]
            : []),
        ]
      : [
          { name: 'Student Groups', to: '/groups', icon: Users, badge: 'Phase 4' },
          { name: 'Assignments', to: '/assignments', icon: BookOpen, badge: 'Phase 5' },
        ]),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                  Joineazy
                </span>
                <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                  Academic Portal
                </span>
              </div>
            </Link>
            <div className="hidden sm:block ml-2">
              <PhaseBadge phase="Phase 9" status="Production Ready" />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action / Auth Panel */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isFaculty ? '/admin/dashboard' : '/student/dashboard'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-all"
                >
                  {isFaculty ? (
                    <Shield className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                  )}
                  <span className="text-xs font-bold">{user.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      user.role === 'PROFESSOR'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Student</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {isAuthenticated && (
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <div className="flex items-center gap-2.5">
                {isFaculty ? (
                  <Shield className="w-5 h-5 text-indigo-600" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  user.role === 'PROFESSOR'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {user.role}
              </span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-2 border-t border-slate-200">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-rose-600 hover:bg-rose-50 border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
