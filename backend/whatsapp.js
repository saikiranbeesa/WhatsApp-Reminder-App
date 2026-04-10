const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

let client;
let isReady = false;

// Wait for exactly one global database connection to open before mounting the Auth Strategy
mongoose.connection.once('open', () => {
    console.log('WhatsApp RemoteAuth detected MongoDB connection open.');
    const store = new MongoStore({ mongoose: mongoose });
    
    client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000 // Backup session every 5 minutes
        }),
        puppeteer: {
            // Very important: these args prevent Chromium crashing on Linux Cloud Servers like Render
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Code received. Please scan with your WhatsApp to login:');
        qrcode.generate(qr, { small: true });
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
});

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
    getClient: () => client
};
