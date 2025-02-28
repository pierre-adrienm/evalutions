const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
const pool = require("./db");
const authenticateToken = require("./middlewares/authenticateJWT");
const authorizeRole = require("./middlewares/authorizeRole");

const manageQuestion = express.Router();
manageQuestion.use(cookieParser());

// Créer une Question
manageQuestion.post("/createQuestion", async (req,res) =>{
    const {nomQuestion} = req.body;

    if(!nomQuestion){
        return res.status(400).json({message:"question is required"});
    }

    try{
        const question = await pool.query(
            `SELECT * FROM "Question" WHERE "question"=$1`,
            [nomQuestion]
        );

        if(question.rows.length > 0){
            return res.status(409).json({message: `Question ${nomQuestion} already exists`});
        }

        await pool.query(
            `INSERT INTO "Question" (question) VALUES ($1)`,
            [nomQuestion]
        );

        console.log(`Question ${nomQuestion} create`);
        res.status(201).json({message: `Question ${nomQuestion} registered successfully.`});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to register Question"});
    }
});

// Consulter tous les Questions
manageQuestion.get("/questions", async (req,res) =>{
    try{
        const Questions = await pool.query(
            `SELECT * FROM "Question" ORDER BY id_question`
        );

        // Si absance de Question
        if(Questions.rows.length ===0){
            return res.status(404).json({message:"No Question"});
        }
        // affichage liste
        console.log(Questions.rows);
        res.status(200).json(Questions.rows);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read Question"});
    }
});

// Afficher le nombre de Question
manageQuestion.get("/nbQuestion", async (req,res) => {
    try{
        const nbQuestion = await pool.query(
            `SELECT count(*) FROM "Question"`
        );

        // Si il n'y a pas de Question
        if(nbQuestion.rows.length === 0){
            return res.status(404).json({message:"There aren't Question."});
        }

        // Récupérer et couvertir le nombre de Question
        const countQuestion = parseInt(nbQuestion.rows[0].count, 10);

        // Afficher le nombre de Question
        console.log(countQuestion);
        res.status(200).json(countQuestion);
    }
    catch(err){
        console.log(err);
        res.status.json({error:"Can't read nomber Question."});
    }
});

// Consulter la Question
manageQuestion.get("/question/:id",async( req, res) => {
    const {id} = req.params;

    try{
        const Question = await pool.query(
            'SELECT question FROM "Question" WHERE id_question=$1 ORDER BY question',
            [id]
        );

        if(Question.rows.length === 0){
            return res.status(404).json({message:`Question ${id} doesn't exists`})
        }
        console.log(Question.rows)
        res.status(200).json(Question.rows);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read Question"});
    }
});

// Modifier le nom de la Question
manageQuestion.put("/updateQuestion/:id", async (req,res) => {
    const {nomQuestion} = req.body;
    const {id} = req.params;

    try{
        const QuestionExist = await pool.query(
            `SELECT * FROM "Question" WHERE id_question=$1`,
            [id]
        );

        if(QuestionExist.rows.length === 0){
            return res.status(404).json({message:`Question ${nomQuestion} doesn't exist.`});
        }

        if(!nomQuestion){
            return res.status(400).json({message:"nomQuestion value is required"});
        }

        // Vérifier si une autre Question a déjà ce nom
        const checkDuplicate = await pool.query(
            `SELECT * FROM "Question" WHERE question = $1 AND id_question <> $2`,
            [nomQuestion, id]
        );

        if (checkDuplicate.rows.length > 0) {
            return res.status(409).json({ message: "Question nomQuestion already taken by another Question." });
        }

        await pool.query(
            `UPDATE "Question" SET question=$1 WHERE id_question=$2`,
            [nomQuestion,id]
        );
        console.log(`Question ${id} update successfully.`)
        res.status(200).json({message:`Question ${id} update successfully.`})
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Update Question failed!"});
    }
});

// Supprimer une Question
manageQuestion.delete("/deleteQuestion/:id", async (req,res) => {
    const {id} = req.params;

    try{
        const QuestionExist = await pool.query(
            `SELECT * FROM "Question" WHERE id_question=$1`,
            [id]
        );

        if(QuestionExist.rows.length === 0){
            return res.status(404).json({message:`Question ${id} doesn't exists`});
        }

        // Supprimer les clé étrangères des autres tables si elles existent
        const classe = await pool.query(
            `SELECT * FROM "Evaluation_group" WHERE id_question=$1`,
            [id]
        );
        if(classe.rows.length > 0){
            await pool.query(
                `DELETE FROM "Evaluation_group" WHERE id_question=$1`,
                [id]
            );
        }
        const evalQuestion = await pool.query(
            `SELECT * FROM "Evaluation_user" WHERE id_question=$1`,
            [id]
        );
        if(evalQuestion.rows.length > 0){
            await pool.query(
                `DELETE FROM "Evaluation_user" WHERE id_question=$1`,
                [id]
            );
        }

        // Suppersion de la Question
        await pool.query(
            'DELETE FROM "Question" WHERE id_question=$1',
            [id]
        );

        console.log(`Question ${id} deleted successfully.`);
        res.status(200).json({message:`Question ${id} deleted successfully.`});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Delete Question failed."});
    }
});

module.exports = manageQuestion;