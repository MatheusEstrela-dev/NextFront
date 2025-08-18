# 🌐 NextFront ERP - Autenticação + Admin CRUD

Este projeto é um **ERP Frontend** desenvolvido em **Next.js 15**,
utilizando **Prisma ORM** com banco **SQLite** (padrão, mas facilmente
adaptável para PostgreSQL ou MySQL) e **Docker** para padronização de
ambiente.\
O objetivo é demonstrar **autenticação de usuários**, com **separação de
papéis (USER / ADMIN)**, permitindo que o administrador gerencie o CRUD
de usuários.

Login de demonstração:\
- **Admin** → `admin@example.com` / `admin123`\
- **Usuário comum** → `user@example.com` / `user123`

------------------------------------------------------------------------

## 🚀 Stack Tecnológica

  Camada           Tecnologia
  ---------------- --------------------------------------------
  Frontend         Next.js 15 + React 19
  Backend/API      Next.js Route Handlers + Prisma
  Banco de Dados   SQLite (dev) / PostgreSQL (prod-ready)
  Autenticação     JWT (`jose`) + bcryptjs
  Estilização      TailwindCSS + Framer Motion + Lucide Icons
  Ambiente         Docker + docker-compose

------------------------------------------------------------------------

## 🧠 Diferenciais Técnicos

-   🔐 **Autenticação com JWT** e persistência via cookies HTTPOnly\
-   👤 **Separação de perfis** (usuário normal e administrador)\
-   🛠 **CRUD completo via painel Admin**\
-   🎨 **Interface moderna** com Tailwind, animações do Framer Motion e
    ícones do Lucide\
-   🐳 **Ambiente containerizado** para rodar em qualquer sistema\
-   ⚡ **Seed automático** com +20 usuários fictícios para testes

------------------------------------------------------------------------

## ▶️ Como Rodar

### 1. Clonar repositório

``` sh
git clone https://github.com/SEU_USUARIO/nextfront.git
cd nextfront
```

### 2. Subir containers

``` sh
docker compose up -d --build
```

O app estará rodando em:\
👉 <http://localhost:3000>

### 3. Rodar migrations + seed

``` sh
docker compose exec web sh -lc "npx prisma migrate dev"
docker compose exec web sh -lc "npm run seed"
```

------------------------------------------------------------------------

## 🎨 Telas

-   **Tela de Login/Cadastro** com busca automática de CEP (ViaCEP)\
-   **Home (usuário)** → área simples pós-login\
-   **Dashboard Admin** → gerencia usuários (listar, editar, excluir)

------------------------------------------------------------------------

## 📂 Estrutura Simplificada

    nextfront/
     ├─ prisma/          # schema + seed
     ├─ src/app/
     │   ├─ api/         # rotas API (auth, users…)
     │   ├─ admin/       # dashboard do admin
     │   ├─ dashboard/   # home de usuários
     │   └─ page.tsx     # tela inicial (login/cadastro)
     ├─ Dockerfile
     ├─ docker-compose.yml
     └─ package.json

------------------------------------------------------------------------

## 🎓 Sobre o Desenvolvedor

**Matheus Estrela**\
Analista de Sistemas \| Desenvolvedor FullStack\
🔗 [LinkedIn](https://www.linkedin.com/in/matheus-estrela-32072a104/)
