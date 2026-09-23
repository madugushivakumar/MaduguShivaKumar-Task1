import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  ExternalLink,
  Users,
  Calendar,
  ArrowRight,
  LogIn,
  Check,
  FileCheck,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  PageHeader,
} from '../components/ui';

export const AssignmentsPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        backTo="/"
        backLabel="Back to Overview"
        title="Coursework & Assignment Management"
        subtitle="Faculty author coursework with deadlines and external OneDrive folders. Students complete assignments and confirm submissions with leader acknowledgment."
        badge={<Badge variant="in-progress">Submissions Active</Badge>}
      />

      <Card className="bg-white p-8 sm:p-10 text-center shadow-paper space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#1557D6] border border-[#BFDBFE] flex items-center justify-center mx-auto shadow-paper-sm">
          <BookOpen className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-[#172033] font-editorial">
            Academic Delivery Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Faculty author coursework with strict ISO deadlines and external OneDrive directories, allocating milestones to entire cohorts or targeted squads.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'PROFESSOR') ? (
            <Link to="/admin/assignments">
              <Button icon={ArrowRight} iconPosition="right" size="lg">
                Manage Course Assignments
              </Button>
            </Link>
          ) : isAuthenticated && user?.role === 'STUDENT' ? (
            <Link to="/student/assignments">
              <Button icon={ArrowRight} iconPosition="right" size="lg">
                View Enrolled Coursework & Submissions
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button icon={LogIn} size="lg">
                Sign In to Access Assignments
              </Button>
            </Link>
          )}
        </div>

        {/* Coursework Features Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-left border-t border-[#D9D5CA]/70">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#172033]">Faculty Authoring</h4>
            <p className="text-[11px] text-[#64748B] mt-1">
              Specify coursework titles, detailed instructions, and ISO deadlines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mb-3">
              <ExternalLink className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#172033]">OneDrive Sync</h4>
            <p className="text-[11px] text-[#64748B] mt-1">
              Direct access to university OneDrive submission directories without OAuth friction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#172033]">Targeted Cohorts</h4>
            <p className="text-[11px] text-[#64748B] mt-1">
              Assign to all cohorts or target specific project teams via junction mappings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA]">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Check className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#172033]">Leader Verification</h4>
            <p className="text-[11px] text-[#64748B] mt-1">
              Two-step confirmation records team-wide completion with strict accountability.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AssignmentsPage;
