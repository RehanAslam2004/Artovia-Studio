
/**
 * Shop Route Layout
 * =================
 * Forces dynamic rendering for shop pages to prevent build-time errors.
 * This ensures search params and dynamic content work correctly.
 */

export const dynamic = 'force-dynamic';

export default function ShopLayout({ children }) {
    return <>{children}</>;
}
