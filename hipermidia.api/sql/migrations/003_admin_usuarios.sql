-- Migration: cria tabela AdminUsuario
-- Usuários do painel administrativo — completamente separados dos usuarios do sistema

CREATE TABLE AdminUsuario (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    nome       NVARCHAR(255) NOT NULL,
    email      NVARCHAR(255) NOT NULL,
    senha      NVARCHAR(255) NOT NULL,
    created_at DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2     NULL,

    CONSTRAINT UQ_AdminUsuario_Email UNIQUE (email)
);
GO

-- Verificação
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'AdminUsuario'
ORDER BY ORDINAL_POSITION;
