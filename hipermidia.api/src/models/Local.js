const { getPool } = require('../config/database');

async function findAll() {
  const pool = await getPool();
  const result = await pool.query(`
    SELECT id, nome, descricao, conteudo, latitude, longitude, foto_url, created_at, updated_at
    FROM local
    ORDER BY nome
  `);
  return result.rows;
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool.query(
    `SELECT id, nome, descricao, conteudo, latitude, longitude, foto_url, created_at, updated_at
     FROM local
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create({ nome, descricao, conteudo, latitude, longitude, foto_url }) {
  const pool = await getPool();
  const result = await pool.query(
    `INSERT INTO local (nome, descricao, conteudo, latitude, longitude, foto_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, descricao, conteudo, latitude, longitude, foto_url, created_at`,
    [nome, descricao, conteudo ?? null, latitude, longitude, foto_url ?? null]
  );
  return result.rows[0];
}

async function update(id, { nome, descricao, conteudo, latitude, longitude, foto_url }) {
  const pool = await getPool();
  const result = await pool.query(
    `UPDATE local
     SET nome      = $2,
         descricao = $3,
         conteudo  = $4,
         latitude  = $5,
         longitude = $6,
         foto_url  = $7,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, descricao, conteudo, latitude, longitude, foto_url, created_at, updated_at`,
    [id, nome, descricao, conteudo ?? null, latitude, longitude, foto_url ?? null]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const pool = await getPool();
  await pool.query('DELETE FROM usuariocheckpoint WHERE checkpoint_id = $1', [id]);
  const result = await pool.query(
    'DELETE FROM local WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

async function updateFoto(id, foto_url) {
  const pool = await getPool();
  const result = await pool.query(
    `UPDATE local
     SET foto_url   = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, foto_url`,
    [id, foto_url]
  );
  return result.rows[0] || null;
}

module.exports = { findAll, findById, create, update, updateFoto, remove };
