# B.aesthetics

SaaS White-Label para microempreendedoras do ramo da beleza (Lash Design, Nail Design, etc).

## Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **Banco de dados:** SQLite + Prisma ORM (arquivo local `dev.db`, zero configuração)
- **Autenticação:** JWT (jose) + bcrypt, sessão via cookie httpOnly

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# DATABASE_URL já vem pronto como "file:./dev.db" — não precisa de servidor de banco

# 3. Criar o banco SQLite e gerar o client Prisma
npm run db:push
npm run db:generate

# 4. (Opcional) Popular com dados de exemplo
npm run db:seed

# 5. Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

> 💡 O banco é um arquivo `prisma/dev.db` criado automaticamente. Para resetar tudo, basta apagar esse arquivo e rodar `npm run db:push` novamente. Para produção, troque `DATABASE_URL` para Postgres/MySQL alterando `provider` em `schema.prisma` quando for escalar — SQLite é ideal para MVP e desenvolvimento local, mas não é recomendado para múltiplos servidores em produção por causa de escrita concorrente.

## Credenciais de exemplo (após `db:seed`)

| Papel        | E-mail                       | Senha         | URL                          |
|--------------|-------------------------------|---------------|-------------------------------|
| Loja         | ana@lashstudio.com            | senha12345    | `/lash-studio-ana`            |
| Admin Master | admin@b-aesthetics.app        | admin12345    | `/admin`                      |

> ⚠️ O login do Admin (`/api/admin/*`) atualmente exige um `adminId` na sessão JWT. Para habilitar o login do painel master, crie uma rota `/api/admin/login` análoga à de loja, que chama `setSession({ adminId: admin.id })` após validar e-mail/senha contra a tabela `Admin`. Esse endpoint foi deixado para a próxima iteração — o seed já cria o registro no banco.

## Estrutura

```
src/
├── app/                  → Rotas Next.js (App Router) + API routes
├── components/
│   ├── layout/            → DashboardLayout (sidebar + nav)
│   ├── dashboard/          → Telas do painel da loja
│   └── admin/              → Painel master
├── contexts/              → ThemeContext (dark/light) + AuthContext
├── lib/
│   ├── prisma.ts           → Cliente Prisma singleton
│   ├── auth.ts             → JWT, sessão, hash de senha
│   └── guards.ts           → requireStore() / requireAdmin()
├── pages/                 → Componentes de tela reutilizados pelo App Router
└── styles/globals.css     → Design tokens (paletas dark/light)
```

## Paleta de cores

**Dark mode:** `#E80F88` `#E63E6D` `#790252` `#4C0033`
**Light mode:** `#F13E93` `#F875AA` `#F891BB` `#FE9EC7` `#FFAAB8` `#FFE4EF`

As variáveis CSS (`--color-brand`, `--bg-page`, etc.) ficam em `src/styles/globals.css` e trocam automaticamente com a classe `.dark` no `<html>`.

## Próximos passos sugeridos

1. **Login do Admin** — criar `/api/admin/login` + tela `/admin/login`.
2. **Upload de imagens** — integrar Cloudinary ou S3 para logo e fotos de serviço (hoje aceita apenas URL).
3. **E-mail transacional** — plugar Resend/SendGrid no fluxo de "esqueci minha senha".
4. **Reset de senha** — criar `/reset-password?token=` que valida o JWT gerado em `forgot-password` e atualiza a senha.
5. **Paginação** — adicionar paginação em `/api/admin/stores` e `/api/appointments` para escala.
6. **Multi-admin / RBAC** — hoje qualquer admin tem acesso total; considerar papéis se a equipe crescer.
