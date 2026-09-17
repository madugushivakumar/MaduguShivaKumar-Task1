import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import assignmentService from '../services/assignmentService';
import groupService from '../services/groupService';
import {
  BookPlus,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const CreateAssignmentPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [onedriveLink, setOnedriveLink] = useState('');

  // Allocation strategy: 'none' | 'all' | 'specific'
  const [allocationType, setAllocationType] = useState('none');
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load available groups if faculty chooses 'specific'
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await groupService.getGroups();
        setAvailableGroups(res.data?.groups || []);
      } catch (err) {
        console.error('Failed to load groups for assignment mapping', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const handleToggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage('Assignment title must be at least 3 characters long.');
      return;
    }

    if (!dueDate) {
      setErrorMessage('Please select a valid submission due date.');
      return;
    }

    if (!onedriveLink.trim().startsWith('http://') && !onedriveLink.trim().startsWith('https://')) {
      setErrorMessage('OneDrive link must be a valid web URL beginning with http:// or https://');
      return;
    }

    if (allocationType === 'specific' && selectedGroupIds.length === 0) {
      setErrorMessage('Please select at least one group to allocate, or choose "Leave unallocated".');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate).toISOString(),
        onedriveLink: onedriveLink.trim(),
        assignAll: allocationType === 'all',
        groupIds: allocationType === 'specific' ? selectedGroupIds : [],
      };

      const res = await assignmentService.createAssignment(payload);
      const createdId = res.data?.assignment?.id;

      if (createdId) {
        navigate(`/admin/assignments/${createdId}`);
      } else {
        navigate('/admin/assignments');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/assignments"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Assignments</span>
        </Link>
        <PhaseBadge phase="Phase 5" status="Author Coursework" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-sm shadow-indigo-100">
            <BookPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Course Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify coursework requirements, external OneDrive submission link, and target student groups.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus & Raft Protocol Implementation"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instructions & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide assignment guidelines, deliverables, and evaluation criteria..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
            />
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Submission Due Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Students will see this deadline displayed with live status badges.
            </p>
          </div>

          {/* OneDrive Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              OneDrive Submission Folder Link
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={onedriveLink}
                onChange={(e) => setOnedriveLink(e.target.value)}
                placeholder="https://onedrive.live.com/?id=sample-course-folder-2026"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Students will click this link to access the OneDrive folder directly.
            </p>
          </div>

          {/* Initial Allocation Strategy */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Group Allocation Strategy
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAllocationType('none')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  allocationType === 'none'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Unallocated
              </button>

              <button
                type="button"
                onClick={() => setAllocationType('all')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  allocationType === 'all'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Groups
              </button>

              <button
                type="button"
                onClick={() => setAllocationType('specific')}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  allocationType === 'specific'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Specific Groups
              </button>
            </div>

            {/* Specific Group Checkbox List */}
            {allocationType === 'specific' && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto space-y-2">
                {loadingGroups ? (
                  <div className="py-4 text-center text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-indigo-600" />
                    Loading available student groups...
                  </div>
                ) : availableGroups.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No student groups found in the system yet.
                  </p>
                ) : (
                  availableGroups.map((grp) => {
                    const isChecked = selectedGroupIds.includes(grp.id);

                    return (
                      <label
                        key={grp.id}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGroup(grp.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-bold text-slate-800">{grp.name}</span>
                        <span className="text-[11px] text-slate-400 ml-auto">
                          {grp.member_count} {grp.member_count === 1 ? 'member' : 'members'}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition-all shadow-md shadow-indigo-100 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Assignment...</span>
                </>
              ) : (
                <>
                  <BookPlus className="w-4 h-4" />
                  <span>Publish Assignment</span>
                </>
              )}
            </button>

            <Link
              to="/admin/assignments"
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
