const { getPool } = require('../config/database');

async function create({ nome, email, assunto, mensagem }) {
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO mensagens (nome, email, assunto, mensagem)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, email, assunto, mensagem, lido, criado_em`,
    [nome, email, assunto, mensagem]
  );
  return result.rows[0];
}

async function findAll() {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT id, nome, email, assunto, mensagem, lido, criado_em
     FROM mensagens
     ORDER BY criado_em DESC`
  );
  return result.rows;
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT id, nome, email, assunto, mensagem, lido, criado_em
     FROM mensagens
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function marcarLido(id) {
  const pool = await getPool();
  const result = await pool.query(
    `UPDATE mensagens SET lido = TRUE WHERE id = $1
     RETURNING id, nome, email, assunto, mensagem, lido, criado_em`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { create, findAll, findById, marcarLido };
