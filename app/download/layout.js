
/**
 * Download Route Layout
 * =====================
 * Forces dynamic rendering for download pages to prevent build-time errors.
 * This ensures order verification and dynamic content work correctly.
 */

export const dynamic = 'force-dynamic';

export default function DownloadLayout({ children }) {
    return <>{children}</>;
}
