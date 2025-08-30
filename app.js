require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const bookRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');

app.use(express.json());

const verifyToken = require('./middleware/verifyToken');

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

app.get('/', (req, res) => {
    res.send('Welcome');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

