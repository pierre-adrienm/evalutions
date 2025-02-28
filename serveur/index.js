const express = require("express");
const cors = require("cors");
const manageUser = require("./manageUser");
const identification = require("./identitification");
const manageGroup = require("./manageGroup");
require('dotenv').config();
const app = express();
app.get("/", (req, res) => res.send("Serveur en marche !"));

app.use( 
    cors({
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(express.json());

app.use("/", manageUser);

app.use("/", identification);

app.use("/", manageGroup);

app.listen(3000, () => console.log("Serveur sur le port 3000"));