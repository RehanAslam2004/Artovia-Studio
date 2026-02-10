import { NextResponse } from 'next/server';

/**
 * Middleware for Route Protection
 * ===============================
 * Protects sensitive routes based on user role cookies.
 * 
 * Rules:
 * 1. /admin/*    -> Requires 'user_role' = 'admin'
 * 2. /account/*  -> Requires 'user_role' (any value)
 * 3. /login      -> Allow always (shows logged-in state if applicable)
 * 4. /register   -> Allow always (shows logged-in state if applicable)
 */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Get user role from cookies
    const userRole = request.cookies.get('user_role')?.value;

    // 1. Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        // Allow access to admin login page always
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

    // 3. Customer login and register pages - always allow access
    // Don't redirect logged-in users, let the page handle showing appropriate content
    // This allows customers and admins to access /login without forced redirects

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
