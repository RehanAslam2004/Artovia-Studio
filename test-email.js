const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Manually parse .env.local
try {
    console.log('Reading .env.local...');
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            // Match KEY=VALUE, handling potential comments
            const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
            if (match && !line.trim().startsWith('#')) {
                const key = match[1].trim();
                let value = match[2] ? match[2].trim() : '';
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
        console.log('✅ Environment variables loaded.');
    } else {
        console.error('❌ .env.local file not found!');
    }
} catch (e) {
    console.error('❌ Error reading .env.local:', e.message);
}

async function testEmail() {
    console.log('\nTesting Gmail Configuration...');
    console.log('User:', process.env.GMAIL_USER);
    console.log('Password set:', process.env.GMAIL_APP_PASSWORD ? 'Yes (' + process.env.GMAIL_APP_PASSWORD.length + ' chars)' : 'No');

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ Missing credentials in environment variables.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: '142.251.127.108', // Hardcoded Google SMTP IPv4 for testing
        port: 587,
        secure: false, // Use STARTTLS
        family: 4, // Force IPv4
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verification successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Send to self
            subject: 'Test Email from Artovia Debugger',
            text: 'If you receive this, the email configuration is working correctly!',
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error occurred:');
        console.error(error);
    }
}

testEmail();
