import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import progressService from '../services/progressService';
import courseService from '../services/courseService';
import assignmentService from '../services/assignmentService';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  AlertCircle,
  Plus,
  Loader2,
  BookMarked,
  Check,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  ProgressBar,
  CircularProgress,
  Modal,
  Tabs,
} from '../components/ui';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [groupProgressList, setGroupProgressList] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState('today');

  // Browse & Enroll Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [coursesRes, groupsRes, assignmentsRes] = await Promise.all([
        courseService.getCourses().catch(() => ({ data: { courses: [] } })),
        groupService.getGroups().catch(() => ({ data: { groups: [] } })),
        assignmentService.getStudentAssignments().catch(() => ({ data: { assignments: [] } })),
      ]);

      const rawCourses = coursesRes.data?.courses || [];
      const uniqueCourses = Array.from(
        new Map(rawCourses.filter((c) => c && c.id).map((c) => [c.id, c])).values()
      );
      setCourses(uniqueCourses);

      const rawAssignments = assignmentsRes.data?.assignments || [];
      // Normalize and deduplicate by assignment ID ensuring stable unique coursework entities
      const uniqueAssignmentsMap = new Map();
      for (const a of rawAssignments) {
        if (!a || !a.id) continue;
        if (!uniqueAssignmentsMap.has(a.id)) {
          uniqueAssignmentsMap.set(a.id, a);
        } else {
          // If duplicate entry exists across groups, prioritize completed/acknowledged status
          const existing = uniqueAssignmentsMap.get(a.id);
          const isExistingComplete =
            existing.submission_status === 'CONFIRMED' || existing.submission_status === 'ACKNOWLEDGED';
          const isNewComplete =
            a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED';
          if (!isExistingComplete && isNewComplete) {
            uniqueAssignmentsMap.set(a.id, a);
          }
        }
      }
      const assignments = Array.from(uniqueAssignmentsMap.values());
      setStudentAssignments(assignments);

      const groups = groupsRes.data?.groups || [];
      const progressPromises = groups.map(async (g) => {
        try {
          const pRes = await progressService.getGroupProgress(g.id);
          return (
            pRes.data || {
              groupId: g.id,
              groupName: g.name,
              memberCount: g.memberCount || 1,
              totalAssignments: 0,
              completedAssignments: 0,
              pendingAssignments: 0,
              progressPercentage: 0,
            }
          );
        } catch {
          return {
            groupId: g.id,
            groupName: g.name,
            memberCount: g.memberCount || 1,
            totalAssignments: 0,
            completedAssignments: 0,
            pendingAssignments: 0,
            progressPercentage: 0,
          };
        }
      });

      const progressData = await Promise.all(progressPromises);
      setGroupProgressList(progressData);
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenEnrollModal = async () => {
    setIsEnrollModalOpen(true);
    try {
      const res = await courseService.getAllCourses();
      const rawCat = res.data?.courses || [];
      const uniqueCat = Array.from(
        new Map(rawCat.filter((c) => c && c.id).map((c) => [c.id, c])).values()
      );
      setAllCourses(uniqueCat);
    } catch (err) {
      console.error('Failed to load course catalogue:', err);
    }
  };

  const handleEnrollInCourse = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      await courseService.enrollStudent(courseId);
      await fetchDashboardData();
      const updatedCatalogue = await courseService.getAllCourses();
      const rawCat = updatedCatalogue.data?.courses || [];
      const uniqueCat = Array.from(
        new Map(rawCat.filter((c) => c && c.id).map((c) => [c.id, c])).values()
      );
      setAllCourses(uniqueCat);
    } catch (err) {
      alert(err.message || 'Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Real Calculations for Stats & Donut Chart
  const totalAssignments = studentAssignments.length;
  const completedCount = studentAssignments.filter(
    (a) => a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
  ).length;
  const pendingCount = studentAssignments.filter(
    (a) => a.submission_status !== 'CONFIRMED' && a.submission_status !== 'ACKNOWLEDGED'
  ).length;
  const overdueCount = studentAssignments.filter((a) => {
    if (a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED') return false;
    if (!a.due_date) return false;
    return new Date(a.due_date) < new Date();
  }).length;

  const progressPercentage =
    totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;
  const displayPercentage = progressPercentage;

  // Fallback course acronym generator
  const getCourseAcronym = (code, title) => {
    if (code) return code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
    if (!title) return 'CS';
    return title
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Dynamically partition student assignments into schedule windows
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;

  const todayTasks = studentAssignments
    .filter((a) => {
      if (!a.due_date) return true;
      const diff = new Date(a.due_date) - now;
      return diff <= oneDayMs;
    })
    .map((a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.course_name || a.course_title || 'Coursework',
      time: a.due_date
        ? new Date(a.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Today',
      badgeStatus:
        a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
          ? 'completed'
          : a.due_date && new Date(a.due_date) < now
          ? 'overdue'
          : 'pending',
      badgeText:
        a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
          ? 'Completed'
          : a.due_date && new Date(a.due_date) < now
          ? 'Overdue'
          : 'Pending',
    }));

  const nextTasks = studentAssignments
    .filter((a) => {
      if (!a.due_date) return false;
      const diff = new Date(a.due_date) - now;
      return diff > oneDayMs && diff <= sevenDaysMs;
    })
    .map((a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.course_name || a.course_title || 'Coursework',
      time: new Date(a.due_date).toLocaleDateString([], {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      badgeStatus:
        a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
          ? 'completed'
          : 'pending',
      badgeText:
        a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
          ? 'Completed'
          : 'Upcoming',
    }));

  const laterTasks = studentAssignments
    .filter((a) => {
      if (!a.due_date) return false;
      const diff = new Date(a.due_date) - now;
      return diff > sevenDaysMs;
    })
    .map((a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.course_name || a.course_title || 'Coursework',
      time: new Date(a.due_date).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }),
      badgeStatus:
        a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
          ? 'completed'
          : 'upcoming',
      badgeText:
        a.submission_status === 'CONFIRMED' || a.submission_status === 'ACKNOWLEDGED'
          ? 'Completed'
          : 'Scheduled',
    }));

  const activeTaskList =
    taskFilter === 'today' ? todayTasks : taskFilter === 'next' ? nextTasks : laterTasks;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Week Calendar Strip (Panel 02 Reference) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-[#D9D5CA]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#172033] tracking-tight font-display">
            Good morning, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-editorial italic text-base">
            Stay consistent. Small steps make big progress.
          </p>
        </div>

        {/* Right Calendar Strip: September 2026 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D5CA] p-2 shadow-paper-sm flex items-center gap-1.5">
            <div className="px-2.5 text-xs font-bold text-[#64748B] font-mono uppercase">
              Sep 2026
            </div>
            <div className="flex items-center gap-1">
              {[
                { day: 'Mon', date: '21' },
                { day: 'Tue', date: '22' },
                { day: 'Wed', date: '23', active: true },
                { day: 'Thu', date: '24' },
                { day: 'Fri', date: '25' },
                { day: 'Sat', date: '26' },
                { day: 'Sun', date: '27' },
              ].map((d) => (
                <div
                  key={d.date}
                  className={`flex flex-col items-center justify-center w-8 py-1.5 rounded-xl text-[10px] font-mono transition-all ${
                    d.active
                      ? 'bg-[#1557D6] text-white font-bold shadow-paper-sm'
                      : 'text-[#64748B] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="text-[9px] opacity-80 uppercase">{d.day}</span>
                  <span className="text-xs font-bold">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          <span className="font-handwritten text-lg text-[#1557D6] self-start sm:self-center -rotate-1 hidden xl:block">
            Same Students. Bigger Opportunities.
          </span>
        </div>
      </div>

      {/* PANEL 02: 2-COLUMN LAYOUT (Tasks vs My Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (lg:col-span-8): Tasks */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-5 bg-[#FFFFFF]">
            {/* Header & Filter Tabs (Today / Next / Later) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9D5CA]/70 pb-4">
              <div className="flex items-center gap-2">
                <Tabs
                  tabs={[
                    { id: 'today', label: `Today (${todayTasks.length})` },
                    { id: 'next', label: `Next (${nextTasks.length})` },
                    { id: 'later', label: `Later (${laterTasks.length})` },
                  ]}
                  activeTab={taskFilter}
                  onChange={setTaskFilter}
                />
              </div>

              <Link
                to="/student/assignments"
                className="text-xs font-bold text-[#1557D6] hover:text-[#0D3EA8] inline-flex items-center gap-1"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Task Cards Stack */}
            <div className="space-y-3">
              {activeTaskList.length === 0 ? (
                <div className="py-10 text-center space-y-2.5 bg-[#FAF8F5] rounded-2xl border border-[#D9D5CA]">
                  <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#172033] font-display">
                    All Caught Up!
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                    No coursework assignments due in this schedule window.
                  </p>
                </div>
              ) : (
                activeTaskList.map((item) => (
                  <Link
                    to={item.id ? `/student/assignments/${item.id}` : '/student/assignments'}
                    key={item.id}
                    className="p-4 rounded-xl border border-[#D9D5CA] bg-[#FFFDF7] hover:border-[#1557D6] hover:shadow-paper-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group block"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          item.badgeStatus === 'completed'
                            ? 'bg-emerald-500 ring-4 ring-emerald-50'
                            : item.badgeStatus === 'overdue'
                            ? 'bg-rose-500 ring-4 ring-rose-50'
                            : 'bg-[#1557D6] ring-4 ring-[#EFF6FF]'
                        }`}
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#172033] group-hover:text-[#1557D6] transition-colors truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[#64748B] mt-0.5 truncate">
                          {item.subtitle} • <span className="font-mono text-[11px]">{item.time}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge variant={item.badgeStatus}>
                        {item.badgeText}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1557D6] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#D9D5CA]/70 flex items-center justify-between text-xs text-[#64748B]">
              <span>Synchronized with enrolled course schedules</span>
              <Link to="/student/assignments" className="font-bold text-[#1557D6] hover:underline">
                View Complete Coursework Dossier →
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column (lg:col-span-4): Sticky Quote & My Progress Donut */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sticky Note Quote (Panel 02) */}
          <div className="sticky-note p-4 sm:p-5 rounded-2xl relative shadow-sticky">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                Daily Focus
              </span>
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <p className="font-handwritten text-2xl text-[#451A03] leading-snug">
              "Discipline today, success tomorrow."
            </p>
            <p className="text-[11px] text-amber-900/70 mt-2 font-editorial italic text-right">
              — Academic Senate
            </p>
          </div>

          {/* "My Progress" Donut Chart Card (Panel 02) */}
          <Card className="space-y-5 bg-[#FFFFFF]">
            <div className="flex items-center justify-between border-b border-[#D9D5CA]/70 pb-3">
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider font-mono">
                My Progress
              </h3>
              <Badge variant="in-progress">
                {displayPercentage}% This Week
              </Badge>
            </div>

            {/* Donut Chart & Center Metric */}
            <div className="flex flex-col items-center justify-center py-2">
              <CircularProgress
                percentage={displayPercentage}
                size={120}
                strokeWidth={10}
                title="This Week"
                color="#1557D6"
                trackColor="#E5E0D8"
              />
            </div>

            {/* Progress Breakdown List */}
            <div className="space-y-2.5 pt-2 border-t border-[#D9D5CA]/70 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[#475569]">Completed</span>
                </div>
                <span className="font-bold text-[#172033] font-mono">
                  {completedCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[#475569]">Pending</span>
                </div>
                <span className="font-bold text-[#172033] font-mono">
                  {pendingCount}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[#475569]">Overdue</span>
                </div>
                <span className="font-bold text-[#172033] font-mono">
                  {overdueCount}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#D9D5CA]/50 font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1557D6]" />
                  <span className="text-[#172033]">Total</span>
                </div>
                <span className="text-[#172033] font-mono">{totalAssignments}</span>
              </div>
            </div>
          </Card>

          {/* Group Orbit Room Quick Link Card */}
          <Card className="bg-[#FFFFFF] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase tracking-wider">
                Group Pulse — {groupProgressList[0]?.groupName || 'Team Alpha'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#172033]">Team Workspace</h4>
                <p className="text-[11px] text-[#64748B]">
                  {groupProgressList[0]?.memberCount || 4} collaborators active
                </p>
              </div>
              <Link to="/student/groups">
                <Button size="sm" variant="secondary">
                  Open Orbit →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ENROLLED COURSES SECTION (Panel 02 Bottom Grid) */}
      <div className="space-y-4" id="courses">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#172033] tracking-tight font-display">
              Enrolled Courses
            </h2>
            <p className="text-xs text-[#64748B]">Curriculum syllabi and milestone tracking</p>
          </div>
          <Button
            onClick={handleOpenEnrollModal}
            variant="outline"
            size="sm"
            icon={Plus}
          >
            Browse Catalogue
          </Button>
        </div>

        {loading ? (
          <div className="py-12 bg-white rounded-2xl border border-[#D9D5CA] text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1557D6]" />
            <p className="text-xs font-semibold text-[#64748B]">Loading your course curriculum...</p>
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center space-y-3 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mx-auto">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#172033]">No Enrolled Courses Found</h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              You are not currently enrolled in any academic courses. Browse the course catalogue to start.
            </p>
            <Button onClick={handleOpenEnrollModal} icon={Plus} size="sm">
              Browse Course Catalogue
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {courses.map((course) => {
              const acronym = getCourseAcronym(course.code, course.title);
              const totalAssn = parseInt(course.assignment_count, 10) || 0;
              const completedAssn = parseInt(course.completed_assignments_count, 10) || 0;
              const pendingAssn = Math.max(0, totalAssn - completedAssn);
              const percentage = totalAssn > 0 ? Math.round((completedAssn / totalAssn) * 100) : 0;

              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="paper-card p-5 bg-white hover:border-[#1557D6] hover:shadow-paper transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3.5">
                    {/* Course Badge / Header */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1557D6] font-black text-xs flex items-center justify-center shadow-paper-sm">
                        {acronym}
                      </div>
                      <span className="text-[11px] font-bold text-[#64748B] font-mono uppercase">
                        {course.code || 'COURSE'}
                      </span>
                    </div>

                    {/* Course Title */}
                    <div>
                      <h3 className="text-sm font-bold text-[#172033] line-clamp-1 group-hover:text-[#1557D6] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {totalAssn} {totalAssn === 1 ? 'Assignment' : 'Assignments'}
                      </p>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <ProgressBar
                      value={percentage}
                      label="Progress"
                      size="sm"
                      color="blue"
                    />
                  </div>

                  {/* Summary Footer */}
                  <div className="mt-4 pt-3 border-t border-[#D9D5CA]/70 flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>
                      {completedAssn} completed · {pendingAssn} pending
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#1557D6] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Catalogue Modal (Explore / Enroll) */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="University Course Catalogue"
        subtitle="Enroll in academic courses to access coursework and cohort workspaces"
        maxWidth="max-w-xl"
      >
        <div className="space-y-3 pr-1">
          {allCourses.map((catCourse) => {
            const alreadyEnrolled = courses.some((c) => c.id === catCourse.id);
            const isBusy = enrollingCourseId === catCourse.id;

            return (
              <div
                key={catCourse.id}
                className="p-4 rounded-xl border border-[#D9D5CA] bg-[#FAF8F5] flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1557D6] bg-[#EFF6FF] px-2 py-0.5 rounded-lg border border-[#BFDBFE]">
                      {catCourse.code}
                    </span>
                    <span className="text-xs font-bold text-[#172033]">{catCourse.title}</span>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-1">
                    {catCourse.description || 'Comprehensive curriculum.'}
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Instructor: {catCourse.instructor_name || 'Academic Faculty'}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {alreadyEnrolled ? (
                    <Badge variant="completed">Enrolled</Badge>
                  ) : (
                    <Button
                      onClick={() => handleEnrollInCourse(catCourse.id)}
                      loading={isBusy}
                      size="sm"
                      icon={Plus}
                    >
                      Enroll
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
