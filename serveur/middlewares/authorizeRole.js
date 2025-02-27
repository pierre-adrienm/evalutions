const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.status !== requiredRole) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};

module.exports = authorizeRole;
