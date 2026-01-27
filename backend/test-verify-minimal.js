
import nodemailer from 'nodemailer';

async function main() {
    console.log('--- Minimal Hardcoded Email Test ---');

    // Hardcoded credentials from .env usage seen in logs
    // SMTP_USER=sahdipendra400@gmail.com
    // SMTP_PASS=hmxnoovatzrguwgt

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: 'sahdipendra400@gmail.com',
            pass: 'hmxnoovatzrguwgt'
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000,
        debug: true,
        logger: true
    });

    try {
        console.log('Verifying...');
        await transporter.verify();
        console.log('✅ Connection successful!');
    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

main();
