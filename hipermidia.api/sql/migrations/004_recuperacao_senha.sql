ALTER TABLE Usuario
  ADD recuperacao_codigo_hash NVARCHAR(255) NULL,
      recuperacao_expira_em   DATETIME2     NULL;
