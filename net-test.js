const net = require('net');
const dns = require('dns');

console.log('Resolving smtp.gmail.com...');

dns.resolve4('smtp.gmail.com', (err, addresses) => {
    if (err) {
        console.error('DNS Resolution failed:', err);
        return;
    }
    console.log('IPv4 Addresses:', addresses);

    if (addresses.length > 0) {
        const ip = addresses[0];
        console.log(`\nTesting TCP connection to ${ip}:587 (IPv4 directly)...`);

        const socket = new net.Socket();
        socket.setTimeout(5000); // 5s timeout

        socket.on('connect', () => {
            console.log('✅ TCP Connection successful!');
            socket.destroy();
        });

        socket.on('timeout', () => {
            console.log('❌ Connection timed out (Firewall likely blocking port 587)');
            socket.destroy();
        });

        socket.on('error', (err) => {
            console.log('❌ Connection error:', err.message);
        });

        socket.connect(587, ip);
    }
});
