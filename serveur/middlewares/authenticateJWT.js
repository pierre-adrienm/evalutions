const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Token requis!' });
    }

    jwt.verify(token, 'JWT_SECRET', (err, user) => {
        if(err) return res.status(403).json({message: 'Token invalide!'})
        req.user = user
        next()
    });
};

module.exports = authenticateToken;
