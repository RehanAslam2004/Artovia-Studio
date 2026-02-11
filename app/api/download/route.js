/**
 * Download API Route
 * ==================
 * Proxies file downloads from Cloudinary to ensure proper download behavior
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    let fileUrl = searchParams.get('url');
    const fileName = searchParams.get('name') || 'download';

    if (!fileUrl) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    try {
        console.log(`[Download API] Requested URL: ${fileUrl}`);

        // Handle relative URLs (e.g. from mock data or local images)
        if (!fileUrl.startsWith('http')) {
            // Get base URL with robust fallback
            let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

            if (!baseUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
                baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
            }

            if (!baseUrl) {
                baseUrl = 'https://artovia-studio.vercel.app';
            }

            // Ensure fileUrl starts with / if not present
            if (!fileUrl.startsWith('/')) fileUrl = '/' + fileUrl;

            // Construct absolute URL
            fileUrl = new URL(fileUrl, baseUrl).toString();
            console.log(`[Download API] Resolved relative URL to: ${fileUrl}`);
        }

        // Fetch the file
        const response = await fetch(fileUrl);

        if (!response.ok) {
            console.error(`[Download API] Fetch failed: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        // Get the file content
        const fileBuffer = await response.arrayBuffer();

        // Determine content type
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Get file extension from URL or content type
        let extension = '';
        if (fileUrl.includes('.')) {
            // Simple extension extraction
            const parts = fileUrl.split('.');
            if (parts.length > 1) {
                extension = parts.pop().split('?')[0].split('#')[0];
            }
        }

        // Only append extension if fileName doesn't already have one
        const downloadName = (extension && !fileName.includes('.'))
            ? `${fileName}.${extension}`
            : fileName;

        // Return the file with proper download headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${downloadName}"`,
                'Content-Length': fileBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('[Download API] Critical error:', error);
        return NextResponse.json({
            error: 'Failed to download file',
            details: error.message
        }, { status: 500 });
    }
}
