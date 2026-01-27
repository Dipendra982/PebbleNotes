
import { sendMail } from './simple-mailer.js';

async function main() {
    console.log('--- Testing Custom Simple Mailer ---');
    try {
        await sendMail({
            to: process.env.SMTP_USER || 'sahdipendra400@gmail.com', // Send to self
            subject: 'Test Email from Simple Mailer',
            text: 'This is a test email sent via raw TLS socket to verify connectivity.',
            html: '<h3>Test Email</h3><p>This is a test email sent via raw TLS socket to verify connectivity.</p>'
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email failed:', error);
    }
}

main();
