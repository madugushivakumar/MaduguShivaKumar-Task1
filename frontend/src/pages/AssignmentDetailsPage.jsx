import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import assignmentService from '../services/assignmentService';
import groupService from '../services/groupService';
import progressService from '../services/progressService';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Users,
  Edit,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CheckSquare,
  UserCheck,
  Shield,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const AssignmentDetailsPage = () => {
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);

  // Group Allocation controls
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [allocationMessage, setAllocationMessage] = useState(null);
  const [allocationError, setAllocationError] = useState(null);

  const fetchAssignmentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, groupsRes, monitorRes] = await Promise.all([
        assignmentService.getAssignmentById(id),
        groupService.getGroups(),
        progressService.getAssignmentSubmissions(id).catch(() => null),
      ]);
      setAssignment(assignRes.data?.assignment);
      setAllGroups(groupsRes.data?.groups || []);
      if (monitorRes?.data) {
        setMonitoringData(monitorRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const handleToggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((gid) => gid !== groupId) : [...prev, groupId]
    );
  };

  const handleAssignSpecific = async () => {
    if (selectedGroupIds.length === 0) {
      setAllocationError('Please select at least one group to allocate.');
      return;
    }

    setIsAssigning(true);
    setAllocationError(null);
    setAllocationMessage(null);

    try {
      const res = await assignmentService.assignToGroups(id, selectedGroupIds);
      setAllocationMessage('Assignment successfully allocated to selected groups!');
      setSelectedGroupIds([]);
      await fetchAssignmentData();
    } catch (err) {
      setAllocationError(err.message || 'Failed to allocate assignment.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignAll = async () => {
    setIsAssigning(true);
    setAllocationError(null);
    setAllocationMessage(null);

    try {
      const res = await assignmentService.assignToAllGroups(id);
      setAllocationMessage('Assignment successfully allocated to all student groups in the system!');
      await fetchAssignmentData();
    } catch (err) {
      setAllocationError(err.message || 'Failed to allocate assignment to all groups.');
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-xs text-slate-500 font-medium">
          Loading assignment metadata and group allocations...
        </p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Assignment</h2>
        <p className="text-xs text-slate-600 mt-2">{error || 'Assignment not found.'}</p>
        <Link
          to="/admin/assignments"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Assignments</span>
        </Link>
      </div>
    );
  }

  const dueDateObj = new Date(assignment.due_date);
  const isOverdue = dueDateObj < new Date();
  const assignedGroupIds = new Set((assignment.assigned_groups || []).map((g) => g.id));
  const unassignedGroups = allGroups.filter((g) => !assignedGroupIds.has(g.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/assignments"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Assignments</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/assignments/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Parameters</span>
          </Link>
          <PhaseBadge phase="Phase 5" status="Coursework Hub" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-indigo-800/50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <BookOpen className="w-7 h-7 text-indigo-300" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight">{assignment.title}</h1>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    isOverdue
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {isOverdue ? 'Overdue' : 'Active Due Date'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1">
                Faculty Author: <strong className="text-white">{assignment.professor_name}</strong> ({assignment.professor_email})
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Due: <strong className="text-white">{dueDateObj.toLocaleDateString()} at {dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Allocated to <strong className="text-white">{assignment.assigned_groups_count || 0} Project Teams</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Direct OneDrive Link Button */}
          <a
            href={assignment.onedrive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 shadow-md shadow-indigo-950/40 transition-all flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span>Open OneDrive Folder</span>
          </a>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Instructions & Assigned Groups List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Assignment Guidelines & Instructions
            </h2>
            <div className="prose prose-sm max-w-none text-slate-700 text-xs leading-relaxed whitespace-pre-line">
              {assignment.description || 'No detailed instructions provided.'}
            </div>
          </div>

          {/* Assigned Groups Roster with Live Submission Monitoring */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Allocated Groups & Submissions ({assignment.assigned_groups?.length || 0})
                </h3>
              </div>
              <Link
                to={`/admin/submissions?assignment=${id}`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
              >
                <span>Deep Student-Wise Roster</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Overall Submission Progress Bar */}
            {assignment.assigned_groups && assignment.assigned_groups.length > 0 && (
              <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <ProgressBar
                  progress={monitoringData?.completionPercentage || 0}
                  total={monitoringData?.assignedGroupsCount || assignment.assigned_groups.length}
                  completed={monitoringData?.confirmedGroupsCount || 0}
                  label="Coursework Submission Rate"
                  size="md"
                />
              </div>
            )}

            {(!assignment.assigned_groups || assignment.assigned_groups.length === 0) ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-500">
                  This assignment has not yet been allocated to any student groups.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use the Group Allocation Manager on the right to assign this coursework.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {assignment.assigned_groups.map((grp) => {
                  const groupMonitor = monitoringData?.groups?.find((g) => g.group_id === grp.id);
                  const isConfirmed = groupMonitor?.submission_status === 'CONFIRMED';

                  return (
                    <div
                      key={grp.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {grp.name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            to={`/admin/groups/${grp.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                          >
                            {grp.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>Allocated on {new Date(grp.assigned_at).toLocaleDateString()}</span>
                            {grp.member_count !== undefined && (
                              <>
                                <span>•</span>
                                <span>{grp.member_count} {grp.member_count === 1 ? 'member' : 'members'}</span>
                              </>
                            )}
                          </div>
                          {isConfirmed && (
                            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                              <span>Confirmed by <strong>{groupMonitor.confirmed_by_name}</strong> on {new Date(groupMonitor.confirmed_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <StatusBadge
                          status={isConfirmed ? 'CONFIRMED' : (isOverdue ? 'OVERDUE' : 'PENDING')}
                          size="xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Group Allocation Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Group Allocation Manager
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Allocate this coursework to all student groups in one click, or select specific teams.
            </p>

            {/* Success Message */}
            {allocationMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-700 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{allocationMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {allocationError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{allocationError}</span>
              </div>
            )}

            {/* Strategy A: Assign All */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">Global Allocation</span>
                <span className="text-[10px] uppercase font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                  All Teams
                </span>
              </div>
              <p className="text-[11px] text-indigo-700">
                Instantly map this coursework to every active project group in the system.
              </p>
              <button
                type="button"
                onClick={handleAssignAll}
                disabled={isAssigning}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isAssigning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span>Assign to All Groups</span>
                  </>
                )}
              </button>
            </div>

            {/* Strategy B: Assign to Specific Groups */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-800">
                Targeted Allocation
              </span>

              {unassignedGroups.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl text-center">
                  All registered groups have already been allocated this assignment.
                </p>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
                    {unassignedGroups.map((grp) => {
                      const isChecked = selectedGroupIds.includes(grp.id);

                      return (
                        <label
                          key={grp.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleGroup(grp.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-medium text-slate-800 line-clamp-1">{grp.name}</span>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAssignSpecific}
                    disabled={isAssigning || selectedGroupIds.length === 0}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAssigning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign to Selected ({selectedGroupIds.length})</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailsPage;
