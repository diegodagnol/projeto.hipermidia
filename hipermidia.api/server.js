require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const authRouter     = require('./src/routes/auth');
const usuariosRouter = require('./src/routes/usuarios');
const locaisRouter   = require('./src/routes/locais');
const errorHandler   = require('./src/middlewares/errorHandler');

const app = express();

// Headers de segurança HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https://*.basemaps.cartocdn.com', 'https://*.tile.openstreetmap.org'],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting no login: máx 10 tentativas por IP a cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});
app.use('/auth/admin/login', loginLimiter);

app.use('/api/auth',     authRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/locais',   locaisRouter);

// Serve admin SPA
app.use('/admin', express.static(path.join(__dirname, '../hipermidia.admin/dist')));
app.get('/admin/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../hipermidia.admin/dist/index.html'));
});

// Serve app SPA (deve ficar por último)
app.use(express.static(path.join(__dirname, '../hipermidia.app/dist')));
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../hipermidia.app/dist/index.html'));
});

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
