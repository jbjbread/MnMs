require('dotenv').config();
const env = process.env;
const { Pool } = require('pg')

module.exports =
  pool = new Pool({
    user : env.POSTGRES_USER,
    password : env.POSTGRES_PWD,
    host : env.POSTGRES_HOST,
    port : env.POSTGRES_PORT,
    database : env.POSTGRES_DB,
    ssl : false,
    statement_timeout : 1000,
  });