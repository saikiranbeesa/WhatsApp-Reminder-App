const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB Cloud Database.');
        await seedDefaultMembers();
        
        // Explicity initialize WhatsApp AFTER the database is perfectly online
        const whatsapp = require('./whatsapp');
        whatsapp.initializeWhatsApp();
    })
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Define Schema for Member
const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    payment_status: { type: String, default: 'Not Paid' },
    month: { type: String, required: true },
});

// Create Mongoose Model
const Member = mongoose.model('Member', memberSchema);

// Initial Seed Function (Will only run if collection is empty)
async function seedDefaultMembers() {
    try {
        const count = await Member.countDocuments();
        if (count === 0) {
            const currentMonth = new Date().toLocaleString('default', { month: 'long' });
            const members = [
                { name: 'Santhosha', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Padma tadam', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Lalitha', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Mamatha', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Radhika', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Haritha', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Swathi', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Nirmala', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Chandana', payment_status: 'Not Paid', month: currentMonth },
                { name: 'Padma mora', payment_status: 'Not Paid', month: currentMonth }
            ];
            await Member.insertMany(members);
            console.log('MongoDB successfully seeded with the 10 authorized members.');
        }
    } catch (error) {
        console.error('Error seeding MongoDB:', error);
    }
}

// Ensure the seed runs
seedDefaultMembers();

module.exports = { mongoose, Member };
