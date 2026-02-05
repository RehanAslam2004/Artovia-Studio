import { NextResponse } from 'next/server';

/**
 * Middleware for Route Protection
 * ===============================
 * Protects sensitive routes based on user role cookies.
 * 
 * Rules:
 * 1. /admin/*    -> Requires 'user_role' = 'admin'
 * 2. /account/*  -> Requires 'user_role' (any value)
 * 3. /login      -> Redirects to /account if logged in
 * 4. /register   -> Redirects to /account if logged in
 */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Get user role from cookies
    const userRole = request.cookies.get('user_role')?.value;

    // 1. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        // Allow access to admin login page
        if (pathname === '/admin/login') {
            // If already admin, redirect to dashboard
            if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
            return NextResponse.next();
        }

        // For all other admin routes, require admin role
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // 2. Protect Account Routes (Customer Dashboard)
    if (pathname.startsWith('/account')) {
        if (!userRole) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Redirect authenticated users away from auth pages
    if (pathname === '/login' || pathname === '/register') {
        if (userRole) {
            // If admin, go to admin dashboard, else customer dashboard
            const destination = userRole === 'admin' ? '/admin/dashboard' : '/account';
            return NextResponse.redirect(new URL(destination, request.url));
        }
    }

    return NextResponse.next();
}

// Configure paths to match
export const config = {
    matcher: [
        '/admin/:path*',
        '/account/:path*',
        '/login',
        '/register',
    ],
};
