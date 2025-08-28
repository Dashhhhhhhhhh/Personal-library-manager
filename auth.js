const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const pool = require('../db');

const saltRounds = 10;

async function hashPassword(password) {
    const hashPassword = await bcrypt.hash(password, saltRounds);
    return hashPassword;
}

router.post('/register', async (req, res) => {
        const { username, password } = req.body;
        const cleanUsername = username.trim().toLowerCase();
        
    try {
        
        if (!cleanUsername.trim() || !password) {
            return res.status(400).json({ error: "Bad Request." });
        }
        
        const sql = `SELECT EXISTS (SELECT 1 FROM users WHERE username = $1);`;
        const result = await pool.query(sql, [cleanUsername]);
        const usernameTaken = result.rows[0].exists;

        if (usernameTaken) {
            return res.status(409).json({ error: "Username already exists." }); 
        }

        const hashedPassword = await hashPassword(password);
        const insertSql = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username;`;
        const insertResult = await pool.query(insertSql, [cleanUsername, hashedPassword]);
            
        res.status(201).json({ message: "User registered.", user: insertResult.rows[0]});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }    
});

router.post('/login', async (req, res) => {
        try {
        const { username, password } = req.body;
        const rawPassword = password;
        const secretKey = process.env.JWT_SECRET;

        const cleanUsername = username?.trim().toLowerCase();

        if (!cleanUsername.trim() || !password) {
            return res.status(400).json({ error: "Bad Request." });
        }

        const sqlUser = `SELECT * FROM users WHERE username = $1 `;
        const result = await pool.query(sqlUser, [cleanUsername]);
        const userRow = result.rows[0];

        if (!userRow) {
            return res.status(401).json({ error: "Username  not found." }); 
        }

        const passMatch = await bcrypt.compare(rawPassword, userRow.password);
        
        if(!passMatch) {
            return res.status(401).json({ error: "Invalid password." }); 
        } else {
            const token = jwt.sign( {userId: userRow.id }, secretKey, { expiresIn: '1h' });
            res.status(200).json({ token: token, username: username });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
