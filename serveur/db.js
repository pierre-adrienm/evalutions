const {Pool} = require("pg");

const pool = new Pool({
    user: "admin",
    host: "localhost",
    database: "evaluations",
    password: ":Ok_hand:",
    port: 5432
});