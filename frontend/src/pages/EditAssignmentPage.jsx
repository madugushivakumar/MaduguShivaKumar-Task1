import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import assignmentService from '../services/assignmentService';
import courseService from '../services/courseService';
import {
  Edit,
  ArrowLeft,
  Calendar,
  ExternalLink,
  AlertCircle,
  Loader2,
  Save,
  Users,
  User,
  BookMarked,
  Trash2,
} from 'lucide-react';
import PhaseBadge from '../components/common/PhaseBadge';

export const EditAssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [onedriveLink, setOnedriveLink] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [submissionType, setSubmissionType] = useState('GROUP');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [assignmentRes, coursesRes] = await Promise.all([
          assignmentService.getAssignmentById(id),
          courseService.getCourses().catch(() => ({ data: { courses: [] } })),
        ]);

        const data = assignmentRes.data?.assignment;
        setCourses(coursesRes.data?.courses || []);

        if (data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setSelectedCourseId(data.course_id || '');
          setSubmissionType(data.submission_type || 'GROUP');
          if (data.due_date) {
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

    fetchData();
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
        courseId: selectedCourseId || null,
        submissionType: submissionType,
      };

      await assignmentService.updateAssignment(id, payload);
      navigate(`/admin/assignments/${id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await assignmentService.deleteAssignment(id);
      navigate('/admin/assignments');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete assignment.');
      setIsDeleting(false);
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
    <div className="max-w-3xl mx-auto my-6 px-4 pb-16">
      <div className="paper-card-elevated bg-white rounded-3xl border border-[#E5E0D8] shadow-xs overflow-hidden">
        {/* Header with Close X */}
        <div className="px-6 py-5 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 font-editorial tracking-tight">Edit Assignment</h1>
              <p className="text-xs text-slate-500">Update coursework parameters, deadlines, and submission repository</p>
            </div>
          </div>

          <Link
            to={`/admin/assignments/${id}`}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-[#FAF8F5] border border-transparent hover:border-[#E5E0D8] flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Error Alert */}
        <div className="px-6 pt-5">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title (Full Width) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* 2-Column: Course & Submission Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
                Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer font-medium"
              >
                <option value="">-- General Coursework --</option>
                {courses.map((c, idx) => (
                  <option key={c.id || c._id || `course-${c.code || idx}`} value={c.id || c._id}>
                    {c.code} — {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
                Submission Mode
              </label>
              <div className="grid grid-cols-2 gap-2 h-11">
                <button
                  type="button"
                  onClick={() => setSubmissionType('INDIVIDUAL')}
                  className={`px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    submissionType === 'INDIVIDUAL'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                      : 'border-[#E5E0D8] bg-[#FAF8F5] text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionType('GROUP')}
                  className={`px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    submissionType === 'GROUP'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                      : 'border-[#E5E0D8] bg-[#FAF8F5] text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Group</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-y font-mono"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
              Due Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
            />
          </div>

          {/* OneDrive Link */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
              OneDrive Submission Folder Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={onedriveLink}
              onChange={(e) => setOnedriveLink(e.target.value)}
              className="w-full h-11 px-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteError(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl border border-rose-200 bg-rose-50/80 text-xs font-mono font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Assignment</span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to={`/admin/assignments/${id}`}
                className="px-5 h-11 rounded-xl border border-[#D9D5CA] text-[#5A6578] text-xs font-mono font-bold hover:bg-[#FAF8F5] transition-colors inline-flex items-center justify-center cursor-pointer shadow-2xs"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-11 rounded-xl bg-[#1557D6] hover:bg-[#0D3EA8] active:bg-[#0A2E80] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-60 inline-flex items-center gap-2 cursor-pointer"
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
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                Are you sure you want to permanently delete <strong className="text-[#172033]">"{title}"</strong>?
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
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#D9D5CA] text-xs font-mono font-bold text-[#5A6578] hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAssignment}
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

export default EditAssignmentPage;
