const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const AdminUsuario = require('../models/AdminUsuario');
const Usuario = require('../models/Usuario');

const router = express.Router();

function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
  next();
}

// POST /auth/admin/login
router.post(
  '/admin/login',
  [
    body('email').trim().isEmail().withMessage('E-mail inválido').normalizeEmail(),
    body('senha').notEmpty().withMessage('Senha é obrigatória'),
  ],
  validar,
  async (req, res, next) => {
    try {
      const { email, senha } = req.body;

      const admin = await AdminUsuario.findByEmail(email);

      // Mesma mensagem para email não encontrado e senha errada (evita enumeração)
      if (!admin) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const senhaCorreta = await AdminUsuario.verificarSenha(senha, admin.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const payload = { sub: admin.id, nome: admin.nome, email: admin.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({
        token,
        admin: { id: admin.id, nome: admin.nome, email: admin.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/login — usuário comum (aceita e-mail ou nome de usuário)
router.post(
  '/login',
  [
    body('identificador').trim().notEmpty().withMessage('Informe seu e-mail ou usuário'),
    body('senha').notEmpty().withMessage('Senha é obrigatória'),
  ],
  validar,
  async (req, res, next) => {
    try {
      const { identificador, senha } = req.body;

      // Detecta o tipo pelo "@": com arroba → e-mail, sem arroba → nome de usuário
      const ehEmail = identificador.includes('@');
      const usuario = ehEmail
        ? await Usuario.findByEmail(identificador.toLowerCase())
        : await Usuario.findByUsuario(identificador);

      if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const senhaCorreta = await Usuario.verificarSenha(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      const payload = { sub: usuario.id, nome: usuario.nome, email: usuario.email, usuario: usuario.usuario };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.json({
        token,
        usuario: { id: usuario.Id, nome: usuario.Nome, email: usuario.Email, usuario: usuario.usuario },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
