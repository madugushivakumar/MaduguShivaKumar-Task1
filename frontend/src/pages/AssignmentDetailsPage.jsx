import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import assignmentService from '../services/assignmentService';
import groupService from '../services/groupService';
import progressService from '../services/progressService';
import ProgressBar from '../components/common/ProgressBar';
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
  FolderOpen,
  Layers,
  Trash2,
} from 'lucide-react';
import { Card, CardBody, Badge, Button } from '../components/ui';

export const AssignmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);

  // Delete Assignment state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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

  const handleDeleteAssignment = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await assignmentService.deleteAssignment(id);
      navigate('/admin/assignments');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete assignment.');
      setIsDeleting(false);
    }
  };

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
      await assignmentService.assignToGroups(id, selectedGroupIds);
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
      await assignmentService.assignToAllGroups(id);
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
      <div className="min-h-[40vh] flex flex-col items-center justify-center paper-card bg-white rounded-3xl border border-[#D9D5CA] p-12">
        <Loader2 className="w-8 h-8 text-[#1557D6] animate-spin" />
        <p className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
          Loading assignment metadata and cohort allocations...
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
        <h2 className="text-xl font-bold font-editorial text-[#172033]">Unable to Load Assignment</h2>
        <p className="text-xs text-[#5A6578] mt-2">{error || 'Assignment not found.'}</p>
        <Link
          to="/admin/assignments"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1557D6] hover:bg-[#0D3EA8] text-white font-mono font-bold text-xs shadow-sm transition-colors"
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/assignments"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#5A6578] hover:text-[#1557D6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Coursework Index</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/assignments/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9D5CA] bg-white text-xs font-mono font-bold text-[#172033] hover:bg-[#FAF8F5] transition-colors shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[#8A7E72]" />
            <span>Edit Parameters</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/80 text-xs font-mono font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete</span>
          </button>
          <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
            FACULTY DOSSIER
          </span>
        </div>
      </div>

      {/* Hero Dossier Banner */}
      <div className="paper-card bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#D9D5CA] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#1557D6] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black font-editorial tracking-tight text-[#172033]">
                  {assignment.title}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                    isOverdue
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {isOverdue ? 'Overdue' : 'Active Due Date'}
                </span>
              </div>

              <p className="text-xs text-[#5A6578] mt-1.5">
                Faculty Author: <strong className="text-[#172033]">{assignment.professor_name}</strong> ({assignment.professor_email})
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-[#5A6578]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8A7E72]" />
                  <span>Due: <strong className="text-[#172033]">{dueDateObj.toLocaleDateString()} {dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#8A7E72]" />
                  <span>Allocated to <strong className="text-[#1557D6]">{assignment.assigned_groups_count || 0} Squads</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Direct OneDrive Link Button */}
          {assignment.onedrive_link && (
            <a
              href={assignment.onedrive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1557D6] hover:bg-[#0D3EA8] text-white font-mono font-bold text-xs transition-all shadow-sm flex-shrink-0"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Open OneDrive Vault</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Instructions & Assigned Groups List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions Card */}
          <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs">
            <h2 className="text-xs font-mono font-bold text-[#172033] uppercase tracking-wider mb-3">
              Assignment Guidelines & Instructions
            </h2>
            <div className="prose prose-sm max-w-none text-[#5A6578] text-xs leading-relaxed whitespace-pre-line font-serif">
              {assignment.description || 'No detailed instructions provided.'}
            </div>
          </div>

          {/* Assigned Groups Roster with Live Submission Monitoring */}
          <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E0D8] gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1557D6]" />
                <h3 className="text-base font-bold font-editorial text-[#172033]">
                  Allocated Groups & Submissions ({assignment.assigned_groups?.length || 0})
                </h3>
              </div>
              <Link
                to={`/admin/submissions?assignment=${id}`}
                className="text-xs font-mono font-bold text-[#1557D6] hover:text-[#0D3EA8] flex items-center gap-1"
              >
                <span>Full Submission Matrix</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Overall Submission Progress Bar */}
            {assignment.assigned_groups && assignment.assigned_groups.length > 0 && (
              <div className="my-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#D9D5CA]">
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
                <p className="text-xs text-[#5A6578]">
                  This assignment has not yet been allocated to any student groups.
                </p>
                <p className="text-[11px] text-[#8A7E72] font-handwritten mt-1 text-sm">
                  Use the Allocation Manager on the right to assign this coursework.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E0D8] mt-2">
                {assignment.assigned_groups.map((grp) => {
                  const groupMonitor = monitoringData?.groups?.find((g) => g.group_id === grp.id);
                  const isConfirmed = groupMonitor?.submission_status === 'CONFIRMED';

                  return (
                    <div
                      key={grp.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1557D6] border border-blue-100 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                          {grp.name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            to={`/admin/groups/${grp.id}`}
                            className="text-sm font-bold text-[#172033] hover:text-[#1557D6] transition-colors font-editorial"
                          >
                            {grp.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#8A7E72] mt-0.5">
                            <span>Allocated {new Date(grp.assigned_at).toLocaleDateString()}</span>
                            {grp.member_count !== undefined && (
                              <>
                                <span>•</span>
                                <span>{grp.member_count} {grp.member_count === 1 ? 'member' : 'members'}</span>
                              </>
                            )}
                          </div>
                          {isConfirmed && (
                            <div className="text-[11px] font-mono text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                              <span>Verified by <strong>{groupMonitor.confirmed_by_name}</strong> on {new Date(groupMonitor.confirmed_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center font-mono text-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isConfirmed ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          {isConfirmed ? 'Confirmed' : isOverdue ? 'Overdue' : 'Pending'}
                        </span>
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
          <div className="paper-card bg-white rounded-3xl border border-[#D9D5CA] p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="w-5 h-5 text-[#1557D6]" />
              <h3 className="text-base font-bold font-editorial text-[#172033]">
                Group Allocation Manager
              </h3>
            </div>
            <p className="text-xs text-[#5A6578] mb-4">
              Allocate this coursework to all student cohorts in one click, or select specific teams.
            </p>

            {/* Success Message */}
            {allocationMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-700 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{allocationMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {allocationError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs font-mono">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{allocationError}</span>
              </div>
            )}

            {/* Strategy A: Assign All */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D9D5CA] mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-[#172033]">Global Allocation</span>
                <span className="text-[10px] uppercase font-bold font-mono text-[#1557D6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  All Teams
                </span>
              </div>
              <p className="text-[11px] text-[#5A6578]">
                Instantly allocate this brief to every active student squad in the institution.
              </p>
              <button
                type="button"
                onClick={handleAssignAll}
                disabled={isAssigning}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#1557D6] hover:bg-[#0D3EA8] active:bg-[#0A2E80] text-white font-mono font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
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
            <div className="space-y-3 pt-2 border-t border-[#E5E0D8]">
              <span className="block text-xs font-bold font-mono text-[#172033]">
                Targeted Allocation
              </span>

              {unassignedGroups.length === 0 ? (
                <p className="text-xs text-[#5A6578] italic p-3 bg-[#FAF8F5] rounded-xl text-center border border-[#E5E0D8]">
                  All registered squads have already been allocated this coursework.
                </p>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#D9D5CA]">
                    {unassignedGroups.map((grp) => {
                      const isChecked = selectedGroupIds.includes(grp.id);

                      return (
                        <label
                          key={grp.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E0D8] hover:border-[#1557D6] cursor-pointer text-xs transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleGroup(grp.id)}
                            className="rounded text-[#1557D6] focus:ring-[#1557D6]"
                          />
                          <span className="font-medium text-[#172033] line-clamp-1">{grp.name}</span>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAssignSpecific}
                    disabled={isAssigning || selectedGroupIds.length === 0}
                    className="w-full py-2 px-3 rounded-xl bg-[#172033] hover:bg-black text-white font-mono font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#D9D5CA] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-editorial text-[#172033]">
                Delete Assignment Dossier?
              </h3>
              <p className="text-xs text-[#5A6578] mt-2 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-[#172033]">"{assignment.title}"</strong>?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] leading-relaxed font-mono">
                ⚠️ <strong>Warning:</strong> All linked cohort allocations and student submission records will be permanently removed in accordance with database cascading rules.
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E0D8]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#D9D5CA] text-xs font-mono font-bold text-[#5A6578] hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAssignment}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailsPage;

