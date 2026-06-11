const express = require('express');
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { body, param, validationResult } = require('express-validator');
const Local = require('../models/Local');
const authenticateAdmin = require('../middlewares/authenticateAdmin');
const sanitizeConteudo  = require('../middlewares/sanitizeHtml');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'explocus',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(Object.assign(new Error('Apenas imagens são permitidas'), { status: 400 }));
  },
});

async function deletarFotoCloudinary(foto_url) {
  if (!foto_url || !foto_url.includes('cloudinary.com')) return;
  try {
    const partes = foto_url.split('/');
    const arquivo = partes[partes.length - 1].replace(/\.[^.]+$/, '');
    const publicId = `explocus/${arquivo}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (_) {}
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

    if (existe.foto_url !== foto_url) await deletarFotoCloudinary(existe.foto_url);

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

    await deletarFotoCloudinary(existe.foto_url);

    const foto_url = req.file.path;
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
    await deletarFotoCloudinary(existe.foto_url);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
