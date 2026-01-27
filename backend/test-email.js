
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkConnection(host, port, secure) {
    console.log(`\nTesting connection to ${host}:${port} (secure: ${secure})...`);
    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 10000, // 10s timeout
            logger: true,
            debug: true
        });

        await transporter.verify();
        console.log(`✅ Connection successful to ${host}:${port}`);
        return true;
    } catch (error) {
        console.error(`❌ Connection failed to ${host}:${port}:`, error.message);
        if (error.code) console.error(`   Code: ${error.code}`);
        return false;
    }
}

async function main() {
    console.log('--- Email Connectivity Test ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);

    // 1. Test current configuration (likely 465)
    // We'll trust the env vars first, but if they are the problem, we'll try overrides.
    const currentPort = parseInt(process.env.SMTP_PORT || '587');
    const currentSecure = process.env.SMTP_SECURE === 'true';

    console.log('Current Config from .env:');
    await checkConnection(process.env.SMTP_HOST, currentPort, currentSecure);

    // 2. Test common alternative: 587 (STARTTLS)
    if (currentPort !== 587) {
        console.log('\nTrying alternative: Port 587 (secure: false)...');
        await checkConnection(process.env.SMTP_HOST, 587, false);
    }

    // 3. Test common alternative: 465 (SSL/TLS)
    if (currentPort !== 465) {
        console.log('\nTrying alternative: Port 465 (secure: true)...');
        await checkConnection(process.env.SMTP_HOST, 465, true);
    }
}

main().catch(console.error);
