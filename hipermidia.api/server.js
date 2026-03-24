require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const authRouter     = require('./src/routes/auth');
const usuariosRouter = require('./src/routes/usuarios');
const locaisRouter   = require('./src/routes/locais');
const errorHandler   = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

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
