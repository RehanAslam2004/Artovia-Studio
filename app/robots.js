export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/account/', '/api/', '/checkout/', '/cart/', '/download/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/', '/account/', '/api/', '/checkout/', '/cart/', '/download/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
