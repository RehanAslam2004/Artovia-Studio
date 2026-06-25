/**
 * Cloudinary Signature Generator API Route
 * ========================================
 * Generates cryptographic signatures to authorize direct client-side
 * uploads to Cloudinary, bypassing Vercel request body size limitations.
 */

import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    console.log('Signature API: Request received');
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get('user_role')?.value;
        console.log('Signature API: User role:', userRole);

        const body = await request.json();
        const { folder } = body;

        if (!folder) {
            console.log('Signature API: Missing folder parameter');
            return NextResponse.json(
                { success: false, error: 'Folder parameter is required' },
                { status: 400 }
            );
        }

        // Security check: Only allow uploads to 'requests' folder for regular customers / guests.
        // Administrative folders like 'products', 'presets', 'bookmarks', 'orders' are restricted to admins.
        if (folder !== 'requests' && userRole !== 'admin') {
            console.log(`Signature API: Unauthorized folder access attempted for '${folder}'`);
            return NextResponse.json(
                { success: false, error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        const timestamp = Math.round((new Date()).getTime() / 1000);
        const paramsToSign = {
            timestamp: timestamp,
            folder: `artovia-studio/${folder}`,
        };

        console.log(`Signature API: Generating signature for folder 'artovia-studio/${folder}'`);

        // Generate signature (sorted alphabetically automatically by Cloudinary SDK)
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        return NextResponse.json({
            success: true,
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        });
    } catch (error) {
        console.error('Signature API Fatal Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Signature generation failed' },
            { status: 500 }
        );
    }
}
