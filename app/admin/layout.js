
/**
 * Admin Route Layout
 * ==================
 * Forces dynamic rendering for all admin pages to prevent build-time errors
 * caused by static generation of protected routes using cookies/searchParams.
 */

export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }) {
    return <>{children}</>;
}
