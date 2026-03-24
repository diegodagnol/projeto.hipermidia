const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const AdminUsuario = require('../models/AdminUsuario');

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

module.exports = router;
