-- ============================================================
-- Schema completo para PostgreSQL (Neon)
-- Equivalente às migrations MSSQL 001, 002 e 003
-- Execute este script uma única vez no SQL Editor do Neon
-- ============================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuario (
    id          SERIAL          PRIMARY KEY,
    nome        VARCHAR(255)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    senha       VARCHAR(255)    NOT NULL,
    usuario     VARCHAR(100)    NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NULL,

    CONSTRAINT uq_usuario_email   UNIQUE (email),
    CONSTRAINT uq_usuario_usuario UNIQUE (usuario)
);

-- Checkpoints visitados por usuário
CREATE TABLE IF NOT EXISTS usuariocheckpoint (
    id             SERIAL      PRIMARY KEY,
    usuario_id     INT         NOT NULL,
    checkpoint_id  INT         NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_usuariocheckpoint_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT uq_usuariocheckpoint
        UNIQUE (usuario_id, checkpoint_id)
);

CREATE INDEX IF NOT EXISTS ix_usuariocheckpoint_usuarioid
    ON usuariocheckpoint (usuario_id);

-- Pontos físicos (blocos, salas, etc.)
CREATE TABLE IF NOT EXISTS local (
    id          SERIAL          PRIMARY KEY,
    nome        VARCHAR(255)    NOT NULL,
    descricao   VARCHAR(1000)   NOT NULL,
    conteudo    TEXT            NULL,
    latitude    DECIMAL(10, 8)  NOT NULL,
    longitude   DECIMAL(11, 8)  NOT NULL,
    foto_url    VARCHAR(500)    NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NULL
);

CREATE INDEX IF NOT EXISTS ix_local_nome ON local (nome);

-- Usuários do painel administrativo
CREATE TABLE IF NOT EXISTS adminusuario (
    id         SERIAL       PRIMARY KEY,
    nome       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    senha      VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NULL,

    CONSTRAINT uq_adminusuario_email UNIQUE (email)
);
