const express = require('express');
const router = require('express').Router();
const { validate: isUuid } = require('uuid');
const verifyToken = require('../middleware/verifyToken');
const pool = require('../db');

function  validateUuid (req, res, next) {
    const { id } = req.params;
    if (!id || !isUuid(id)) {
        return res.status(400).json({ error: "Invalid UUID."});
    }
    next();
}

router.post('/', verifyToken, async (req, res) => {
    try {

    const { title, author, status } = req.body;
    const userId = req.user.userId;

    const allowedStatus = ['reading', 'completed', 'planned'];

    const cleanTitle = title.trim().toLowerCase();
    const cleanAuthor = author.trim().toLowerCase();
    const cleanStatus = status?.trim().toLowerCase();
    
    if (!cleanTitle || !cleanAuthor) {
        return res.status(400).json({ error: "Invalid input." });
    }
    if (!allowedStatus.includes(cleanStatus)) {
        return res.status(400).json({ error: "Invalid status value." });
    }

    const sql = `INSERT INTO books (title, author, status, user_id) VALUES ($1, $2 ,$3, $4) RETURNING *`;

    const result = await pool.query(sql, [cleanTitle, cleanAuthor, cleanStatus, userId]);
    
    res.status(201).json({ book: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }    
});

router.get('/', verifyToken, async (req, res) => {
    try{
        const userId = req.user.userId;
        const sql = `SELECT * FROM books WHERE user_id = $1`;
        const result = await pool.query(sql, [userId]);

        res.status(200).json({ books: result.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }  
});

router.get('/:id', verifyToken, validateUuid, async (req, res) => {
    try {

        const { id } = req.params;
        const userId = req.user.userId;


        const sql = `SELECT * FROM books WHERE id = $1 AND user_id = $2`;
        const result = await pool.query(sql, [id, userId]);

        if (!result.rows.length) {
            return res.status(404).json({ error: "Book not found."});
        } else {
            res.status(200).json({ book: result.rows[0]});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }    
});

router.patch('/:id', verifyToken, validateUuid, async (req, res) => {
    try {

    const { id } = req.params;
    const { title, author, status } = req.body;
    const userId = req.user.userId;

    const allowedFields = ['title', 'author', 'status'];
    const allowedStatus = ['reading', 'completed', 'planned'];

    const cleantTitle = title.trim().toLowerCase();
    const cleanAuthor = author.trim().toLowerCase();
    const cleanStatus = status?.trim().toLowerCase();

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (!cleantTitle || !cleanAuthor) {
        return res.status(400).json({ error: "Invalid input." });
    } 

    if (cleanStatus && !allowedStatus.includes(cleanStatus)) {
            return res.status(400).json({ error: "Invalid status value." });
    }


        for (const key of allowedFields) {
            let value = req.body[key];
            
            
        if (typeof value !== 'string' || value.trim() === '') {
            continue;
        }
        const cleanValue = value.trim().toLowerCase();

            updates.push(`${key} = $${paramIndex}`);
            values.push(cleanValue);
            paramIndex++;
        } 

        if (updates.length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });  
        }


        const sql = `UPDATE books SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex +1} RETURNING*`;
        values.push(id, userId);   

        const result = await pool.query(sql, values);

        if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Book updated", task: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }    
});

router.delete('/:id', verifyToken, validateUuid, async (req, res) => {
    try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(`DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING *`, [id, userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Book deleted", book: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }    
});

module.exports = router;
