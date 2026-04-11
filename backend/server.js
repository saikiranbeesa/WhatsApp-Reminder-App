const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { Member } = require('./db');
const auth = require('./auth');
const scheduler = require('./scheduler'); // Kick off the scheduler

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Auth Routes ---
app.post('/api/auth/login', auth.handleLogin);

// --- Protected Member Routes ---
// Get all members (requires valid JWT token)
app.get('/api/members', auth.verifyToken, async (req, res) => {
    try {
        const members = await Member.find({});
        
        // Map _id to id so frontend doesn't break
        const mappedMembers = members.map(m => ({
            id: m._id,
            name: m.name,
            payment_status: m.payment_status,
            month: m.month
        }));

        res.json({ members: mappedMembers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update member payment status (requires valid JWT token)
app.put('/api/members/:id/status', auth.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status !== 'Paid' && status !== 'Not Paid') {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const result = await Member.findByIdAndUpdate(id, { payment_status: status });
        if (!result) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Test endpoint to trigger WhatsApp message manually (requires valid JWT token)
app.get('/api/test-reminder', auth.verifyToken, async (req, res) => {
    try {
        await scheduler.runReminderJob();
        res.json({ message: 'Reminder job triggered! Check your WhatsApp group.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to trigger job' });
    }
});

// --- Health Check Endpoint (For Render) ---
app.get('/', (req, res) => {
    res.status(200).send('WhatsApp Reminder API is running.');
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
