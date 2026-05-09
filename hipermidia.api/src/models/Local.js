const { sql, getPool } = require('../config/database');

async function findAll() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, nome, descricao, conteudo, latitude, longitude, foto_url, created_at, updated_at
    FROM Local
    ORDER BY nome
  `);
  return result.recordset;
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      SELECT id, nome, descricao, conteudo, latitude, longitude, foto_url, created_at, updated_at
      FROM Local
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

async function create({ nome, descricao, conteudo, latitude, longitude, foto_url }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('nome',      sql.NVarChar(255),  nome)
    .input('descricao', sql.NVarChar(1000), descricao)
    .input('conteudo',  sql.NVarChar(sql.MAX), conteudo  ?? null)
    .input('latitude',  sql.Decimal(10, 8), latitude)
    .input('longitude', sql.Decimal(11, 8), longitude)
    .input('foto_url',  sql.NVarChar(500),  foto_url  ?? null)
    .query(`
      INSERT INTO Local (nome, descricao, conteudo, latitude, longitude, foto_url)
      OUTPUT INSERTED.id, INSERTED.nome, INSERTED.descricao, INSERTED.conteudo,
             INSERTED.latitude, INSERTED.longitude, INSERTED.foto_url, INSERTED.created_at
      VALUES (@nome, @descricao, @conteudo, @latitude, @longitude, @foto_url)
    `);
  return result.recordset[0];
}

async function update(id, { nome, descricao, conteudo, latitude, longitude, foto_url }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id',        sql.Int,            id)
    .input('nome',      sql.NVarChar(255),  nome)
    .input('descricao', sql.NVarChar(1000), descricao)
    .input('conteudo',  sql.NVarChar(sql.MAX), conteudo  ?? null)
    .input('latitude',  sql.Decimal(10, 8), latitude)
    .input('longitude', sql.Decimal(11, 8), longitude)
    .input('foto_url',  sql.NVarChar(500),  foto_url  ?? null)
    .query(`
      UPDATE Local
      SET nome      = @nome,
          descricao = @descricao,
          conteudo  = @conteudo,
          latitude  = @latitude,
          longitude = @longitude,
          foto_url  = @foto_url,
          updated_at = GETDATE()
      OUTPUT INSERTED.id, INSERTED.nome, INSERTED.descricao, INSERTED.conteudo,
             INSERTED.latitude, INSERTED.longitude, INSERTED.foto_url,
             INSERTED.created_at, INSERTED.updated_at
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

async function remove(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Local OUTPUT DELETED.id WHERE id = @id');
  return result.recordset[0] || null;
}

async function updateFoto(id, foto_url) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id',       sql.Int,           id)
    .input('foto_url', sql.NVarChar(500), foto_url)
    .query(`
      UPDATE Local
      SET foto_url   = @foto_url,
          updated_at = GETDATE()
      OUTPUT INSERTED.id, INSERTED.foto_url
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

module.exports = { findAll, findById, create, update, updateFoto, remove };
