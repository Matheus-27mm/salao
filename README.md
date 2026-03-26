# Sistema de Gestão para Salão

Aplicação full stack para gestão de salão de beleza com foco em operação diária:
agenda, clientes, profissionais, serviços, caixa, estoque e relatórios.

## Visão Geral

- Frontend: React + Vite
- Backend: Node.js + Express
- ORM: Prisma
- Banco de dados: PostgreSQL
- Autenticação: JWT

## Funcionalidades

- Agenda semanal com criação, edição e atualização de status
- Cadastro de clientes, profissionais e serviços
- Controle de caixa (entradas e saídas)
- Controle de estoque e movimentações
- Relatórios operacionais e dashboard
- Setup inicial para criação do primeiro usuário administrador

## Arquitetura do Projeto

```text
salao/
├── backend/
│   ├── middleware/
│   ├── prisma/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── iniciar.bat
├── instalar.bat
└── README.md
```

## Pré-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL 13+

## Instalação

### 1) Instalar dependências

No Windows, execute na raiz do projeto:

```bash
instalar.bat
```

Ou manualmente:

```bash
cd backend
npm install
npx prisma generate

cd ../frontend
npm install
```

### 2) Configurar variáveis de ambiente

Crie o arquivo `backend/.env` com base em `backend/.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/salao?schema=public"
JWT_SECRET="defina_uma_chave_forte"
PORT=3001
```

### 3) Sincronizar schema no banco

```bash
cd backend
npx prisma db push
```

## Execução

### Opção rápida (Windows)

```bash
iniciar.bat
```

### Opção manual

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

## Endereços locais

- Frontend: http://localhost:5199
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/health

## Primeiro acesso

1. Acesse `http://localhost:5199/setup`
2. Crie a conta admin
3. Faça login em `http://localhost:5199/login`

## Modo MVP (Demonstração)

O projeto inclui modo MVP para demo comercial:

- Arquivo: `frontend/.env`
- Flag: `VITE_MVP_MODE=true`
- Efeito: oculta módulos não essenciais na navegação (sem remover funcionalidades do backend)

Para popular dados de demonstração:

```bash
cd backend
npm run seed:mvp
```

## Scripts úteis

### Backend

- `npm run dev` — inicia API em modo desenvolvimento
- `npm run start` — inicia API em modo produção
- `npm run db:generate` — gera cliente Prisma
- `npm run db:push` — aplica schema no banco
- `npm run db:studio` — abre Prisma Studio
- `npm run seed:mvp` — popula dados de demonstração

### Frontend

- `npm run dev` — inicia app em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run preview` — preview da build

## Boas práticas adotadas

- Separação clara entre frontend e backend
- Rotas protegidas com middleware de autenticação
- Uso de variáveis de ambiente para segredos e conexão
- Organização de domínio por módulos (clientes, agenda, caixa etc.)
- Scripts de suporte para setup e seed de demo

## Segurança

- Nunca versionar arquivos `.env`
- Definir `JWT_SECRET` forte em produção
- Restringir acesso ao banco de dados por rede/IP
- Utilizar HTTPS e CORS configurado por ambiente

## Troubleshooting

### Porta em uso

Se a API ou frontend não subirem por porta ocupada, finalize processos antigos e inicie novamente.

### Erro de conexão com banco

- Validar `DATABASE_URL`
- Confirmar se o PostgreSQL está ativo
- Executar `npx prisma db push`

### Setup já realizado

A rota de setup cria apenas o primeiro admin. Após isso, utilize login normalmente.

## Contribuição

1. Crie uma branch de feature
2. Faça commits pequenos e descritivos
3. Abra Pull Request com contexto da mudança

## Licença

Defina a licença do projeto conforme sua estratégia (ex.: MIT, proprietária, uso interno).
