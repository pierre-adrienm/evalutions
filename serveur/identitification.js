const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
const pool = require("./db");
const authenticateToken = require("./middlewares/authenticateJWT");
const authorizeRole = require("./middlewares/authorizeRole");

const identification = express.Router();
identification.use(cookieParser());

// Connexion utilisateur
identification.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
        const user = result.rows[0];
  
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
  
        const token = jwt.sign(
            { id_user: user.id_user, name: user.name, status: user.status },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
  
        console.log(token);
        return res.status(200).json({
            message: 'Login successful.',
            user: {
                id_user: user.id_user,
                name: user.name,
                status: user.status
            },
            token: token
        });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// test conexion admin
identification.get(
    "/admin/:id",
    authenticateToken,
    authorizeRole("admin"),
    async (req, res) => {
        console.log(`Welcome admin ${req.user.name}!`);
        res.send(`Welcome admin ${req.user.name}!`);
    }
);

// test connexion utilisateur
identification.get(
    "/user/:id",
    authenticateToken,
    authorizeRole("admin"),
    async (req, res) => {
        console.log(`Welcome admin ${req.user.name}!`);
        res.send(`Welcome admin ${req.user.name}!`);
    }
);

// déconnexion utilisateur
identification.post("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully." });
});
  
module.exports = identification;