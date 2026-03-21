require('dotenv').config();

const express = require('express');
const usuariosRouter = require('./src/routes/usuarios');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API do Projeto Hipermídia' });
});

app.use('/usuarios', usuariosRouter);

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
