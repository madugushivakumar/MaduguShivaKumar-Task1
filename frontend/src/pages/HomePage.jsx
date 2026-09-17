import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Server,
  Database,
  Box,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileCode,
} from 'lucide-react';
import HealthStatusCard from '../components/common/HealthStatusCard';
import PhaseBadge from '../components/common/PhaseBadge';

export const HomePage = () => {
  const foundationHighlights = [
    {
      title: 'React + Vite Frontend',
      description: 'Configured with Tailwind CSS, React Router v6, and Axios client with interceptors.',
      icon: Layers,
      status: 'Ready',
      accent: 'indigo',
    },
    {
      title: 'Layered Express Backend',
      description: 'Route → Controller → Service → Repository → Database architecture with centralized error handling.',
      icon: Server,
      status: 'Ready',
      accent: 'blue',
    },
    {
      title: 'PostgreSQL Architecture',
      description: 'Connection pooling with pg, standalone test runner, and migration version tracking.',
      icon: Database,
      status: 'Ready',
      accent: 'teal',
    },
    {
      title: 'Docker Orchestration',
      description: 'Multi-service docker-compose.yml linking PostgreSQL, backend API, and frontend web client.',
      icon: Box,
      status: 'Ready',
      accent: 'purple',
    },
  ];

  const phase2Roadmap = [
    'Student & Professor JWT Authentication & Role Authorization',
    'Student Group Creation, Invite Codes & Member Management',
    'Assignment Creation with Target Group Filtering',
    'OneDrive Submission Links & Two-Step Submission Confirmation',
    'Group-Wise & Student-Wise Progress Tracking',
    'Professor Analytics Dashboard & Submission Oversight',
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-12 shadow-xl border border-indigo-900/50">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <PhaseBadge phase="Phase 3 Complete" status="Auth & RBAC Active" />
            <span className="text-xs text-indigo-300 font-medium">
              Technical Task Assignment — Task 1
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            Student, Group & Assignment Management System
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            Welcome to the Joineazy Academic Platform. Featuring JWT-based authentication
            with secure bcrypt password encryption, Student and Admin role-based access control,
            a layered Node.js REST API, PostgreSQL database connectivity, and Docker container orchestration.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Portal Sign In</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
            >
              <span>Register Student</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Live Health Status Section */}
      <section id="health-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Live System Connectivity
            </h2>
            <p className="text-sm text-slate-500">
              Interactive end-to-end verification proving frontend-to-backend communication.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
            GET /api/health
          </span>
        </div>

        <HealthStatusCard />
      </section>

      {/* Foundation Architecture Highlights */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Phase 1 Architectural Pillars
          </h2>
          <p className="text-sm text-slate-500">
            Clean separation of concerns adhering to enterprise software patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {foundationHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">Foundation Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roadmap & Upcoming Phase 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phase 1 Verification Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Phase 1 Deliverables Checklist
            </h3>
          </div>
          <ul className="space-y-3">
            {[
              'React + Tailwind CSS frontend with React Router & Axios',
              'Node.js + Express backend with layered architecture',
              'Route → Controller → Service → Repository → DB separation',
              'GET /api/health endpoint returning expected JSON format',
              'PostgreSQL connection pool & standalone test script',
              'Centralized error handling & structured request logging',
              'Docker configuration (Frontend, Backend, PostgreSQL)',
              'Environment variable templates (.env.example)',
            ].map((check, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Phase 2 Planned Features */}
        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Upcoming Phase 2 Roadmap
              </h3>
            </div>
            <PhaseBadge phase="Phase 2" status="Planned" />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            The foundation is strictly isolated. In Phase 2, business logic will be plugged into the established controllers and repositories:
          </p>
          <ul className="space-y-2.5">
            {phase2Roadmap.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
