'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import RoleTab from './RoleTab';
import CredentialsBox from './CredentialsBox';
import CampusNetworkBackground from './CampusNetworkBackground';
import { fetchProfileByEmail, saveProfile, roleRoutes } from '@/lib/auth';

type Role = 'student' | 'teacher' | 'admin';
type AuthMode = 'login' | 'signup';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const mockCredentials = {
  student: { email: 'student5@campusos.demo', password: 'Student@2026' },
  teacher: { email: 'faculty@campusos.demo', password: 'Teacher@2026' },
  admin: { email: 'admin@campusos.demo', password: 'Admin@2026' },
};

export default function LoginPageClient() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<Role>('student');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const signupForm = useForm<SignupFormData>({
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'student' },
  });

  const handleAutofill = (role: Role) => {
    const creds = mockCredentials[role];
    loginForm.setValue('email', creds.email, { shouldValidate: true });
    loginForm.setValue('password', creds.password, { shouldValidate: true });
    setActiveRole(role);
    toast.success(`Demo credentials auto-filled for ${role.toUpperCase()}`);
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const email = data.email.trim().toLowerCase();
    let profile = await fetchProfileByEmail(email);

    if (!profile) {
      const creds = mockCredentials[activeRole];
      if (email === creds.email.toLowerCase()) {
        profile = await fetchProfileByEmail(creds.email);
      }
    }

    if (profile) {
      saveProfile(profile);
      toast.success(`Welcome back, ${profile.fullName}! Opening ${profile.role.toUpperCase()} portal...`);
      await new Promise((r) => setTimeout(r, 300));
      router.push(roleRoutes[profile.role]);
    } else {
      setIsLoading(false);
      loginForm.setError('email', {
        message: 'Invalid credentials — click a demo account below to auto-fill',
      });
    }
  };

  const onSignup = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    toast.success('Account created! Please check your email to verify.');
    setIsLoading(false);
    setAuthMode('login');
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#F8FAFC] flex flex-col justify-center items-center selection:bg-brand-100 selection:text-primary-dark">
      {/* ─── 1. SUBTLE INTELLIGENT CAMPUS NETWORK BACKGROUND ────────────── */}
      <CampusNetworkBackground />

      {/* ─── 2. MAIN LOGIN HERO CARD CONTAINER ──────────────────────────── */}
      <div className="relative z-10 w-full min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-[calc(100%-32px)] sm:w-full max-w-[460px] my-auto py-6 animate-fade-in-up">
          
          {/* CampusOS Clean Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-3 mb-2 group cursor-pointer transition-transform duration-200 hover:scale-102">
              <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-sm ring-4 ring-primary/15 text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                  Campus<span className="text-primary font-black">OS</span>
                </div>
                <div className="text-[11px] text-primary-dark tracking-wider font-mono-data font-bold uppercase mt-1">
                  Intelligent Campus Platform
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto">
              Unified Academic Operating System for Students & Faculty
            </p>
          </div>

          {/* Auth Mode Toggle (Sign In / Create Account) */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100/90 mb-4 border border-border">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-primary-dark shadow-sm border border-brand-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-primary-dark shadow-sm border border-brand-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Tabs (Student / Teacher / Admin) */}
          {authMode === 'login' && (
            <div className="flex gap-2 mb-4">
              {(['student', 'teacher', 'admin'] as Role[]).map((role) => (
                <RoleTab
                  key={`role-${role}`}
                  role={role}
                  isActive={activeRole === role}
                  onClick={() => setActiveRole(role)}
                />
              ))}
            </div>
          )}

          {/* Premium White Hero Login Card */}
          <div className="p-6 sm:p-8 bg-white rounded-[22px] border border-border shadow-[0_12px_36px_-6px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)]">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                {authMode === 'login' ? 'Welcome back' : 'Create Campus Account'}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {authMode === 'login'
                  ? 'Sign in to continue to your campus'
                  : 'Register for your institutional academic account'}
              </p>
            </div>

            {authMode === 'login' ? (
              <LoginForm
                form={loginForm}
                onSubmit={onLogin}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isLoading={isLoading}
              />
            ) : (
              <SignupForm
                form={signupForm}
                onSubmit={onSignup}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Demo Accounts Quick-Fill Panel */}
          {authMode === 'login' && (
            <CredentialsBox
              credentials={mockCredentials}
              activeRole={activeRole}
              onAutofill={handleAutofill}
            />
          )}

          {/* Terms & Privacy Footer */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            By signing in, you agree to the{' '}
            <span className="text-primary-dark cursor-pointer hover:underline font-semibold">Terms of Service</span>{' '}
            and <span className="text-primary-dark cursor-pointer hover:underline font-semibold">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Clean Form Inputs & Controls ─────────────────────────────────────────────

interface LoginFormProps {
  form: ReturnType<typeof useForm<LoginFormData>>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isLoading: boolean;
}

function LoginForm({ form, onSubmit, showPassword, setShowPassword, isLoading }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5 tracking-wide">
          Email address
        </label>
        <input
          type="email"
          className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          placeholder="you@campusos.edu"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        {errors.email && (
          <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-semibold animate-fade-in">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="6" fillOpacity="0.2" />
              <path
                d="M6 3.5V6.5M6 8H6.01"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-800 tracking-wide">Password</label>
          <button
            type="button"
            className="text-xs text-primary-dark hover:text-primary cursor-pointer hover:underline font-semibold"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full h-12 pl-4 pr-11 rounded-xl border border-border bg-white text-sm text-foreground font-mono-data placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-danger mt-1.5 font-semibold animate-fade-in">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          id="rememberMe"
          className="w-4 h-4 rounded accent-primary cursor-pointer"
          {...register('rememberMe')}
        />
        <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer font-medium select-none">
          Remember this device for 30 days
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <span className="text-base leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
          </>
        )}
      </button>
    </form>
  );
}

// ─── Signup Form ──────────────────────────────────────────────────────────────

interface SignupFormProps {
  form: ReturnType<typeof useForm<SignupFormData>>;
  onSubmit: (data: SignupFormData) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  isLoading: boolean;
}

function SignupForm({
  form,
  onSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
}: SignupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5 tracking-wide">Full Name</label>
        <input
          type="text"
          className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          placeholder="Arjun Sharma"
          {...register('fullName', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name too short' },
          })}
        />
        {errors.fullName && <p className="text-xs text-danger mt-1.5 font-semibold">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5 tracking-wide">Email address</label>
        <input
          type="email"
          className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          placeholder="you@campusos.edu"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
          })}
        />
        {errors.email && <p className="text-xs text-danger mt-1.5 font-semibold">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5 tracking-wide">Role</label>
        <select
          className="w-full h-12 px-4 rounded-xl border border-border bg-white text-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 cursor-pointer font-semibold"
          {...register('role', { required: true })}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5 tracking-wide">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full h-12 pl-4 pr-11 rounded-xl border border-border bg-white text-sm text-foreground font-mono-data placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            placeholder="Min. 8 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Min. 8 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
        {errors.password && <p className="text-xs text-danger mt-1.5 font-semibold">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5 tracking-wide">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="w-full h-12 pl-4 pr-11 rounded-xl border border-border bg-white text-sm text-foreground font-mono-data placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            placeholder="Repeat your password"
            {...register('confirmPassword', { required: 'Please confirm password' })}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showConfirmPassword ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-danger mt-1.5 font-semibold">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Create My Account</span>
            <span className="text-base leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
          </>
        )}
      </button>
    </form>
  );
}
