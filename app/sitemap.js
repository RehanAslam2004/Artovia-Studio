import { getAllProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
    // Robust site URL detection
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
        ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
        : 'https://artovia-studio.vercel.app'; // Fallback to current production URL

    // Get all products
    let productUrls = [];
    try {
        const { products } = await getAllProducts();
        productUrls = (products || []).map((product) => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Sitemap: Error fetching products', error);
    }

    // Static routes with priorities
    const routes = [
        { path: '', priority: 1.0, changeFrequency: 'daily' },
        { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
        { path: '/custom-request', priority: 0.8, changeFrequency: 'weekly' },
        { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/login', priority: 0.4, changeFrequency: 'yearly' },
        { path: '/register', priority: 0.4, changeFrequency: 'yearly' },
        { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
        { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    ].map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));

    return [...routes, ...productUrls];
}
