import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import {
  Users,
  UserPlus,
  UserMinus,
  Crown,
  ArrowLeft,
  Mail,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  LogOut,
  X,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const GroupDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Member form state
  const [searchType, setSearchType] = useState('email'); // 'email' or 'studentId'
  const [emailInput, setEmailInput] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);

  // Remove confirmation modal
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupService.getGroupById(id);
      setGroup(res.data?.group);
    } catch (err) {
      setError(err.message || 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    const trimmedEmail = emailInput.trim();
    const trimmedStudentId = studentIdInput.trim();

    if (!trimmedEmail && !trimmedStudentId) {
      setAddError(
        `Please enter a valid student ${searchType === 'email' ? 'institutional email' : 'ID number'}.`
      );
      return;
    }

    setIsAdding(true);
    try {
      const payload = {};
      if (trimmedEmail) payload.email = trimmedEmail;
      if (trimmedStudentId) payload.studentId = trimmedStudentId;

      const res = await groupService.addMember(id, payload);
      const addedName =
        res.data?.member?.name ||
        res.data?.addedMember?.name ||
        'Student';
      setAddSuccess(`Student '${addedName}' was added to the team!`);
      setEmailInput('');
      setStudentIdInput('');

      // Refresh members list via GET /api/groups/:groupId/members
      try {
        const membersRes = await groupService.getMembers(id);
        const membersList = membersRes.data?.members || membersRes.data || [];
        setGroup((prev) => ({
          ...prev,
          members: membersList,
          member_count: membersList.length,
        }));
      } catch {
        // Fallback to response payload if getMembers encounters an issue
        setGroup((prev) => ({
          ...prev,
          members: res.data?.members || prev.members,
          member_count: res.data?.memberCount || (prev.member_count + 1),
        }));
      }
    } catch (err) {
      if (err.status === 409) {
        setAddError(err.message || 'Student is already a member of this group.');
      } else if (err.status === 404) {
        setAddError(err.message || 'Student not found. Please verify the institutional email or student ID.');
      } else if (err.status === 403) {
        setAddError(err.message || 'You are not authorized to add members to this group.');
      } else if (err.status === 400) {
        setAddError(err.message || 'Invalid input provided. Please verify the student information.');
      } else if (err.status === 401) {
        setAddError('Authentication required. Please sign in again.');
      } else {
        setAddError(err.message || 'Could not add student to the group.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);

    try {
      const res = await groupService.removeMember(id, memberToRemove.student_id);
      setGroup((prev) => ({
        ...prev,
        members: res.data?.members || prev.members.filter((m) => m.student_id !== memberToRemove.student_id),
        member_count: res.data?.memberCount || (prev.member_count - 1),
      }));

      // If the current student left the group themselves, redirect to groups list
      if (memberToRemove.student_id === user?.id) {
        navigate('/student/groups');
      } else {
        setMemberToRemove(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to remove student.');
    } finally {
      setIsRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-xs text-slate-500 font-medium">
          Loading team roster and group information...
        </p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Group</h2>
        <p className="text-xs text-slate-600 mt-2">{error || 'Group not found.'}</p>
        <Link
          to="/student/groups"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Groups</span>
        </Link>
      </div>
    );
  }

  const isCreator = group.created_by === user?.id || group.is_creator;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/groups"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Groups</span>
        </Link>
        <PhaseBadge phase="Phase 4" status="Team Hub" />
      </div>

      {/* Group Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-indigo-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
              <Users className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight">{group.name}</h1>
                {isCreator && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Crown className="w-3 h-3 text-amber-400" />
                    Team Leader
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Created by: <strong className="text-white">{group.creator_name}</strong> ({group.creator_email})
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-indigo-200">
                <span>Team Roster: <strong className="text-white">{group.member_count} Active {group.member_count === 1 ? 'Student' : 'Students'}</strong></span>
                <span>•</span>
                <span>Formed on: {new Date(group.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Roster Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Team Members ({group.members?.length || 0})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Auto-Synchronized
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {group.members?.map((member) => {
                const memberIsCreator = member.student_id === group.created_by;
                const isCurrentUser = member.student_id === user?.id;

                return (
                  <div
                    key={member.membership_id || member.student_id}
                    className="py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {member.name}
                          </span>
                          {memberIsCreator && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              <Crown className="w-2.5 h-2.5 text-amber-600" />
                              Creator
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{member.email}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                            {member.institutional_id || member.studentId || 'ID Verified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div>
                      {memberIsCreator ? (
                        <span
                          className="text-[11px] text-slate-400 font-medium px-2 py-1 italic"
                          title="Group creator cannot be removed"
                        >
                          Anchor Member
                        </span>
                      ) : (isCreator || isCurrentUser) ? (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(member)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                        >
                          {isCurrentUser ? (
                            <>
                              <LogOut className="w-3 h-3" />
                              <span>Leave</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Add Member Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Invite Student</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add a peer to this project group using their institutional email or student ID.
            </p>

            {/* Toggle: Email vs Student ID */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setSearchType('email');
                  setAddError(null);
                  setAddSuccess(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  searchType === 'email'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType('studentId');
                  setAddError(null);
                  setAddSuccess(null);
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  searchType === 'studentId'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Student ID
              </button>
            </div>

            {/* Alerts */}
            {addError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-700 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{addSuccess}</span>
              </div>
            )}

            {/* Input & Form */}
            <form onSubmit={handleAddMember} className="space-y-3">
              {searchType === 'email' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      University Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setAddError(null);
                        setAddSuccess(null);
                      }}
                      placeholder="e.g. charlie.brown@university.edu"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Student ID Number
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Required for new friends
                      </span>
                    </div>
                    <input
                      type="text"
                      value={studentIdInput}
                      onChange={(e) => {
                        setStudentIdInput(e.target.value);
                        setAddError(null);
                        setAddSuccess(null);
                      }}
                      placeholder="e.g. STU2026010"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student ID Number
                    </label>
                    <input
                      type="text"
                      value={studentIdInput}
                      onChange={(e) => {
                        setStudentIdInput(e.target.value);
                        setAddError(null);
                        setAddSuccess(null);
                      }}
                      placeholder="e.g. STU2026003"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        University Email Address
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Required for new friends
                      </span>
                    </div>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setAddError(null);
                        setAddSuccess(null);
                      }}
                      placeholder="e.g. friend@university.edu"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs transition-all shadow-md shadow-indigo-100 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Member to Group</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <UserMinus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              {memberToRemove.student_id === user?.id ? 'Leave Project Group?' : 'Remove Team Member?'}
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              {memberToRemove.student_id === user?.id
                ? 'Are you sure you want to leave this group? You will lose access to team assignments and progress.'
                : `Are you sure you want to remove ${memberToRemove.name} from the group?`}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isRemoving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Confirm Removal</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsPage;
