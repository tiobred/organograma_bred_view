# 🚀 Guia de Deploy - OrgaView

## ⚠️ Problema Atual

O deploy no Vercel falhou porque **as variáveis de ambiente do Supabase estão faltando**. Você precisa configurar o Supabase primeiro.

---

## 📋 Passo a Passo Completo

### **1️⃣ Criar Projeto no Supabase** (5 minutos)

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `OrgaView`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha `South America (São Paulo)` ou mais próximo
4. Clique em **"Create new project"**
5. ⏳ Aguarde ~2 minutos até o projeto estar pronto

---

### **2️⃣ Copiar Credenciais do Supabase**

1. No Dashboard do Supabase, vá em **Settings** (⚙️) → **API**
2. Copie:
   - **Project URL**: `https://xxxxxxxxxxx.supabase.co`
   - **anon public key**: Começa com `eyJ...` (key bem longa)

---

### **3️⃣ Configurar Variáveis Locais**

Abra o arquivo `.env.local` que criei e **substitua** os valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-real.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

💾 **Salve o arquivo!**

---

### **4️⃣ Executar Migração do Banco de Dados**

1. No Supabase Dashboard → **SQL Editor** (💾)
2. Clique em **"New query"**
3. Abra o arquivo `supabase/migrations/001_initial_schema.sql` no seu projeto
4. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
5. **Cole no SQL Editor** do Supabase
6. Clique em **"Run"** (▶️)
7. ✅ Você deve ver "Success. No rows returned"

---

### **5️⃣ Criar Bucket de Storage**

1. No Supabase Dashboard → **Storage** (🗂️)
2. Clique em **"Create a new bucket"**
3. Preencha:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Marque esta opção**
4. Clique em **"Save"**

As políticas de segurança já foram criadas pela migration!

---

### **6️⃣ Criar Primeiro Usuário Admin**

#### Criar usuário:
1. Supabase Dashboard → **Authentication** (🔐) → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: senha-forte-aqui
   - **Auto Confirm User**: ✅ Marque
4. Clique em **"Create user"**
5. 📝 **Copie o User UID** que aparece na lista

#### Criar perfil admin:
1. Vá em **Table Editor** (📊) → Tabela **`profiles`**
2. Clique em **"Insert"** → **"Insert row"**
3. Preencha:
   ```
   user_id: [Cole o User UID que você copiou]
   email: seu-email@exemplo.com
   full_name: Seu Nome Completo
   position: CEO
   metadata: {"role": "admin"}
   ```
4. Clique em **"Save"**

✅ Agora você tem um usuário admin!

---

### **7️⃣ Testar Localmente**

```bash
npm run dev
```

Acesse http://localhost:3000

Se aparecer a tela "OrgaView" sem erros, está funcionando! 🎉

---

### **8️⃣ Deploy no Vercel**

#### Opção A: Via Dashboard (Mais Fácil)

1. Vá para https://vercel.com/tiobreds-projects/orgaonograma-app-bred
2. Clique em **Settings** → **Environment Variables**
3. Adicione as 2 variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   (Use os mesmos valores do `.env.local`)
4. Clique em **Deployments** no topo
5. No último deployment com erro, clique nos **"..."** → **"Redeploy"**

#### Opção B: Via CLI

```bash
# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Cole o valor quando solicitado

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Cole o valor quando solicitado

# Deploy novamente
vercel --prod
```

---

## ✅ Checklist Final

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas para `.env.local`
- [ ] Migration SQL executada (tabela `profiles` criada)
- [ ] Bucket `avatars` criado
- [ ] Usuário admin criado
- [ ] Testado localmente (npm run dev)
- [ ] Variáveis configuradas no Vercel
- [ ] Deploy realizado com sucesso

---

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Certifique-se que `.env.local` existe com os valores corretos
- Reinicie o servidor: `Ctrl+C` e `npm run dev` novamente

### Erro: "relation 'profiles' does not exist"
- Você não executou a migration SQL
- Vá no SQL Editor e execute o arquivo `001_initial_schema.sql`

### Erro no Deploy Vercel: "Command npm run build exited with 1"
- As variáveis de ambiente não foram configuradas no Vercel
- Siga o passo 8 acima

### Bucket não aparece
- Certifique-se de marcar **"Public bucket"** ao criar
- O nome deve ser exatamente `avatars`

---

## 📞 Próximos Passos

Depois que tudo estiver funcionando:

1. **Adicione mais funcionários** pela interface admin
2. **Customize as cores** em `app/globals.css`
3. **Configure um domínio personalizado** no Vercel
4. **Habilite autenticação** criando páginas de login

---

**Qualquer dúvida, consulte o README.md no projeto!** 📚
