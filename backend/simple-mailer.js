
import tls from 'tls';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || `PebbleNotes <${process.env.SMTP_USER}>`
};

export async function sendMail({ to, subject, text, html }) {
    return new Promise((resolve, reject) => {
        const socket = tls.connect(SMTP_CONFIG.port, SMTP_CONFIG.host, { rejectUnauthorized: false });

        let step = 0;
        let buffer = '';

        socket.setEncoding('utf8');

        function send(cmd) {
            // console.log(`[SMTP_DEBUG_SEND] ${cmd.substring(0, 50)}`); 
            socket.write(cmd + '\r\n');
        }

        socket.on('secureConnect', () => {
            console.log('✅ Connected securely to SMTP server');
        });

        socket.on('data', (data) => {
            buffer += data;
            // Process line by line
            let lines = buffer.split('\r\n');
            // Keep the last partial line in buffer
            if (!buffer.endsWith('\r\n')) {
                buffer = lines.pop(); // Remove partial line and store back in buffer
            } else {
                buffer = ''; // buffer fully consumed
                lines.pop(); // Remove empty string from trailing split
            }

            for (const line of lines) {
                console.log(`< ${line}`);
                const code = line.substring(0, 3);
                const isMultiLine = line.charAt(3) === '-';

                if (isMultiLine) continue; // Waiting for final line of response

                // State Machine
                if (step === 0 && code === '220') {
                    // Greeting -> EHLO
                    step++;
                    send(`EHLO pebblenotes.local`);
                } else if (step === 1 && code === '250') {
                    // EHLO OK -> AUTH LOGIN
                    step++;
                    send('AUTH LOGIN');
                } else if (step === 2 && code === '334') {
                    // Username prompt (expecting something like 334 VXNlcm5hbWU6)
                    step++;
                    send(Buffer.from(SMTP_CONFIG.user).toString('base64'));
                } else if (step === 3 && code === '334') {
                    // Password prompt
                    step++;
                    send(Buffer.from(SMTP_CONFIG.pass).toString('base64'));
                } else if (step === 4 && code === '235') {
                    // Auth OK -> MAIL FROM
                    step++;
                    send(`MAIL FROM:<${SMTP_CONFIG.user}>`);
                } else if (step === 5 && code === '250') {
                    // MAIL FROM OK -> RCPT TO
                    step++;
                    send(`RCPT TO:<${to}>`);
                } else if (step === 6 && code === '250') {
                    // RCPT TO OK -> DATA
                    step++;
                    send('DATA');
                } else if (step === 7 && code === '354') {
                    // Start mail input -> Send content
                    step++;

                    const boundary = 'NextPart_PEBBLE_' + Date.now();
                    const message = [
                        `From: ${SMTP_CONFIG.from}`,
                        `To: ${to}`,
                        `Subject: ${subject}`,
                        `MIME-Version: 1.0`,
                        `Content-Type: multipart/alternative; boundary="${boundary}"`,
                        '',
                        `--${boundary}`,
                        `Content-Type: text/plain; charset=utf-8`,
                        `Content-Transfer-Encoding: 7bit`,
                        '',
                        text,
                        '',
                        `--${boundary}`,
                        `Content-Type: text/html; charset=utf-8`,
                        `Content-Transfer-Encoding: 7bit`,
                        '',
                        html || text,
                        '',
                        `--${boundary}--`,
                        '.'
                    ].join('\r\n');

                    send(message);
                } else if (step === 8 && code === '250') {
                    // Message queued -> QUIT
                    step++;
                    send('QUIT');
                    socket.end();
                    resolve({ messageId: 'custom-success' });
                } else if (code.startsWith('4') || code.startsWith('5')) {
                    // Error response
                    console.error(`SMTP Error: ${line}`);
                    socket.destroy();
                    reject(new Error(`SMTP Error: ${line}`));
                }
            }
        });

        socket.on('error', (err) => {
            console.error('Socket error:', err);
            reject(err);
        });

        socket.setTimeout(20000, () => {
            console.error('Socket timeout');
            socket.destroy();
            reject(new Error('Socket timeout'));
        });
    });
}
