const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
const pool = require("./db");
const authenticateToken = require("./middlewares/authenticateJWT");
const authorizeRole = require("./middlewares/authorizeRole");

const manageGroup = express.Router();
manageGroup.use(cookieParser());

// Créer un group
manageGroup.post("/createGroup", async (req,res) =>{
    const {nomGroup} = req.body;

    if(!nomGroup){
        return res.status(400).json({message:"nomGroup is required"});
    }

    try{
        const group = await pool.query(
            `SELECT * FROM "Group" WHERE "nom_group"=$1`,
            [nomGroup]
        );

        if(group.rows.length > 0){
            return res.status(409).json({message: `Group ${nomGroup} already exists`});
        }

        await pool.query(
            `INSERT INTO "Group" (nom_group) VALUES ($1)`,
            [nomGroup]
        );

        console.log(`Group ${nomGroup} create`);
        res.status(201).json({message: `Group ${nomGroup} registered successfully.`});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to register group"});
    }
});

// Consulter tous les groups
manageGroup.get("/groups", async (req,res) =>{
    try{
        const groups = await pool.query(
            `SELECT * FROM "Group" ORDER BY nom_group`
        );

        // Si absance de group
        if(groups.rows.length ===0){
            return res.status(404).json({message:"No group"});
        }
        // affichage liste
        console.log(groups.rows);
        res.status(200).json(groups.rows);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read group"});
    }
});

// Afficher le nombre de group
manageGroup.get("/nbGroup", async (req,res) => {
    try{
        const nbGroup = await pool.query(
            `SELECT count(*) FROM "Group"`
        );

        // Si il n'y a pas de groupe
        if(nbGroup.rows.length === 0){
            return res.status(404).json({message:"There aren't group."});
        }

        // Récupérer et couvertir le nombre de group
        const countGroup = parseInt(nbGroup.rows[0].count, 10);

        // Afficher le nombre de groupe
        console.log(countGroup);
        res.status(200).json(countGroup);
    }
    catch(err){
        console.log(err);
        res.status.json({error:"Can't read nomber group."});
    }
});

// Consulter le groupe
manageGroup.get("/group/:id",async( req, res) => {
    const {id} = req.params;

    try{
        const group = await pool.query(
            'SELECT nom_group FROM "Group" WHERE id_group=$1 ORDER BY nom_group',
            [id]
        );

        if(group.rows.length === 0){
            return res.status(404).json({message:`Group ${id} doesn't exists`})
        }
        console.log(group.rows)
        res.status(200).json(group.rows);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read group"});
    }
});

// Modifier le nom du groupe
manageGroup.put("/updateGroup/:id", async (req,res) => {
    const {nomGroup} = req.body;
    const {id} = req.params;

    try{
        const groupExist = await pool.query(
            `SELECT * FROM "Group" WHERE id_group=$1`,
            [id]
        );

        if(groupExist.rows.length === 0){
            return res.status(404).json({message:`Group ${nomGroup} doesn't exist.`});
        }

        if(!nomGroup){
            return res.status(400).json({message:"nomGroup value is required"});
        }

        // Vérifier si un autre groupe a déjà ce nom
        const checkDuplicate = await pool.query(
            `SELECT * FROM "Group" WHERE nom_Group = $1 AND id_group <> $2`,
            [nomGroup, id]
        );

        if (checkDuplicate.rows.length > 0) {
            return res.status(409).json({ message: "Group nomGroup already taken by another group." });
        }

        await pool.query(
            `UPDATE "Group" SET nom_group=$1 WHERE id_group=$2`,
            [nomGroup,id]
        );
        console.log(`Group ${id} update successfully.`)
        res.status(200).json({message:`Group ${id} update successfully.`})
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Update group failed!"});
    }
});

// Supprimer un group
manageGroup.delete("/deleteGroup/:id", async (req,res) => {
    const {id} = req.params;

    try{
        const groupExist = await pool.query(
            `SELECT * FROM "Group" WHERE id_group=$1`,
            [id]
        );

        if(groupExist.rows.length === 0){
            return res.status(404).json({message:`Group ${id} doesn't exists`});
        }

        // Supprimer les clé étrangères des autres tables si elles existent
        const classe = await pool.query(
            `SELECT * FROM "Classe" WHERE id_group=$1`,
            [id]
        );
        if(classe.rows.length > 0){
            await pool.query(
                `DELETE FROM "Classe" WHERE id_group=$1`,
                [id]
            );
        }
        const evalgroup = await pool.query(
            `SELECT * FROM "Evaluation_group" WHERE id_group=$1`,
            [id]
        );
        if(evalgroup.rows.length > 0){
            await pool.query(
                `DELETE FROM "Evaluation_group" WHERE id_group=$1`,
                [id]
            );
        }

        // Suppersion du groupe
        await pool.query(
            'DELETE FROM "Group" WHERE id_group=$1',
            [id]
        );

        console.log(`Group ${id} deleted successfully.`);
        res.status(200).json({message:`Group ${id} deleted successfully.`});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Delete Group failed."});
    }
});

module.exports = manageGroup;