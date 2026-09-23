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
import ProgressBar from '../components/common/ProgressBar';
import { Card, CardBody, Badge, Button } from '../components/ui';

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
      <div className="max-w-5xl mx-auto py-20 text-center space-y-3 paper-card bg-white rounded-3xl border border-[#D9D5CA]">
        <div className="w-10 h-10 border-4 border-[#1557D6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
          Loading squad telemetry and coursework records...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/admin/groups"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#5A6578] hover:text-[#1557D6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Group Registry</span>
        </Link>

        <div className="paper-card bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-editorial text-[#172033]">Squad Record Not Found</h3>
          <p className="text-xs text-[#5A6578]">{error || 'The requested group could not be found.'}</p>
          <Link
            to="/admin/groups"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1557D6] text-white rounded-xl text-xs font-mono font-bold shadow-2xs hover:bg-[#0D3EA8]"
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
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#5A6578] hover:text-[#1557D6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Group Monitoring</span>
        </Link>
        <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
          COHORT DOSSIER
        </span>
      </div>

      {/* Group Header Card */}
      <div className="paper-card bg-[#FAF8F5] rounded-3xl border border-[#D9D5CA] p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 text-[#1557D6] border border-blue-200">
                ACTIVE SQUAD
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  percentage === 100
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : percentage > 0
                    ? 'bg-blue-50 text-[#1557D6] border-blue-200'
                    : 'bg-[#FAF8F5] text-[#5A6578] border-[#D9D5CA]'
                }`}
              >
                {percentage === 100 ? 'Completed' : percentage > 0 ? 'In Progress' : 'Not Started'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-editorial text-[#172033] tracking-tight">
              {group.groupName}
            </h1>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider block">Submission Index</span>
            <span className="text-3xl font-black text-[#1557D6] font-mono">{percentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <ProgressBar
            value={percentage}
            total={total}
            completed={completed}
            size="lg"
            emptyText="No coursework allocated to this squad"
          />
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E5E0D8] text-xs">
          <div className="p-3.5 bg-white/80 rounded-2xl border border-[#D9D5CA]">
            <span className="text-[#8A7E72] block text-[10px] font-mono font-bold uppercase tracking-wider">
              Squad Members
            </span>
            <span className="font-mono font-black text-[#172033] text-xl mt-0.5 block">
              {members?.length || 0}
            </span>
          </div>
          <div className="p-3.5 bg-white/80 rounded-2xl border border-[#D9D5CA]">
            <span className="text-[#8A7E72] block text-[10px] font-mono font-bold uppercase tracking-wider">
              Assigned Tasks
            </span>
            <span className="font-mono font-black text-[#172033] text-xl mt-0.5 block">{total}</span>
          </div>
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
            <span className="text-emerald-700 block text-[10px] font-mono font-bold uppercase tracking-wider">
              Confirmed Submissions
            </span>
            <span className="font-mono font-black text-emerald-800 text-xl mt-0.5 block">{completed}</span>
          </div>
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80">
            <span className="text-amber-700 block text-[10px] font-mono font-bold uppercase tracking-wider">
              Pending Submissions
            </span>
            <span className="font-mono font-black text-amber-800 text-xl mt-0.5 block">{pending}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Members Roster & Coursework Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Column (1 col) */}
        <div className="space-y-4">
          <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1557D6]" />
                <h3 className="text-sm font-bold font-editorial text-[#172033]">Enrolled Cadre</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {members?.length || 0}
              </span>
            </div>

            <div className="space-y-3 divide-y divide-[#E5E0D8]">
              {members?.map((member) => (
                <div key={member.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172033] font-editorial text-sm">{member.name}</span>
                    {member.is_creator && (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#1557D6] border border-blue-200">
                        Lead
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5A6578]">
                    <Mail className="w-3 h-3 text-[#8A7E72] flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.student_id && (
                    <div className="text-[10px] text-[#8A7E72] font-mono">
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
          <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1557D6]" />
                <h3 className="text-sm font-bold font-editorial text-[#172033]">Coursework & Submissions</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#5A6578]">
                {completed} / {total} Confirmed
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5A6578]">
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
                          : 'bg-[#FAF8F5]/80 border-[#D9D5CA]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold font-editorial text-[#172033] text-base">{item.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#5A6578]">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#8A7E72]" />
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
                              className="inline-flex items-center gap-1 text-[#1557D6] font-bold hover:underline"
                            >
                              <FolderOpen className="w-3 h-3" />
                              <span>OneDrive Vault</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        <div>
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Confirmation Attributed Metadata */}
                      {isConfirmed && (
                        <div className="mt-3 pt-2.5 border-t border-emerald-200/60 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Confirmed by <strong>{item.confirmed_by_name || 'Squad member'}</strong> ({item.confirmed_by_email})
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

