/**
 * Send Email API Route
 * ====================
 * API endpoint for sending emails via Resend
 */

import { NextResponse } from 'next/server';
import {
    sendOrderConfirmationEmail,
    sendOrderApprovalEmail,
    sendAdminOrderNotification
} from '@/lib/email';

export async function POST(request) {
    try {
        const body = await request.json();
        const { type, order, downloadLinks } = body;

        if (!type || !order) {
            return NextResponse.json(
                { error: 'Missing required fields: type and order' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'order_confirmation':
                // Send confirmation to customer + notification to admin
                result = await sendOrderConfirmationEmail(order);
                // Also notify admin
                await sendAdminOrderNotification(order);
                break;

            case 'order_approval':
                // Send approval email with download links to customer
                result = await sendOrderApprovalEmail(order, downloadLinks || []);
                break;

            case 'admin_notification':
                // Send notification to admin only
                result = await sendAdminOrderNotification(order);
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid email type' },
                    { status: 400 }
                );
        }

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Email sent successfully' });
        } else {
            return NextResponse.json(
                { error: result.error || 'Failed to send email' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Email API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
