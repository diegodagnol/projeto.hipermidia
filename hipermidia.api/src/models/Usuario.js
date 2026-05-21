const bcrypt = require('bcryptjs');
const { sql, getPool } = require('../config/database');

const SALT_ROUNDS = 12;

async function findAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, nome, email, usuario, created_at, updated_at
    FROM Usuario
    
  `);
  return result.recordset;
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT id, nome, email, usuario, created_at, updated_at
      FROM Usuario
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('email', sql.NVarChar(255), email)
    .query('SELECT id, nome, email, usuario, senha, created_at, updated_at FROM Usuario WHERE email = @email');
  return result.recordset[0] || null;
}

async function findByUsuario(usuario) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('usuario', sql.NVarChar(100), usuario)
    .query('SELECT id, nome, email, usuario, senha, created_at, updated_at FROM Usuario WHERE usuario = @usuario');
  return result.recordset[0] || null;
}

async function create({ nome, email, senha, usuario }) {
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const pool = await getPool();
  const result = await pool
    .request()
    .input('nome', sql.NVarChar(255), nome)
    .input('email', sql.NVarChar(255), email.toLowerCase())
    .input('senha', sql.NVarChar(255), senhaHash)
    .input('usuario', sql.NVarChar(100), usuario)
    .query(`
      INSERT INTO Usuario (nome, email, senha, usuario)
      OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email, INSERTED.usuario, INSERTED.created_at
      VALUES (@nome, @email, @senha, @usuario)
    `);
  return result.recordset[0];
}

async function update(id, { nome, email, usuario }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .input('nome', sql.NVarChar(255), nome)
    .input('email', sql.NVarChar(255), email.toLowerCase())
    .input('usuario', sql.NVarChar(100), usuario)
    .query(`
      UPDATE Usuario
      SET nome = @nome, email = @email, usuario = @usuario, updated_at = GETDATE()
      OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email, INSERTED.usuario, INSERTED.updated_at
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

async function updateSenha(id, novaSenha) {
  const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
  const pool = await getPool();
  await pool
    .request()
    .input('id', sql.Int, id)
    .input('senha', sql.NVarChar(255), senhaHash)
    .query(`
      UPDATE Usuario
      SET senha = @senha, updated_at = GETDATE()
      WHERE id = @id
    `);
}

async function remove(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Usuario OUTPUT DELETED.id WHERE id = @id');
  return result.recordset[0] || null;
}

async function verificarSenha(senhaTexto, senhaHash) {
  return bcrypt.compare(senhaTexto, senhaHash);
}

// --- Checkpoints ---

async function getCheckpoints(usuarioId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('usuario_id', sql.Int, usuarioId)
    .query(`
      SELECT checkpoint_id, created_at
      FROM UsuarioCheckpoint
      WHERE usuario_id = @usuario_id
      ORDER BY created_at
    `);
  return result.recordset;
}

async function addCheckpoint(usuarioId, checkpointId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('usuario_id', sql.Int, usuarioId)
    .input('checkpoint_id', sql.Int, checkpointId)
    .query(`
      IF NOT EXISTS (
        SELECT 1 FROM UsuarioCheckpoint
        WHERE usuario_id = @usuario_id AND checkpoint_id = @checkpoint_id
      )
      INSERT INTO UsuarioCheckpoint (usuario_id, checkpoint_id)
      OUTPUT INSERTED.usuario_id, INSERTED.checkpoint_id, INSERTED.created_at
      VALUES (@usuario_id, @checkpoint_id)
    `);
  return result.recordset[0] || null;
}

async function removeCheckpoint(usuarioId, checkpointId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('usuario_id', sql.Int, usuarioId)
    .input('checkpoint_id', sql.Int, checkpointId)
    .query(`
      DELETE FROM UsuarioCheckpoint
      OUTPUT DELETED.checkpoint_id
      WHERE usuario_id = @usuario_id AND checkpoint_id = @checkpoint_id
    `);
  return result.recordset[0] || null;
}

// --- Recuperação de senha ---

async function setCodigoRecuperacao(id, codigoHash) {
  const pool = await getPool();
  await pool
    .request()
    .input('id', sql.Int, id)
    .input('hash', sql.NVarChar(255), codigoHash)
    .query(`
      UPDATE Usuario
      SET recuperacao_codigo_hash = @hash,
          recuperacao_expira_em   = DATEADD(MINUTE, 15, GETDATE())
      WHERE id = @id
    `);
}

async function getRecuperacaoAtiva(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT recuperacao_codigo_hash
      FROM Usuario
      WHERE id = @id
        AND recuperacao_expira_em > GETDATE()
    `);
  return result.recordset[0] || null;
}

async function limparCodigoRecuperacao(id) {
  const pool = await getPool();
  await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      UPDATE Usuario
      SET recuperacao_codigo_hash = NULL,
          recuperacao_expira_em   = NULL
      WHERE id = @id
    `);
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
  setCodigoRecuperacao,
  getRecuperacaoAtiva,
  limparCodigoRecuperacao,
};
