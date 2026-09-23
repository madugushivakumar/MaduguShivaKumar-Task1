import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  User,
  GraduationCap,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'PROFESSOR'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const { name, email, studentId, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    if (role === 'STUDENT' && !studentId.trim()) {
      setErrorMessage('Student ID is required for student registration.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const registeredUser = await register({
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim() || null,
        password,
        role,
      });

      if (role === 'PROFESSOR' || registeredUser?.role === 'PROFESSOR') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Registration failed. Please review your input.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F1E8]">
      {/* LEFT SIDE: Editorial Academic Storytelling Panel */}
      <div className="lg:w-[45%] bg-[#F5F1E8] border-b lg:border-b-0 lg:border-r border-[#D9D5CA] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle grid dots background */}
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
                Academic Registration
              </span>
            </div>
          </Link>

          <div className="hidden sm:inline-block rubber-stamp text-[10px] font-mono font-bold px-2.5 py-1 -rotate-6">
            NEW COHORT ★ 2026
          </div>
        </div>

        {/* Middle Content */}
        <div className="my-10 lg:my-0 relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1557D6] text-xs font-mono font-bold border border-[#BFDBFE]">
            <Sparkles className="w-3.5 h-3.5 text-[#1557D6]" />
            <span>JOIN THE ACADEMIC NETWORK</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-editorial text-[#172033] tracking-tight leading-[1.12]">
            Build together.<br />
            Learn together.<br />
            <span className="text-[#1557D6] italic">Excel together.</span>
          </h1>

          <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-md">
            Join thousands of students and faculty members collaborating seamlessly on real-world projects and coursework.
          </p>

          <div className="sticky-note p-4 rounded-2xl shadow-sticky rotate-1 text-[#451A03] relative max-w-xs">
            <p className="font-handwritten text-lg leading-snug font-medium">
              "Great minds collaborate before they graduate."
            </p>
            <p className="text-[10px] font-mono text-amber-800 font-bold mt-1 text-right">— Dean of Studies</p>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-[#94A3B8] font-mono">
          © 2026 Joineazy Academic System · All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Warm Paper Registration Card */}
      <div className="lg:w-[55%] flex items-center justify-center p-6 sm:p-12 bg-[#F5F1E8]">
        <div className="paper-card-elevated max-w-[500px] w-full bg-[#FFFFFF] rounded-3xl border border-[#D9D5CA] p-8 sm:p-10 shadow-paper">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#172033] font-editorial tracking-tight">
              Create your account
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Join a collaborative learning community
            </p>
          </div>

          {/* Role Selection Cards: Student / Professor */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#172033] mb-2 font-mono uppercase">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  role === 'STUDENT'
                    ? 'border-[#1557D6] bg-[#EFF6FF] text-[#1557D6] shadow-paper-sm'
                    : 'border-[#D9D5CA] bg-[#FAF8F5] text-[#64748B] hover:bg-[#F5F1E8]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    role === 'STUDENT'
                      ? 'bg-[#1557D6] text-white shadow-xs'
                      : 'bg-white text-[#94A3B8] border border-[#D9D5CA]'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172033]">Student</p>
                  <p className="text-[10px] text-[#64748B]">Enroll & submit coursework</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('PROFESSOR')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  role === 'PROFESSOR'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-paper-sm'
                    : 'border-[#D9D5CA] bg-[#FAF8F5] text-[#64748B] hover:bg-[#F5F1E8]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    role === 'PROFESSOR'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-[#94A3B8] border border-[#D9D5CA]'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172033]">Professor</p>
                  <p className="text-[10px] text-[#64748B]">Create & oversee courses</p>
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={role === 'PROFESSOR' ? 'e.g. Dr. Alan Turing' : 'e.g. Alice Smith'}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  {role === 'PROFESSOR' ? 'Faculty / Staff ID (Optional)' : 'Student ID'}
                </label>
                <input
                  type="text"
                  name="studentId"
                  required={role === 'STUDENT'}
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder={role === 'PROFESSOR' ? 'e.g. FAC-2026-001' : 'e.g. STU-2026-042'}
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="shiva@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-9 py-2.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94A3B8] hover:text-[#172033] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-9 py-2.5 bg-[#FFFFFF] border border-[#D9D5CA] rounded-xl text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1557D6]/20 focus:border-[#1557D6] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94A3B8] hover:text-[#172033] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-4"
              icon={ArrowRight}
              iconPosition="right"
            >
              Create Account
            </Button>
          </form>

          {/* Bottom Navigation */}
          <div className="mt-6 pt-4 border-t border-[#D9D5CA]/70 text-center">
            <p className="text-xs text-[#64748B]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#1557D6] hover:text-[#0D3EA8] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
