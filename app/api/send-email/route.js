/**
 * Send Email API Route
 * ====================
 * API endpoint for sending emails via Resend
 */

import { NextResponse } from 'next/server';
import {
    sendOrderConfirmationEmail,
    sendOrderApprovalEmail,
    sendAdminOrderNotification,
    sendWelcomeEmail,
    sendCustomRequestNotification,
    sendCustomQuoteEmail
} from '@/lib/email';

export async function POST(request) {
    try {
        const body = await request.json();
        const { type, order, downloadLinks } = body;

        console.log('📧 Email API Request:', { type, hasOrder: !!order, hasUser: !!body.user });

        if (!type) {
            console.error('❌ Missing email type', body);
            return NextResponse.json(
                { error: 'Missing email type' },
                { status: 400 }
            );
        }

        // Validate required fields based on type
        if (type !== 'welcome' && type !== 'custom_request' && type !== 'custom_quote' && !order) {
            console.error('❌ Missing order data for type:', type);
            return NextResponse.json(
                { error: 'Missing order data' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'welcome':
                // Send welcome email to new user
                console.log('📧 Sending welcome email to:', body.user?.email);
                if (body.user) {
                    result = await sendWelcomeEmail(body.user);
                } else {
                    result = { success: false, error: 'Missing user data for welcome email' };
                }
                break;

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
            
            case 'custom_request':
                // Send notification to admin + confirmation to customer
                console.log('📧 Sending custom request notification for:', body.request?.email);
                if (body.request) {
                    result = await sendCustomRequestNotification(body.request);
                } else {
                    result = { success: false, error: 'Missing request data for custom request email' };
                }
                break;

            case 'custom_quote':
                // Send quote with price to customer
                console.log('📧 Sending custom quote to:', body.request?.email, 'Price:', body.price);
                if (body.request && body.price) {
                    result = await sendCustomQuoteEmail(body.request, body.price);
                } else {
                    result = { success: false, error: 'Missing request data or price for custom quote email' };
                }
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
