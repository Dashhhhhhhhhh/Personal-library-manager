const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, (req, res) => {
    res.send(`Books for user ${req.user.userId}`);
});

router.post('/books', verifyToken, async (req, res) => {

});

module.exports = router;
