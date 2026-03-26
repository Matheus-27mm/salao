<div align="center">
  <h1>💅 Sistema de Salão de Beleza</h1>
  <p>Sistema completo de gestão para salão de beleza: agendamento, caixa, estoque, clientes, profissionais e relatórios.</p>
  <a href="https://github.com/Matheus-27mm/salao">Repositório no GitHub</a>
</div>

---

## 🖥️ Tecnologias

- **Frontend:** React + Vite (porta 5199)
- **Backend:** Node.js + Express + Prisma (porta 3001)
- **Banco:** PostgreSQL (Supabase recomendado)

---

## 🚦 Instalação rápida (Windows)

1. **Clone o repositório:**
    ```bash
    git clone https://github.com/Matheus-27mm/salao.git
    cd salao
    ```
2. **Execute o script de instalação:**
    ```bash
    instalar.bat
    ```
    Isso instala dependências do backend e frontend, e gera o cliente Prisma.
3. **Configure o banco de dados:**
    - Crie um banco PostgreSQL (Supabase recomendado)
    - Copie `backend/.env.example` para `backend/.env` e preencha a variável `DATABASE_URL` com sua string de conexão.
    - Defina um valor seguro para `JWT_SECRET`.
4. **Inicie o sistema:**
    ```bash
    iniciar.bat
    ```
    Dois terminais abrirão: backend (porta 3001) e frontend (porta 5199).
5. **Acesse no navegador:**
    - [http://localhost:5199](http://localhost:5199)
    - No primeiro acesso, vá em `/setup` para criar a conta admin.
    - Depois, faça login em `/login`.

---

## 🐧 Instalação manual (multiplataforma)

### 1. Banco de dados

- Crie um banco PostgreSQL (local ou Supabase)
- Copie a string de conexão para o arquivo `.env` do backend

### 2. Backend

```bash
cd backend
cp .env.example .env # ou copy no Windows
# Edite .env conforme instruções
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---


## 🗂️ Estrutura de Pastas


```
salao/
├── backend/
│   ├── routes/         # Rotas: agendamentos, caixa, clientes, estoque, profissionais, serviços, relatórios
│   ├── middleware/     # Autenticação JWT
│   ├── prisma/         # schema.prisma (modelos do banco)
│   └── server.js       # Servidor Express
├── frontend/
│   ├── src/
│   │   ├── pages/      # Dashboard, Agenda, Clientes, Profissionais, Serviços, Caixa, Estoque, Relatórios
│   │   ├── components/ # Layout (sidebar)
│   │   ├── hooks/      # useAuth, useToast
│   │   └── utils/      # api.js, format.js
├── instalar.bat        # Instala dependências e prepara ambiente
├── iniciar.bat         # Inicia backend e frontend automaticamente
└── sincronizar_banco.bat # (opcional) Sincroniza banco manualmente
```


## 🛠️ Funcionalidades

| Módulo         | Funcionalidades principais                                                      |
| -------------- | ------------------------------------------------------------------------------ |
| **Agenda**     | Calendário semanal, criar/editar/cancelar agendamentos, atualizar status      |
| **Clientes**   | Cadastro, busca, histórico de atendimentos                                    |
| **Profissionais** | Cadastro, comissão, serviços vinculados                                 |
| **Serviços**   | Catálogo com preço e duração                                                  |
| **Caixa**      | Lançamentos do dia, entradas/saídas, formas de pagamento                      |
| **Estoque**    | Produtos, movimentações, alertas de estoque mínimo                            |
| **Relatórios** | Faturamento por período, profissional e serviço                               |


## 🔐 Segurança

- Autenticação JWT (expiração de 8h)
- Todas as rotas protegidas por middleware
- Senhas criptografadas com bcrypt (salt 10)

---

## 📝 Observações

- Scripts `.bat` facilitam a instalação e execução no Windows.
- Para Linux/Mac, use os comandos manualmente.
- O backend espera um banco PostgreSQL acessível via `DATABASE_URL`.
- O frontend comunica com o backend em `http://localhost:3001/api`.

---

## 🎯 Modo MVP (demonstração)

- O frontend já vem com `VITE_MVP_MODE=true` em `frontend/.env`.
- Nesse modo, o menu oculta os módulos **Estoque** e **Relatórios**, mantendo o restante do sistema igual.
- Para desativar depois, altere para `VITE_MVP_MODE=false` e reinicie o frontend.

### Popular dados de demo

No backend, execute:

```bash
cd backend
npm run seed:mvp
```

Esse script cria (sem duplicar):
- 3 serviços
- 2 profissionais
- 5 clientes
- 3 agendamentos no dia
- lançamentos iniciais no caixa

---

## 🤝 Contribuição

Pull requests são bem-vindos! Abra uma issue para sugestões ou problemas.

---

## 📄 Licença

MIT
