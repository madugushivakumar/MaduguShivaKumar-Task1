import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import {
  Users,
  UserPlus,
  ArrowRight,
  Search,
  Crown,
  Calendar,
  Loader2,
  AlertCircle,
  FolderPlus,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const GroupListPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupService.getGroups();
      setGroups(res.data?.groups || []);
    } catch (err) {
      setError(err.message || 'Failed to load project groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Student Project Groups
            </h1>
            <PhaseBadge phase="Phase 4" status="Active" />
          </div>
          <p className="text-xs text-slate-500">
            Create project teams, invite student collaborators, and manage group rosters.
          </p>
        </div>

        {user?.role === 'STUDENT' && (
          <Link
            to="/student/groups/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Group</span>
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter groups by team name..."
          className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton / Spinner */}
      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="mt-3 text-xs text-slate-500 font-medium">
            Loading your project groups...
          </p>
        </div>
      ) : filteredGroups.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {searchQuery ? 'No matching groups found' : 'No Project Groups Yet'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No teams match the query "${searchQuery}". Try a different keyword.`
              : 'You have not joined or created any project groups. Form a team with your peers to collaborate on assignments.'}
          </p>

          {user?.role === 'STUDENT' && !searchQuery && (
            <div className="mt-6">
              <Link
                to="/student/groups/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Your First Group</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Groups Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const isCreator = group.created_by === user?.id || group.is_creator;

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    {isCreator && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Crown className="w-3 h-3 text-amber-500" />
                        Leader / Creator
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {group.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Creator: <span className="text-slate-700 font-medium">{group.creator_name || 'Student Creator'}</span>
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{group.member_count} {group.member_count === 1 ? 'Member' : 'Members'}</span>
                  </div>

                  <Link
                    to={`/student/groups/${group.id}`}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>View Team</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupListPage;
