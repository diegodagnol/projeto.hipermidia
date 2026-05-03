require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const authRouter     = require('./src/routes/auth');
const usuariosRouter = require('./src/routes/usuarios');
const locaisRouter   = require('./src/routes/locais');
const errorHandler   = require('./src/middlewares/errorHandler');

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

// Rate limiting no login: máx 10 tentativas por IP a cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});
app.use('/auth/admin/login', loginLimiter);

app.get('/', (req, res) => {
  res.json({ message: 'API do Projeto Hipermídia' });
});

app.use('/auth',     authRouter);
app.use('/usuarios', usuariosRouter);
app.use('/locais',   locaisRouter);

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
