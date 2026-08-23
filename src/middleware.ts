import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRoutes: Record<string, string> = {
  student: '/student-dashboard',
  teacher: '/teacher-dashboard',
  admin: '/admin-dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('campusos_token')?.value;
  const userRole = request.cookies.get('campusos_role')?.value || 'student';

  const isAuthRoute = pathname === '/sign-up-login-screen' || pathname === '/';
  const isDashboardRoute =
    pathname.startsWith('/student-dashboard') ||
    pathname.startsWith('/teacher-dashboard') ||
    pathname.startsWith('/admin-dashboard');

  // If user is already authenticated and visits login or root landing
  if (isAuthRoute && sessionToken) {
    const targetDashboard = roleRoutes[userRole] || '/student-dashboard';
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // If unauthenticated visitor hits protected dashboard
  if (isDashboardRoute && !sessionToken) {
    const loginUrl = new URL('/sign-up-login-screen', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control guards
  if (isDashboardRoute && sessionToken) {
    if (pathname.startsWith('/admin-dashboard') && userRole !== 'admin') {
      const fallbackUrl = new URL(roleRoutes[userRole] || '/student-dashboard', request.url);
      return NextResponse.redirect(fallbackUrl);
    }

    if (pathname.startsWith('/teacher-dashboard') && userRole === 'student') {
      const fallbackUrl = new URL('/student-dashboard', request.url);
      return NextResponse.redirect(fallbackUrl);
    }
  }

  const response = NextResponse.next();

  // Attach Enterprise Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    '/',
    '/sign-up-login-screen',
    '/student-dashboard/:path*',
    '/teacher-dashboard/:path*',
    '/admin-dashboard/:path*',
  ],
};
