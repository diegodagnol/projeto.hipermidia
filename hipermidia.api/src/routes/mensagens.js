const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Mensagem = require('../models/Mensagem');
const authenticateAdmin = require('../middlewares/authenticateAdmin');

const router = express.Router();

function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array() });
  next();
}

// POST /mensagens — público
router.post('/', [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 255 }),
  body('email').trim().isEmail().withMessage('E-mail inválido').isLength({ max: 255 }),
  body('assunto').trim().notEmpty().withMessage('Assunto é obrigatório').isLength({ max: 255 }),
  body('mensagem').trim().notEmpty().withMessage('Mensagem é obrigatória').isLength({ max: 2000 }),
], validar, async (req, res, next) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;
    const nova = await Mensagem.create({ nome, email, assunto, mensagem });
    res.status(201).json(nova);
  } catch (err) {
    next(err);
  }
});

// GET /mensagens — admin
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const mensagens = await Mensagem.findAll();
    res.json(mensagens);
  } catch (err) {
    next(err);
  }
});

// PATCH /mensagens/:id/lido — admin
router.patch('/:id/lido', authenticateAdmin, [
  param('id').isInt({ min: 1 }),
], validar, async (req, res, next) => {
  try {
    const mensagem = await Mensagem.marcarLido(Number(req.params.id));
    if (!mensagem) return res.status(404).json({ erro: 'Mensagem não encontrada' });
    res.json(mensagem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
