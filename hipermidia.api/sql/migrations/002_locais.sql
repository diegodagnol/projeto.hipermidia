-- Migration: cria tabela Local
-- Locais são pontos físicos (ex: blocos de universidade) usados como checkpoints

CREATE TABLE Local (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    nome        NVARCHAR(255)    NOT NULL,
    descricao   NVARCHAR(1000)   NOT NULL,
    conteudo    NVARCHAR(MAX)    NULL,
    latitude    DECIMAL(10, 8)   NOT NULL,
    longitude   DECIMAL(11, 8)   NOT NULL,
    foto_url    NVARCHAR(500)    NULL,
    created_at  DATETIME2        NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2        NULL
);

CREATE INDEX IX_Local_Nome ON Local (nome);
GO

-- Verificação
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Local'
ORDER BY ORDINAL_POSITION;
