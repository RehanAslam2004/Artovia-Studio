/**
 * Email Service (Nodemailer + Gmail)
 * =================================
 * Handles sending emails via Gmail SMTP
 */

import nodemailer from 'nodemailer';
import { Writable } from 'stream';
import { ZipArchive } from 'archiver';

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
 * Helper to get the site URL with robust fallback
 */
function getSiteUrl() {
    // 1. Check explicitly set site URL
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        const url = process.env.NEXT_PUBLIC_SITE_URL;
        // Ignore localhost to force production URL
        if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
            return url.replace(/\/$/, '');
        }
    }

    // 2. Check Custom Domain or Hardcoded Production URL
    // We intentionally SKIP process.env.NEXT_PUBLIC_VERCEL_URL because it often points to 
    // password-protected preview deployments (causing Vercel Login screen).

    // Default to strict production URL
    return 'https://artovia-studio.vercel.app';
}

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
 * Helper to send email with attachments
 */
async function sendEmailWithAttachments({ to, subject, html, attachments = [] }) {
    try {
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to,
            subject,
            html,
            attachments,
        });
        console.log('Email with attachments sent:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('Email with attachments send error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Helper to generate base email template
 * Wraps content in a consistent header/footer design
 */
function generateBaseTemplate({ title, body, previewText }) {
    const siteUrl = getSiteUrl();
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
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #9a3412;">Please ensure you have completed the payment transfer if you haven't already.</p>
        </div>

        ${order.notes ? `
        <div style="margin-top: 25px; border: 1px dashed #d1d5db; padding: 15px; border-radius: 8px;">
            <strong style="color: #4b5563;">Your Customization Request:</strong>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280; white-space: pre-wrap;">${order.notes}</p>
        </div>
        ` : ''}
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
    const siteUrl = getSiteUrl();
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
    const siteUrl = getSiteUrl();

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

        ${order.notes ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <strong>📝 Customization Details:</strong>
            <p style="margin-top: 5px; white-space: pre-wrap;">${order.notes}</p>
        </div>
        ` : ''}

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
    const siteUrl = getSiteUrl();
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

/**
 * Send custom request notification to admin and confirmation to customer
 */
export async function sendCustomRequestNotification(requestData) {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'artovia.business@gmail.com';
    const { name, email, type, details, referenceImage } = requestData;
    const siteUrl = getSiteUrl();

    const typeLabel = type === 'custom-design' ? 'Custom Design' : 'Customize Bundle';

    // 1. Send Admin Notification
    const adminBody = `
        <h2>✨ New Custom Request</h2>
        <div class="highlight-box" style="background-color: #f5f3ff; border-color: #ddd6fe;">
            <div class="info-label">Request Type</div>
            <div class="info-value" style="color: #7c3aed;">${typeLabel}</div>
        </div>

        <h3>Customer Details</h3>
        <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
        </ul>

        <h3>Project Details</h3>
        <p style="white-space: pre-wrap; background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">${details}</p>

        ${referenceImage ? `
        <div style="margin-top: 20px;">
            <strong>🖼️ Reference Image:</strong><br>
            <a href="${referenceImage}" target="_blank">
                <img src="${referenceImage}" alt="Reference" style="max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #e5e7eb;">
            </a>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${email}?subject=Re: Your Custom Request - Artovia Studio" class="button" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.4);">
                Reply to Customer →
            </a>
        </div>
    `;

    await sendEmail({
        to: adminEmail,
        subject: `[New Custom Request] ${typeLabel} - from ${name}`,
        html: generateBaseTemplate({
            title: 'New Custom Request',
            previewText: `New ${typeLabel} request from ${name}`,
            body: adminBody
        })
    });

    // 2. Send Customer Confirmation
    const customerBody = `
        <h2>Request Received! 🎨</h2>
        <p>Hi ${name},</p>
        <p>Thank you for reaching out! We've received your custom request for a <strong>${typeLabel}</strong>. Our team is currently reviewing the details you provided.</p>
        
        <div class="highlight-box">
            <h3 style="margin-top: 0; font-size: 16px;">What Happens Next?</h3>
            <ol style="margin-bottom: 0;">
                <li>We'll review your requirements and any reference images.</li>
                <li>We'll get back to you with a quote or clarification within 24-48 hours.</li>
                <li>Once agreed, we'll start crafting your unique design!</li>
            </ol>
        </div>

        <h3>Summary of Your Request:</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px;">
            <strong>Details:</strong><br>
            <p style="white-space: pre-wrap; margin-top: 5px;">${details}</p>
        </div>

        <p style="margin-top: 25px;">If you have any more details to share, simply reply to this email!</p>
    `;

    return sendEmail({
        to: email,
        subject: `We've received your custom request! - Artovia Studio`,
        html: generateBaseTemplate({
            title: 'Request Confirmed',
            previewText: 'Thanks for your interest in a custom design!',
            body: customerBody
        })
    });
}

/**
 * Send custom quote email to customer with price and payment instructions
 */
export async function sendCustomQuoteEmail(requestData, price) {
    const { name, email, type, details, id: requestId } = requestData;
    const siteUrl = getSiteUrl();
    const typeLabel = type === 'custom-design' ? 'Custom Design' : 'Customize Bundle';

    const body = `
        <h2>Quote Ready! 🎨✨</h2>
        <p>Hi ${name},</p>
        <p>We've reviewed your request for a <strong>${typeLabel}</strong> and we're excited to work on it! Here is the quoted price based on your requirements:</p>
        
        <div class="highlight-box" style="text-align: center; background-color: #fdf2f8; border-color: #fbcfe8;">
            <div class="info-label">Total Amount</div>
            <div class="info-value" style="color: #ec4899; font-size: 32px;">Rs. ${price}</div>
        </div>

        <h3>Next Steps</h3>
        <p>To proceed with your custom design, please complete the payment of <strong>Rs. ${price}</strong> using any of the methods below:</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <div style="margin-bottom: 15px;">
                <strong style="color: #4b5563;">Option 1: EasyPaisa / JazzCash</strong><br>
                <span>0347 1148481 (Rehan Aslam)</span>
            </div>
            <div>
                <strong style="color: #4b5563;">Option 2: SadaPay (IBAN)</strong><br>
                <code style="background-color: #fff; padding: 5px; border-radius: 4px; display: block; border: 1px dashed #d1d5db; margin-top: 5px;">PK96SADA0000003191946061</code>
            </div>
        </div>

        <p>After payment, please reply to this email with your **Transaction ID** or a **Screenshot** of the payment confirmation. Once verified, we will start working on your design immediately!</p>

        <div style="margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
             <strong>Project Reference:</strong><br>
             <p style="white-space: pre-wrap; margin-top: 5px;">${details}</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: `Quote Ready: Your Custom Design - Artovia Studio`,
        html: generateBaseTemplate({
            title: 'Quote Ready',
            previewText: `Your quote for ${typeLabel} is ready: Rs. ${price}`,
            body
        })
    });
}


/**
 * Send preset delivery email with DNG files attached as ZIP
 * @param {Object} order - Order data
 * @param {Array} presetFiles - Array of { name, url } objects for DNG files
 */
export async function sendPresetDeliveryEmail(order, presetFiles = []) {
    const { userEmail, userName, id: orderId } = order;
    const siteUrl = getSiteUrl();
    const downloadPageUrl = `${siteUrl}/download/${orderId}`;

    // Build file list HTML
    const fileListHtml = presetFiles.map(f =>
        `<div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #ec4899; font-size: 18px;">📸</span>
            <span style="font-weight: 500; color: #374151;">${f.name}</span>
        </div>`
    ).join('');

    const body = `
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: #dcfce7; padding: 15px; border-radius: 50%;">
                <span style="font-size: 32px; line-height: 1;">✅</span>
            </div>
        </div>

        <h2 style="text-align: center;">Your Presets are Ready! 📸</h2>
        <p>Great news, <strong>${userName}</strong>! Your payment has been verified and your Lightroom presets are attached to this email.</p>
        
        <div class="highlight-box" style="text-align: center;">
            <div class="info-label">Order ID</div>
            <div class="info-value">#${orderId.slice(0, 8).toUpperCase()}</div>
        </div>

        <h3>📦 Attached Files</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${fileListHtml}
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 13px; color: #6b7280;">
                    <strong>📎 Check the attachment below</strong> — Your presets are packed in a ZIP folder ready to import into Lightroom.
                </p>
            </div>
        </div>

        <div style="margin-top: 25px; background-color: #eff6ff; border: 1px solid #dbeafe; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af;">💡 How to Import</h3>
            <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #3b82f6;">
                <li>Download the attached ZIP file</li>
                <li>Extract the .DNG file(s)</li>
                <li>Open Lightroom Mobile → Import the DNG file</li>
                <li>Copy the preset settings and apply to your photos!</li>
            </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadPageUrl}" class="button" style="font-size: 16px; padding: 16px 40px;">
                View Order Details 📋
            </a>
        </div>

        <p style="text-align: center; font-size: 14px; margin-top: 30px; color: #9ca3af;">
            You can also access your order anytime from your 
            <a href="${downloadPageUrl}" style="color: #ec4899; font-weight: 600;">Order Page</a>.
        </p>
    `;

    // Build ZIP attachment with DNG files
    let attachments = [];
    try {
        console.log(`[Preset Email] Building ZIP for ${presetFiles.length} DNG file(s)...`);

        // Create ZIP buffer in memory
        const zipBuffer = await new Promise(async (resolve, reject) => {
            const chunks = [];
            const writable = new Writable({
                write(chunk, encoding, callback) {
                    chunks.push(chunk);
                    callback();
                }
            });

            const archive = new ZipArchive({ zlib: { level: 5 } });

            writable.on('finish', () => resolve(Buffer.concat(chunks)));
            archive.on('error', (err) => reject(err));
            archive.pipe(writable);

            // Download each DNG and add to ZIP
            for (const file of presetFiles) {
                try {
                    console.log(`[Preset Email] Downloading: ${file.name} from ${file.url}`);
                    const response = await fetch(file.url);
                    if (!response.ok) {
                        console.error(`[Preset Email] Failed to fetch ${file.name}: ${response.statusText}`);
                        continue;
                    }
                    const fileBuffer = Buffer.from(await response.arrayBuffer());
                    archive.append(fileBuffer, { name: file.name });
                    console.log(`[Preset Email] Added ${file.name} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
                } catch (fileErr) {
                    console.error(`[Preset Email] Error downloading ${file.name}:`, fileErr);
                }
            }

            archive.finalize();
        });

        const zipSizeMB = (zipBuffer.length / 1024 / 1024).toFixed(2);
        console.log(`[Preset Email] ZIP created: ${zipSizeMB} MB`);

        // Gmail limit is ~25MB for attachments
        if (zipBuffer.length < 24 * 1024 * 1024) {
            const zipFileName = `Artovia-Presets-${orderId.slice(0, 8).toUpperCase()}.zip`;
            attachments = [{
                filename: zipFileName,
                content: zipBuffer,
                contentType: 'application/zip',
            }];
        } else {
            console.warn(`[Preset Email] ZIP too large (${zipSizeMB} MB), skipping attachment. Will rely on download links.`);
        }
    } catch (zipError) {
        console.error('[Preset Email] Failed to create ZIP:', zipError);
        // Proceed without attachment — email still sends with download page link
    }

    return sendEmailWithAttachments({
        to: userEmail,
        subject: `Your Presets are Ready! 📸 - #${orderId.slice(0, 8).toUpperCase()}`,
        html: generateBaseTemplate({
            title: 'Presets Delivered',
            previewText: 'Your Lightroom presets are attached and ready to use!',
            body
        }),
        attachments,
    });
}




