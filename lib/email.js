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
 * Helper to generate base email template
 * Wraps content in a consistent header/footer design
 */
function generateBaseTemplate({ title, body, previewText }) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';
    const year = new Date().getFullYear();

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; }
            .header { background: linear-gradient(135deg, #ec4899, #f472b6); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
            .content { padding: 40px 30px; line-height: 1.6; color: #4b5563; }
            .footer { background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 13px; color: #9ca3af; }
            .footer a { color: #ec4899; text-decoration: none; }
            .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #db2777); color: white; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(236, 72, 153, 0.4); }
            h2 { color: #1f2937; margin-top: 0; margin-bottom: 20px; font-size: 22px; }
            h3 { color: #374151; margin-top: 25px; margin-bottom: 10px; font-size: 18px; }
            .highlight-box { background-color: #fdf2f8; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #fbcfe8; }
            .info-label { color: #6b7280; font-size: 14px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-value { color: #ec4899; font-size: 20px; font-weight: 700; }
            ul { padding-left: 20px; margin-bottom: 20px; }
            li { margin-bottom: 8px; }
            @media only screen and (max-width: 480px) {
                .content { padding: 25px 20px; }
                .header { padding: 25px; }
            }
        </style>
    </head>
    <body>
        <div style="display: none; max-height: 0px; overflow: hidden;">
            ${previewText || title}
        </div>
        
        <div class="container">
            <div class="header">
                <h1>Artovia Studio</h1>
            </div>
            
            <div class="content">
                ${body}
                
                <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Best regards,<br>
                    <strong>The Artovia Studio Team</strong>
                </p>
            </div>
            
            <div class="footer">
                <p style="margin-bottom: 10px;">
                    Questions? Email us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
                </p>
                <p>
                    © ${year} Artovia Studio. All rights reserved.<br>
                    Made with ❤️ in Pakistan
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order) {
    const { userEmail, userName, id: orderId, total, items, paymentMethod } = order;

    const itemsList = items.map(item =>
        `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f3f4f6; padding: 8px 0;">
            <span>${item.name} <span style="color: #9ca3af; font-size: 13px;">(x${item.quantity})</span></span>
            <strong>Rs. ${item.price * item.quantity}</strong>
        </div>`
    ).join('');

    const body = `
        <h2>Order Received! 🛍️</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for shopping with us! We have received your order and are currently processing it. Once we verify your payment, you'll receive another email with your download links.</p>
        
        <div class="highlight-box" style="text-align: center;">
            <div class="info-label">Order Reference</div>
            <div class="info-value">#${orderId.slice(0, 8).toUpperCase()}</div>
        </div>
        
        <h3>Order Summary</h3>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
            ${itemsList}
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 18px;">
                <strong>Total</strong>
                <strong style="color: #ec4899;">Rs. ${total}</strong>
            </div>
        </div>

        <div style="margin-top: 25px; background-color: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 8px;">
            <strong style="color: #9a3412;">💳 Payment Method: <span style="text-transform: capitalize;">${paymentMethod}</span></strong>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #9a3412;">Please ensure you have completed the payment transfer if you haven't already.</p>
        </div>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Order Confirmation - #${orderId.slice(0, 8).toUpperCase()}`,
        html: generateBaseTemplate({
            title: 'Order Confirmation',
            previewText: `Thanks for your order! Total: Rs. ${total}`,
            body
        })
    });
}

/**
 * Send order approval email with download links
 */
export async function sendOrderApprovalEmail(order, downloadLinks = []) {
    const { userEmail, userName, id: orderId } = order;

    // Create download page URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';
    const downloadPageUrl = `${siteUrl}/download/${orderId}`;

    const linksHtml = downloadLinks.length > 0
        ? `<div style="text-align: center; margin: 30px 0;">
            ${downloadLinks.map(link => `
                <a href="${link.url}" class="button" style="margin: 5px;">
                    Download ${link.name || 'File'} 📥
                </a>
            `).join('')}
           </div>`
        : `<div class="highlight-box" style="background-color: #eff6ff; border-color: #dbeafe;">
            <strong>Processing Files...</strong>
            <p style="margin: 5px 0 0 0; font-size: 14px;">We are finalizing your personalized files. You will receive a separate email shortly.</p>
           </div>`;

    const body = `
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: #dcfce7; padding: 15px; border-radius: 50%;">
                <span style="font-size: 32px; line-height: 1;">✅</span>
            </div>
        </div>

        <h2 style="text-align: center;">Order Approved & Ready!</h2>
        <p>Great news, <strong>${userName}</strong>! Your payment has been verified and your files are ready for you.</p>
        
        <div class="highlight-box" style="text-align: center;">
            <div class="info-label">Order ID</div>
            <div class="info-value">#${orderId.slice(0, 8).toUpperCase()}</div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadPageUrl}" class="button" style="font-size: 16px; padding: 16px 40px;">
                Access Your Downloads 📥
            </a>
        </div>

        <h3 style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 16px;">Quick Access Links</h3>
        ${linksHtml}

        <p style="text-align: center; font-size: 14px; margin-top: 30px; color: #9ca3af;">
            You can also access your downloads anytime from your 
            <a href="${downloadPageUrl}" style="color: #ec4899; font-weight: 600;">Order Page</a>.
        </p>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Your Order is Ready! 🎨 - #${orderId.slice(0, 8).toUpperCase()}`,
        html: generateBaseTemplate({
            title: 'Order Approved',
            previewText: 'Your files are ready to download!',
            body
        })
    });
}

/**
 * Send admin notification for new order
 */
export async function sendAdminOrderNotification(order) {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'artovia.business@gmail.com';
    const { userName, userEmail, id: orderId, total, items } = order;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';

    const itemsSummary = items.map(i => `${i.name} (x${i.quantity})`).join(', ');

    const body = `
        <h2>🛒 New Order Received</h2>
        <div class="highlight-box" style="background-color: #fff7ed; border-color: #ffedd5;">
            <div class="info-label">Order Value</div>
            <div class="info-value">Rs. ${total}</div>
        </div>

        <h3>Customer Details</h3>
        <ul>
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>ID:</strong> #${orderId}</li>
        </ul>

        <h3>Items</h3>
        <p>${itemsSummary}</p>

        <div style="text-align: center; margin-top: 30px;">
            <a href="${siteUrl}/admin/orders" class="button">
                Process Order in Admin Panel →
            </a>
        </div>
    `;

    return sendEmail({
        to: adminEmail,
        subject: `[New Order] #${orderId.slice(0, 8).toUpperCase()} - Rs. ${total}`,
        html: generateBaseTemplate({
            title: 'New Admin Order',
            previewText: `New order from ${userName} for Rs. ${total}`,
            body
        })
    });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(user) {
    const { email, displayName } = user;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com';
    const name = displayName || 'Creator';

    const body = `
        <h2>Welcome to Artovia Studio! ✨</h2>
        <p>Hi ${name},</p>
        <p>We're thrilled to have you join our creative community! At Artovia Studio, we provide premium digital designs to help you create stunning projects effortlessly.</p>
        
        <h3>What you can do next:</h3>
        <ul>
            <li>🎨 <strong>Explore Templates:</strong> Browse our collection of wedding cards, business stationery, and social media kits.</li>
            <li>💾 <strong>Instant Access:</strong> All your purchases are digital downloads, available immediately after approval.</li>
            <li>⭐ <strong>Rate & Review:</strong> Share your experience with products you love.</li>
        </ul>

        <div style="text-align: center; margin: 40px 0;">
            <a href="${siteUrl}/shop" class="button">
                Start Browsing Collection
            </a>
        </div>
        
        <p>If you need any help finding the perfect design, just reply to this email!</p>
    `;

    return sendEmail({
        to: email,
        subject: 'Welcome to Artovia Studio! 🎨',
        html: generateBaseTemplate({
            title: 'Welcome',
            previewText: 'Thanks for joining Artovia Studio! Here is what you can do next...',
            body
        })
    });
}
