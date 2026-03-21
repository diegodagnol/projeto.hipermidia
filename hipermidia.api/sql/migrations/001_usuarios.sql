-- Tabela principal de usuários
CREATE TABLE Usuario (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    nome        NVARCHAR(255)   NOT NULL,
    email       NVARCHAR(255)   NOT NULL,
    senha       NVARCHAR(255)   NOT NULL,   -- bcrypt hash
    usuario     NVARCHAR(100)   NOT NULL,   -- username único
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NULL,

    CONSTRAINT UQ_Usuario_Email   UNIQUE (email),
    CONSTRAINT UQ_Usuario_Usuario UNIQUE (usuario)
);

-- Checkpoints do usuário (lista de IDs de pontos visitados/salvos)
-- Separado da tabela principal para permitir queries relacionais eficientes
CREATE TABLE UsuarioCheckpoint (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id     INT         NOT NULL,
    checkpoint_id  INT         NOT NULL,
    created_at     DATETIME2   NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_UsuarioCheckpoint_Usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE,

    CONSTRAINT UQ_UsuarioCheckpoint
        UNIQUE (usuario_id, checkpoint_id)
);

CREATE INDEX IX_UsuarioCheckpoint_UsuarioId ON UsuarioCheckpoint (usuario_id);
