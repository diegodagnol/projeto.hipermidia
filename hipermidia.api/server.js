require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const authRouter          = require('./src/routes/auth');
const usuariosRouter      = require('./src/routes/usuarios');
const locaisRouter        = require('./src/routes/locais');
const recuperacaoRouter   = require('./src/routes/recuperacaoSenha');
const errorHandler        = require('./src/middlewares/errorHandler');

const app = express();

// Headers de segurança HTTP
app.use(helmet());

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

// Rate limiting na recuperação: máx 5 tentativas por IP a cada 15 minutos
const recuperacaoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});
app.use('/recuperacao-senha/solicitar', recuperacaoLimiter);

app.get('/', (req, res) => {
  res.json({ message: 'API do Projeto Hipermídia' });
});

app.use('/auth',              authRouter);
app.use('/usuarios',          usuariosRouter);
app.use('/locais',            locaisRouter);
app.use('/recuperacao-senha', recuperacaoRouter);

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
