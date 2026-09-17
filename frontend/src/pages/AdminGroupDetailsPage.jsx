import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import progressService from '../services/progressService';
import {
  Users,
  BookOpen,
  ArrowLeft,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  UserCheck,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';

export const AdminGroupDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await progressService.getAdminGroupDetails(id);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load group monitoring details:', err);
        setError(err.response?.data?.message || 'Failed to load group details.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">
          Loading group progress and coursework records...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/admin/groups"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups List</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Group Not Found</h3>
          <p className="text-xs text-slate-500">{error || 'The requested group could not be found.'}</p>
          <Link
            to="/admin/groups"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            <span>Return to Groups</span>
          </Link>
        </div>
      </div>
    );
  }

  const { group, members, assignments } = data;
  const total = group.totalAssignments || 0;
  const completed = group.completedAssignments || 0;
  const pending = group.pendingAssignments || 0;
  const percentage = group.progressPercentage || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/groups"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Group Monitoring</span>
        </Link>
        <PhaseBadge phase="Phase 7" status="Group Details" />
      </div>

      {/* Group Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                Project Group
              </span>
              <StatusBadge
                status={
                  percentage === 100 ? 'COMPLETED' : percentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
                }
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {group.groupName}
            </h1>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">Overall Completion</span>
            <span className="text-3xl font-black text-indigo-600 font-mono">{percentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <ProgressBar
            value={percentage}
            total={total}
            completed={completed}
            size="lg"
            emptyText="No coursework allocated to this group"
          />
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Team Members
            </span>
            <span className="font-bold text-slate-900 text-base mt-0.5 block">
              {members?.length || 0}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Assigned Tasks
            </span>
            <span className="font-bold text-slate-900 text-base mt-0.5 block">{total}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-emerald-700 block text-[10px] uppercase font-semibold">
              Confirmed Submissions
            </span>
            <span className="font-bold text-emerald-900 text-base mt-0.5 block">{completed}</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
            <span className="text-amber-700 block text-[10px] uppercase font-semibold">
              Pending Submissions
            </span>
            <span className="font-bold text-amber-900 text-base mt-0.5 block">{pending}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Members Roster & Coursework Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Column (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Enrolled Members</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {members?.length || 0}
              </span>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {members?.map((member) => (
                <div key={member.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{member.name}</span>
                    {member.is_creator && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Creator
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.student_id && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {member.student_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coursework & Submission Status Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Coursework & Submissions</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {completed} / {total} Confirmed
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No assignments have been allocated to this group yet.
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((item) => {
                  const isConfirmed = item.submission_status === 'CONFIRMED';
                  return (
                    <div
                      key={item.assignment_id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isConfirmed
                          ? 'bg-emerald-50/20 border-emerald-200/80'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                Due: {new Date(item.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </span>
                            <a
                              href={item.onedrive_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
                            >
                              <FolderOpen className="w-3 h-3" />
                              <span>OneDrive Folder</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        <div>
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>✓ Confirmed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>⏳ Pending</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Confirmation Attributed Metadata */}
                      {isConfirmed && (
                        <div className="mt-3 pt-2.5 border-t border-emerald-200/60 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Confirmed by <strong>{item.confirmed_by_name || 'Team member'}</strong> ({item.confirmed_by_email})
                            </span>
                          </span>
                          <span className="font-mono text-[11px] text-emerald-700">
                            {new Date(item.confirmed_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGroupDetailsPage;
