/**
 * Script para criar o primeiro usuário administrador.
 * Execute uma única vez após rodar a migration 003_admin_usuarios.sql:
 *
 *   node scripts/criar-admin.js
 *
 * Ou defina as variáveis de ambiente para não precisar digitar:
 *   ADMIN_NOME="Seu Nome" ADMIN_EMAIL="email@dominio.com" ADMIN_SENHA="SuaSenha@123" node scripts/criar-admin.js
 */

require('dotenv').config();

const readline = require('readline');
const bcrypt   = require('bcryptjs');
const sql      = require('mssql');

const SALT_ROUNDS = 12;

async function perguntar(rl, pergunta) {
  return new Promise(resolve => rl.question(pergunta, resolve));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n=== Criar Administrador ===\n');

  const nome  = process.env.ADMIN_NOME  || await perguntar(rl, 'Nome: ');
  const email = process.env.ADMIN_EMAIL || await perguntar(rl, 'E-mail: ');
  const senha = process.env.ADMIN_SENHA || await perguntar(rl, 'Senha (mín. 8 caracteres): ');

  rl.close();

  if (!nome.trim() || !email.trim() || senha.length < 8) {
    console.error('\nErro: nome, e-mail e senha (mín. 8 chars) são obrigatórios.');
    process.exit(1);
  }

  const pool = await sql.connect(process.env.CONNECTION_STRING);

  const existe = await pool
    .request()
    .input('email', sql.NVarChar(255), email.toLowerCase())
    .query('SELECT id FROM AdminUsuario WHERE email = @email');

  if (existe.recordset.length > 0) {
    console.error('\nErro: já existe um admin com este e-mail.');
    await pool.close();
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  const result = await pool
    .request()
    .input('nome',  sql.NVarChar(255), nome.trim())
    .input('email', sql.NVarChar(255), email.toLowerCase().trim())
    .input('senha', sql.NVarChar(255), senhaHash)
    .query(`
      INSERT INTO AdminUsuario (nome, email, senha)
      OUTPUT INSERTED.id, INSERTED.nome, INSERTED.email, INSERTED.created_at
      VALUES (@nome, @email, @senha)
    `);

  const admin = result.recordset[0];
  console.log('\nAdministrador criado com sucesso!');
  console.log(`  ID:    ${admin.id}`);
  console.log(`  Nome:  ${admin.nome}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Criado em: ${admin.created_at}\n`);

  await pool.close();
}

main().catch(err => {
  console.error('\nErro ao criar admin:', err.message);
  process.exit(1);
});
