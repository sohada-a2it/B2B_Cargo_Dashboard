// middleware.js (project root এ, যেখানে package.json আছে)
import { NextResponse } from 'next/server';

// পাবলিক রাউট - যেখানে লগইন ছাড়া যাওয়া যাবে
const publicRoutes = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/register',
  '/',
];

// প্রটেক্টেড রাউট - যেখানে লগইন করতে হবে
const protectedRoutes = [
  '/dashboard',
  '/Bookings',
  '/shippings',
  '/warehouse',
  '/users',
  '/all-tracking',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // টোকেন চেক করুন
  const token = request.cookies.get('token')?.value;
  const isLoggedIn = !!token;
  
  // চেক করুন রুটটি প্রটেক্টেড কিনা
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // লগইন না করা থাকলে প্রটেক্টেড রুটে যেতে দেবেন না
  if (!isLoggedIn && isProtectedRoute) {
    console.log(`🔒 Redirecting to login from: ${pathname}`);
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // লগইন করা থাকলে লগইন পেজে যেতে দেবেন না
  if (isLoggedIn && pathname === '/auth/login') {
    console.log(`✅ Already logged in, redirecting to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // লগইন করা থাকলে রুট পেজ (/) এ গেলে dashboard এ পাঠান
  if (isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// middleware কোথায় কাজ করবে
export const config = {
  matcher: [
    /*
     * সব রাউটে কাজ করবে except:
     * - api routes (API calls)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder এর ফাইল (.png, .jpg, .svg, .ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
  ],
};