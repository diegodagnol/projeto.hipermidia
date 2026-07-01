# Explócus

Aplicação hipermídia gamificada para exploração do campus da **Universidade de Caxias do Sul (UCS)**. O usuário percorre pontos de interesse do campus, faz *check-in* em cada local, coleciona carimbos em um "passaporte" digital e disputa um ranking.

> Trabalho da disciplina **Projeto Temático Hipermídia** — Profa. Elisa Boff.

---

## Arquitetura

Monorepo com três aplicações independentes:

| Pacote | Descrição | Stack | Porta (dev) |
|--------|-----------|-------|-------------|
| [`hipermidia.api`](hipermidia.api) | API REST + servidor de produção (serve os dois SPAs em build) | Express 5, PostgreSQL (`pg`), JWT, Cloudinary | 3000 |
| [`hipermidia.admin`](hipermidia.admin) | CMS para administradores gerenciarem locais, mensagens e usuários | React 18 + Vite, React Admin, TipTap | 5173 |
| [`hipermidia.app`](hipermidia.app) | App principal dos usuários (mapa interativo, passaporte, ranking) | React 18 + Vite, Leaflet / OpenStreetMap, Framer Motion, SCSS | 5174 |

Em produção a API serve os builds estáticos: o app do usuário na raiz (`/`) e o admin em `/admin`.

## Funcionalidades

**App do usuário**
- Cadastro / login com autenticação JWT
- Mapa interativo do campus com Leaflet + tiles do OpenStreetMap (sem custo)
- Página de cada local com conteúdo rico (texto, imagens, vídeos do YouTube)
- Passaporte digital com carimbos de check-in
- Ranking entre usuários
- Perfil, edição de dados e configurações

**Admin (CMS)**
- CRUD de locais com editor de conteúdo rich-text (TipTap) e upload de imagens (Cloudinary)
- Gestão de usuários e de mensagens

## Tecnologias e decisões

- **Orçamento zero, dev solo.** Escolhas priorizam ferramentas gratuitas: OpenStreetMap em vez de Google Maps, Cloudinary (free tier) para imagens.
- **Segurança:** `helmet` (CSP configurada), `cors`, `express-rate-limit` no login, `express-validator`, `sanitize-html`, senhas com `bcryptjs`.
- **Banco:** PostgreSQL, com migrations versionadas em [`hipermidia.api/sql/migrations`](hipermidia.api/sql/migrations).

---

## Como rodar (desenvolvimento)

Pré-requisitos: **Node.js 18+** e um **PostgreSQL** acessível.

```bash
# 1. Instalar dependências de cada pacote
npm install
npm install --prefix hipermidia.api
npm install --prefix hipermidia.admin
npm install --prefix hipermidia.app

# 2. Configurar variáveis de ambiente (ver seção abaixo)

# 3. Rodar migrations do banco (arquivos em hipermidia.api/sql/migrations)

# 4. Subir API + Admin + App simultaneamente
npm run dev
```

O `npm run dev` (na raiz) usa `concurrently` para iniciar os três serviços de uma vez:
- **API** → http://localhost:3000
- **ADMIN** → http://localhost:5173
- **APP** → http://localhost:5174

### Criar um usuário administrador

```bash
cd hipermidia.api
ADMIN_NOME="Nome" ADMIN_EMAIL="admin@exemplo.com" ADMIN_SENHA="senha" node scripts/criar-admin.js
```

## Build e produção

```bash
# Na raiz — faz o build dos SPAs e instala as deps da API
npm run build

# Sobe a API servindo os builds do app e do admin
npm start
```

## Variáveis de ambiente

Cada pacote tem seu próprio `.env` (não versionado).

**`hipermidia.api/.env`**

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Segredo para assinar tokens JWT |
| `PORT` | Porta da API (padrão `3000`) |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciais do Cloudinary (upload de imagens) |

**`hipermidia.admin/.env`** e **`hipermidia.app/.env`** — apontam para a URL da API (build com `.env.production` para produção).

## Estrutura da API

```
hipermidia.api/src/
├── config/        # conexão com o banco
├── middlewares/   # autenticação (admin/usuário), errorHandler, sanitizeHtml
├── models/        # AdminUsuario, Local, Mensagem, Usuario
└── routes/        # auth, usuarios, locais, mensagens
```

Endpoints montados em: `/api/auth`, `/api/usuarios`, `/api/locais`, `/api/mensagens`.

## Configuração do ranking

O modo de ranking é definido por constantes no código (não por env var), e precisa ser mantido igual nos dois lados:

- `MODO_RANKING` em [`hipermidia.api/src/routes/usuarios.js`](hipermidia.api/src/routes/usuarios.js) e [`hipermidia.app/src/pages/Ranking.jsx`](hipermidia.app/src/pages/Ranking.jsx):
  - `'combinado'` → pontuação por taxa de checkpoints / tempo
  - `'checkpoints'` → apenas contagem de checkpoints
- `MOSTRAR_TEMPO` (em `Ranking.jsx`) → exibe ou não o tempo no card do ranking.
