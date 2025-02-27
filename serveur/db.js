const {Pool} = require("pg");

const pool = new Pool({
    user: "admin",
    host: "postgres_db",
    database: "evaluations",
    password: "Ok_hand:",
    port: 5432
});

module.exports = pool;