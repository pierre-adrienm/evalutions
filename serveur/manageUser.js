const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
const pool = require("./db");
const authenticateToken = require("./middlewares/authenticateJWT");
const authorizeRole = require("./middlewares/authorizeRole");

const manageUser = express.Router();
manageUser.use(cookieParser());

// ajouter un utilisateur
manageUser.post("/register", async (req,res) =>{
    const {prenom,nom,email,password, status} =req.body;

    if(!prenom || !nom || !email || !password || !status){
        return res.status(400).json({message:"All fields required"})
    }

    const validStatues = ['user','admin'];
    if(!validStatues.includes(status)){
        return res.status(400).json({message: "Invalid status. Choose from 'user', or 'admin'."});
    }

    try{
        const readyRegisterUser = await pool.query(
            `SELECT * FROM "User" WHERE email=$1`,
            [email]
        );

        if(readyRegisterUser.rows.length > 0) {
            return res.status(409).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO "User" (nom, prenom,  email, password, status) VALUES ($1, $2, $3, $4, $5)`,
            [nom, prenom, email, hashedPassword, status]
        );

        console.log(`User ${email} registered successfully.`);
        res.status(201).json({ message: `User ${email} registered successfully.` });
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to register user."});
    }
});

module.exports = manageUser;