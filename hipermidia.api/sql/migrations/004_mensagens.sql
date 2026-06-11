CREATE TABLE IF NOT EXISTS mensagens (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  assunto    VARCHAR(255) NOT NULL,
  mensagem   TEXT         NOT NULL,
  lido       BOOLEAN      NOT NULL DEFAULT FALSE,
  criado_em  TIMESTAMP    NOT NULL DEFAULT NOW()
);
