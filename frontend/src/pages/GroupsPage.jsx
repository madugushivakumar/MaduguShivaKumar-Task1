import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  PageHeader,
} from '../components/ui';

export const GroupsPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <PageHeader
        backTo="/"
        backLabel="Back to Overview"
        title="Student Cohort Management"
        subtitle="Form academic project teams, invite fellow students via institutional email or student ID, and organize member rosters for coordinated coursework."
        badge={<Badge variant="in-progress">Student Groups Active</Badge>}
      />

      <Card className="bg-white p-8 sm:p-10 text-center shadow-paper space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#1557D6] border border-[#BFDBFE] flex items-center justify-center mx-auto shadow-paper-sm">
          <Users className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-[#172033] font-editorial">
            Cohort Collaboration Protocol
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Form academic project teams, invite fellow scholars via institutional credentials, and coordinate assignments through synchronized orbit rooms.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          {isAuthenticated && user?.role === 'STUDENT' ? (
            <Link to="/student/groups">
              <Button icon={ArrowRight} iconPosition="right" size="lg">
                Go to My Groups
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button icon={LogIn} size="lg">
                Sign In to Manage Groups
              </Button>
            </Link>
          )}
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left border-t border-[#D9D5CA]/70">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mb-3">
              <UserPlus className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#172033]">Atomic Group Creation</h4>
            <p className="text-[11px] text-[#64748B] mt-1">
              Group creator is atomically enrolled as the team leader and protected anchor member.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#172033]">Flexible Member Search</h4>
            <p className="text-[11px] text-[#64748B] mt-1">
              Invite student peers using either their institutional email address or student ID.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D9D5CA]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[#172033]">Strict RBAC Boundaries</h4>
            <p className="text-[11px] text-[#64748B] mt-1">
              Guaranteed isolation — only group members can inspect rosters or modify group composition.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupsPage;
