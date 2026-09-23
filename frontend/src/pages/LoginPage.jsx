import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  Sparkles,
  Users,
  FileText,
  CheckCircle2,
  Lightbulb,
  GraduationCap,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Quick fill helper for demonstration testing
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else if (loggedUser.role === 'ADMIN' || loggedUser.role === 'PROFESSOR') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F1E8]">
      {/* LEFT SIDE: Editorial Academic Storytelling Panel */}
      <div className="lg:w-[48%] bg-[#F5F1E8] border-b lg:border-b-0 lg:border-r border-[#D9D5CA] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative grid/dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#D9D5CA_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1557D6] flex items-center justify-center text-white shadow-paper-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black font-editorial text-[#172033] tracking-tight leading-none">
                Joineazy
              </span>
              <span className="text-[10px] text-[#64748B] font-mono font-bold tracking-wider uppercase mt-0.5">
                Academic Portal
              </span>
            </div>
          </Link>

          {/* Editorial Rubber Stamp */}
          <div className="hidden sm:inline-block rubber-stamp text-[10px] font-mono font-bold px-2.5 py-1 -rotate-6">
            EST. 2026 ★ VERIFIED
          </div>
        </div>

        {/* Middle Content & Sticky Note */}
        <div className="my-10 lg:my-0 relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1557D6] text-xs font-mono font-bold border border-[#BFDBFE]">
            <Sparkles className="w-3.5 h-3.5 text-[#1557D6]" />
            <span>STUDENTS. IDEAS. TOGETHER.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-editorial text-[#172033] tracking-tight leading-[1.12]">
            Collaborate.<br />
            Submit.<br />
            <span className="text-[#1557D6] italic">Succeed.</span>
          </h1>

          <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-md">
            A purpose-built workspace for students and faculty to coordinate courses, form project squads, and execute assignments with verified delivery.
          </p>

          {/* Sticky Note & Academic Pillars Strip */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="sticky-note p-4 rounded-2xl shadow-sticky rotate-1 text-[#451A03] relative max-w-xs">
              <div className="w-8 h-2.5 bg-amber-400/50 rounded mx-auto -mt-2 mb-2" />
              <p className="font-handwritten text-lg leading-snug font-medium">
                "Education today, opportunities tomorrow."
              </p>
              <p className="text-[10px] font-mono text-amber-800 font-bold mt-1 text-right">— Campus Senate</p>
            </div>

            {/* Academic Pillars */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D9D5CA] text-[#172033] flex items-center gap-1.5 shadow-paper-sm">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Ideas</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D9D5CA] text-[#172033] flex items-center gap-1.5 shadow-paper-sm">
                <Users className="w-3.5 h-3.5 text-[#1557D6]" />
                <span>Cohorts</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D9D5CA] text-[#172033] flex items-center gap-1.5 shadow-paper-sm">
                <FileText className="w-3.5 h-3.5 text-[#1557D6]" />
                <span>Missions</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D9D5CA] text-[#172033] flex items-center gap-1.5 shadow-paper-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-[#94A3B8] font-mono">
          © 2026 Joineazy Academic System · Precision student workflows.
        </div>
      </div>

      {/* RIGHT SIDE: Warm Paper Login Card */}
      <div className="lg:w-[52%] flex items-center justify-center p-6 sm:p-12 bg-[#F5F1E8]">
        <div className="paper-card-elevated max-w-[460px] w-full bg-[#FFFFFF] rounded-3xl border border-[#D9D5CA] p-8 sm:p-10 shadow-paper">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#172033] font-editorial tracking-tight">
              Welcome back 👋
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Sign in to access your coursework, groups, and submissions.
            </p>
          </div>

          {/* 1-Click Demo Accounts Quick-Fill Panel */}
          <div className="mb-6 p-3.5 bg-[#FAF8F5] border border-[#D9D5CA] rounded-2xl">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 font-mono">
              1-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickFill('dr.alan@university.edu', 'Password123!')
                }
                className="flex items-center gap-2 p-2 rounded-xl bg-white hover:bg-[#EFF6FF] hover:border-[#BFDBFE] border border-[#D9D5CA] text-[#172033] shadow-paper-sm transition-all text-left cursor-pointer"
                title="Professor Alan Turing"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-[11px] truncate">Prof. Alan</span>
                  <span className="text-[9px] text-amber-800 font-mono font-semibold">FACULTY</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickFill('prof.curie@university.edu', 'Password123!')
                }
                className="flex items-center gap-2 p-2 rounded-xl bg-white hover:bg-[#EFF6FF] hover:border-[#BFDBFE] border border-[#D9D5CA] text-[#172033] shadow-paper-sm transition-all text-left cursor-pointer"
                title="Professor Marie Curie"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-[11px] truncate">Prof. Curie</span>
                  <span className="text-[9px] text-amber-800 font-mono font-semibold">PROFESSOR</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickFill('alice.smith@university.edu', 'Password123!')
                }
                className="flex items-center gap-2 p-2 rounded-xl bg-white hover:bg-[#EFF6FF] hover:border-[#BFDBFE] border border-[#D9D5CA] text-[#172033] shadow-paper-sm transition-all text-left cursor-pointer"
                title="Alice Smith (Group Leader)"
              >
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#1557D6] flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-[11px] truncate">Alice (Leader)</span>
                  <span className="text-[9px] text-[#1557D6] font-bold font-mono">Leader Ack</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickFill('bob.jones@university.edu', 'Password123!')
                }
                className="flex items-center gap-2 p-2 rounded-xl bg-white hover:bg-[#EFF6FF] hover:border-[#BFDBFE] border border-[#D9D5CA] text-[#172033] shadow-paper-sm transition-all text-left cursor-pointer"
                title="Bob Jones (Group Member)"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#64748B] flex items-center justify-center flex-shrink-0 border border-[#D9D5CA]">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-[11px] truncate">Bob (Member)</span>
                  <span className="text-[9px] text-[#64748B] font-bold font-mono">Student</span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alice.smith@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#172033] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#64748B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1557D6] focus:ring-[#1557D6] border-[#D9D5CA]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Please contact institutional faculty administrator for password reset assistance.')}
                className="text-xs font-semibold text-[#1557D6] hover:text-[#0D3EA8] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Sign In Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          {/* Bottom Link */}
          <div className="mt-6 text-center pt-4 border-t border-[#D9D5CA]/70">
            <p className="text-xs text-[#64748B]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#1557D6] hover:text-[#0D3EA8] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
