const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const pool = require("./db");


const manageEvalUser = express.Router();

// Inserer une question dans un utilisateur
manageEvalUser.post("/user/:id_user/registerEvalUser", async (req, res) =>{
    const {question} = req.body;
    const {id_user} = req.params;
    
    try{
        // Si la question existe
        const questionResult = await pool.query(
            `SELECT id_question FROM "Question" WHERE question=$1`,
            [question]
        );
        if(questionResult.rows.length === 0){
            return res.status(404).json({message:`Question ${question} doesn't exist`});
        }

        const id_question = questionResult.rows[0].id_question;

        // Vérifier si la question est déjà dans l'utilisateur
        const existingEvalUser = await pool.query(
            `SELECT * FROM "Evaluation_user" WHERE id_question = $1 AND id_user = $2`,
            [id_question, id_user]
        );

        if (existingEvalUser.rows.length > 0) {
            return res.status(400).json({ message: `Question ${question} is already in group ${id_user}` });
        }

        // Insérer dans la table EvalUser
        const evalUserResult = await pool.query(
            'INSERT INTO "Evaluation_user" (id_Question, id_user) VALUES ($1, $2)',
            [id_question, id_user]
        );
        console.log(evalUserResult.rows[0]);
        res.status(201).json({ message: "Question added to EvalUser", evalUser: evalUserResult.rows[0] });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Add Question EvalUser failed"});
    }
});

// Consultation liste des utilisateur dans une EvalUser
manageEvalUser.get('/user/:id_user/questions',async (req,res) =>{
    const {id_user} = req.params;

    try{
        // Vérifie si le groupe existe
        const userCheck = await pool.query(
            `SELECT * FROM "User" WHERE id_user = $1`,
            [id_user]
        );
        if(userCheck.rows.length === 0){
            return res.status(404).json({message:"This user doesn't exists."});
        }

        // Récupérer les questions d'un utilisateur
        const questionsResult = await pool.query(
            `SELECT q.id_question, q.question
             FROM "Question" q
             JOIN "Evaluation_user" eu ON q.id_question = eg.id_question
             WHERE eu.id_user = $1 ORDER BY q.question`,
            [id_user]
        );

        // Affiche la liste
        console.log(id_user,questionsResult.rows);
        res.status(200).json({ group: id_user, questions: questionsResult.rows });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read Question list in the user"});
    }
});

// Consulter le nombre de question pour un utilisateur
manageEvalUser.get(`/user/:id_user/nbQuestions`, async (req, res) => {
    const {id_user} = req.params;

    try{
        const nbQuestionGroup = await pool.query(
            `SELECT count(*) FROM "Evaluation_group" WHERE id_group=$1`,
            [id_user]
        );
        // Vérifier si l'utilisateur existe
        if(nbQuestionGroup.rows.length === 0){
            return res.status(404).json({message:`The user ${id_user} doesn't exists`});
        }

        // Récupérer et couvertir le nombre d'utilisateur dans un groupe
        const countNbQuestionGroup = parseInt(nbQuestionGroup.rows[0].count, 10);

        // Afficher le nombre d'utilisateur dans un group
        console.log(countNbQuestionGroup);
        res.status(200).json(countNbQuestionGroup);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read nombre Question in user"});
    }
});

// Récupérer la liste des questions pour un utilisateur
manageEvalUser.get('/question/:id_question/users', async (req, res) => {
    const { id_question } = req.params;

    try {
        // Vérifie si la question existe
        const questionCheck = await pool.query(
            `SELECT * FROM "Question" WHERE id_question = $1`,
            [id_question]
        );
        if (questionCheck.rows.length === 0) {
            return res.status(404).json({ message: "This question doesn't exist." });
        }

        // Récupérer les utilisateurs associés à cette question
        const usersResult = await pool.query(
            `SELECT u.id_user, u.nom, u.prenom, u.email
            FROM "Evaluation_user" eu
            JOIN "User" u ON eu.id_user = u.id_user
            WHERE eu.id_question = $1`,
            [id_question]
        );

        // Afficher la liste des utilisateurs
        console.log(id_question, usersResult.rows);
        res.status(200).json({ question: id_question, users: usersResult.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Can't retrieve users for this question." });
    }
});

// Mettre un note à une question pour un utilisateur
manageEvalUser.put('/question/:id_question/user/:id_user', async (req,res) => {
    const {id_question,id_user} = req.params;
    const {note} = req.body;

    try{
        // Vérifier sur la question et l'utilisateur existe
        const existUserQuestion = await pool.query(
            `SELECT * FROM "Evaluation_user" WHERE id_question=$1 AND id_user=$2`,
            [id_question,id_user]
        );

        if(existUserQuestion.rows.length==0){
            return res.status(404).json({message:`Question ${id_question} for user ${id_user} doesn't exist`});
        }

        await pool.query(
            `UPDATE "Evaluation_user" SET note=$1 WHERE id_question=$2 AND id_user=$3`,
            [note,id_question,id_user]
        );

        res.status(200).json({message:`User ${id_user} give note at the question ${id_question}`});

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Can't update note question"});
    }
});

// Récuperér le nombre d'utilisateur pour une question
manageEvalUser.get('/question/:id_question/nbUser', async (req,res) => {
    const {id_question} = req.params;

    try{
        const nbEvalUsersQuestion = await pool.query(
            `SELECT count(*) FROM "Evaluation_user" WHERE id_user=$1`,
            [id_question]
        );

        // Vérifier si la question existe
        if(nbEvalUsersQuestion.rows.length === 0){
            return res.status(404).json({message:`Question ${id_question} doesn't exists`});
        }

        // Récupérer et couvertir le nombre de EvalUser
        const countNbEvalUsersQuestion = parseInt(nbEvalUsersQuestion.rows[0].count,10);

        // Afficher le nombre de grpou pour une question
        console.log(countNbEvalUsersQuestion);
        res.status(200).json(countNbEvalUsersQuestion);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read nomber of EvalUser in the Question"});
    }
});

// Supprimer une question d'un group
manageEvalUser.delete(`/user/:id_user/question/:id_question`, async (req,res) => {
    const {id_user,id_question} = req.params;
    try{
        // Vérifier si la question est bien dans le group
        const checkMembership = await pool.query(
            `SELECT * FROM "Evaluation_user" WHERE id_question = $1 AND id_user = $2`,
            [id_question,id_user]
        );

        if(checkMembership.rows.length === 0){
            return res.status(404).json({ message: `Question ${id_question} is not in user ${id_user}`});
        }

        // Suppresion d'une question dans un group
        await pool.query(
            `DELETE FROM "Evaluation_group" WHERE id_question=$1 AND id_group=$2`,
            [id_question,id_user]
        );

        console.log(`Question ${id_question} removed from ${id_user}`);
        res.status(200).json({message:`Question ${id_question} removed from ${id_user}`});
    }
    catch (err){
        console.log(err);
        res.status(500).json({erro:"Failed to remove Question from group"});
    }
});

module.exports = manageEvalUser;
