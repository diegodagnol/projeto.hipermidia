const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { body, param, validationResult } = require('express-validator');
const Local = require('../models/Local');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const sanitizeConteudo  = require('../middlewares/sanitizeHtml');

const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(Object.assign(new Error('Apenas imagens são permitidas'), { status: 400 }));
  },
});

function deletarFotoLocal(foto_url) {
  if (!foto_url || !foto_url.startsWith('/uploads/')) return;
  const filepath = path.join(uploadsDir, path.basename(foto_url));
  fs.unlink(filepath, () => {});
}

const router = express.Router();

function validar(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }
  next();
}

const validacoesCorpo = [
  body('nome')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ max: 255 }).withMessage('Nome deve ter no máximo 255 caracteres'),
  body('descricao')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('latitude')
    .notEmpty().withMessage('Latitude é obrigatória')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude inválida (deve estar entre -90 e 90)'),
  body('longitude')
    .notEmpty().withMessage('Longitude é obrigatória')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude inválida (deve estar entre -180 e 180)'),
  body('conteudo')
    .optional({ nullable: true })
    .isString().withMessage('Conteúdo inválido'),
  body('foto_url')
    .optional({ nullable: true })
    .isLength({ max: 500 }).withMessage('URL da foto deve ter no máximo 500 caracteres'),
];

const validarId = [param('id').isInt({ min: 1 }).withMessage('ID inválido')];

// GET /locais
router.get('/', async (req, res, next) => {
  try {
    const locais = await Local.findAll();
    res.json(locais);
  } catch (err) {
    next(err);
  }
});

// GET /locais/:id
router.get('/:id', validarId, validar, async (req, res, next) => {
  try {
    const local = await Local.findById(Number(req.params.id));
    if (!local) return res.status(404).json({ erro: 'Local não encontrado' });
    res.json(local);
  } catch (err) {
    next(err);
  }
});

// POST /locais
router.post('/', authenticateAdmin, sanitizeConteudo, validacoesCorpo, validar, async (req, res, next) => {
  try {
    const { nome, descricao, conteudo, latitude, longitude, foto_url } = req.body;
    const novo = await Local.create({ nome, descricao, conteudo, latitude, longitude, foto_url });
    res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
});

// PUT /locais/:id
router.put('/:id', authenticateAdmin, sanitizeConteudo, [...validarId, ...validacoesCorpo], validar, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nome, descricao, conteudo, latitude, longitude, foto_url } = req.body;

    const existe = await Local.findById(id);
    if (!existe) return res.status(404).json({ erro: 'Local não encontrado' });

    if (existe.foto_url !== foto_url) deletarFotoLocal(existe.foto_url);

    const atualizado = await Local.update(id, { nome, descricao, conteudo, latitude, longitude, foto_url });
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
});

// POST /locais/:id/upload
router.post('/:id/upload', authenticateAdmin, validarId, validar, (req, res, next) => {
  upload.single('foto')(req, res, (err) => {
    if (err) return next(Object.assign(err, { status: err.status || 400 }));
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

    const id = Number(req.params.id);
    const existe = await Local.findById(id);
    if (!existe) return res.status(404).json({ erro: 'Local não encontrado' });

    deletarFotoLocal(existe.foto_url);

    const foto_url = `/uploads/${req.file.filename}`;
    await Local.updateFoto(id, foto_url);
    res.json({ foto_url });
  } catch (err) {
    next(err);
  }
});

// DELETE /locais/:id
router.delete('/:id', authenticateAdmin, validarId, validar, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existe = await Local.findById(id);
    if (!existe) return res.status(404).json({ erro: 'Local não encontrado' });

    await Local.remove(id);
    deletarFotoLocal(existe.foto_url);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
