CREATE TABLE "User"(
    "id_user" SERIAL PRIMARY KEY,
    "prenom" varchar(50) NOT NULL,
    "nom" varchar(50) NOT NULL,
    "email" varchar(100) NOT NULL UNIQUE,
    "password" varchar(255) NOT NULL,
    "status" varchar(20) NOT NULL CHECK("status" IN('user', 'admin'))
);

CREATE TABLE "Group"(
    "id_group" SERIAL PRIMARY KEY,
    "nom_group" varchar(50) NOT NULL UNIQUE
);

CREATE TABLE "Question"(
    "id_question" SERIAL PRIMARY KEY,
    "question" varchar(255) NOT NULL
);

CREATE TABLE "Classe"(
    "id_classe" SERIAL PRIMARY KEY,
    "id_user" integer references "User" ("id_user"),
    "id_group" integer references "Group" ("id_group")
);

CREATE TABLE "Evaluation_user"(
    "id_evaluation_user" SERIAL PRIMARY KEY,
    "id_user" integer references "User" ("id_user"),
    "id_question" integer references "Question" ("id_question"),
    "note" integer
);

CREATE TABLE "Evaluation_group"(
    "id_evaluation_group" SERIAL PRIMARY KEY,
    "id_group" integer references "Group" ("id_group"),
    "id_question" integer references "Question" ("id_question")
);