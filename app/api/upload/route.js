/**
 * Cloudinary Upload API Route
 * ===========================
 * Handles server-side signed uploads to Cloudinary.
 * This provides secure upload functionality for the admin panel.
 */

import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Allow up to 60 seconds for uploads
export const maxDuration = 60;

// ...

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    console.log('Upload API: Request received');
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get('user_role')?.value;
        console.log('Upload API: User role:', userRole);

        if (userRole !== 'admin') {
            console.log('Upload API: Unauthorized');
            return NextResponse.json(
                { success: false, error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'products';

        if (!file) {
            console.log('Upload API: No file provided');
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        console.log(`Upload API: Processing file ${file.name} (${file.size} bytes)`);

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log('Upload API: Starting Cloudinary upload...');

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `artovia-studio/${folder}`,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary API Error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary Upload Success:', result.public_id);
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type, // 'image', 'video', or 'raw'
            format: result.format, // 'jpg', 'mp4', 'dng', etc.
            bytes: result.bytes,
        });
    } catch (error) {
        console.error('Upload API Fatal Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const cookieStore = await cookies();
        const userRole = cookieStore.get('user_role')?.value;

        if (userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        const { publicId } = await request.json();

        if (!publicId) {
            return NextResponse.json(
                { success: false, error: 'No publicId provided' },
                { status: 400 }
            );
        }

        await cloudinary.uploader.destroy(publicId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Delete failed' },
            { status: 500 }
        );
    }
}
