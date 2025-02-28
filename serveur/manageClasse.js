const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const pool = require("./db");


const manageClasse = express.Router();

// Inserer un utilisateur dans le groupe
manageClasse.post("/group/:id_group/registerClasse", async (req, res) =>{
    const {email} = req.body;
    const {id_group} = req.params;
    
    try{
        // Si l'utilisateur existe
        const userResult = await pool.query(
            `SELECT id_user FROM "User" WHERE email=$1`,
            [email]
        );
        if(userResult.rows.length === 0){
            return res.status(404).json({message:`User ${email} doesn't exist`});
        }

        const id_user = userResult.rows[0].id_user;

        // Vérifier si l'utilisateur est déjà inscrit dans le groupe
        const existingClasse = await pool.query(
            `SELECT * FROM "Classe" WHERE id_user = $1 AND id_group = $2`,
            [id_user, id_group]
        );

        if (existingClasse.rows.length > 0) {
            return res.status(400).json({ message: `User ${email} is already in group ${id_group}` });
        }

        // Insérer dans la table Classes
        const ClasseResult = await pool.query(
            'INSERT INTO "Classe" (id_user, id_group) VALUES ($1, $2)',
            [id_user, id_group]
        );
        console.log(ClasseResult.rows[0]);
        res.status(201).json({ message: "User added to Classe", Classe: ClasseResult.rows[0] });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Add user Classe failed"});
    }
});

// Consultation liste des utilisateur dans une Classe
manageClasse.get('/group/:id_group/users',async (req,res) =>{
    const {id_group} = req.params;

    try{
        // Vérifie si le groupe existe
        const groupCheck = await pool.query(
            `SELECT * FROM "Group" WHERE id_group = $1`,
            [id_group]
        );
        if(groupCheck.rows.length === 0){
            return res.status(404).json({message:"This group doesn't exists."});
        }

        // Récupérer les utilisateurs du groupe
        const usersResult = await pool.query(
            `SELECT u.id_user, u.nom, u.prenom , u.email, u.status
             FROM "User" u
             JOIN "Classe" c ON u.id_user = c.id_user
             WHERE c.id_group = $1 ORDER BY u.email`,
            [id_group]
        );

        // Affiche la liste
        console.log(id_group,usersResult.rows);
        res.status(200).json({ group: id_group, users: usersResult.rows });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read user list in the group"});
    }
});

// Consulter le nombre d'utilisateur dans un group
manageClasse.get(`/group/:id_group/nbUser`, async (req, res) => {
    const {id_group} = req.params;

    try{
        const nbUserGroup = await pool.query(
            `SELECT count(*) FROM "Classe" WHERE id_group=$1`,
            [id_group]
        );
        // Vérifier si le group existe
        if(nbUserGroup.rows.length === 0){
            return res.status(404).json({message:`The group ${id_group} doesn't exists`});
        }

        // Récupérer et couvertir le nombre d'utilisateur dans un groupe
        const countNbUserGroup = parseInt(nbUserGroup.rows[0].count, 10);

        // Afficher le nombre d'utilisateur dans un group
        console.log(countNbUserGroup);
        res.status(200).json(countNbUserGroup);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read nombre user in group"});
    }
});

// Récupérer la liste des Classes d'un utilisateur avec le nom du groupe
manageClasse.get('/user/:id_user/classe', async (req,res) => {
    const {id_user} = req.params;

    try{
        // Vérification si l'utilisateur existe
        const userCheck = await pool.query(
            `SELECT * FROM "User" WHERE id_user=$1`,
            [id_user]
        );
        if(userCheck.rows.length === 0){
            return res.status(404).json({message:`User ${id_user} doesn't exist`});
        }

        // Récupérer les Classes de l'utilisateur avec le nom du groupe
        const classeResult = await pool.query(
            `SELECT c.id_classe, g.id_group, g.nom_group AS group_name
                FROM "Classe" c
                JOIN "Group" g ON c.id_group = g.id_group
                WHERE c.id_user = $1 ORDER BY g.nom_group`,
            [id_user]
        );

        // Afficher la liste des Classes
        console.log(id_user,classeResult.rows);
        res.status(200).json({ user: id_user, Classes: classeResult.rows });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read list Classes"});
    }
});

// Récuperér le nombre de Classe qu'a un utilisateur
manageClasse.get('/user/:id_user/nbClasses', async (req,res) => {
    const {id_user} = req.params;

    try{
        const nbClassesUser = await pool.query(
            `SELECT count(*) FROM "Classe" WHERE id_user=$1`,
            [id_user]
        );

        // Vérifier si l'utilisateur existe
        if(nbClassesUser.rows.length === 0){
            return res.status(404).json({message:`User ${id_user} doesn't exists`});
        }

        // Récupérer et couvertir le nombre de Classe
        const countNbClassesUser = parseInt(nbClassesUser.rows[0].count,10);

        // Afficher le nombre de Classe pour un utilisateur
        console.log(countNbClassesUser);
        res.status(200).json(countNbClassesUser);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read nomber of Classe in the user"});
    }
});

// Supprimer un utilisateur d'un group
manageClasse.delete(`/group/:id_group/user/:id_user`, async (req,res) => {
    const {id_group,id_user} = req.params;
    try{
        // Vérifier si l'utilisateur est bien dans le groupe
        const checkMembership = await pool.query(
            `SELECT * FROM "Classe" WHERE id_user = $1 AND id_group = $2`,
            [id_user,id_group]
        );

        if(checkMembership.rows.length === 0){
            return res.status(404).json({ message: `User ${id_user} is not in group ${id_group}`});
        }

        // Suppresion d'un utilisateur du group
        await pool.query(
            `DELETE FROM "Classe" WHERE id_user=$1 AND id_group=$2`,
            [id_user,id_group]
        );

        console.log(`User ${id_user} removed from ${id_group}`);
        res.status(200).json({message:`User ${id_user} removed from ${id_group}`});
    }
    catch (err){
        console.log(err);
        res.status(500).json({erro:"Failed to remove user from group"});
    }
});

module.exports = manageClasse;
