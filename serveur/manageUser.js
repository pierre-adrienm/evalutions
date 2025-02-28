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

// Consulter tous les  utilisateurs
manageUser.get("/users", async (req,res) => {
    try{
        const users = await pool.query(
            `SELECT * FROM "User" ORDER by nom`
        );

        // si absence d'utilisateur
        if(users.rows.length=== 0){
            return res.status(404).json({message:"No users"});
        }
        // Affichage d'utilisateur
        console.log(users.rows);
        res.status(200).json(users.rows);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read user"});
    }
});

// Obtenier le nombre total de l'utilisateur
manageUser.get("/nbUser", async(req,res) => {
    try{
        const nbUser = await pool.query(
            `SELECT count(*) FROM "User"`
        );
        // Si il n'y a pas d'utilisateur
        if(nbUser.rows.length === 0){
            return res.status(404).json("There aren't Users");
        }

        // Récupérer et convertir en nombre
        const countUser = parseInt(nbUser.rows[0].count, 10);

        // Afficher le nombre d'utilisateur
        console.log(countUser);
        res.status(200).json(countUser);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read nbUser"});
    }
});

// Consultation un Profil user
manageUser.get("/user/:id", async (req,res) => {
    const {id} = req.params;

    try{

        const user = await pool.query(
            `SELECT * FROM "User" WHERE id_user=$1 `,
            [id]
        );

        if(user.rows.length === 0){
            return res.status(404).json({error:`User ${id} doesn't exists`});
        }
        console.log(user.rows);
        res.status(200).json(user.rows);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read user profile"});
    }
});

// Mise à jour du profil
manageUser.put("/profile/:id", async (req, res) => {
    const { prenom, nom, email, password, status, oldPassword } = req.body; // oldPassword ajouté
    const { id } = req.params;
    console.log('Données reçues pour la mise à jour:', req.body);

    try {
        const userExist = await pool.query(`SELECT * FROM "User" WHERE id_user=$1`, [id]);

        if (userExist.rows.length === 0) {
            return res.status(404).json({ message: "User doesn't exist." });
        }

        // Vérifier l'ancien mot de passe si fourni
        if (oldPassword) {
            const match = await bcrypt.compare(oldPassword, userExist.rows[0].password);
            if (!match) {
                return res.status(400).json({ message: "Old password is incorrect." });
            }
        }

        // Vérifier si l'email existent déjà pour un autre utilisateur
        if (email) {
            const checkDuplicate = await pool.query(
                `SELECT * FROM "User" WHERE (email = $1) AND id_user <> $2`,
                [userExist.rows[0].email, id]
            );

            if (checkDuplicate.rows.length > 0) {
                return res.status(409).json({ message: "Name or Email already taken by another user." });
            }
        }

        const updates = [];
        const values = [];
        let index = 1;

        if (prenom) {
            updates.push(`name = $${index++}`);
            values.push(name);
        }
        if (nom) {
            updates.push(`name = $${index++}`);
            values.push(name);
        }

        if (email) {
            updates.push(`email = $${index++}`);
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${index++}`);
            values.push(hashedPassword);
        }
        if (status) {
            updates.push(`status = $${index++}`);
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update." });
        }

        values.push(id);
        const query = `UPDATE "User" SET ${updates.join(", ")} WHERE id_user = $${index} RETURNING *`;
        const result = await pool.query(query, values);

        console.log("Profile updated successfully.", result.rows[0]);
        res.status(200).json({ message: "Profile updated successfully.", user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Profile update failed." });
    }
});

// Supprimer un utilisateur
manageUser.delete("/deleteUser/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const userExist = await pool.query(
            `SELECT * FROM "User" WHERE id_user=$1`,
            [id]
        );

        if (userExist.rows.length === 0) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        // Suppression des clé étrangère des autres tables si elle existe
        const userClasse = await pool.query(
            `SELECT * FROM "Classe" WHERE id_user=$1`,
            [id]
        );
        if(userClasse.rows.length > 0) {
            await pool.query(`DELETE FROM "Classe" WHERE id_user=$1`,[id]);
        }
        const evalUser = await pool.query(
            `SELECT * FROM "Evaluation_user" WHERE id_user=$1`,
            [id]
        );
        if(evalUser.rows.length > 0) {
            await pool.query(`DELETE FROM "Evaluation_user" WHERE id_user=$1`,[id]);
        }
        
        // supperesion de l'utilisateur
        await pool.query(`DELETE FROM "User" WHERE id_user=$1`, [id]);

        console.log(`User ${id} deleted`);
        res.status(200).json({ message: `User ${id} deleted` });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Delete user failed" });
    }
});

module.exports = manageUser;