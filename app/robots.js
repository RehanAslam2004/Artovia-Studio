export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/account/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
