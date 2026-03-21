-- Migration: adiciona colunas faltantes na tabela Usuario existente
-- Tabela atual: Id, Nome, Email
-- Execução segura para tabelas com dados existentes

-- 1. Adiciona as novas colunas como NULL (sem quebrar os registros existentes)
ALTER TABLE Usuario
    ADD senha      NVARCHAR(255) NULL,
        usuario    NVARCHAR(100) NULL,
        created_at DATETIME2     NULL,
        updated_at DATETIME2     NULL;
GO

-- 2. Preenche created_at para os registros existentes
UPDATE Usuario SET created_at = GETDATE() WHERE created_at IS NULL;
GO

-- 3. Preenche usuario com base no Email (parte antes do @), garantindo unicidade com o Id
--    Ex: "diego@email.com" → "diego", se conflito → "diego_2"
UPDATE Usuario
SET usuario = LOWER(SUBSTRING(Email, 1, CHARINDEX('@', Email) - 1)) + '_' + CAST(Id AS NVARCHAR)
WHERE usuario IS NULL;
GO

-- 4. Preenche senha com um hash bcrypt de placeholder: "TrocarSenha@123"
--    ATENÇÃO: esses usuários devem redefinir a senha antes de usar o sistema
UPDATE Usuario
SET senha = '$2a$12$placeholderHashTrocarSenhaXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
WHERE senha IS NULL;
GO

-- 5. Aplica NOT NULL agora que todos os registros têm valor
ALTER TABLE Usuario
    ALTER COLUMN senha      NVARCHAR(255) NOT NULL;
ALTER TABLE Usuario
    ALTER COLUMN usuario    NVARCHAR(100) NOT NULL;
ALTER TABLE Usuario
    ALTER COLUMN created_at DATETIME2     NOT NULL;
GO

-- 6. Adiciona o DEFAULT para novos registros
ALTER TABLE Usuario ADD CONSTRAINT DF_Usuario_created_at DEFAULT GETDATE() FOR created_at;
GO

-- 7. Adiciona constraints de unicidade
ALTER TABLE Usuario ADD CONSTRAINT UQ_Usuario_Email   UNIQUE (Email);
ALTER TABLE Usuario ADD CONSTRAINT UQ_Usuario_Usuario UNIQUE (usuario);
GO

-- 8. Cria a tabela de checkpoints
CREATE TABLE UsuarioCheckpoint (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id     INT       NOT NULL,
    checkpoint_id  INT       NOT NULL,
    created_at     DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_UsuarioCheckpoint_Usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario(Id) ON DELETE CASCADE,

    CONSTRAINT UQ_UsuarioCheckpoint
        UNIQUE (usuario_id, checkpoint_id)
);

CREATE INDEX IX_UsuarioCheckpoint_UsuarioId ON UsuarioCheckpoint (usuario_id);
GO

-- Verificação final
SELECT Id, Nome, Email, usuario,
       LEFT(senha, 10) + '...' AS senha_hash_preview,
       created_at
FROM Usuario;
