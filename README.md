# Barbearia do Pedro — Sistema de Agendamento

Projeto de portfólio: sistema de agendamento online para uma barbearia com
um único barbeiro. Cliente agenda sozinho (sem login); admin gerencia tudo
por um painel autenticado.

Stack: **Next.js 14 (App Router) + Tailwind CSS + Supabase**

---

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto (escolha uma senha forte para o banco — guarde-a)
3. Vá em **SQL Editor** (menu lateral) → **New query**
4. Copie todo o conteúdo do arquivo `supabase/schema.sql` deste projeto, cole
   lá e clique em **Run**. Isso cria as tabelas, as regras de segurança (RLS)
   e já insere os 4 serviços iniciais.
5. Vá em **Authentication → Users → Add user** e crie o seu usuário admin
   (o e-mail e senha que você vai usar para logar no painel `/admin`)
6. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**

## 2. Configurar as variáveis de ambiente

Copie o arquivo `.env.local.example` para `.env.local`:

```
cp .env.local.example .env.local
```

Abra o `.env.local` e cole a URL e a chave que você copiou no passo anterior.

## 3. Instalar e rodar o projeto

Com o Node.js já instalado (v18 ou superior):

```
npm install
npm run dev
```

Abra **http://localhost:3000** no navegador — essa é a tela do cliente.

Abra **http://localhost:3000/admin** para o painel administrativo (vai pedir
login — use o e-mail/senha que você criou no passo 1.5).

## 4. Estrutura do projeto

```
app/
  page.tsx                → Tela 1: lista de serviços (cliente)
  agendar/page.tsx         → Tela 2: escolha de dia e horário
  confirmar/page.tsx       → Tela 3: confirmação (nome + telefone)
  admin/
    login/page.tsx         → Login do admin
    page.tsx               → Tela 4: dashboard administrativo
lib/
  supabase/client.ts       → Conexão Supabase (navegador)
  supabase/server.ts       → Conexão Supabase (servidor)
  types.ts                 → Tipos TypeScript do banco
supabase/
  schema.sql               → SQL completo (tabelas + RLS + dados iniciais)
middleware.ts               → Protege as rotas /admin (exige login)
```

## 5. Próximos passos / melhorias futuras

- Lembrete automático por WhatsApp ou e-mail antes do horário marcado
  (ainda não implementado — ficou fora do escopo inicial)
- Cadastro de múltiplos barbeiros (hoje o sistema assume um barbeiro só)
- Editar/desativar serviços direto pelo painel admin (hoje isso é feito
  direto no Supabase, na tabela `servicos`)

## 6. Deploy

Recomendado: [Vercel](https://vercel.com) (gratuito para projetos pessoais).
Basta conectar o repositório do GitHub e adicionar as mesmas variáveis de
ambiente do `.env.local` nas configurações do projeto na Vercel.
