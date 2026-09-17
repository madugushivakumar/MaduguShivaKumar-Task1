import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import progressService from '../services/progressService';
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Activity,
  PlusCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';
import GroupProgressCard from '../components/common/GroupProgressCard';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [groupProgressList, setGroupProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentGroupsWithProgress = async () => {
      try {
        setLoading(true);
        const res = await groupService.getGroups();
        const groups = res.data?.groups || [];

        // Fetch progress for each group in parallel
        const progressPromises = groups.map(async (g) => {
          try {
            const pRes = await progressService.getGroupProgress(g.id);
            return pRes.data || {
              groupId: g.id,
              groupName: g.name,
              memberCount: g.memberCount || 1,
              totalAssignments: 0,
              completedAssignments: 0,
              pendingAssignments: 0,
              progressPercentage: 0,
            };
          } catch (e) {
            return {
              groupId: g.id,
              groupName: g.name,
              memberCount: g.memberCount || 1,
              totalAssignments: 0,
              completedAssignments: 0,
              pendingAssignments: 0,
              progressPercentage: 0,
            };
          }
        });

        const progressData = await Promise.all(progressPromises);
        setGroupProgressList(progressData);
      } catch (err) {
        console.error('Failed to load group progress data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentGroupsWithProgress();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-indigo-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
              <GraduationCap className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Student
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-0.5">{user?.email}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-indigo-200">
                <span>
                  Student ID:{' '}
                  <strong className="text-white font-mono">
                    {user?.student_id || 'STU-ACTIVE'}
                  </strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  JWT Session Authenticated
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between">
            <PhaseBadge phase="Phase 7" status="Progress Tracking" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">My Project Groups</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create teams, invite student peers, manage rosters, and collaborate on assignments.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/student/groups"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>Manage Groups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Coursework & Submissions</h3>
            <p className="text-xs text-slate-500 mt-1">
              Access coursework instructions, OneDrive submission folders, and two-step confirmations.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/student/assignments"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>View Coursework</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Security & Credentials</h3>
            <p className="text-xs text-slate-500 mt-1">
              Protected by salted bcrypt password hashing and cryptographic JSON Web Tokens.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Role: STUDENT</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* Group Coursework Progress Section (Phase 7 Feature) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Group Progress</h2>
              <p className="text-xs text-slate-500">
                Visual progress bars and completion percentages for your project teams
              </p>
            </div>
          </div>

          <Link
            to="/student/groups"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>All Groups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Calculating group progress from coursework records...
            </p>
          </div>
        ) : groupProgressList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Groups Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You have not joined or created any project groups yet. Create or join a team to begin
              collaborating on coursework.
            </p>
            <Link
              to="/student/groups/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create a Group</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupProgressList.map((group) => (
              <GroupProgressCard key={group.groupId} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
