import { getAllProducts } from '@/lib/products';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';

    // Get all products
    const { products } = await getAllProducts(); // Fetch all products, no limit

    // Generate product URLs
    const productUrls = products.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Static routes
    const routes = [
        '',
        '/shop',
        '/about',
        '/contact',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes, ...productUrls];
}
