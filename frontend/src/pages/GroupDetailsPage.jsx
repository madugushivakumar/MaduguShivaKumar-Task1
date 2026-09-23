import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import progressService from '../services/progressService';
import {
  Users,
  UserPlus,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  X,
  Search,
  Check,
  Plus,
  Sparkles,
  MessageSquare,
  FolderOpen,
  Send,
  ExternalLink,
  Shield,
  FileText,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  Modal,
  Input,
  Breadcrumb,
  UserAvatar,
  GoldenCrown,
} from '../components/ui';

export const GroupDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Member Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Remove confirmation state
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Discussion feed simulation
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Priya Sharma', text: 'Uploaded database schema draft to OneDrive.', time: '10 mins ago' },
    { id: 2, sender: 'Rahul Verma', text: 'Pushed new code to GitHub repository.', time: '1 hour ago' },
    { id: 3, sender: 'Shiva Kumar', text: 'Started a discussion on route validation schemas.', time: '2 hours ago' },
    { id: 4, sender: 'Ananya Reddy', text: 'Joined the group workspace.', time: '3 hours ago' },
  ]);
  const [newChatInput, setNewChatInput] = useState('');

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupRes, progressRes] = await Promise.all([
        groupService.getGroupById(id),
        progressService.getGroupProgress(id).catch(() => ({ data: null })),
      ]);
      setGroup(groupRes.data?.group);
      setProgressData(progressRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  // Handle Search in add teammate modal
  const handleSearchStudent = (e) => {
    e.preventDefault();
    setSearchError(null);
    const query = searchInput.trim();
    if (!query) {
      setSearchError('Please enter a student email or student ID.');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const isEmail = query.includes('@');
      const alreadyMember = group?.members?.some(
        (m) =>
          m.email?.toLowerCase() === query.toLowerCase() ||
          m.student_id?.toLowerCase() === query.toLowerCase()
      );

      if (alreadyMember) {
        setSearchError('This student is already a registered member of this group.');
        setSearchResult(null);
      } else {
        setSearchResult({
          name: isEmail ? query.split('@')[0].replace('.', ' ') : `Student ${query}`,
          email: isEmail ? query : `${query.toLowerCase()}@university.edu`,
          studentId: isEmail ? 'STU-ACTIVE' : query,
        });
      }
      setIsSearching(false);
    }, 300);
  };

  // Handle Add Member from search result
  const handleExecuteAddMember = async () => {
    if (!searchResult) return;
    setIsAddingMember(true);
    setSearchError(null);

    try {
      const payload = {
        email: searchResult.email,
        studentId: searchResult.studentId,
      };

      await groupService.addMember(id, payload);
      await fetchGroupDetails();
      setIsAddModalOpen(false);
      setSearchInput('');
      setSearchResult(null);
    } catch (err) {
      setSearchError(err.message || 'Could not add student to the group.');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handle Remove Member
  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);

    try {
      await groupService.removeMember(id, memberToRemove.student_id);
      await fetchGroupDetails();
      setMemberToRemove(null);
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    setChatMessages((prev) => [
      {
        id: Date.now(),
        sender: user?.name || 'You',
        text: newChatInput.trim(),
        time: 'Just now',
      },
      ...prev,
    ]);
    setNewChatInput('');
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#1557D6] animate-spin" />
        <p className="text-xs text-[#64748B] font-mono tracking-wider uppercase">
          Loading Group Workspace...
        </p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <Card className="max-w-md mx-auto my-12 p-8 text-center bg-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#172033] font-display">
          Group Workspace Unavailable
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          {error || 'The requested group could not be retrieved.'}
        </p>
        <Link to="/student/groups">
          <Button size="sm" icon={ArrowLeft}>
            Return to Groups
          </Button>
        </Link>
      </Card>
    );
  }

  const isCreator = group.created_by === user?.id || group.is_creator;
  const membersList = group.members || [];
  const progressPct =
    progressData?.progressPercentage !== undefined && progressData?.progressPercentage !== null
      ? Math.round(progressData.progressPercentage)
      : 0;

  // Circular orbit room coordinates
  const orbitRadius = 125;
  const centerX = 190;
  const centerY = 190;

  // Symmetrically arrange real members with leader at 12 o'clock
  const leaderMember =
    membersList.find(
      (m) =>
        m.student_id === group.created_by ||
        m.id === group.created_by ||
        m.role?.toUpperCase() === 'LEADER'
    ) || membersList[0];

  const sortedMembers = leaderMember
    ? [leaderMember, ...membersList.filter((m) => m !== leaderMember)]
    : membersList;

  // Orbit roster: real members first, open slots up to capacity of 5 if less
  const totalOrbitSlots = Math.max(sortedMembers.length, 5);
  const displayRoster = Array.from({ length: totalOrbitSlots }, (_, idx) => {
    if (idx < sortedMembers.length) {
      const member = sortedMembers[idx];
      return {
        ...member,
        isOpenSlot: false,
        isLeader: idx === 0,
      };
    }
    return {
      id: `open-slot-${idx}`,
      name: 'Open Slot',
      role: 'Available',
      isOpenSlot: true,
      isLeader: false,
    };
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumb backTo="/student/groups" backLabel="All Groups" />

        {isCreator && (
          <Button
            onClick={() => {
              setSearchInput('');
              setSearchResult(null);
              setSearchError(null);
              setIsAddModalOpen(true);
            }}
            icon={UserPlus}
            size="sm"
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* GROUP WORKSPACE HEADER (Reference 1) */}
      <div className="paper-card bg-white rounded-2xl p-6 sm:p-7 border border-[#D9D5CA] shadow-paper-sm relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Team Crest Emblem */}
            <div className="w-14 h-14 rounded-2xl bg-[#172033] text-white flex items-center justify-center shadow-paper flex-shrink-0">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <path d="M16 3L6 8V15C6 21.5 10.3 27.5 16 29C21.7 27.5 26 21.5 26 15V8L16 3Z" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#1E293B" />
                <path d="M16 10C14.34 10 13 11.34 13 13C13 14.66 14.34 16 16 16C17.66 16 19 14.66 19 13C19 11.34 17.66 10 16 10Z" fill="#FFFFFF" />
                <path d="M10.5 22C10.5 19.5 13 18 16 18C19 18 21.5 19.5 21.5 22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#172033] font-editorial tracking-tight">
                {group.name || 'Team Alpha'}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-sans">
                {group.course_title || 'Web Development'} •{' '}
                <span className="font-semibold text-[#172033]">
                  {membersList.length}/5 members
                </span>
              </p>
            </div>
          </div>

          {/* Group Progress Bar (Reference 1 Top Right) */}
          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#172033]">Group Progress</span>
              <span className="font-mono font-bold text-base text-[#172033]">{progressPct}%</span>
            </div>
            <div className="w-full bg-[#FAF8F5] border border-[#D9D5CA] rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN WORKBENCH (Reference 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: ORBIT ROOM VISUALIZATION & DECORATION */}
        <div className="lg:col-span-7 space-y-6">
          <div className="paper-card bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-6 sm:p-8 relative overflow-hidden flex flex-col items-center shadow-paper-sm">
            {/* SVG ORBIT ROOM VISUALIZATION (Reference 1 Core) */}
            <div className="relative w-full max-w-[420px] h-[400px] flex items-center justify-center my-2">
              <svg className="w-full h-full" viewBox="0 0 380 380">
                {/* Concentric Guide Rings */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="78"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={orbitRadius}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="165"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Radial Dashed Connecting Lines */}
                {displayRoster.map((_, idx) => {
                  const angle =
                    (idx * (2 * Math.PI)) / Math.max(displayRoster.length, 1) - Math.PI / 2;
                  const x = centerX + orbitRadius * Math.cos(angle);
                  const y = centerY + orbitRadius * Math.sin(angle);
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke="#93C5FD"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Central Dark Charcoal Hub */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="56"
                  fill="#172033"
                  stroke="#1557D6"
                  strokeWidth="2.5"
                  className="drop-shadow-md"
                />
              </svg>

              {/* Central Hub Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none text-white p-3 select-none">
                <Users className="w-5 h-5 text-white mb-1" />
                <span className="text-xs font-black font-display tracking-tight leading-tight px-2 line-clamp-1">
                  {group.name || 'Team Alpha'}
                </span>
                <span className="text-[9px] font-mono text-[#93C5FD] tracking-wider uppercase mt-0.5 leading-tight">
                  Learn • Build<br />Together
                </span>
              </div>

              {/* Orbiting Member Nodes */}
              {displayRoster.map((member, idx) => {
                const angle =
                  (idx * (2 * Math.PI)) / Math.max(displayRoster.length, 1) - Math.PI / 2;
                const x = centerX + orbitRadius * Math.cos(angle);
                const y = centerY + orbitRadius * Math.sin(angle);

                const isLeader =
                  member.isLeader ||
                  member.role?.toUpperCase() === 'LEADER' ||
                  member.id === group.created_by ||
                  idx === 0;
                const isPending = member.isPending || member.role?.toUpperCase() === 'PENDING';

                return (
                  <div
                    key={member.id || idx}
                    className="absolute flex flex-col items-center pointer-events-auto"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Floating Crown above leader (Reference 1) */}
                    {isLeader && !member.isOpenSlot && (
                      <div className="absolute -top-5 z-20 animate-bounce-subtle">
                        <GoldenCrown className="w-5 h-5 drop-shadow-xs" />
                      </div>
                    )}

                    {/* Avatar Circle or Open Slot */}
                    {member.isOpenSlot ? (
                      <button
                        type="button"
                        onClick={() => isCreator && setIsAddModalOpen(true)}
                        className={`w-10 h-10 rounded-full border-2 border-dashed border-[#CBD5E1] bg-[#FAF8F5] flex items-center justify-center text-[#94A3B8] transition-all ${
                          isCreator
                            ? 'hover:border-[#1557D6] hover:text-[#1557D6] hover:bg-[#EFF6FF] cursor-pointer'
                            : ''
                        }`}
                        title={isCreator ? 'Click to invite a member' : 'Available slot'}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <div
                        className={`relative rounded-full p-0.5 shadow-paper-sm transition-transform hover:scale-105 ${
                          isLeader
                            ? 'ring-2 ring-[#059669] bg-emerald-50'
                            : isPending
                            ? 'ring-2 ring-dashed ring-amber-400 bg-amber-50'
                            : 'ring-1 ring-[#93C5FD] bg-white'
                        }`}
                      >
                        <UserAvatar name={member.name} size="md" />
                      </div>
                    )}

                    {/* Name Pill */}
                    <span className="text-[11px] font-bold text-[#172033] mt-1 whitespace-nowrap bg-white/95 px-2 py-0.5 rounded-md border border-[#D9D5CA]/60 shadow-2xs">
                      {member.isOpenSlot ? 'Available Slot' : member.name}
                    </span>

                    {/* Role Label */}
                    <span
                      className={`text-[10px] font-semibold mt-0.5 ${
                        member.isOpenSlot
                          ? 'text-[#94A3B8]'
                          : isLeader
                          ? 'text-[#059669]'
                          : isPending
                          ? 'text-[#D97706]'
                          : 'text-[#1557D6]'
                      }`}
                    >
                      {member.isOpenSlot
                        ? isCreator
                          ? '+ Invite'
                          : 'Open'
                        : isLeader
                        ? 'Leader'
                        : isPending
                        ? 'Pending'
                        : 'Member'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom-Left Editorial Handwritten Note (Reference 1) */}
            <div className="w-full pt-4 border-t border-[#D9D5CA]/70 flex items-center justify-between">
              <span className="font-handwritten text-2xl sm:text-3xl text-[#1E293B] -rotate-3 select-none">
                Great teams build greater futures.
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider hidden sm:inline">
                Joineazy Collaboration Orbit
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: GROUP ACTIONS & ACTIVITY TIMELINE (Reference 1) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Group Actions Card */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 space-y-3 shadow-paper-sm">
            <h3 className="text-sm font-bold text-[#172033] font-display">
              Group Actions
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchResult(null);
                  setSearchError(null);
                  setIsAddModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-[#EFF6FF] border border-[#BFDBFE] hover:border-[#93C5FD] text-[#1557D6] font-semibold text-xs shadow-paper-sm transition-all group cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#1557D6] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>Invite Member</span>
              </button>

              <Link to="/student/assignments" className="block">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-[#EFF6FF] border border-[#BFDBFE] hover:border-[#93C5FD] text-[#1557D6] font-semibold text-xs shadow-paper-sm transition-all group cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-[#1557D6] flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>View Shared Files</span>
                </button>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('chat-input-field');
                  if (input) input.focus();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-[#EFF6FF] border border-[#BFDBFE] hover:border-[#93C5FD] text-[#1557D6] font-semibold text-xs shadow-paper-sm transition-all group cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#1557D6] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>Group Discussion</span>
              </button>
            </div>
          </div>

          {/* Group Activity Card */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 space-y-4 shadow-paper-sm">
            <div className="flex items-center justify-between border-b border-[#D9D5CA]/70 pb-3">
              <h3 className="text-sm font-bold text-[#172033] font-display">
                Group Activity
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live stream active" />
            </div>

            {/* Vertical Activity Stream */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs hover:border-[#CBD5E1] transition-colors"
                >
                  <UserAvatar name={msg.sender} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#172033] font-medium leading-snug">
                      <span className="font-bold">{msg.sender}</span> {msg.text.toLowerCase().startsWith(msg.sender.toLowerCase()) ? msg.text.slice(msg.sender.length) : msg.text}
                    </p>
                    <span className="text-[10px] text-[#94A3B8] font-mono block mt-0.5">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Discussion Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#D9D5CA]/70">
              <input
                id="chat-input-field"
                type="text"
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                placeholder="Post a message to your team..."
                className="flex-1 bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl px-3 py-2 text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1557D6] focus:bg-white transition-all"
              />
              <Button type="submit" size="sm" icon={Send}>
                Post
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Invite Teammate to Group"
        subtitle={`Cohort: ${group.name}`}
      >
        <div className="space-y-4">
          <form onSubmit={handleSearchStudent} className="flex gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by student email or student ID..."
              leftIcon={Search}
            />
            <Button type="submit" loading={isSearching} size="md">
              Search
            </Button>
          </form>

          {searchError && (
            <p className="text-xs text-rose-600 font-medium">{searchError}</p>
          )}

          {searchResult && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#172033]">{searchResult.name}</p>
                <p className="text-[11px] text-[#64748B]">{searchResult.email}</p>
              </div>
              <Button
                onClick={handleExecuteAddMember}
                loading={isAddingMember}
                size="sm"
                icon={Plus}
              >
                Add to Team
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* REMOVE MEMBER CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member from Group"
        subtitle={`Remove ${memberToRemove?.name} from ${group.name}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setMemberToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmRemove}
              loading={isRemoving}
            >
              Remove Member
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#475569]">
          Are you sure you want to remove this member from the group? They will lose access to team assignments and deliverables.
        </p>
      </Modal>
    </div>
  );
};

export default GroupDetailsPage;
