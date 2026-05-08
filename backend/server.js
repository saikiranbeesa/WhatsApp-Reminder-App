const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { getAllMembers, updateMemberStatus, seedMembers } = require('./dbSupabase');
const auth = require('./auth');
const scheduler = require('./scheduler'); // Kick off the scheduler

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const whatsapp = require('./whatsapp');
seedMembers()
    .then(() => {
        console.log('Supabase seeding check complete.');
        whatsapp.initializeWhatsApp();
    })
    .catch((e) => console.error('Seeding error:', e));

// --- Auth Routes ---
app.post('/api/auth/login', auth.handleLogin);

// --- Protected Member Routes ---
// Get all members (requires valid JWT token)
app.get('/api/members', auth.verifyToken, async (req, res) => {
    try {
        console.log('Frontend requested members...');
        const members = await getAllMembers();
        console.log(`Fetched ${members?.length || 0} members from Supabase:`, members);
        
        // Map to the shape the frontend expects
        const mapped = members.map(m => ({
            id: m.id,
            name: m.name,
            payment_status: m.payment_status,
            month: m.month,
        }));
        res.json({ members: mapped });
    } catch (err) {
        console.error('API Error in /api/members:', err);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Update member payment status (requires valid JWT token)
app.put('/api/members/:id/status', auth.verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Paid', 'Not Paid'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        await updateMemberStatus(id, status);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Add a new member (requires valid JWT token)
app.post('/api/members', auth.verifyToken, async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }
    try {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const newMember = await require('./dbSupabase').addMember(name.trim(), currentMonth);
        res.status(201).json({ member: newMember });
    } catch (err) {
        console.error('API Error in POST /api/members:', err);
        res.status(500).json({ error: 'Failed to add member' });
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
