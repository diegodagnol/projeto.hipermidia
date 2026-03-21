const sql = require('mssql');
require('dotenv').config();

const config = {
  connectionString: process.env.CONNECTION_STRING,
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config.connectionString);
  }
  return pool;
}

module.exports = { sql, getPool };
