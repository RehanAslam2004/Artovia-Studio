
/**
 * Shop Route Layout
 * =================
 * Forces dynamic rendering for shop pages to prevent build-time errors.
 * This ensures search params and dynamic content work correctly.
 */

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Shop — Browse Digital Designs',
    description: 'Browse premium digital designs at Artovia Studio — wedding cards, social media templates, e-books, and more. Instant download after purchase.',
    openGraph: {
        title: 'Shop Digital Designs | Artovia Studio',
        description: 'Explore wedding cards, social media templates, and digital art. Instant download.',
        url: '/shop',
        type: 'website',
    },
    alternates: { canonical: '/shop' },
};

export default function ShopLayout({ children }) {
    return <>{children}</>;
}
