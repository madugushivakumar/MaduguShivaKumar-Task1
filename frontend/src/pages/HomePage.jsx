import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Play,
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  Calendar,
  Sparkles,
  ExternalLink,
  Clock,
  Lock,
  Database,
  Layers,
  TrendingUp,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import HealthStatusCard from '../components/common/HealthStatusCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export const HomePage = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    const sections = ['hero', 'students', 'professors', 'features', 'demo-personas'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        const el = document.getElementById(id);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero', id: 'hero' },
    { name: 'For Students', href: '#students', id: 'students' },
    { name: 'For Professors', href: '#professors', id: 'professors' },
    { name: 'Features', href: '#features', id: 'features' },
    { name: 'Demo Personas', href: '#demo-personas', id: 'demo-personas' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#172033] flex flex-col selection:bg-[#1557D6] selection:text-white">
      {/* Top Warm Ivory Editorial Ribbon */}
      <div className="bg-[#F7F5EE] text-[#64748B] text-[11px] px-4 sm:px-8 py-1.5 flex items-center justify-between border-b border-[#D9D5CA] select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#172033] tracking-tight font-display">Joineazy</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="tracking-wider uppercase text-[#1557D6] font-bold text-[10px]">
            Academic System
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px]">
          <span className="font-editorial italic text-sm text-[#172033]">Students. Ideas. Together.</span>
          <span className="text-[#CBD5E1]">•</span>
          <span className="font-handwritten text-base text-[#1557D6]">
            A Brighter Academic Tomorrow
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#1557D6]" />
          <span className="font-mono">{todayFormatted}</span>
        </div>
      </div>

      {/* Landing Page Navbar */}
      <header className="h-16 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D9D5CA] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-3">
          <a href="#hero" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1557D6] flex items-center justify-center text-white shadow-paper-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#172033] font-display">
              Joineazy
            </span>
          </a>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#64748B]">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`transition-colors py-1 ${
                activeSection === link.id
                  ? 'text-[#1557D6] font-extrabold border-b-2 border-[#1557D6]'
                  : 'hover:text-[#172033]'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-block px-4 py-2 rounded-xl text-xs font-bold text-[#475569] hover:text-[#172033] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            Sign In
          </Link>
          <Link to="/register" className="hidden sm:inline-block">
            <Button size="sm" icon={ArrowRight} iconPosition="right">
              Get Started
            </Button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-[#D9D5CA] text-[#475569] hover:text-[#172033] hover:bg-[#FAF8F5] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#D9D5CA] px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 sticky top-16 z-30 shadow-md">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSection === link.id
                  ? 'bg-blue-50 text-[#1557D6] font-extrabold'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-white'
              }`}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-[#E5E0D8] flex items-center gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 rounded-xl text-xs font-bold border border-[#D9D5CA] bg-white text-[#172033]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 rounded-xl text-xs font-bold bg-[#1557D6] text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Main Hero Section — Visual Panel 01 Reference (Preserved 100%) */}
      <section id="hero" className="scroll-mt-20 px-4 sm:px-8 pt-10 pb-12 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Editorial Typography & Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1557D6] text-xs font-bold font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#1557D6] animate-pulse" />
              <span>Academic Cohort Platform · v2.0</span>
            </div>

            {/* Editorial Serif Heading matching Panel 01 */}
            <div className="space-y-1">
              <h1 className="font-editorial text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#172033] leading-[1.06]">
                Students.
                <br />
                Ideas.
                <br />
                <span className="text-[#1557D6]">Together.</span>
              </h1>
            </div>

            {/* Handwritten script callout */}
            <div className="flex items-center gap-3">
              <span className="font-handwritten text-2xl text-[#1557D6] -rotate-1 inline-block">
                Different Students, Brighter Futures.
              </span>
            </div>

            <p className="text-base text-[#475569] font-normal leading-relaxed max-w-lg">
              Collaborate, complete, and achieve — a smarter way to manage assignments,
              groups, and academic progress with verified OneDrive link deliverables and strict leader acknowledgment.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/register">
                <Button size="lg" icon={ArrowRight} iconPosition="right">
                  Get Started
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="secondary" size="lg" icon={Play}>
                  Watch Demo / Sign In
                </Button>
              </Link>
            </div>

            {/* Stats Row matching Panel 01 Reference */}
            <div className="pt-6 border-t border-[#D9D5CA] grid grid-cols-4 gap-4 text-center sm:text-left">
              <div>
                <span className="block font-black text-xl sm:text-2xl text-[#172033] font-display">10K+</span>
                <span className="text-xs text-[#64748B] font-medium">Students</span>
              </div>
              <div>
                <span className="block font-black text-xl sm:text-2xl text-[#172033] font-display">500+</span>
                <span className="text-xs text-[#64748B] font-medium">Professors</span>
              </div>
              <div>
                <span className="block font-black text-xl sm:text-2xl text-[#172033] font-display">50K+</span>
                <span className="text-xs text-[#64748B] font-medium">Assignments</span>
              </div>
              <div>
                <span className="block font-black text-xl sm:text-2xl text-[#172033] font-display">99%</span>
                <span className="text-xs text-[#64748B] font-medium">Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Right Column: Academic Board with Photo, Rubber Stamp & Sticky Note */}
          <div className="lg:col-span-6 relative">
            <div className="paper-card-elevated p-4 sm:p-5 relative bg-[#FFFFFF]">
              {/* Photo Frame */}
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 border border-[#D9D5CA]">
                <img
                  src="/students-hero.jpg"
                  alt="University Students Collaborating"
                  className="w-full h-full object-cover object-center"
                />

                {/* Soft gradient overlay at base */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Photo Caption */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="font-editorial italic text-sm">Library Collab Room B-104</span>
                  <span className="bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase">
                    Active Session
                  </span>
                </div>
              </div>

              {/* Hanging Tag Ribbon (Panel 01) */}
              <div className="absolute -right-3 top-10 hidden sm:flex flex-col gap-1 p-2 bg-[#FAF8F5] border border-[#D9D5CA] rounded-xl shadow-paper-sm text-[9px] font-mono font-bold text-[#172033] uppercase">
                <span className="text-[#1557D6]">• LEARN</span>
                <span>• COLLABORATE</span>
                <span>• BUILD</span>
                <span>• SUBMIT</span>
                <span className="text-emerald-700">• SUCCEED</span>
              </div>

              {/* Rubber Stamp Overlay (Top-Right) */}
              <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 pointer-events-none transform rotate-12 z-20">
                <div className="rubber-stamp px-3 py-1.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-white/95 backdrop-blur-xs shadow-paper-sm">
                  ★ ACADEMIC HUB ★
                  <br />
                  <span className="text-[9px] tracking-normal font-sans">CAMPUS VERIFIED</span>
                </div>
              </div>

              {/* Post-it Sticky Note (Bottom-Right Overlap) */}
              <div className="absolute -bottom-6 -left-3 sm:-bottom-8 sm:-left-6 z-20 transform -rotate-3 hover:rotate-0 transition-transform">
                <div className="sticky-note p-3 sm:p-4 w-52 sm:w-60 text-xs text-[#713F12]">
                  <div className="flex items-center justify-between mb-1.5 border-b border-amber-300/40 pb-1">
                    <span className="text-[9px] font-mono tracking-wider uppercase text-amber-700 font-bold">
                      Campus Senate
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg leading-tight text-[#451A03]">
                    "Education today, opportunities tomorrow."
                  </p>
                  <p className="text-[10px] text-amber-800/80 mt-2 font-mono">
                    — University Senate 2026
                  </p>
                </div>
              </div>

              {/* Floating Protocol Card (Bottom-Right) */}
              <div className="absolute -bottom-4 right-4 z-10 hidden sm:block bg-white/95 backdrop-blur-md rounded-2xl border border-[#D9D5CA] p-3 shadow-paper">
                <div className="flex items-center gap-2 text-xs font-bold text-[#172033] mb-1">
                  <FileCheck className="w-3.5 h-3.5 text-[#1557D6]" />
                  <span>Team Submission Checklist</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#475569]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Group formation verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>OneDrive repo linked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1557D6]" />
                    <span>Leader acknowledgment lock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Ticker matching Panel 01 reference */}
        <div className="mt-12 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#D9D5CA] shadow-paper-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172033] font-mono uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Campus Stream</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#475569]">
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D9D5CA] flex items-center gap-1.5">
              <span>Rahul joined Team Beta</span>
              <span className="text-[10px] text-[#94A3B8]">2 mins ago</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1557D6] border border-[#BFDBFE] flex items-center gap-1.5 font-medium">
              <span>Assignment posted: Web Development</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-medium">
              <span>Team Alpha submitted</span>
              <span className="text-[10px] text-emerald-600">3 mins ago</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-[#172033] text-white text-[11px] font-bold">
              12+ groups active today
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1 — FOR STUDENTS                                                  */}
      {/* ========================================================================= */}
      <section id="students" className="scroll-mt-20 px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t border-[#D9D5CA]/80">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1557D6] text-xs font-bold font-mono uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>For Students · Academic Workflow</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#172033] leading-tight">
            Everything Students Need to Stay on Track.
          </h2>
          <p className="text-sm sm:text-base text-[#475569] mt-3 leading-relaxed">
            From discovering enrolled courses to submitting individual research papers and synchronizing collaborative squad milestones with leader-verified governance.
          </p>
        </div>

        {/* 5-Step Visual Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  STEP 01
                </span>
                <BookOpen className="w-5 h-5 text-[#1557D6]" />
              </div>
              <h3 className="text-xl font-bold font-editorial text-[#172033] mb-2">
                Enrolled Course Catalog
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Discover university courses, browse instructor syllabi, view enrolled peers, and access centralized coursework registries directly from your student portal.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#64748B] flex items-center justify-between">
              <span>Catalog Integration</span>
              <span className="text-emerald-700 font-bold">Verified</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  STEP 02
                </span>
                <FileCheck className="w-5 h-5 text-[#1557D6]" />
              </div>
              <h3 className="text-xl font-bold font-editorial text-[#172033] mb-2">
                Coursework Dossiers & Briefs
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Inspect rich coursework dossiers with strict ISO due dates, deliverable specifications, assigned faculty details, and direct external OneDrive repository directories.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#64748B] flex items-center justify-between">
              <span>OneDrive Integration</span>
              <span className="text-emerald-700 font-bold">Active</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  STEP 03
                </span>
                <ExternalLink className="w-5 h-5 text-[#1557D6]" />
              </div>
              <h3 className="text-xl font-bold font-editorial text-[#172033] mb-2">
                Deliverable Submissions
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Submit web repository links (GitHub, Google Drive, OneDrive) for both individual assignments and squad projects with automatic server timestamps.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#64748B] flex items-center justify-between">
              <span>Timestamp Ledger</span>
              <span className="text-emerald-700 font-bold">Immutable</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#1557D6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  STEP 04
                </span>
                <CheckCircle2 className="w-5 h-5 text-[#1557D6]" />
              </div>
              <h3 className="text-xl font-bold font-editorial text-[#172033] mb-2">
                Real-Time Progress Tracking
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Stay ahead of deadlines with intelligent scheduling (Due Today, Next Up, Later), live completion percentage bars, and visual status badges.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#64748B] flex items-center justify-between">
              <span>Dynamic Progress</span>
              <span className="text-emerald-700 font-bold">Live %</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="paper-card bg-[#FFFDF7] rounded-2xl border border-[#D9D5CA] p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  STEP 05 · GOVERNANCE PROTOCOL
                </span>
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold font-editorial text-[#172033] mb-2">
                Leader-Only Acknowledgment Protocol
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed max-w-2xl">
                Collaborative team submissions are protected by backend role enforcement: non-leader teammates view synchronized progress, but <strong>only the designated squad leader</strong> is authorized to execute the final acknowledgment. Once confirmed, the status immediately propagates across the entire squad.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[11px] font-mono text-[#64748B] flex items-center justify-between">
              <span>HTTP 403 Non-Leader Enforced</span>
              <span className="text-amber-700 font-bold">Synchronized Squad-Wide</span>
            </div>
          </div>
        </div>

        {/* Student Section Call-to-Action Strip */}
        <div className="mt-8 p-6 rounded-2xl bg-[#FFFFFF] border border-[#D9D5CA] shadow-paper-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#172033] text-sm">Ready to elevate your academic coursework?</h4>
            <p className="text-xs text-[#64748B] mt-0.5">Register as a student or sign in with your campus credentials.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/register">
              <Button size="sm" icon={ArrowRight} iconPosition="right">Get Started as Student</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — FOR PROFESSORS                                                */}
      {/* ========================================================================= */}
      <section id="professors" className="scroll-mt-20 px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t border-[#D9D5CA]/80">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5FF] border border-[#E9D5FF] text-[#7C3AED] text-xs font-bold font-mono uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>For Professors · Curriculum Authority</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#172033] leading-tight">
            Curriculum Authority & Cohort Oversight.
          </h2>
          <p className="text-sm sm:text-base text-[#475569] mt-3 leading-relaxed">
            Author coursework, establish external OneDrive repositories, allocate milestones across student squads, and supervise deliverable telemetry with complete CRUD authority.
          </p>
        </div>

        {/* 5-Stage Faculty Workflow Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Stage 1: CREATE */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-mono font-bold text-xs">
                  1
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">STAGE</span>
              </div>
              <h3 className="text-lg font-bold font-editorial text-[#172033] mb-1.5">CREATE</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Author coursework briefs with deadlines, submission type (Individual or Group), course association, and OneDrive repository folders.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[10px] font-mono text-[#7C3AED] font-bold">
              POST /api/assignments
            </div>
          </div>

          {/* Stage 2: ASSIGN */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-[#1557D6] flex items-center justify-center font-mono font-bold text-xs">
                  2
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">STAGE</span>
              </div>
              <h3 className="text-lg font-bold font-editorial text-[#172033] mb-1.5">ASSIGN</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Allocate milestones to targeted student squads or bulk-distribute coursework across all registered cohorts in a single action.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[10px] font-mono text-[#1557D6] font-bold">
              Bulk & Squad Targeting
            </div>
          </div>

          {/* Stage 3: MONITOR */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs">
                  3
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">STAGE</span>
              </div>
              <h3 className="text-lg font-bold font-editorial text-[#172033] mb-1.5">MONITOR</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Supervise deliverable feeds with comprehensive status filtering (ALL, ACKNOWLEDGED, CONFIRMED, SUBMITTED, PENDING).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[10px] font-mono text-emerald-700 font-bold">
              Status Filtering Matrix
            </div>
          </div>

          {/* Stage 4: TRACK */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-mono font-bold text-xs">
                  4
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">STAGE</span>
              </div>
              <h3 className="text-lg font-bold font-editorial text-[#172033] mb-1.5">TRACK</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Inspect institutional metrics: live student enrollment counts, completion percentages, and automated alerts for low-progress squads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[10px] font-mono text-amber-800 font-bold">
              Real-Time Analytics
            </div>
          </div>

          {/* Stage 5: MANAGE */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-mono font-bold text-xs">
                  5
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">STAGE</span>
              </div>
              <h3 className="text-lg font-bold font-editorial text-[#172033] mb-1.5">MANAGE</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Complete Assignment CRUD authority: view dossiers, revise parameters, and safely delete with PostgreSQL cascade cleanup.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E0D8] text-[10px] font-mono text-rose-700 font-bold">
              Full CRUD + RBAC
            </div>
          </div>
        </div>

        {/* Professor Section Call-to-Action Strip */}
        <div className="mt-8 p-6 rounded-2xl bg-[#FFFFFF] border border-[#D9D5CA] shadow-paper-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#172033] text-sm">Empower your department with verified coursework tracking</h4>
            <p className="text-xs text-[#64748B] mt-0.5">Faculty registration is open with campus credentials.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button size="sm" icon={ArrowRight} iconPosition="right">Faculty Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="sm">Register Faculty</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 — FEATURES                                                      */}
      {/* ========================================================================= */}
      <section id="features" className="scroll-mt-20 px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t border-[#D9D5CA]/80">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-bold font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Core Architecture · Built for Academics</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#172033] leading-tight">
            Enterprise Capabilities Engineered for Higher Education.
          </h2>
          <p className="text-sm sm:text-base text-[#475569] mt-3 leading-relaxed">
            Every architectural tier of Joineazy is purpose-built for relational integrity, authenticated role safety, and tangible academic governance.
          </p>
        </div>

        {/* 8-Card Responsive Architectural Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Feature 1 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#1557D6] flex items-center justify-center mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">JWT Authentication & RBAC</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Cryptographically signed tokens and strict role boundaries for Student, Professor, and Admin with sanitized credentials.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-[#7C3AED] flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">Course Catalogs & Rosters</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Course creation, student enrollment catalog, syllabus tracking, and direct assignment-to-course relationship mapping.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">Complete Assignment CRUD</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Create, read dossiers, revise parameters, and safely delete coursework with PostgreSQL cascading constraint protection.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
              <ExternalLink className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">Dual Submission Workflows</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Support for both individual research deliverables and collaborative student squad repositories with external cloud storage.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#1557D6] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">Leader-Only Acknowledgment</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Squad governance enforced by backend: only team creators can confirm submissions; non-leaders receive HTTP 403.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">Dynamic Progress Engine</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Mathematically computed completion percentages from live database rows; zero hardcoded fallback statistics.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-[#7C3AED] flex items-center justify-center mb-3">
              <FileCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">Academic Dossier UI/UX</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Warm cream paper aesthetic, editorial serif typography, tangible sticky notes, and accessible micro-animations.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="p-5 rounded-2xl bg-white border border-[#D9D5CA] shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#172033]">PostgreSQL Relational Safety</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              9 relational tables with ACID transactions, foreign keys with cascading cleanup, and verified schema integrity.
            </p>
          </div>
        </div>

        {/* Live System Connectivity Card (Preserved GET /api/health Verification) */}
        <div id="health-section" className="p-6 rounded-3xl bg-white border border-[#D9D5CA] shadow-paper-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#172033] uppercase tracking-wider font-mono">
                Live System Connectivity & Status
              </h3>
              <p className="text-xs text-[#64748B]">
                End-to-end communication verified with PostgreSQL database and Node.js REST API.
              </p>
            </div>
            <span className="text-xs font-mono text-[#475569] bg-[#FAF8F5] border border-[#D9D5CA] px-3 py-1 rounded-xl shadow-2xs self-start sm:self-auto">
              GET /api/health
            </span>
          </div>

          <HealthStatusCard />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 — DEMO PERSONAS                                                 */}
      {/* ========================================================================= */}
      <section id="demo-personas" className="scroll-mt-20 px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t border-[#D9D5CA]/80 pb-24">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-xs font-bold font-mono uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Academic Roles · Seeded Credentials</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#172033] leading-tight">
            Explore Joineazy Across Key Academic Roles.
          </h2>
          <p className="text-sm sm:text-base text-[#475569] mt-3 leading-relaxed">
            Test the live platform immediately using pre-configured academic personas across faculty instruction, student leadership, and squad collaboration.
          </p>
        </div>

        {/* 4 Seeded Persona Cards Grid */}
        <div id="rapid-access" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Persona 1: Faculty Turing */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between hover:border-[#1557D6] transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#1557D6] transition-colors">
                  Dr. Alan Turing
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Faculty
                </span>
              </div>
              <p className="text-xs font-mono text-[#64748B] mb-2">dr.alan@university.edu</p>
              <p className="text-[11px] text-[#475569] leading-relaxed mb-4">
                Full curriculum authority: course creation, assignment CRUD lifecycle, submission monitoring, and group performance analytics.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E0D8]">
              <Link
                to="/login"
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#1557D6] hover:text-white text-[#1557D6] font-mono font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Sign In as Faculty</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Persona 2: Faculty Curie */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between hover:border-[#1557D6] transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#1557D6] transition-colors">
                  Prof. Marie Curie
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Faculty
                </span>
              </div>
              <p className="text-xs font-mono text-[#64748B] mb-2">prof.curie@university.edu</p>
              <p className="text-[11px] text-[#475569] leading-relaxed mb-4">
                Departmental curriculum instructor: manages independent laboratory courses, authoring briefs, and supervising student rosters.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E0D8]">
              <Link
                to="/login"
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#1557D6] hover:text-white text-[#1557D6] font-mono font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Sign In as Faculty</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Persona 3: Student Leader Alice */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between hover:border-[#1557D6] transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#1557D6] transition-colors">
                  Alice Smith (Leader)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1557D6]">
                  Squad Leader
                </span>
              </div>
              <p className="text-xs font-mono text-[#64748B] mb-1">alice.smith@university.edu</p>
              <p className="text-[10px] font-mono text-[#94A3B8] mb-2">ID: STU2026001</p>
              <p className="text-[11px] text-[#475569] leading-relaxed mb-4">
                Student group founder: course enrollment, squad formation, deliverable submission, and exclusive acknowledgment authorization.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E0D8]">
              <Link
                to="/login"
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#1557D6] hover:text-white text-[#1557D6] font-mono font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Sign In as Leader</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Persona 4: Student Member Bob */}
          <div className="paper-card bg-white rounded-2xl border border-[#D9D5CA] p-5 shadow-2xs flex flex-col justify-between hover:border-[#1557D6] transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#172033] group-hover:text-[#1557D6] transition-colors">
                  Bob Jones (Member)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Team Member
                </span>
              </div>
              <p className="text-xs font-mono text-[#64748B] mb-1">bob.jones@university.edu</p>
              <p className="text-[10px] font-mono text-[#94A3B8] mb-2">ID: STU2026002</p>
              <p className="text-[11px] text-[#475569] leading-relaxed mb-4">
                Collaborative squad member: course study, shared repository access, synchronized progress viewing, and non-leader status transparency.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E5E0D8]">
              <Link
                to="/login"
                className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-[#1557D6] hover:text-white text-[#1557D6] font-mono font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <span>Sign In as Member</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Landing Page Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#D9D5CA] py-6 px-4 sm:px-8 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#172033]">Joineazy</span>
            <span>•</span>
            <span className="font-editorial italic text-sm">Students. Ideas. Together.</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Joineazy Academic System · Node.js, Express, PostgreSQL, React 18
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
