import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import assignmentService from '../services/assignmentService';
import {
  BookOpen,
  PlusCircle,
  Calendar,
  ExternalLink,
  Users,
  Edit,
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { Card, CardBody, Badge, Button, SearchBar, EmptyState } from '../components/ui';

export const AdminAssignmentListPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assignmentService.getAssignments();
      setAssignments(res.data?.assignments || []);
    } catch (err) {
      setError(err.message || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await assignmentService.deleteAssignment(assignmentToDelete.id);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentToDelete.id));
      setAssignmentToDelete(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete assignment.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="paper-card bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#D9D5CA] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase tracking-wider">
                CURRICULUM OVERSIGHT
              </span>
              <span className="text-xs font-handwritten text-[#8A7E72] text-sm">
                Faculty control terminal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-editorial tracking-tight text-[#172033]">
              Coursework & Assignments
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6578] mt-1.5 max-w-2xl leading-relaxed">
              Author coursework briefs, establish OneDrive repository links, allocate milestones to squads, and monitor student submission activity.
            </p>
          </div>

          <Link to="/admin/assignments/create">
            <Button variant="primary" icon={PlusCircle}>
              Create Assignment
            </Button>
          </Link>
        </div>

        {/* Quick Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#E5E0D8]">
          <div className="bg-white/80 rounded-xl p-3 border border-[#E5E0D8]">
            <p className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">Total Briefs</p>
            <p className="text-2xl font-black font-mono text-[#172033] mt-0.5">{assignments.length}</p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 border border-[#E5E0D8]">
            <p className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">Active Coursework</p>
            <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
              {assignments.filter((a) => new Date(a.due_date) >= new Date()).length}
            </p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 border border-[#E5E0D8] col-span-2 sm:col-span-1">
            <p className="text-[10px] font-mono font-bold text-[#8A7E72] uppercase tracking-wider">Past Due</p>
            <p className="text-2xl font-black font-mono text-rose-600 mt-0.5">
              {assignments.filter((a) => new Date(a.due_date) < new Date()).length}
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
          placeholder="Filter coursework dossiers by title or instructions..."
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center paper-card bg-white rounded-3xl border border-[#D9D5CA] p-12">
          <Loader2 className="w-8 h-8 text-[#1557D6] animate-spin" />
          <p className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-[#5A6578]">
            Retrieving assignment dossiers...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={searchQuery ? 'No matching assignments found' : 'No Course Assignments Yet'}
          description={
            searchQuery
              ? `No coursework matched "${searchQuery}". Try a different keyword.`
              : 'Create your first assignment with a deadline, OneDrive submission folder, and target student groups.'
          }
          actionText={!searchQuery ? 'Create First Assignment' : undefined}
          onAction={!searchQuery ? () => window.location.href = '/admin/assignments/create' : undefined}
        />
      ) : (
        /* Assignment Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((assignment) => {
            const dueDateObj = new Date(assignment.due_date);
            const isOverdue = dueDateObj < new Date();
            const groupCount = assignment.assigned_groups_count || 0;

            return (
              <div
                key={assignment.id}
                className="paper-card bg-[#FFFDF7] rounded-2xl border border-[#D9D5CA] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1557D6] border border-blue-200/60 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {isOverdue ? 'Overdue' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-editorial text-[#172033] line-clamp-1 group-hover:text-[#1557D6] transition-colors">
                    {assignment.title}
                  </h3>

                  <p className="text-xs text-[#5A6578] mt-1.5 line-clamp-2 leading-relaxed">
                    {assignment.description || 'No detailed instructions provided.'}
                  </p>

                  {/* Metadata Chips */}
                  <div className="mt-4 pt-3 border-t border-[#E5E0D8] grid grid-cols-2 gap-2 text-xs text-[#5A6578] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8A7E72]" />
                      <span>{dueDateObj.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#8A7E72]" />
                      <span className="font-bold text-[#172033]">
                        {groupCount} {groupCount === 1 ? 'Squad' : 'Squads'}
                      </span>
                    </div>
                  </div>

                  {/* OneDrive Link Preview */}
                  {assignment.onedrive_link && (
                    <div className="mt-3">
                      <a
                        href={assignment.onedrive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#1557D6] hover:text-[#0D3EA8] font-mono font-medium truncate max-w-full bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#D9D5CA]"
                      >
                        <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 text-[#1557D6]" />
                        <span className="truncate">OneDrive Vault</span>
                        <ExternalLink className="w-3 h-3 text-[#8A7E72] ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-[#E5E0D8] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/admin/assignments/${assignment.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs font-bold font-mono text-[#5A6578] hover:text-[#172033] transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#8A7E72]" />
                      <span>Edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentToDelete(assignment);
                        setDeleteError(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold font-mono text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <Link
                    to={`/admin/assignments/${assignment.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-[#1557D6] hover:text-[#0D3EA8] transition-colors"
                  >
                    <span>Manage Cohorts</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#D9D5CA] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-editorial text-[#172033]">
                Delete Assignment?
              </h3>
              <p className="text-xs text-[#5A6578] mt-2 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-[#172033]">"{assignmentToDelete.title}"</strong>?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] leading-relaxed font-mono">
                ⚠️ <strong>Warning:</strong> All student submissions and group allocations for this assignment will be permanently removed.
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
                  setAssignmentToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#D9D5CA] text-xs font-mono font-bold text-[#5A6578] hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
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

export default AdminAssignmentListPage;

