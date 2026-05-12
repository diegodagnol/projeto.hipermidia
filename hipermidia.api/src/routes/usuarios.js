const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const authenticateUser = require('../middlewares/authenticateUser');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Permite acesso se for admin OU se for o próprio usuário (payload.usuario distingue os dois)
function authenticateAdminOrSelf(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Token de autenticação ausente' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = typeof payload.usuario === 'undefined';
    if (isAdmin) {
      req.admin = payload;
    } else {
      req.usuario = payload;
    }
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }
  next();
}

const validacoesCriar = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 255 }),
  body('email').trim().isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('usuario')
    .trim()
    .notEmpty()
    .withMessage('Usuário é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Usuário deve ter entre 3 e 100 caracteres')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Usuário pode conter apenas letras, números, _, . e -'),
  body('senha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres'),
];

const validacoesAtualizar = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 255 }),
  body('email').trim().isEmail().withMessage('E-mail inválido').normalizeEmail(),
  body('usuario')
    .trim()
    .notEmpty()
    .withMessage('Usuário é obrigatório')
    .isLength({ min: 3, max: 100 })
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Usuário pode conter apenas letras, números, _, . e -'),
];

// GET /usuarios/ranking — classificação pública por checkpoints
router.get('/ranking', async (req, res, next) => {
  try {
    const { sql, getPool } = require('../config/database');
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        u.id,
        u.nome,
        u.usuario,
        COUNT(c.checkpoint_id) AS total_checkpoints,
        MIN(c.created_at)      AS primeiro_checkpoint
      FROM Usuario u
      LEFT JOIN UsuarioCheckpoint c ON c.usuario_id = u.id
      GROUP BY u.id, u.nome, u.usuario
      ORDER BY total_checkpoints DESC, primeiro_checkpoint ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

// GET /usuarios
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
});

// GET /usuarios/:id
router.get(
  '/:id',
  authenticateAdmin,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  validar,
  async (req, res, next) => {
    try {
      const usuario = await Usuario.findById(Number(req.params.id));
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  }
);

// POST /usuarios
router.post('/', validacoesCriar, validar, async (req, res, next) => {
  try {
    const { nome, email, senha, usuario } = req.body;

    const [emailExiste, usuarioExiste] = await Promise.all([
      Usuario.findByEmail(email),
      Usuario.findByUsuario(usuario),
    ]);

    if (emailExiste) return res.status(409).json({ erro: 'E-mail já cadastrado' });
    if (usuarioExiste) return res.status(409).json({ erro: 'Nome de usuário já está em uso' });

    const novo = await Usuario.create({ nome, email, senha, usuario });
    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
});

// PUT /usuarios/:id
router.put('/:id', authenticateAdminOrSelf, validacoesAtualizar, validar, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!req.admin && req.usuario.sub !== id) {
      return res.status(403).json({ erro: 'Sem permissão para alterar este usuário' });
    }

    const { nome, email, usuario } = req.body;

    const existe = await Usuario.findById(id);
    if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });

    const [emailExiste, usuarioExiste] = await Promise.all([
      Usuario.findByEmail(email),
      Usuario.findByUsuario(usuario),
    ]);

    if (emailExiste && emailExiste.id !== id)
      return res.status(409).json({ erro: 'E-mail já cadastrado por outro usuário' });
    if (usuarioExiste && usuarioExiste.id !== id)
      return res.status(409).json({ erro: 'Nome de usuário já está em uso' });

    const atualizado = await Usuario.update(id, { nome, email, usuario });
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
});

// PATCH /usuarios/:id/senha
router.patch(
  '/:id/senha',
  authenticateAdminOrSelf,
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('senha_atual').notEmpty().withMessage('Senha atual é obrigatória'),
    body('nova_senha')
      .isLength({ min: 8 })
      .withMessage('Nova senha deve ter no mínimo 8 caracteres'),
  ],
  validar,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      if (!req.admin && req.usuario.sub !== id) {
        return res.status(403).json({ erro: 'Sem permissão para alterar este usuário' });
      }

      const { senha_atual, nova_senha } = req.body;

      const usuario = await Usuario.findByEmail(
        (await Usuario.findById(id))?.email ?? ''
      );

      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

      const senhaCorreta = await Usuario.verificarSenha(senha_atual, usuario.senha);
      if (!senhaCorreta) return res.status(401).json({ erro: 'Senha atual incorreta' });

      await Usuario.updateSenha(id, nova_senha);
      res.json({ mensagem: 'Senha atualizada com sucesso' });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /usuarios/:id
router.delete(
  '/:id',
  authenticateAdmin,
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  validar,
  async (req, res, next) => {
    try {
      const deletado = await Usuario.remove(Number(req.params.id));
      if (!deletado) return res.status(404).json({ erro: 'Usuário não encontrado' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

// --- Checkpoints ---

// GET /usuarios/:id/checkpoints
router.get(
  '/:id/checkpoints',
  [param('id').isInt({ min: 1 }).withMessage('ID inválido')],
  validar,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const existe = await Usuario.findById(id);
      if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });

      const checkpoints = await Usuario.getCheckpoints(id);
      res.json(checkpoints);
    } catch (err) {
      next(err);
    }
  }
);

// POST /usuarios/:id/checkpoints
router.post(
  '/:id/checkpoints',
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    body('checkpoint_id').isInt({ min: 1 }).withMessage('checkpoint_id inválido'),
  ],
  validar,
  async (req, res, next) => {
    try {
      const usuarioId = Number(req.params.id);
      const { checkpoint_id } = req.body;

      const existe = await Usuario.findById(usuarioId);
      if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });

      const adicionado = await Usuario.addCheckpoint(usuarioId, Number(checkpoint_id));
      if (!adicionado) return res.status(409).json({ erro: 'Checkpoint já registrado para este usuário' });

      res.status(201).json(adicionado);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /usuarios/:id/checkpoints/:checkpointId
router.delete(
  '/:id/checkpoints/:checkpointId',
  [
    param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    param('checkpointId').isInt({ min: 1 }).withMessage('checkpoint_id inválido'),
  ],
  validar,
  async (req, res, next) => {
    try {
      const removido = await Usuario.removeCheckpoint(
        Number(req.params.id),
        Number(req.params.checkpointId)
      );
      if (!removido) return res.status(404).json({ erro: 'Checkpoint não encontrado para este usuário' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
