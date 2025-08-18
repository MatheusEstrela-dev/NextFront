# 🌐 NextFront-

- Autenticação + Admin CRUD

Este projeto é um **Frontend** desenvolvido em **Next.js 15**,
utilizando **Prisma ORM** com banco **SQLite** (padrão, com ORM de estrutural de exemplo) e **Docker** para padronização de
ambiente.\
O objetivo é demonstrar **autenticação de usuários**, com **separação de
papéis (USER / ADMIN)**, permitindo que o administrador gerencie o CRUD
de usuários.

Login de demonstração:\

- **Admin** → `admin@abrasel.com` / `abrasel123`\ Pagina Admin
- **Usuário comum** → `user@example.com` / `user123` Pagina Home

---

## 🚀 Stack Tecnológica

| Camada           | Tecnologia              |
| ---------------- | ----------------------- |
| Backend          | App Router + Prisma     |
| Banco de Dados   | Sqlite                  |
| Autenticação JWT | (`jose`) + bcryptjs     |
| Ambiente         | Docker + docker-compose |
| Frontend         | Next.s 15 + Node        |
| Script de Setup  | ./start.sh              |

---

---

## 🧠 Diferenciais Técnicos

- 🔐 **Autenticação com JWT** e persistência via cookies HTTPOnly\
- 👤 **Separação de perfis** (usuário normal e administrador)\
- 🛠 **CRUD completo via painel Admin**\
- 🎨 **Interface moderna** com Tailwind, animações do Framer Motion e
  ícones do Lucide\
- 🐳 **Ambiente containerizado** para rodar em qualquer sistema\
- ⚡ **Seed automático** com +20 usuários fictícios para testes

---

## ▶️ Como Rodar

### 1. Clonar repositório

```sh
git clone https://github.com/MatheusEstrela-dev/NextFront.git
cd nextfront
```

### 2. Terminal ./start.sh

```sh
Via Git Bash, dar permissao ao arquivo para ser executado
chmod +x ./start.sh
```
<img width="1014" height="513" alt="Terminal" src="https://github.com/user-attachments/assets/d80c2818-1fb9-410a-8854-7be3c4b82ffe" />

O app estará rodando em:\
👉 <http://localhost:3000>

👉 <http://localhost:5555>

### 3. Inicializacao auto
```sh
> 1. Docker, inicializa os conatiners da aplicacao
> 2. Dependencias , confere Node, Next.js etc *vide erros caso necessario
> 3. Banco de dadaos, sobe o seed do Admin e usuarios de exemplo
```
### 3. Erros de dependencia

```sh
Por algum motivo, o terminal pode nao encontrar as dependias o package.json, sendo necessario a intervensao manual (`requirements-node`), sao a  libs instaladas para o projeto rodar corretamentee
```

### 3. Rodar migrations + seed manual

```sh
> docker compose exec web sh -lc "npm run seed"
```

---

## 🎨 Telas

- **Tela de Login/Cadastro** com busca automática de CEP (ViaCEP)\
- **Home (usuário)** → área simples pós-login\
- **Dashboard Admin** → gerencia usuários (listar, editar, excluir)

---

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

---

## 🎓 Sobre o Desenvolvedor

**Matheus Estrela**\
Analista de Sistemas \| Desenvolvedor FullStack\
🔗 [LinkedIn](https://www.linkedin.com/in/matheus-estrela-32072a104/)
