const bcrypt = require('bcryptjs');
const { sql, getPool } = require('../config/database');

const SALT_ROUNDS = 12;

async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('email', sql.NVarChar(255), email)
    .query('SELECT * FROM AdminUsuario WHERE email = @email');
  return result.recordset[0] || null;
}

async function create({ nome, email, senha }) {
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const pool = await getPool();
  const result = await pool
    .request()
    .input('nome',  sql.NVarChar(255), nome)
    .input('email', sql.NVarChar(255), email.toLowerCase())
    .input('senha', sql.NVarChar(255), senhaHash)
    .query(`
      INSERT INTO AdminUsuario (nome, email, senha)
      OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email, INSERTED.created_at
      VALUES (@nome, @email, @senha)
    `);
  return result.recordset[0];
}

async function verificarSenha(senhaTexto, senhaHash) {
  return bcrypt.compare(senhaTexto, senhaHash);
}

module.exports = { findByEmail, create, verificarSenha };
