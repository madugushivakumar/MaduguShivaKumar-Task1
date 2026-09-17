import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, ShieldCheck, ArrowRight, ArrowLeft, LogIn } from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const GroupsPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
        <PhaseBadge phase="Phase 4" status="Student Groups Active" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Student Group Management</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Form academic project teams, invite fellow students via institutional email or student ID,
          and organize member rosters for coordinated coursework.
        </p>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          {isAuthenticated && user?.role === 'STUDENT' ? (
            <Link
              to="/student/groups"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all"
            >
              <span>Go to My Groups</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Manage Groups</span>
            </Link>
          )}
        </div>

        {/* Phase 4 features showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <UserPlus className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Atomic Group Creation</h4>
            <p className="text-xs text-slate-500 mt-1">
              Group creator is atomically enrolled as the team leader and protected anchor member.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Flexible Member Search</h4>
            <p className="text-xs text-slate-500 mt-1">
              Invite student peers using either their institutional email address or student ID.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Strict RBAC Boundaries</h4>
            <p className="text-xs text-slate-500 mt-1">
              Guaranteed isolation — only group members can inspect rosters or modify group composition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
