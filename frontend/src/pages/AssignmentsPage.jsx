import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ExternalLink, Users, Calendar, ArrowRight, ArrowLeft, LogIn, PlusCircle, Check } from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const AssignmentsPage = () => {
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
        <PhaseBadge phase="Phase 6" status="Submissions Active" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Coursework & Assignment Management</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Faculty author coursework with deadlines and external OneDrive links, allocating work to all
          students or targeting specific project groups. Students complete assignments and confirm submissions.
        </p>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          {isAuthenticated && user?.role === 'ADMIN' ? (
            <Link
              to="/admin/assignments"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all"
            >
              <span>Manage Course Assignments</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : isAuthenticated && user?.role === 'STUDENT' ? (
            <Link
              to="/student/assignments"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all"
            >
              <span>View Enrolled Coursework & Submissions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Access Assignments</span>
            </Link>
          )}
        </div>

        {/* Phase 5 & 6 features showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Faculty Authoring</h4>
            <p className="text-xs text-slate-500 mt-1">
              Specify coursework titles, detailed instructions, and ISO deadlines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <ExternalLink className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">OneDrive Integration</h4>
            <p className="text-xs text-slate-500 mt-1">
              Direct access to external OneDrive submission directories without OAuth friction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Targeted Allocation</h4>
            <p className="text-xs text-slate-500 mt-1">
              Assign to all groups or target specific project teams via junction table mappings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Check className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Two-Step Confirmation</h4>
            <p className="text-xs text-slate-500 mt-1">
              Interactive modal verification records group-wide completion instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
