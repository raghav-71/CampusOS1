'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AuthLeftPanel from './AuthLeftPanel';
import RoleTab from './RoleTab';
import CredentialsBox from './CredentialsBox';
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
  student: { email: 'arjun.sharma@campusos.edu', password: 'Student@2026' },
  teacher: { email: 'dr.priya.nair@campusos.edu', password: 'Teacher@2026' },
  admin: { email: 'admin@campusos.edu', password: 'Admin@2026' },
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
    loginForm.setValue('email', creds.email);
    loginForm.setValue('password', creds.password);
    setActiveRole(role);
    toast.success(`Demo credentials filled for ${role}`);
  };

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    // BACKEND INTEGRATION: Replace with Supabase signInWithPassword
    await new Promise((r) => setTimeout(r, 900));

    const creds = mockCredentials[activeRole];
    if (data.email === creds.email && data.password === creds.password) {
      // Fetch profile data and persist it for the dashboard
      const profile = await fetchProfileByEmail(data.email);
      if (profile) {
        saveProfile(profile);
      }
      toast.success(`Welcome back! Redirecting to ${activeRole} dashboard...`);
      await new Promise((r) => setTimeout(r, 400));
      router.push(roleRoutes[activeRole]);
    } else {
      setIsLoading(false);
      loginForm.setError('email', {
        message: 'Invalid credentials — use the demo accounts below to sign in',
      });
    }
  };

  const onSignup = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    // BACKEND INTEGRATION: Replace with Supabase signUp
    await new Promise((r) => setTimeout(r, 1200));
    toast.success('Account created! Please check your email to verify.');
    setIsLoading(false);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex overflow-hidden relative">
      {/* Background orbs */}
      <div className="floating-orb orb-primary w-96 h-96 top-[-10%] left-[-5%] opacity-40" />
      <div className="floating-orb orb-accent w-80 h-80 bottom-[-10%] right-[40%] opacity-30" />
      <div className="floating-orb orb-warm w-64 h-64 top-[40%] left-[25%] opacity-20" />

      {/* Left Panel — 3D-style animated */}
      <AuthLeftPanel />

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative z-10 min-h-screen">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo mark for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L20 7V15L11 20L2 15V7L11 2Z" fill="white" fillOpacity="0.9" />
                <path d="M11 6L16 9V13L11 16L6 13V9L11 6Z" fill="white" fillOpacity="0.4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gradient-primary">CampusOS</span>
          </div>

          {/* Auth mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl glass-card mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-600 transition-all duration-200 ${
                authMode === 'login' ?'bg-primary text-primary-foreground shadow-glow' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-600 transition-all duration-200 ${
                authMode === 'signup' ?'bg-primary text-primary-foreground shadow-glow' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Tabs (login only) */}
          {authMode === 'login' && (
            <div className="flex gap-2 mb-6">
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

          {/* Card */}
          <div className="glass-card rounded-2xl p-7">
            <div className="mb-6">
              <h1 className="text-2xl font-700 text-foreground mb-1">
                {authMode === 'login' ? `${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Sign In` : 'Create Account'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {authMode === 'login' ?'Access your CampusOS dashboard' :'Join CampusOS and get started'}
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

          {/* Demo Credentials */}
          {authMode === 'login' && (
            <CredentialsBox
              credentials={mockCredentials}
              activeRole={activeRole}
              onAutofill={handleAutofill}
            />
          )}

          <p className="text-center text-xs text-muted-foreground mt-5">
            By continuing, you agree to our{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
interface LoginFormProps {
  form: ReturnType<typeof useForm<LoginFormData>>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isLoading: boolean;
}

function LoginForm({ form, onSubmit, showPassword, setShowPassword, isLoading }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-500 text-foreground mb-1.5">Email address</label>
        <input
          type="email"
          className="input-field"
          placeholder="you@campusos.edu"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        {errors.email && (
          <p className="text-xs text-danger mt-1.5 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="6" fillOpacity="0.2" />
              <path d="M6 3.5V6.5M6 8H6.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-500 text-foreground">Password</label>
          <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field pr-10"
            placeholder="Enter your password"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="rememberMe"
          className="w-4 h-4 rounded accent-primary"
          {...register('rememberMe')}
        />
        <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
          Remember me for 30 days
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full mt-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </>
        ) : (
          <>
            Sign In to CampusOS
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
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

function SignupForm({ form, onSubmit, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, isLoading }: SignupFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-500 text-foreground mb-1.5">Full Name</label>
        <input
          type="text"
          className="input-field"
          placeholder="Arjun Sharma"
          {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
        />
        {errors.fullName && <p className="text-xs text-danger mt-1.5">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-500 text-foreground mb-1.5">Email address</label>
        <input
          type="email"
          className="input-field"
          placeholder="you@campusos.edu"
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
        />
        {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-500 text-foreground mb-1.5">Role</label>
        <select className="input-field" {...register('role', { required: true })}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-500 text-foreground mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field pr-10"
            placeholder="Min. 8 characters"
            {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min. 8 characters' } })}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
        {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-500 text-foreground mb-1.5">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="input-field pr-10"
            placeholder="Repeat your password"
            {...register('confirmPassword', { required: 'Please confirm password' })}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showConfirmPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-danger mt-1.5">{errors.confirmPassword.message}</p>}
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
        {isLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account...
          </>
        ) : 'Create My Account'}
      </button>
    </form>
  );
}