const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');

const SALT_ROUNDS = 12;

async function findAll() {
  const pool = await getPool();
  const result = await pool.query(`
    SELECT id, nome, email, usuario, created_at, updated_at
    FROM usuario
  `);
  return result.rows;
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT id, nome, email, usuario, created_at, updated_at
     FROM usuario
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT id, nome, email, usuario, senha, created_at, updated_at
     FROM usuario
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

async function findByUsuario(usuario) {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT id, nome, email, usuario, senha, created_at, updated_at
     FROM usuario
     WHERE usuario = $1`,
    [usuario]
  );
  return result.rows[0] || null;
}

async function create({ nome, email, senha, usuario }) {
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO usuario (nome, email, senha, usuario)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, email, usuario, created_at`,
    [nome, email.toLowerCase(), senhaHash, usuario]
  );
  return result.rows[0];
}

async function update(id, { nome, email, usuario }) {
  const pool = await getPool();
  const result = await pool.query(
    `UPDATE usuario
     SET nome = $2, email = $3, usuario = $4, updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, email, usuario, updated_at`,
    [id, nome, email.toLowerCase(), usuario]
  );
  return result.rows[0] || null;
}

async function updateSenha(id, novaSenha) {
  const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
  const pool = await getPool();
  await pool.query(
    `UPDATE usuario
     SET senha = $2, updated_at = NOW()
     WHERE id = $1`,
    [id, senhaHash]
  );
}

async function remove(id) {
  const pool = await getPool();
  const result = await pool.query(
    'DELETE FROM usuario WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

async function verificarSenha(senhaTexto, senhaHash) {
  return bcrypt.compare(senhaTexto, senhaHash);
}

// --- Checkpoints ---

async function getCheckpoints(usuarioId) {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT checkpoint_id, created_at
     FROM usuariocheckpoint
     WHERE usuario_id = $1
     ORDER BY created_at`,
    [usuarioId]
  );
  return result.rows;
}

async function addCheckpoint(usuarioId, checkpointId) {
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO usuariocheckpoint (usuario_id, checkpoint_id)
     VALUES ($1, $2)
     ON CONFLICT (usuario_id, checkpoint_id) DO NOTHING
     RETURNING usuario_id, checkpoint_id, created_at`,
    [usuarioId, checkpointId]
  );
  return result.rows[0] || null;
}

async function removeCheckpoint(usuarioId, checkpointId) {
  const pool = await getPool();
  const result = await pool.query(
    `DELETE FROM usuariocheckpoint
     WHERE usuario_id = $1 AND checkpoint_id = $2
     RETURNING checkpoint_id`,
    [usuarioId, checkpointId]
  );
  return result.rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByUsuario,
  create,
  update,
  updateSenha,
  remove,
  verificarSenha,
  getCheckpoints,
  addCheckpoint,
  removeCheckpoint,
};
