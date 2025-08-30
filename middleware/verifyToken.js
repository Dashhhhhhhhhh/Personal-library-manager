const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
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
}

module.exports = verifyToken;
