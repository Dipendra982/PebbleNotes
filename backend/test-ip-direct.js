
import nodemailer from 'nodemailer';
import net from 'net';

async function main() {
    console.log('--- Socket Injection Test ---');
    console.log('Connecting via net.createConnection...');

    const socket = net.createConnection(587, 'smtp.gmail.com');

    socket.on('connect', async () => {
        console.log('✅ net socket connected! Passing to Nodemailer...');

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'sahdipendra400@gmail.com',
                pass: 'hmxnoovatzrguwgt'
            },
            // Inject the working socket
            // Nodemailer >= 6.x supports 'socket' in options, or maybe it's passed via connection object?
            // Actually, for SMTP transport, if we pass 'socket', it uses it.
            // But we must be careful: Nodemailer might try to do TLS upgrade (STARTTLS).
            // Since we are on 587, we want STARTTLS.
            name: 'pebblenotes.local', // equivalent to 'clientName'
        });

        // We can't just pass 'socket' to createTransport because createTransport returns a Transporter,
        // and the connection is created on demand (sendMail/verify).
        // 
        // We need to use a custom transport or hook into the connection phase.
        // Furtuntely, 'smtp' transport has a `getSocket` option? No.

        // Actually, looking at docs: 
        // "socket" property in the configuration object.

        const transporterWithSocket = nodemailer.createTransport({
            pool: false, // Must be false to use a single socket
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'sahdipendra400@gmail.com',
                pass: 'hmxnoovatzrguwgt'
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true,
            logger: true
        });

        // HACK: We can't easily pass the socket to standard Nodemailer transport factory for *re-use*.
        // But we can try to rely on the fact that if we provide a `connection` object it uses it?
        // No.

        // ALTERNATIVE: Use the `stream` transport? No, that's for output.
    });

    // WAIT! 
    // If I can't pass 'socket' easily, I'll try to use the `net` module within a custom `connect` function.

    // Nodemailer allows `getSocket(options, callback)`?
    // No.

    // But `smtp-connection` has a `connect` method so...

    // Let's try to overwrite the `connect` handling if possible?
    // Unlikely.

    console.log("Wait, let's try a different approach in this script.");
    console.log("We will just TRY to pass 'socket' check if it works.");
}

// Retrying with correct logic:
// Nodemailer doesn't officially document passing 'socket' to createTransport for SMTP.
// But some underlying libs might use it.
//
// Actually, I'll try this:
// `test-net.js` worked. `test-email.js` failed.
// Maybe I should write a tiny wrapper that mimics `nodemailer` but uses `net`?
// No, that's complex.

// Let's go back to looking at WHY `nodemailer` fails.
// Is it because `dns` lookup in `nodemailer` returns something `net` doesn't like?
// `test-verify-minimal.js` output:
// [FtEuRbDpvHM] Resolved smtp.gmail.com as 142.250.4.109 [cache miss]
// This is correct.

// I will try to use `ip` address directly in `nodemailer` to bypass DNS lookup inside `nodemailer`.
// host: '142.250.4.109'

const transporter = nodemailer.createTransport({
    host: '142.250.4.109', // Direct IP
    port: 587,
    secure: false,
    auth: {
        user: 'sahdipendra400@gmail.com',
        pass: 'hmxnoovatzrguwgt'
    },
    tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com' // SNI needed for TLS
    },
    debug: true,
    logger: true
});

transporter.verify().then(() => console.log('✅ Success IP!')).catch(e => console.error('❌ Failed IP:', e));

main();
