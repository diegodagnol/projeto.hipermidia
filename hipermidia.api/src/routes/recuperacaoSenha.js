const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const email   = require('../services/email');

const router = express.Router();

const MENSAGEM_PADRAO = 'Se este e-mail estiver cadastrado, você receberá um código em breve.';

function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
  next();
}

// POST /recuperacao-senha/solicitar
router.post(
  '/solicitar',
  [body('email').trim().isEmail().withMessage('E-mail inválido').normalizeEmail()],
  validar,
  async (req, res, next) => {
    try {
      const { email: emailReq } = req.body;

      const usuario = await Usuario.findByEmail(emailReq);
      if (!usuario) return res.json({ mensagem: MENSAGEM_PADRAO });

      const codigo = String(Math.floor(100000 + Math.random() * 900000));
      const codigoHash = await bcrypt.hash(codigo, 10);

      await Usuario.setCodigoRecuperacao(usuario.id, codigoHash);
      await email.enviarCodigoRecuperacao(emailReq, usuario.nome, codigo);

      res.json({ mensagem: MENSAGEM_PADRAO });
    } catch (err) {
      next(err);
    }
  }
);

// POST /recuperacao-senha/verificar
router.post(
  '/verificar',
  [
    body('email').trim().isEmail().withMessage('E-mail inválido').normalizeEmail(),
    body('codigo').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Código inválido'),
  ],
  validar,
  async (req, res, next) => {
    try {
      const { email: emailReq, codigo } = req.body;
      const ERRO = 'Código inválido ou expirado.';

      const usuario = await Usuario.findByEmail(emailReq);
      if (!usuario) return res.status(400).json({ erro: ERRO });

      const recuperacao = await Usuario.getRecuperacaoAtiva(usuario.id);
      if (!recuperacao) return res.status(400).json({ erro: ERRO });

      const correto = await bcrypt.compare(codigo, recuperacao.recuperacao_codigo_hash);
      if (!correto) return res.status(400).json({ erro: ERRO });

      const token = jwt.sign(
        { sub: usuario.id, proposito: 'recuperacao' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

// POST /recuperacao-senha/redefinir
router.post(
  '/redefinir',
  [
    body('token').notEmpty().withMessage('Token obrigatório'),
    body('nova_senha').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres'),
  ],
  validar,
  async (req, res, next) => {
    try {
      const { token, nova_senha } = req.body;

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        return res.status(400).json({ erro: 'Link expirado. Solicite um novo código.' });
      }

      if (payload.proposito !== 'recuperacao') {
        return res.status(400).json({ erro: 'Token inválido.' });
      }

      const recuperacao = await Usuario.getRecuperacaoAtiva(payload.sub);
      if (!recuperacao) {
        return res.status(400).json({ erro: 'Código expirado. Solicite um novo.' });
      }

      await Usuario.updateSenha(payload.sub, nova_senha);
      await Usuario.limparCodigoRecuperacao(payload.sub);

      res.json({ mensagem: 'Senha atualizada com sucesso.' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
