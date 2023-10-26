const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DBNAME,
    password: process.env.DB_PASSW,
    port: process.env.DB_PORT
});

module.exports = pool;