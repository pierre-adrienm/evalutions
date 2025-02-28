const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const pool = require("./db");


const manageEvalGroup = express.Router();

// Inserer une question dans le groupe
manageEvalGroup.post("/group/:id_group/registerEvalGroup", async (req, res) =>{
    const {question} = req.body;
    const {id_group} = req.params;
    
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

        // Vérifier si l'utilisateur est déjà inscrit dans le groupe
        const existingEvalGroup = await pool.query(
            `SELECT * FROM "Evaluation_group" WHERE id_question = $1 AND id_group = $2`,
            [id_question, id_group]
        );

        if (existingEvalGroup.rows.length > 0) {
            return res.status(400).json({ message: `Question ${question} is already in group ${id_group}` });
        }

        // Insérer dans la table EvalGroups
        const evalGroupResult = await pool.query(
            'INSERT INTO "Evaluation_group" (id_Question, id_group) VALUES ($1, $2)',
            [id_question, id_group]
        );
        console.log(evalGroupResult.rows[0]);
        res.status(201).json({ message: "Question added to EvalGroup", evalGroup: evalGroupResult.rows[0] });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Add Question EvalGroup failed"});
    }
});

// Consultation liste des utilisateur dans une EvalGroup
manageEvalGroup.get('/group/:id_group/questions',async (req,res) =>{
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

        // Récupérer les questions du groupe
        const questionsResult = await pool.query(
            `SELECT q.id_question, q.question
             FROM "Question" q
             JOIN "Evaluation_group" eg ON q.id_question = eg.id_question
             WHERE eg.id_group = $1 ORDER BY q.question`,
            [id_group]
        );

        // Affiche la liste
        console.log(id_group,questionsResult.rows);
        res.status(200).json({ group: id_group, questions: questionsResult.rows });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read Question list in the group"});
    }
});

// Consulter le nombre d'utilisateur dans un group
manageEvalGroup.get(`/group/:id_group/nbQuestions`, async (req, res) => {
    const {id_group} = req.params;

    try{
        const nbQuestionGroup = await pool.query(
            `SELECT count(*) FROM "Evaluation_group" WHERE id_group=$1`,
            [id_group]
        );
        // Vérifier si le group existe
        if(nbQuestionGroup.rows.length === 0){
            return res.status(404).json({message:`The group ${id_group} doesn't exists`});
        }

        // Récupérer et couvertir le nombre d'utilisateur dans un groupe
        const countNbQuestionGroup = parseInt(nbQuestionGroup.rows[0].count, 10);

        // Afficher le nombre d'utilisateur dans un group
        console.log(countNbQuestionGroup);
        res.status(200).json(countNbQuestionGroup);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read nombre Question in group"});
    }
});

// Récupérer la liste des questions pour un group
manageEvalGroup.get('/question/:id_question/group', async (req,res) => {
    const {id_question} = req.params;

    try{
        // Vérification si la question existe
        const QuestionCheck = await pool.query(
            `SELECT * FROM "Question" WHERE id_question=$1`,
            [id_question]
        );
        if(QuestionCheck.rows.length === 0){
            return res.status(404).json({message:`Question ${id_question} doesn't exist`});
        }

        // Récupérer les questions du groupe avec l'id du group
        const EvalGroupResult = await pool.query(
            `SELECT g.nom_group AS group_name
                FROM "Evaluation_group" eg
                JOIN "Group" g ON eg.id_group = g.id_group
                WHERE eg.id_question = $1 ORDER BY g.nom_group`,
            [id_question]
        );

        // Afficher la liste des questions du groupe
        console.log(id_question,EvalGroupResult.rows);
        res.status(200).json({ Question: id_question, EvalGroups: EvalGroupResult.rows });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read list EvalGroups"});
    }
});

// Récuperér le nombre de group pour une question
manageEvalGroup.get('/question/:id_question/nbGroup', async (req,res) => {
    const {id_question} = req.params;

    try{
        const nbEvalGroupsQuestion = await pool.query(
            `SELECT count(*) FROM "Evaluation_group" WHERE id_Question=$1`,
            [id_question]
        );

        // Vérifier si la question existe
        if(nbEvalGroupsQuestion.rows.length === 0){
            return res.status(404).json({message:`Question ${id_question} doesn't exists`});
        }

        // Récupérer et couvertir le nombre de EvalGroup
        const countNbEvalGroupsQuestion = parseInt(nbEvalGroupsQuestion.rows[0].count,10);

        // Afficher le nombre de grpou pour une question
        console.log(countNbEvalGroupsQuestion);
        res.status(200).json(countNbEvalGroupsQuestion);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Can't read nomber of EvalGroup in the Question"});
    }
});

// Supprimer une question d'un group
manageEvalGroup.delete(`/group/:id_group/question/:id_question`, async (req,res) => {
    const {id_group,id_question} = req.params;
    try{
        // Vérifier si la question est bien dans le group
        const checkMembership = await pool.query(
            `SELECT * FROM "Evaluation_group" WHERE id_question = $1 AND id_group = $2`,
            [id_question,id_group]
        );

        if(checkMembership.rows.length === 0){
            return res.status(404).json({ message: `Question ${id_question} is not in group ${id_group}`});
        }

        // Suppresion d'une question dans un group
        await pool.query(
            `DELETE FROM "Evaluation_group" WHERE id_question=$1 AND id_group=$2`,
            [id_question,id_group]
        );

        console.log(`Question ${id_question} removed from ${id_group}`);
        res.status(200).json({message:`Question ${id_question} removed from ${id_group}`});
    }
    catch (err){
        console.log(err);
        res.status(500).json({erro:"Failed to remove Question from group"});
    }
});

module.exports = manageEvalGroup;
