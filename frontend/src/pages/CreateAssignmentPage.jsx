import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import assignmentService from '../services/assignmentService';
import groupService from '../services/groupService';
import courseService from '../services/courseService';
import {
  Calendar,
  Clock,
  ExternalLink,
  Users,
  User,
  AlertCircle,
  Loader2,
  Check,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  Code,
  Link2,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Breadcrumb,
} from '../components/ui';

export const CreateAssignmentPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateOnly, setDateOnly] = useState('');
  const [timeOnly, setTimeOnly] = useState('23:59');
  const [onedriveLink, setOnedriveLink] = useState('');

  // Course linkage
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Submission type: 'INDIVIDUAL' | 'GROUP'
  const [submissionType, setSubmissionType] = useState('GROUP');

  // Assign to: 'all' | 'specific'
  const [assignTo, setAssignTo] = useState('all');
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load available courses and groups
  useEffect(() => {
    const fetchData = async () => {
      setLoadingGroups(true);
      try {
        const [groupsRes, coursesRes] = await Promise.all([
          groupService.getGroups().catch(() => ({ data: { groups: [] } })),
          courseService.getCourses().catch(() => ({ data: { courses: [] } })),
        ]);
        setAvailableGroups(groupsRes.data?.groups || []);
        const loadedCourses = coursesRes.data?.courses || [];
        setCourses(loadedCourses);
        if (loadedCourses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(loadedCourses[0].id);
        }

        // Set default due date to 7 days from now
        const defaultDue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        setDateOnly(defaultDue.toISOString().slice(0, 10));
      } catch (err) {
        console.error('Failed to load courses or groups for assignment mapping', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    // Load any existing draft
    try {
      const savedDraft = localStorage.getItem('joineazy_assignment_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.dateOnly) setDateOnly(parsed.dateOnly);
        if (parsed.timeOnly) setTimeOnly(parsed.timeOnly);
        if (parsed.onedriveLink) setOnedriveLink(parsed.onedriveLink);
        if (parsed.submissionType) setSubmissionType(parsed.submissionType);
        if (parsed.selectedCourseId) setSelectedCourseId(parsed.selectedCourseId);
      }
    } catch (e) {
      console.warn('Draft restore error', e);
    }

    fetchData();
  }, []);

  const handleToggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    try {
      const draft = {
        title,
        description,
        dateOnly,
        timeOnly,
        onedriveLink,
        submissionType,
        selectedCourseId,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('joineazy_assignment_draft', JSON.stringify(draft));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage('Assignment title must be at least 3 characters long.');
      return;
    }

    if (!dateOnly) {
      setErrorMessage('Please select a valid submission due date.');
      return;
    }

    if (!onedriveLink.trim().startsWith('http://') && !onedriveLink.trim().startsWith('https://')) {
      setErrorMessage('OneDrive link must be a valid web URL beginning with http:// or https://');
      return;
    }

    if (submissionType === 'GROUP' && assignTo === 'specific' && selectedGroupIds.length === 0) {
      setErrorMessage('Please select at least one cohort to allocate, or select "All Enrolled Cohorts".');
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedDateTime = new Date(`${dateOnly}T${timeOnly || '23:59'}:00`);
      const isoDueDate = isNaN(combinedDateTime.getTime())
        ? new Date(dateOnly).toISOString()
        : combinedDateTime.toISOString();

      const payload = {
        title: title.trim(),
        description: description.trim(),
        dueDate: isoDueDate,
        onedriveLink: onedriveLink.trim(),
        courseId: selectedCourseId || null,
        submissionType: submissionType,
        assignAll: assignTo === 'all',
        groupIds: submissionType === 'GROUP' && assignTo === 'specific' ? selectedGroupIds : [],
      };

      const res = await assignmentService.createAssignment(payload);
      localStorage.removeItem('joineazy_assignment_draft');
      const createdId = res.data?.assignment?.id;

      if (createdId) {
        navigate(`/admin/assignments/${createdId}`);
      } else {
        navigate('/admin/assignments');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to publish assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourseObj = courses.find((c) => c.id.toString() === selectedCourseId?.toString());

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Wizard Stepper (Panel 07 Reference) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb backTo="/admin/assignments" backLabel="Assignments" />
          <h1 className="text-3xl sm:text-4xl font-black text-[#172033] font-editorial tracking-tight mt-1">
            Create New Assignment
          </h1>
        </div>

        {/* 4-Step Wizard Indicator (Panel 07) */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#D9D5CA] text-xs font-mono font-bold shadow-paper-sm">
          <span className="px-3 py-1 rounded-xl bg-[#1557D6] text-white shadow-xs">
            1 Content
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="px-2.5 py-1 text-[#64748B]">2 Rules</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="px-2.5 py-1 text-[#64748B]">3 Groups</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="px-2.5 py-1 text-[#64748B]">4 Publish</span>
        </div>
      </div>

      {/* Two Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: Form Configuration Canvas */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white p-6 sm:p-8 space-y-5">
            {/* Form Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {draftSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-700 text-xs">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Assignment blueprint draft saved to local storage.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title & Course Selector Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement REST API"
                  required
                />

                <Select
                  label="Course *"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">Select Academic Course</option>
                  {courses.map((c, idx) => (
                    <option key={c.id || c._id || `course-${c.code || idx}`} value={c.id || c._id}>
                      {c.code} - {c.title || c.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Description & Rich Text Toolbar (Panel 07) */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#172033]">
                    Description & Specifications
                  </label>
                  {/* Rich Text Toolbar Mock */}
                  <div className="flex items-center gap-1 border border-[#D9D5CA] rounded-lg p-0.5 bg-[#FAF8F5]">
                    <button type="button" className="p-1 hover:bg-white rounded text-[#64748B] hover:text-[#172033]" title="Bold">
                      <Bold className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-white rounded text-[#64748B] hover:text-[#172033]" title="Italic">
                      <Italic className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-white rounded text-[#64748B] hover:text-[#172033]" title="Underline">
                      <Underline className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-white rounded text-[#64748B] hover:text-[#172033]" title="List">
                      <List className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-white rounded text-[#64748B] hover:text-[#172033]" title="Link">
                      <Link2 className="w-3 h-3" />
                    </button>
                    <button type="button" className="p-1 hover:bg-white rounded text-[#64748B] hover:text-[#172033]" title="Code">
                      <Code className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Build authentication using JWT, implement login, registration, and role-based access control..."
                  className="w-full rounded-xl bg-white border border-[#D9D5CA] text-xs sm:text-sm text-[#172033] p-3 outline-none focus:border-[#1557D6] focus:ring-2 focus:ring-[#1557D6]/20 transition-all font-mono"
                />
              </div>

              {/* Due Date & Submission Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Due Date *"
                  value={dateOnly}
                  onChange={(e) => setDateOnly(e.target.value)}
                  required
                />

                {/* Submission Type: Radio (Individual / Group) */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-[#172033]">Submission Type</label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSubmissionType('INDIVIDUAL')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        submissionType === 'INDIVIDUAL'
                          ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1557D6]'
                          : 'bg-[#FAF8F5] border-[#D9D5CA] text-[#64748B]'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Individual</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubmissionType('GROUP')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        submissionType === 'GROUP'
                          ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1557D6]'
                          : 'bg-[#FAF8F5] border-[#D9D5CA] text-[#64748B]'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Group</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* OneDrive Drop Folder Link */}
              <Input
                label="Official OneDrive Submission Folder URL *"
                value={onedriveLink}
                onChange={(e) => setOnedriveLink(e.target.value)}
                placeholder="https://university-my.sharepoint.com/:f:/r/personal/course-drop-folder"
                helperText="Must be a valid web URL starting with https://"
                required
              />

              {/* Group Allocation Options (If Group Submission) */}
              {submissionType === 'GROUP' && (
                <div className="space-y-2 pt-2 border-t border-[#D9D5CA]/70">
                  <label className="block text-xs font-bold text-[#172033]">
                    Target Student Cohorts
                  </label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#172033]">
                      <input
                        type="radio"
                        name="assignTo"
                        value="all"
                        checked={assignTo === 'all'}
                        onChange={() => setAssignTo('all')}
                        className="text-[#1557D6]"
                      />
                      <span>All Enrolled Groups</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-[#172033]">
                      <input
                        type="radio"
                        name="assignTo"
                        value="specific"
                        checked={assignTo === 'specific'}
                        onChange={() => setAssignTo('specific')}
                        className="text-[#1557D6]"
                      />
                      <span>Select Specific Groups</span>
                    </label>
                  </div>

                  {assignTo === 'specific' && (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9D5CA] max-h-40 overflow-y-auto space-y-2 mt-2">
                      {availableGroups.length === 0 ? (
                        <p className="text-xs text-[#64748B]">No groups created yet in this course.</p>
                      ) : (
                        availableGroups.map((grp) => (
                          <label
                            key={grp.id}
                            className="flex items-center gap-2 text-xs text-[#172033] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedGroupIds.includes(grp.id)}
                              onChange={() => handleToggleGroup(grp.id)}
                              className="rounded text-[#1557D6]"
                            />
                            <span>{grp.name} ({grp.member_count || 1} members)</span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-[#D9D5CA] flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={handleSaveDraft}
                >
                  Save as Draft
                </Button>

                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Publish Assignment
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* RIGHT 5 COLS: LIVE PREVIEW CARD (Panel 07 Reference) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
              Live Preview
            </span>
            <Badge variant="in-progress" size="xs">Auto-Updating</Badge>
          </div>

          {/* Student-facing card preview */}
          <Card className="bg-white p-6 space-y-4 shadow-paper">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#1557D6] uppercase bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  {selectedCourseObj?.code || 'CS-COURSE'}
                </span>
                <h3 className="text-base font-bold text-[#172033] font-editorial mt-1">
                  {title || 'Implement Authentication System'}
                </h3>
              </div>
              <Badge variant={submissionType === 'GROUP' ? 'academic' : 'neutral'} size="xs">
                {submissionType}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-[#64748B] font-mono pt-2 border-t border-[#D9D5CA]/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#1557D6]" />
                <span>Due: {dateOnly || 'Sep 25, 2026'} • 11:59 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#1557D6]" />
                <span>Marks: 100</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#1557D6]" />
                <span>Type: {submissionType === 'GROUP' ? 'Cohort Team' : 'Individual'}</span>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#D9D5CA] font-mono line-clamp-4">
              {description ||
                'Build authentication using JWT, implement login, registration, and role-based access control.'}
            </p>

            <div className="pt-2 border-t border-[#D9D5CA]/70 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Verified OneDrive Folder Target</span>
              <span className="text-[#1557D6] font-bold">Ready for Submission →</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
