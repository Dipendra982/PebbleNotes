
import net from 'net';
import tls from 'tls';

const HOST = 'smtp.gmail.com';
const PORT_465 = 465;
const PORT_587 = 587;

function testTcp(port) {
    return new Promise((resolve) => {
        console.log(`\nTesting raw TCP to ${HOST}:${port}...`);
        const start = Date.now();
        const socket = net.createConnection(port, HOST, () => {
            console.log(`✅ TCP Connected to ${HOST}:${port} in ${Date.now() - start}ms`);
        });

        socket.on('data', (data) => {
            console.log(`📨 Received data from ${port}: ${data.toString().trim()}`);
            socket.end();
            resolve(true);
        });

        socket.on('error', (err) => {
            console.error(`❌ TCP Failed to ${HOST}:${port}: ${err.message}`);
            resolve(false);
        });

        socket.setTimeout(10000, () => {
            console.error(`❌ TCP Timeout (no data received) to ${HOST}:${port}`);
            socket.destroy();
            resolve(false);
        });
    });
}

function testTls(port) {
    return new Promise((resolve) => {
        console.log(`\nTesting TLS to ${HOST}:${port}...`);
        const start = Date.now();
        const socket = tls.connect(port, HOST, { rejectUnauthorized: false }, () => {
            console.log(`✅ TLS Connected to ${HOST}:${port} in ${Date.now() - start}ms`);
        });

        socket.on('data', (data) => {
            console.log(`📨 Received TLS data from ${port}: ${data.toString().trim()}`);
            socket.end();
            resolve(true);
        });

        socket.on('error', (err) => {
            console.error(`❌ TLS Failed to ${HOST}:${port}: ${err.message}`);
            resolve(false);
        });

        socket.setTimeout(10000, () => {
            console.error(`❌ TLS Timeout (no data received) to ${HOST}:${port}`);
            socket.destroy();
            resolve(false);
        });
    });
}

async function main() {
    await testTcp(PORT_587); // Should receive 220
    // await testTcp(PORT_465); // 465 is SSL, random TCP read might be garbage or nothing until SSL handshake

    // 465 expects immediate TLS
    await testTls(PORT_465); // Should receive 220
}

main();
