# OrgaView 🏢

Sistema de organograma corporativo dinâmico com foco visual premium. Ideal para empresas que querem visualizar sua estrutura organizacional de forma elegante e profissional.

![OrgaView](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![React Flow](https://img.shields.io/badge/React_Flow-Visualization-blue)

## ✨ Características Principais

- **🎨 Interface Premium**: Design moderno com gradientes, animações suaves e micro-interações
- **📸 Avatares de Alta Qualidade**: Upload com drag & drop, crop interativo e compressão automática
- **🔒 Segurança Robusta**: RLS (Row Level Security), validação de arquivos, e controle de acesso baseado em roles
- **⚡ Performance Otimizada**: Thumbnails para o canvas, lazy loading, e otimização de imagens com WebP
- **📊 Visualização Hierárquica**: Layout automático usando algoritmo ELK para organogramas complexos
- **🌐 Responsivo**: Funciona perfeitamente em desktop e mobile

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS com tema personalizado
- **Visualização**: React Flow com layout hierárquico (ELK.js)
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Validação**: Zod
- **Processamento de Imagens**: browser-image-compression, react-easy-crop

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com) (gratuita)
- Git

## ⚙️ Configuração

### 1. Clone o Repositório

```bash
git clone <seu-repositorio>
cd OrganorgramaAppBred
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Supabase

#### 3.1. Crie um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha os dados (Nome, Database Password, Região)
4. Aguarde a criação do projeto (~2 minutos)

#### 3.2. Obtenha as Credenciais

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie:
   - `Project URL` (ex: `https://xxxxx.supabase.co`)
   - `anon/public` key

#### 3.3. Configure o Arquivo `.env.local`

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e cole suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Execute a Migration do Banco de Dados

#### Opção A: Via SQL Editor (Recomendado)

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Cole no editor e clique em "Run"

#### Opção B: Via Supabase CLI

```bash
npx supabase link --project-ref seu-project-ref
npx supabase db push
```

### 5. Crie o Bucket de Storage

1. No Supabase Dashboard, vá em **Storage**
2. Clique em "Create bucket"
3. Nome: `avatars`
4. Marque como **Public bucket**
5. Clique em "Save"

As policies de segurança já foram criadas pela migration.

### 6. Crie um Usuário Admin (Primeira Vez)

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique em "Add user" → "Create new user"
3. Preencha email e senha
4. Após criar, vá em **Table Editor** → `profiles`
5. Clique em "Insert" → "Insert row"
6. Preencha:
   - `user_id`: O UUID do usuário que você criou
   - `email`: O mesmo email
   - `full_name`: Seu nome
   - `position`: "CEO" ou similar
   - `metadata`: `{"role": "admin"}`
7. Salve

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
OrganorgramaAppBred/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── upload-avatar/ # Upload de avatares
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página principal
├── components/
│   ├── avatar/            # Componentes de avatar
│   │   ├── AvatarUploader.tsx
│   │   ├── AvatarCropper.tsx
│   │   ├── AvatarPreview.tsx
│   │   └── AvatarFallback.tsx
│   └── org-chart/         # Componentes do organograma
│       ├── OrgChartCanvas.tsx
│       └── EmployeeNode.tsx
├── lib/
│   ├── supabase/          # Clientes Supabase
│   ├── utils/             # Utilitários
│   │   ├── image-validation.ts
│   │   ├── image-compression.ts
│   │   └── ...
│   └── schemas/           # Schemas Zod
├── types/                 # TypeScript types
│   └── supabase.ts        # Tipos gerados do DB
├── supabase/
│   └── migrations/        # Migrations SQL
└── middleware.ts          # Middleware Next.js
```

## 🔐 Segurança

O sistema implementa múltiplas camadas de segurança:

- **Row Level Security (RLS)**: Políticas de acesso no nível do banco de dados
- **Validação de Arquivos**: Magic number checking para prevenir malware
- **Controle de Tamanho**: Limite de 2MB por imagem
- **Nomenclatura Segura**: UUIDs para nomes de arquivos
- **Autenticação**: Supabase Auth com JWT
- **Role-based Access Control**: Apenas admins/editores podem modificar dados

## 🎨 Customização

### Cores do Tema

Edite `app/globals.css` para customizar as cores:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### Departamentos e Cores

Edite `components/org-chart/OrgChartCanvas.tsx` no MiniMap para customizar cores por departamento.

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

- Certifique-se de que `.env.local` existe e está preenchido corretamente
- Reinicie o servidor de desenvolvimento

### Erro: "relation 'profiles' does not exist"

- Execute a migration SQL no Supabase Dashboard

### Upload de Imagem Falha

- Verifique se o bucket `avatars` foi criado
- Confirme que as policies de storage foram aplicadas

## 📝 Licença

MIT License - Sinta-se livre para usar em projetos pessoais e comerciais.

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

**Desenvolvido com ❤️ usando Next.js e Supabase**
