import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import assignmentService from '../services/assignmentService';
import {
  Edit,
  ArrowLeft,
  Calendar,
  ExternalLink,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const EditAssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [onedriveLink, setOnedriveLink] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await assignmentService.getAssignmentById(id);
        const data = res.data?.assignment;
        if (data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          if (data.due_date) {
            // Convert to YYYY-MM-DDTHH:mm format for datetime-local input
            const dt = new Date(data.due_date);
            const offset = dt.getTimezoneOffset();
            const localDate = new Date(dt.getTime() - offset * 60 * 1000);
            setDueDate(localDate.toISOString().slice(0, 16));
          }
          setOnedriveLink(data.onedrive_link || '');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load assignment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

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

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate).toISOString(),
        onedriveLink: onedriveLink.trim(),
      };

      await assignmentService.updateAssignment(id, payload);
      navigate(`/admin/assignments/${id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="mt-3 text-xs text-slate-500 font-medium">
          Loading assignment details for editing...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/admin/assignments/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignment Details</span>
        </Link>
        <PhaseBadge phase="Phase 5" status="Edit Mode" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm shadow-amber-100">
            <Edit className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Course Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update instructions, adjust deadlines, and refine OneDrive folder links.
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instructions & Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Submission Due Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* OneDrive Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              OneDrive Submission Folder Link
            </label>
            <input
              type="url"
              required
              value={onedriveLink}
              onChange={(e) => setOnedriveLink(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
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
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <Link
              to={`/admin/assignments/${id}`}
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

export default EditAssignmentPage;
