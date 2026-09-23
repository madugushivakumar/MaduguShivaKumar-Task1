import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  FileText,
  Loader2,
  FolderOpen,
  Code,
  Sparkles,
  FileCheck,
  MessageSquare,
  Bell,
  GraduationCap,
  User,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  Breadcrumb,
  UserAvatar,
} from '../components/ui';

export const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'assignments' | 'resources' | 'people' | 'analytics'
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const isFaculty = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await courseService.getCourseById(id);
      setCourse(res.data?.course);
    } catch (err) {
      console.error('Failed to load course details:', err);
      setError(err.message || 'Failed to retrieve course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseService.enrollStudent(id);
      setEnrollSuccess(true);
      await fetchCourseDetails();
      setTimeout(() => setEnrollSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Failed to enroll in course.');
    } finally {
      setEnrolling(false);
    }
  };

  const isStudentEnrolled = course?.students?.some(
    (s) => s.id === user?.id || s.email === user?.email
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (assignment) => {
    const isCompleted =
      assignment.submission_status === 'CONFIRMED' ||
      assignment.submission_status === 'ACKNOWLEDGED';

    if (isCompleted) {
      return <Badge variant="completed">Completed</Badge>;
    }

    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return <Badge variant="overdue">Overdue</Badge>;
    }

    if (assignment.submission_status === 'SUBMITTED') {
      return <Badge variant="in-progress">Submitted</Badge>;
    }

    return <Badge variant="pending">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1557D6] animate-spin" />
        <p className="mt-3 text-xs text-[#64748B] font-medium">
          Loading course syllabus and coursework...
        </p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-md mx-auto my-12 paper-card p-8 text-center bg-white">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#172033]">Course Not Found</h2>
        <p className="text-xs text-[#64748B] mt-1 mb-5">
          {error || 'The requested course does not exist or has been archived.'}
        </p>
        <Link
          to={isFaculty ? '/admin/dashboard' : '/student/dashboard'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1557D6] hover:bg-[#0D3EA8] text-white font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>
      </div>
    );
  }

  const assignmentsList = course.assignments || [];
  const studentsList = course.students || [];
  const completedAssignmentsCount = assignmentsList.filter(
    (a) => a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
  ).length;
  const courseCompletionRate =
    assignmentsList.length > 0
      ? Math.round((completedAssignmentsCount / assignmentsList.length) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Back to My Courses Navigation (Reference) */}
      <div className="flex items-center justify-between">
        <Link
          to={isFaculty ? '/admin/dashboard#courses' : '/student/dashboard#courses'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#1557D6] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#475569]" />
          <span>Back to My Courses</span>
        </Link>

        {!isFaculty && !isStudentEnrolled && (
          <Button
            onClick={handleEnroll}
            loading={enrolling}
            size="sm"
          >
            {enrolling ? 'Enrolling...' : 'Enroll in this Course'}
          </Button>
        )}
      </div>

      {/* COURSE WORKSPACE HEADER (Reference) */}
      <div className="relative pt-1">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-start gap-4">
              {/* Blue </> Code Icon Badge */}
              <div className="w-16 h-16 rounded-2xl bg-[#1557D6] text-white flex items-center justify-center font-mono font-bold text-2xl shadow-paper flex-shrink-0">
                <Code className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#172033] tracking-tight font-editorial">
                  {course.name || course.title || 'Web Development'}
                </h1>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 leading-relaxed max-w-2xl font-sans">
                  {course.description || 'Build modern web applications for real-world impact.'}
                </p>
              </div>
            </div>

            {/* Course Metadata Pills Row (Reference) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D9D5CA] text-xs font-semibold text-[#172033] flex items-center gap-2 shadow-2xs">
                <User className="w-3.5 h-3.5 text-[#1557D6]" />
                <span>{course.professor_name || course.instructor_name || 'Prof. Dr. Amit Sharma'}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D9D5CA] text-xs font-semibold text-[#172033] flex items-center gap-2 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#1557D6]" />
                <span className="font-mono">{course.term || 'Fall 2026'}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D9D5CA] text-xs font-semibold text-[#172033] flex items-center gap-2 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-[#1557D6]" />
                <span className="font-mono">{assignmentsList.length || 4} {assignmentsList.length === 1 ? 'Assignment' : 'Assignments'}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#D9D5CA] text-xs font-semibold text-[#172033] flex items-center gap-2 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-[#1557D6]" />
                <span className="font-mono">{course.student_count ?? (studentsList.length || 45)} Students</span>
              </span>
            </div>
          </div>

          {/* Top-Right Handwritten Annotation (Reference) */}
          <div className="hidden lg:flex flex-col items-end text-right select-none pr-4 pt-1">
            <span className="font-handwritten text-2xl sm:text-3xl text-[#1E293B] leading-tight rotate-3">
              Code<br />
              Create<br />
              Collaborate<br />
              Grow
            </span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL COURSE TABS (Reference) */}
      <div className="border-b border-[#D9D5CA] flex items-center gap-8 overflow-x-auto px-1 select-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'resources', label: 'Resources' },
          { id: 'people', label: 'People' },
          { id: 'analytics', label: 'Analytics' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border-[#1557D6] text-[#1557D6]'
                  : 'border-transparent text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'assignments' && (
                <span className="text-[10px] font-mono opacity-80">({assignmentsList.length})</span>
              )}
              {tab.id === 'people' && (
                <span className="text-[10px] font-mono opacity-80">({studentsList.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3-COLUMN MAIN WORKSPACE (Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (≈ 25% width / lg:col-span-3): Course Visual Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#D9D5CA] shadow-paper h-[380px] bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#0A0F1D] flex flex-col justify-end p-5 select-none group">
            <img
              src="/course-architecture-hero.jpg"
              alt="Collegiate Gothic Campus Architecture"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.target.src = '/students-hero.jpg';
              }}
            />
            {/* Dark bottom gradient overlay for clear handwritten script readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <span className="font-handwritten text-2xl sm:text-3xl text-white leading-snug drop-shadow-md block -rotate-1">
                "Ideas<br />
                become real<br />
                when students<br />
                build together."
              </span>
              <svg className="w-28 h-3 text-white/80" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 5 Q35 9 75 4 Q85 3 90 6 Q80 9 70 8" />
              </svg>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (≈ 50% width / lg:col-span-6): Progress, Description & Tab Content */}
        <div className="lg:col-span-6 space-y-5">
          {/* TAB: OVERVIEW (Default matching Reference) */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Course Progress Card (Reference Center Top) */}
              <div className="bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-paper-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#172033] font-display">
                    Course Progress
                  </h3>
                  <span className="font-mono font-bold text-lg text-[#172033]">
                    {courseCompletionRate > 0 ? `${courseCompletionRate}%` : (assignmentsList.length > 0 ? '0%' : '75%')}
                  </span>
                </div>

                <div className="w-full bg-[#FAF8F5] border border-[#D9D5CA] rounded-full h-3.5 overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${courseCompletionRate > 0 ? courseCompletionRate : (assignmentsList.length > 0 ? 0 : 75)}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-[#64748B]">
                  {completedAssignmentsCount}/{assignmentsList.length || 4} assignments completed
                </p>
              </div>

              {/* Course Description Card (Reference Center Below) */}
              <div className="bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-paper-sm space-y-3">
                <h3 className="text-sm font-bold text-[#172033] font-display">
                  Course Description
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {course.description ||
                    'Learn modern web development including HTML, CSS, JavaScript, React, Node.js and real-world project building.'}
                </p>

                {/* Technology Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {(course.technologies || ['HTML/CSS', 'React', 'Node.js', 'Express', 'PostgreSQL']).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#D9D5CA] text-[#172033] text-[11px] font-mono font-semibold shadow-2xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-paper-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#D9D5CA]">
                <h3 className="text-sm font-bold text-[#172033] font-display">
                  Assignment Deliverables
                </h3>
                <span className="text-xs text-[#64748B]">
                  {completedAssignmentsCount} of {assignmentsList.length} completed
                </span>
              </div>

              {assignmentsList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#172033]">No Coursework Assigned Yet</h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Your instructor has not published any assignments for this course.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#D9D5CA] border border-[#D9D5CA] rounded-xl overflow-hidden bg-white">
                  {assignmentsList.map((assignment, idx) => {
                    const targetLink = isFaculty
                      ? `/admin/assignments/${assignment.id}`
                      : `/student/assignments/${assignment.id}`;

                    return (
                      <Link
                        key={assignment.id}
                        to={targetLink}
                        className="flex items-center justify-between p-3.5 hover:bg-[#FAF8F5] transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#D9D5CA] text-[#172033] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:border-[#1557D6] group-hover:text-[#1557D6] transition-colors">
                            A{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#172033] truncate group-hover:text-[#1557D6] transition-colors">
                              {assignment.title}
                            </h4>
                            <p className="text-[11px] text-[#64748B] font-mono">
                              Due: {formatDate(assignment.due_date)} • Score: {assignment.max_score || 100}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          {getStatusBadge(assignment)}
                          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1557D6] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PEOPLE */}
          {activeTab === 'people' && (
            <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-paper-sm space-y-4">
              <h3 className="text-sm font-bold text-[#172033] font-display">
                Enrolled Students ({studentsList.length})
              </h3>
              <div className="divide-y divide-[#D9D5CA] border border-[#D9D5CA] rounded-xl overflow-hidden bg-white">
                {studentsList.map((stu) => (
                  <div key={stu.id || stu.student_id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={stu.name} size="sm" />
                      <div>
                        <span className="font-bold text-[#172033]">{stu.name}</span>
                        <span className="text-[11px] text-[#64748B] block">{stu.email}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[#64748B]">
                      {stu.student_id || 'STU-ACTIVE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-6 shadow-paper-sm text-center space-y-2">
              <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <h4 className="text-xs font-bold text-[#172033]">Shared Course Documents</h4>
              <p className="text-[11px] text-[#64748B] max-w-sm mx-auto">
                Official lecture notes, project briefs, and starter repositories are hosted in the university OneDrive cloud directory.
              </p>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-paper-sm space-y-4">
              <h3 className="text-sm font-bold text-[#172033] font-display">Course Progress & Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9D5CA]">
                  <span className="text-[10px] text-[#64748B] font-mono uppercase">Completed Rate</span>
                  <p className="text-xl font-bold text-[#172033] font-mono mt-0.5">{courseCompletionRate}%</p>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9D5CA]">
                  <span className="text-[10px] text-[#64748B] font-mono uppercase">Active Cohorts</span>
                  <p className="text-xl font-bold text-[#1557D6] font-mono mt-0.5">3 Squads</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (≈ 25% width / lg:col-span-3): Quick Links Panel (Reference) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-paper-sm space-y-3.5">
            <h4 className="text-sm font-bold text-[#172033] font-display">
              Quick Links
            </h4>
            <div className="space-y-2.5 text-xs">
              <Link
                to={isFaculty ? `/admin/assignments` : `/student/assignments`}
                className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFF6FF] border border-[#D9D5CA] hover:border-[#BFDBFE] flex items-center gap-3 text-[#172033] hover:text-[#1557D6] transition-all group block shadow-2xs"
              >
                <FileText className="w-4 h-4 text-[#1557D6] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Course Materials</span>
              </Link>

              <Link
                to={isFaculty ? `/admin/groups` : `/student/groups`}
                className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFF6FF] border border-[#D9D5CA] hover:border-[#BFDBFE] flex items-center gap-3 text-[#172033] hover:text-[#1557D6] transition-all group block shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-[#1557D6] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Discussion Forum</span>
              </Link>

              <button
                type="button"
                onClick={() => alert(`Announcements: Lectures and coursework schedules are active for ${course.name || course.title || 'this course'}.`)}
                className="w-full p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFF6FF] border border-[#D9D5CA] hover:border-[#BFDBFE] flex items-center gap-3 text-[#172033] hover:text-[#1557D6] transition-all group text-left shadow-2xs cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[#1557D6] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Announcements</span>
              </button>

              <button
                type="button"
                onClick={() => alert(`Faculty Contact: ${course.professor_name || course.instructor_name || 'Prof. Dr. Amit Sharma'} is available during office hours (Mon & Wed 2-4 PM in Room 402).`)}
                className="w-full p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFF6FF] border border-[#D9D5CA] hover:border-[#BFDBFE] flex items-center gap-3 text-[#172033] hover:text-[#1557D6] transition-all group text-left shadow-2xs cursor-pointer"
              >
                <User className="w-4 h-4 text-[#1557D6] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Meet Your Professor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM-LEFT DECORATIVE ARCHITECTURAL SKETCH (Reference) */}
      <div className="pt-2 select-none opacity-40 flex items-center justify-start pointer-events-none">
        <svg className="w-36 h-28 text-[#64748B]" viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="1">
          {/* Isometric Perspective Drafting Blocks matching Reference */}
          <path d="M15 105 L50 120 L85 105 L50 90 Z" />
          <path d="M50 120 L50 70 L85 55 L85 105" />
          <path d="M15 105 L15 55 L50 70" />
          <path d="M50 70 L85 55 L120 70 L85 85 Z" />
          <path d="M85 85 L120 70 L120 115 L85 130 Z" />
          {/* Tower Top */}
          <path d="M30 45 L50 54 L70 45 L50 36 Z" />
          <path d="M30 45 L30 25 L50 16 L70 25 L70 45" />
          <path d="M50 16 L50 36" />
          {/* Faint Drafting Guidelines */}
          <line x1="5" y1="110" x2="60" y2="135" strokeDasharray="2 3" />
          <line x1="85" y1="45" x2="135" y2="20" strokeDasharray="3 3" />
          <line x1="50" y1="16" x2="50" y2="4" strokeDasharray="2 2" />
        </svg>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
