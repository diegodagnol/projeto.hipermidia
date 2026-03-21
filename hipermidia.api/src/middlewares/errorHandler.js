function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} -`, err.message);

  // Erros conhecidos do mssql
  if (err.number === 2627 || err.number === 2601) {
    return res.status(409).json({ erro: 'Registro duplicado' });
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = errorHandler;
