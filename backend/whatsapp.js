const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

let client;
let isReady = false;

function initializeWhatsApp() {
    console.log('WhatsApp Engine initializing explicitly...');
    const store = new MongoStore({ mongoose: mongoose });
    
    client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000 
        }),
        puppeteer: {
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage', 
                '--disable-accelerated-2d-canvas', 
                '--no-first-run', 
                '--no-zygote', 
                '--single-process', 
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', (qr) => {
        console.log('================================================================');
        console.log('QR Code received! (Attempting to draw inside terminal...)');
        qrcode.generate(qr, { small: true });
        
        // Render logs notoriously distort QR code text heights. We generate a direct graphic link!
        const cleanQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
        console.log('\n🚨 IF THE TERMINAL QR CODE ABOVE IS DISTORTED OR BLURRY:');
        console.log('Simply click the link below to view it perfectly clear in your browser:');
        console.log(cleanQrUrl);
        console.log('================================================================\n');
    });

    client.on('remote_session_saved', () => {
        console.log('WhatsApp Session successfully backed up to MongoDB Atlas!');
    });

    client.on('authenticated', () => {
        console.log('WhatsApp Client authenticated!');
    });

    client.on('ready', () => {
        console.log('WhatsApp Client is ready!');
        isReady = true;
    });

    client.on('auth_failure', () => {
        console.error('WhatsApp Authentication failed. QR code scan required.');
    });

    client.initialize().catch(err => {
        console.error('Failed to initialize WhatsApp Client:', err);
    });
}

async function sendGroupMessage(groupName, message) {
    if (!isReady || !client) {
        console.error('WhatsApp client is not ready. Cannot send message.');
        return;
    }

    try {
        const chats = await client.getChats();
        const groupChat = chats.find(chat => chat.isGroup && chat.name === groupName);

        if (groupChat) {
            await client.sendMessage(groupChat.id._serialized, message);
            console.log(`Successfully sent message to group: ${groupName}`);
        } else {
            console.error(`Group "${groupName}" not found. Message aborted.`);
        }
    } catch (err) {
        console.error('Failed to send group message:', err);
    }
}

module.exports = {
    sendGroupMessage,
    getClient: () => client,
    initializeWhatsApp
};
