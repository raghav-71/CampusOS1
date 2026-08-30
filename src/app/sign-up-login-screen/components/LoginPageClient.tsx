'use client';

import React, { useState, Suspense, lazy } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import RoleTab from './RoleTab';
import CredentialsBox from './CredentialsBox';
import AnimatedCard from '@/components/motion/AnimatedCard';
import MagneticButton from '@/components/motion/MagneticButton';
import { fetchProfileByEmail, saveProfile, roleRoutes } from '@/lib/auth';

const LoginScene3D = lazy(() => import('./LoginScene3D'));

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
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Account created! Please check your email to verify.');
    setIsLoading(false);
    setAuthMode('login');
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#060B18] flex flex-col justify-center items-center selection:bg-accent selection:text-black">
      {/* ─── 1. FULL-SCREEN 100VW x 100VH 3D ANIMATED BACKGROUND ─────────────── */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Deep Cosmic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060B18] via-[#0A142F] to-[#040813]" />

        {/* Cyber Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />

        {/* Floating Glowing Atmospheric Orbs */}
        <div className="floating-orb orb-primary w-[550px] h-[550px] top-[-10%] left-[-10%] opacity-35 filter blur-[100px] animate-float-slow" />
        <div className="floating-orb orb-accent w-[450px] h-[450px] bottom-[-15%] right-[-10%] opacity-30 filter blur-[110px]" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />
        <div className="floating-orb orb-warm w-[350px] h-[350px] top-[40%] left-[20%] opacity-20 filter blur-[120px]" />

        {/* Full-Screen Three.js Academic Universe 3D Canvas */}
        <Suspense fallback={null}>
          <LoginScene3D />
        </Suspense>

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,11,24,0.65)_100%)]" />
      </div>

      {/* ─── 2. FOREGROUND CENTERED LOGIN OVERLAY ───────────────────────────── */}
      <div className="relative z-10 w-full min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[460px] my-auto py-6 animate-fade-in-up">
          {/* Logo & Header Centerpiece */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-3 mb-3 group cursor-pointer transition-transform duration-300 hover:scale-105">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-accent flex items-center justify-center shadow-glow border border-white/30 animate-pulse-glow">
                <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
                  <path d="M15 3L27 9.5V20.5L15 27L3 20.5V9.5L15 3Z" fill="white" fillOpacity="0.9" />
                  <path d="M15 8L22 12V18L15 22L8 18V12L15 8Z" fill="white" fillOpacity="0.4" />
                  <circle cx="15" cy="15" r="3" fill="#00D8F6" className="animate-ping" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-gradient-primary leading-none tracking-tight">
                  CAMPUS OS
                </div>
                <div className="text-[10px] text-accent tracking-widest font-mono-data font-800 uppercase mt-1">
                  3D Academic Universe
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-500 max-w-sm mx-auto">
              The Intelligent Operating System for Higher Education
            </p>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex gap-1 p-1 rounded-2xl glass-card mb-4 border border-primary/20 backdrop-blur-xl shadow-glass">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`btn-press flex-1 py-2.5 rounded-xl text-xs font-800 transition-all duration-200 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-glow border border-primary/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`btn-press flex-1 py-2.5 rounded-xl text-xs font-800 transition-all duration-200 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-glow border border-primary/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Tabs (Login only) */}
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

          {/* 3D Glass Auth Card with Subtle Tilt & Cursor Spotlight */}
          <AnimatedCard maxTilt={3} className="p-6 sm:p-7 border-primary/30 shadow-2xl backdrop-blur-2xl bg-card/85">
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-800 text-foreground tracking-tight mb-1">
                {authMode === 'login'
                  ? `${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Workspace`
                  : 'Create Campus Account'}
              </h1>
              <p className="text-xs text-muted-foreground font-500">
                {authMode === 'login'
                  ? 'Access your unified Campus OS 3D dashboard'
                  : 'Join the next-generation academic network'}
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
          </AnimatedCard>

          {/* Demo Credentials Section */}
          {authMode === 'login' && (
            <CredentialsBox
              credentials={mockCredentials}
              activeRole={activeRole}
              onAutofill={handleAutofill}
            />
          )}

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            By signing in, you agree to the{' '}
            <span className="text-primary cursor-pointer hover:underline font-600">Terms of Service</span>{' '}
            and <span className="text-primary cursor-pointer hover:underline font-600">Privacy Policy</span>
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-700 text-foreground mb-1.5 uppercase tracking-wider">
          Email address
        </label>
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
          <p className="text-xs text-danger mt-1.5 flex items-center gap-1 animate-fade-in font-600">
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
          <label className="text-xs font-700 text-foreground uppercase tracking-wider">Password</label>
          <span className="text-xs text-primary cursor-pointer hover:underline font-600">
            Forgot password?
          </span>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field pr-10 font-mono-data"
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-all duration-200 cursor-pointer"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-200 hover:scale-110"
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
        {errors.password && <p className="text-xs text-danger mt-1.5 animate-fade-in font-600">{errors.password.message}</p>}
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          id="rememberMe"
          className="w-4 h-4 rounded accent-primary cursor-pointer transition-transform duration-150 hover:scale-110"
          {...register('rememberMe')}
        />
        <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer font-600">
          Remember this device for 30 days
        </label>
      </div>

      <MagneticButton
        type="submit"
        disabled={isLoading}
        variant="primary"
        className="w-full mt-2 py-3 text-sm font-800 shadow-glow"
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
            AUTHENTICATING...
          </>
        ) : (
          <>
            <span>Sign In to Campus OS</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </MagneticButton>
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
        <label className="block text-xs font-700 text-foreground mb-1.5 uppercase tracking-wider">Full Name</label>
        <input
          type="text"
          className="input-field"
          placeholder="Arjun Sharma"
          {...register('fullName', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name too short' },
          })}
        />
        {errors.fullName && <p className="text-xs text-danger mt-1.5 font-600">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-700 text-foreground mb-1.5 uppercase tracking-wider">Email address</label>
        <input
          type="email"
          className="input-field"
          placeholder="you@campusos.edu"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
          })}
        />
        {errors.email && <p className="text-xs text-danger mt-1.5 font-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-700 text-foreground mb-1.5 uppercase tracking-wider">Role</label>
        <select className="input-field cursor-pointer font-700" {...register('role', { required: true })}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-700 text-foreground mb-1.5 uppercase tracking-wider">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field pr-10 font-mono-data"
            placeholder="Min. 8 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Min. 8 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
        {errors.password && <p className="text-xs text-danger mt-1.5 font-600">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-700 text-foreground mb-1.5 uppercase tracking-wider">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="input-field pr-10 font-mono-data"
            placeholder="Repeat your password"
            {...register('confirmPassword', { required: 'Please confirm password' })}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
          <p className="text-xs text-danger mt-1.5 font-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <MagneticButton type="submit" disabled={isLoading} variant="primary" className="w-full mt-2 py-3 text-sm font-800 shadow-glow">
        {isLoading ? 'Creating account...' : 'Create My Account'}
      </MagneticButton>
    </form>
  );
}
