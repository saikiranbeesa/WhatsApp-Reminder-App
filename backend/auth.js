const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret';
// Read from environment, or use fallback defaults
const ADMIN_USERID = process.env.ADMIN_USERID || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

// Middleware to verify JWT token on protected routes
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
    if (!token) return res.status(403).json({ error: 'Malformed token' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        req.user = decoded; 
        next();
    });
}

// Handle classic User ID & Password Login
function handleLogin(req, res) {
    const { userid, password } = req.body;

    if (!userid || !password) {
        return res.status(400).json({ error: 'Please provide both User ID and Password.' });
    }

    if (userid !== ADMIN_USERID || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Credentials match correctly, issue JWT
    const token = jwt.sign({ userid }, JWT_SECRET, { expiresIn: '7d' }); // Valid for 7 days

    res.json({
        message: 'Authentication successful',
        token
    });
}

module.exports = {
    verifyToken,
    handleLogin
};
