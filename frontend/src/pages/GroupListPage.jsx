import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import {
  Users,
  UserPlus,
  ArrowRight,
  Crown,
  Calendar,
  Loader2,
  AlertCircle,
  FolderPlus,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Card, CardBody, Badge, Button, SearchBar, EmptyState } from '../components/ui';

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="paper-card bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#D9D5CA] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase tracking-wider">
                COHORT DIRECTORY
              </span>
              <span className="text-xs font-handwritten text-[#8A7E72] text-sm">
                Collaborative project teams
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-editorial tracking-tight text-[#172033]">
              Project Groups & Squads
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6578] mt-1.5 max-w-2xl leading-relaxed">
              Form academic teams, invite student collaborators, coordinate milestone deliverables, and access shared Orbit rooms.
            </p>
          </div>

          {user?.role === 'STUDENT' && (
            <Link to="/student/groups/create">
              <Button variant="primary" icon={FolderPlus}>
                Create New Group
              </Button>
            </Link>
          )}
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#E5E0D8]">
          <div className="bg-white/80 rounded-xl p-3 border border-[#E5E0D8]">
            <p className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">Active Teams</p>
            <p className="text-2xl font-black font-mono text-[#172033] mt-0.5">{groups.length}</p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 border border-[#E5E0D8]">
            <p className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">My Groups</p>
            <p className="text-2xl font-black font-mono text-[#1557D6] mt-0.5">
              {groups.filter(g => g.created_by === user?.id || g.is_creator).length}
            </p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 border border-[#E5E0D8] col-span-2 sm:col-span-1">
            <p className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">Mode</p>
            <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Collaborative Orbit
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-3 shadow-2xs">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Filter squads and teams by group name..."
        />
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
        <div className="min-h-[30vh] flex flex-col items-center justify-center paper-card bg-white rounded-3xl border border-[#D9D5CA] p-12">
          <Loader2 className="w-8 h-8 text-[#1557D6] animate-spin" />
          <p className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
            Loading project groups from registry...
          </p>
        </div>
      ) : filteredGroups.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No matching groups found' : 'No Project Groups Yet'}
          description={
            searchQuery
              ? `No teams match "${searchQuery}". Try searching with a different term.`
              : 'You have not joined or created any project groups. Form a team with your peers to collaborate on assignments.'
          }
          actionText={user?.role === 'STUDENT' && !searchQuery ? 'Create Your First Group' : undefined}
          onAction={user?.role === 'STUDENT' && !searchQuery ? () => window.location.href = '/student/groups/create' : undefined}
        />
      ) : (
        /* Groups Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const isCreator = group.created_by === user?.id || group.is_creator;

            return (
              <div
                key={group.id}
                className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1557D6] border border-blue-100 flex items-center justify-center font-bold font-mono text-sm">
                      {group.name.substring(0, 2).toUpperCase()}
                    </div>
                    {isCreator && (
                      <Badge variant="leader" icon={<Crown className="w-3 h-3 text-amber-500" />}>
                        Team Leader
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#172033] line-clamp-1 font-editorial text-lg group-hover:text-[#1557D6] transition-colors">
                    {group.name}
                  </h3>

                  <p className="text-xs text-[#5A6578] mt-1.5">
                    Lead: <span className="text-[#172033] font-medium">{group.creator_name || 'Student Creator'}</span>
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#5A6578] font-medium font-mono">
                    <Users className="w-3.5 h-3.5 text-[#8A7E72]" />
                    <span>{group.member_count} {group.member_count === 1 ? 'Member' : 'Members'}</span>
                  </div>

                  <Link
                    to={`/student/groups/${group.id}`}
                    className="inline-flex items-center gap-1.5 font-bold text-[#1557D6] hover:text-[#0D3EA8] transition-colors"
                  >
                    <span>Enter Orbit</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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

