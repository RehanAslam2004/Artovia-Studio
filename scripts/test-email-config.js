import nodemailer from 'nodemailer';
// dotenv handled by node --env-file

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log('User:', process.env.GMAIL_USER ? 'Set' : 'Missing');
    console.log('Pass:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing');

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env.local');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Send to self
            subject: 'Test Email form Artovia Debugger',
            text: 'If you see this, email is working!',
        });
        console.log('✅ Email Sent:', info.messageId);
    } catch (error) {
        console.error('❌ Email Test Failed:', error);
    }
}

testEmail();
