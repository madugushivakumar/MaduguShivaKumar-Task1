import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import groupService from '../services/groupService';
import {
  FolderPlus,
  ArrowLeft,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || name.trim().length < 2) {
      setErrorMessage('Group name must be at least 2 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await groupService.createGroup({ name: name.trim() });
      const createdGroupId = res.data?.group?.id;
      if (createdGroupId) {
        navigate(`/student/groups/${createdGroupId}`);
      } else {
        navigate('/student/groups');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to create group. Please check your connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/groups"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Groups</span>
        </Link>
        <PhaseBadge phase="Phase 4" status="Group Creator" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-sm shadow-indigo-100">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Project Group
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Establish a collaborative team for academic coursework and assignment submissions.
          </p>
        </div>

        {/* Informational pill */}
        <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 text-indigo-700 text-xs">
          <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <span>
            You will automatically become the <strong>Group Leader</strong>. You can invite other students right after creating the group.
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Group / Team Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="e.g. Distributed Consensus Lab Team 4"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition-all shadow-md shadow-indigo-100 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Team...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Create Group</span>
                </>
              )}
            </button>

            <Link
              to="/student/groups"
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

export default CreateGroupPage;
