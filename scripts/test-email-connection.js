
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Manually parse .env.local
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('Environment variables loaded from .env.local');
} catch (err) {
    console.warn('Could not read .env.local', err.message);
}

async function testEmail() {
    console.log('Testing Email Connection...');
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    console.log('User:', user);
    console.log('Password set:', !!pass);

    if (!user || !pass) {
        console.error('❌ Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env.local');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        family: 4,
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection Successful! Credentials are valid.');
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error);
        console.error('Please check your GMAIL_USER and GMAIL_APP_PASSWORD.');
        console.error('Note: You must use an App Password, not your regular Google password.');
    }
}

testEmail();
