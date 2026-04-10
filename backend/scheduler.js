const cron = require('node-cron');
const { Member } = require('./db');
const whatsapp = require('./whatsapp');

const TARGET_GROUP_NAME = 'Sri Matha Podhupu Group'; 

// Function to generate and send reminder
async function runReminderJob() {
    const today = new Date();
    const day = today.getDate();
    
    // Only execute between 6th and 10th of every month
    if (day >= 6 && day <= 10) {
        console.log(`Running reminder job for day ${day}...`);
        
        try {
            const rows = await Member.find({});
            const currentMonth = today.toLocaleString('default', { month: 'long' });
            
            const paidMembers = rows.filter(m => m.payment_status === 'Paid').map(m => m.name);
            const unpaidMembers = rows.filter(m => m.payment_status === 'Not Paid').map(m => m.name);

            let message = `📅 *Payment Reminder (${currentMonth})*\n\n`;
            
            message += `✅ *Paid:*\n`;
            if (paidMembers.length === 0) message += `- None\n`;
            paidMembers.forEach(name => {
                message += `- ${name}\n`;
            });
            
            message += `\n❌ *Not Paid:*\n`;
            if (unpaidMembers.length === 0) message += `- None\n`;
            unpaidMembers.forEach(name => {
                message += `- ${name}\n`;
            });

            message += `\nPlease complete your payment at your earliest convenience.`;

            // Attempt to send message
            await whatsapp.sendGroupMessage(TARGET_GROUP_NAME, message);
        } catch (err) {
            console.error('Error fetching members for reminder:', err);
        }
    } else {
        console.log(`Today is day ${day}. Reminder job only runs between 6th and 10th. Skipping.`);
    }
}

// Reset payment logic for the 1st of every month at midnight
cron.schedule('0 0 1 * *', async () => {
    const newMonth = new Date().toLocaleString('default', { month: 'long' });
    console.log(`Resetting payment statuses for the new month: ${newMonth}...`);
    
    try {
        await Member.updateMany({}, { payment_status: 'Not Paid', month: newMonth });
        console.log('Successfully reset all payment statuses in MongoDB.');
    } catch (err) {
        console.error('Failed to reset statuses:', err);
    }
});

// Run daily at 7:00 AM
cron.schedule('0 7 * * *', () => {
    runReminderJob();
});

console.log('Scheduler initialized successfully.');

module.exports = {
    runReminderJob
};
