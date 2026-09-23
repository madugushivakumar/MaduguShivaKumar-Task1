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
  Sparkles,
} from 'lucide-react';
import { Card, CardBody, Button, Input, Badge } from '../components/ui';

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
    <div className="max-w-lg mx-auto my-8 space-y-6">
      {/* Top Header Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/groups"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#5A6578] hover:text-[#1557D6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Group Registry</span>
        </Link>
        <span className="text-[11px] font-mono font-bold text-[#1557D6] bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase">
          COHORT CREATION
        </span>
      </div>

      <div className="paper-card bg-[#FFFDF7] rounded-3xl border border-[#D9D5CA] p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative stamp */}
        <div className="absolute top-6 right-6 opacity-30 pointer-events-none">
          <div className="rubber-stamp-navy text-[10px] scale-90">
            FORMATION
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1557D6] border border-blue-200/60 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black font-editorial text-[#172033] tracking-tight">
            Create Project Squad
          </h1>
          <p className="text-xs text-[#5A6578] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Establish a collaborative team for academic coursework, mutual code reviews, and assignment submissions.
          </p>
        </div>

        {/* Informational sticky-like note */}
        <div className="mb-6 p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex items-start gap-3 text-xs text-[#172033]">
          <CheckCircle className="w-4 h-4 text-[#1557D6] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[#172033]">Leader Delegation</p>
            <p className="text-[#5A6578] leading-relaxed">
              You will automatically become the <span className="font-bold text-[#1557D6]">Team Leader</span> with permissions to manage membership and verify submissions.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-bold text-[#172033] uppercase tracking-wider mb-2">
              Squad / Team Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="e.g. Distributed Systems Squad 4"
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl text-sm text-[#172033] placeholder-[#8A7E72] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-medium"
            />
            <p className="text-[11px] text-[#8A7E72] font-handwritten mt-1.5 ml-1">
              Choose a distinct, identifiable moniker for your cohort.
            </p>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-5 rounded-xl bg-[#1557D6] hover:bg-[#0D3EA8] active:bg-[#0A2E80] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Squad...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Form Group</span>
                </>
              )}
            </button>

            <Link
              to="/student/groups"
              className="py-3 px-5 rounded-xl border border-[#D9D5CA] text-[#5A6578] font-bold text-xs uppercase tracking-wider hover:bg-[#FAF8F5] hover:text-[#172033] transition-colors text-center font-mono"
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

