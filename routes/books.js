const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('User Homepage');
}) 

router.post('/login', (req, res) => {
    res.send('User ')
});
