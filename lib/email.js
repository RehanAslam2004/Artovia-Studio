/**
 * Email Service (Nodemailer + Gmail)
 * =================================
 * Handles sending emails via Gmail SMTP
 */

import nodemailer from 'nodemailer';

// Configure Gmail Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    family: 4, // Force IPv4
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Support email for from address
const FROM_EMAIL = '"Artovia Studio" <artovia.business@gmail.com>';
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'artovia.business@gmail.com';

/**
 * Helper to send email
 */
async function sendEmail({ to, subject, html }) {
    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order) {
    const { userEmail, userName, id: orderId, total, items, paymentMethod } = order;

    const itemsList = items.map(item =>
        `• ${item.name} (Qty: ${item.quantity}) - Rs. ${item.price * item.quantity}`
    ).join('\n');

    return sendEmail({
        to: userEmail,
        subject: `Order Received - #${orderId.slice(0, 8).toUpperCase()} | Artovia Studio`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
                <div style="background: linear-gradient(135deg, #ec4899, #f472b6); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Artovia Studio</h1>
                </div>
                
                <div style="padding: 30px;">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Thank you for your order, ${userName}!</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6;">
                        We've received your order and it's being processed. Once we verify your payment, 
                        you'll receive another email with your download links.
                    </p>
                    
                    <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #6b7280;">Order ID</p>
                        <p style="margin: 0; font-size: 20px; font-weight: bold; color: #ec4899;">
                            #${orderId.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                    
                    <h3 style="color: #1f2937; margin-top: 25px;">Order Details</h3>
                    <div style="background: #f9fafb; border-radius: 8px; padding: 15px;">
                        <pre style="margin: 0; font-family: inherit; white-space: pre-wrap; color: #4b5563;">${itemsList}</pre>
                    </div>
                    
                    <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 15px;">
                        <p style="margin: 0; display: flex; justify-content: space-between;">
                            <span style="color: #6b7280;">Payment Method:</span>
                            <strong style="color: #1f2937; text-transform: capitalize;">${paymentMethod}</strong>
                        </p>
                        <p style="margin: 10px 0 0 0; display: flex; justify-content: space-between;">
                            <span style="color: #6b7280;">Total:</span>
                            <strong style="color: #ec4899; font-size: 18px;">Rs. ${total}</strong>
                        </p>
                    </div>
                    
                    <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 25px;">
                        <p style="margin: 0; color: #92400e;">
                            <strong>⏳ What's Next?</strong><br>
                            Complete your payment if you haven't already. We'll send your download links 
                            within 24 hours after payment verification.
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; margin-top: 25px; font-size: 14px;">
                        If you have any questions, reply to this email or contact us at 
                        <a href="mailto:${SUPPORT_EMAIL}" style="color: #ec4899;">${SUPPORT_EMAIL}</a>
                    </p>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} Artovia Studio. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    });
}

/**
 * Send order approval email with download links
 */
export async function sendOrderApprovalEmail(order, downloadLinks = []) {
    const { userEmail, userName, id: orderId, items } = order;

    // Create download page URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';
    const downloadPageUrl = `${siteUrl}/download/${orderId}`;

    const itemsList = items.map(item => `• ${item.name}`).join('<br>');

    return sendEmail({
        to: userEmail,
        subject: `Your Order is Approved! Download Ready - #${orderId.slice(0, 8).toUpperCase()} | Artovia Studio`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
                <div style="background: linear-gradient(135deg, #ec4899, #f472b6); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Artovia Studio</h1>
                </div>
                
                <div style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="background: #dcfce7; width: 80px; height: 80px; border-radius: 50%; 
                                    display: inline-flex; align-items: center; justify-content: center;">
                            <span style="font-size: 40px;">✓</span>
                        </div>
                    </div>
                    
                    <h2 style="color: #1f2937; text-align: center; margin-bottom: 20px;">
                        Great news, ${userName}! Your order is approved!
                    </h2>
                    
                    <p style="color: #4b5563; line-height: 1.6; text-align: center;">
                        Thank you for your purchase. Your payment has been verified and your files are ready for download.
                    </p>
                    
                    <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #6b7280;">Order ID</p>
                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #ec4899;">
                            #${orderId.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                    
                    <h3 style="color: #1f2937; margin-top: 25px;">Your Items</h3>
                    <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                        <p style="margin: 0; color: #4b5563;">${itemsList}</p>
                    </div>

                    <div style="text-align: center; padding: 20px;">
                        ${downloadLinks && downloadLinks.length > 0 ? `
                            <div style="margin-bottom: 20px;">
                                <p style="margin-bottom: 15px; color: #374151;">Here are your deliverables:</p>
                                ${downloadLinks.map(link => {
            const isFile = link.type === 'file' || !link.type; // Default to file if undefined
            const btnColor = isFile ? 'linear-gradient(135deg, #ec4899, #db2777)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)';
            const btnIcon = isFile ? '📥' : '🔗';
            const btnText = isFile ? `Download ${link.name || 'File'}` : `Access ${link.name || 'Link'}`;

            return `
                                    <a href="${link.url}" 
                                       style="display: inline-block; background: ${btnColor}; 
                                              color: white; padding: 14px 30px; border-radius: 30px; text-decoration: none; 
                                              font-weight: 600; font-size: 15px; margin: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                        ${btnIcon} ${btnText}
                                    </a><br>`;
        }).join('')}
                            </div>
                        ` : `
                            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; display: inline-block;">
                                <p style="margin: 0; color: #1e40af;">
                                    <strong>Processing:</strong> We are personalizing your order.<br>
                                    You will receive your files in a separate email shortly.
                                </p>
                            </div>
                        `}
                        
                        <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">
                            You can also view your order details at our <a href="${downloadPageUrl}" style="color: #ec4899;">Order Page</a>
                        </p>
                    </div>
                    
                    <div style="background: #dbeafe; border-radius: 8px; padding: 15px; margin-top: 25px;">
                        <p style="margin: 0; color: #1e40af;">
                            <strong>💡 Tip:</strong><br>
                            Bookmark your download page! You can access your files anytime at:<br>
                            <a href="${downloadPageUrl}" style="color: #ec4899; word-break: break-all;">${downloadPageUrl}</a>
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; margin-top: 25px; font-size: 14px; text-align: center;">
                        Thank you for choosing Artovia Studio!<br>
                        Questions? Email us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #ec4899;">${SUPPORT_EMAIL}</a>
                    </p>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} Artovia Studio. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    });
}

/**
 * Send admin notification for new order
 */
export async function sendAdminOrderNotification(order) {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'artovia.business@gmail.com';
    const { userName, userEmail, userPhone, id: orderId, total, items, paymentMethod } = order;

    const itemsList = items.map(item =>
        `• ${item.name} (Qty: ${item.quantity}) - Rs. ${item.price * item.quantity}`
    ).join('\n');

    return sendEmail({
        to: adminEmail,
        subject: `🛒 New Order Received - #${orderId.slice(0, 8).toUpperCase()} | Rs. ${total}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
                <div style="background: #1f2937; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🛒 New Order Received!</h1>
                </div>
                
                <div style="padding: 25px;">
                    <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #92400e;">
                            <strong>Action Required:</strong> Review and approve this order in the admin panel.
                        </p>
                    </div>
                    
                    <h3 style="color: #1f2937; margin-bottom: 15px;">Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                            <td style="padding: 8px 0; font-weight: bold;">#${orderId.slice(0, 8).toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Customer:</td>
                            <td style="padding: 8px 0; font-weight: bold;">${userName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                            <td style="padding: 8px 0;"><a href="mailto:${userEmail}">${userEmail}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
                            <td style="padding: 8px 0;">${userPhone || 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Payment:</td>
                            <td style="padding: 8px 0; text-transform: capitalize;">${paymentMethod}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Total:</td>
                            <td style="padding: 8px 0; font-weight: bold; color: #ec4899; font-size: 18px;">Rs. ${total}</td>
                        </tr>
                    </table>
                    
                    <h3 style="color: #1f2937; margin-top: 20px;">Items Ordered</h3>
                    <div style="background: #f9fafb; border-radius: 8px; padding: 15px;">
                        <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>
                    </div>
                    
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" 
                           style="display: inline-block; background: #ec4899; color: white; padding: 12px 30px; 
                                  border-radius: 25px; text-decoration: none; font-weight: 500;">
                            View in Admin Panel
                        </a>
                    </div>
                </div>
            </div>
        `,
    });
}
