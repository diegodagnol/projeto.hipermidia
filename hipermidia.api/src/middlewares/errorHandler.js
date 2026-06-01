function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} -`, err.message);

  // Violação de unique constraint no PostgreSQL (código 23505)
  if (err.code === '23505') {
    return res.status(409).json({ erro: 'Registro duplicado' });
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = errorHandler;
