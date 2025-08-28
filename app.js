require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const bookRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');

app.use(express.json());


const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token."});
        }

        req.user = decoded;
        next();
    });

    } else {
        return res.status(401).json({ error: "No token provided."});
    }
};

app.use('/auth', authRoutes);
app.use('/books', verifyToken, bookRoutes);

app.get('/', (req, res) => {
    res.send('Welcome');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

