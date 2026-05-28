const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');

const SALT_ROUNDS = 12;

async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool.query(
    'SELECT * FROM adminusuario WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function create({ nome, email, senha }) {
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO adminusuario (nome, email, senha)
     VALUES ($1, $2, $3)
     RETURNING id, nome, email, created_at`,
    [nome, email.toLowerCase(), senhaHash]
  );
  return result.rows[0];
}

async function verificarSenha(senhaTexto, senhaHash) {
  return bcrypt.compare(senhaTexto, senhaHash);
}

module.exports = { findByEmail, create, verificarSenha };
