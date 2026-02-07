# 🎉 Configuração do Supabase - PRÓXIMOS PASSOS

## ✅ Já Configurado

- [x] URL do Projeto: `https://jabwsswwckximzlvjyax.supabase.co`
- [x] Anon Key adicionada ao `.env.local`

---

## 📋 Agora Você Precisa Fazer (No Supabase Dashboard)

### **1. Executar a Migration SQL** (Criar a tabela `profiles`)

1. No Supabase Dashboard, vá em **SQL Editor** (ícone de documento no menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo local: `supabase/migrations/001_initial_schema.sql`
4. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
5. **Cole no SQL Editor** do Supabase
6. Clique em **"Run"** (botão ▶️ no canto inferior direito)
7. ✅ Você deve ver: **"Success. No rows returned"**

---

### **2. Criar o Bucket de Storage** (Para as fotos de perfil)

1. No Supabase Dashboard, vá em **Storage** (ícone de pasta no menu lateral)
2. Clique em **"Create a new bucket"**
3. Preencha:
   - **Name**: `avatars` (exatamente assim, minúsculo)
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (importante!)
4. Clique em **"Save"**

---

### **3. Criar Usuário Admin** (Opcional - para testar)

#### Criar o usuário:
1. Vá em **Authentication** → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   - Email: seu email
   - Password: uma senha forte
   - **Auto Confirm User**: ✅ Marque
4. Clique em **"Create user"**
5. **Copie o UUID do usuário** (aparece na coluna ID)

#### Criar o perfil admin:
1. Vá em **Table Editor** → Tabela **`profiles`**
2. Clique em **"Insert"** → **"Insert row"**
3. Preencha os campos:
   - `user_id`: [Cole o UUID que você copiou]
   - `email`: [Seu email]
   - `full_name`: Seu Nome Completo
   - `position`: CEO
   - `department`: Diretoria
   - `metadata`: `{"role": "admin"}`
4. Clique em **"Save"**

---

## 🧪 Testar Localmente

Depois de fazer os passos acima, rode:

```bash
npm run dev
```

Acesse: http://localhost:3000

✅ Se aparecer a página "OrgaView" sem erros, está funcionando!

---

## 🚀 Deploy no Vercel

### Adicionar Variáveis de Ambiente:

**Opção 1: Via Dashboard**
1. Vá para: https://vercel.com/tiobreds-projects/orgaonograma-app-bred/settings/environment-variables
2. Adicione as 2 variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jabwsswwckximzlvjyax.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[Sua Anon Key]`
   - `SUPABASE_SERVICE_ROLE_KEY` = `[Sua Service Role Key]` (CRUCIAL para uploads de imagem!)
3. Clique em **"Save"**
4. Vá em **Deployments** → Último deployment → **"..."** → **"Redeploy"**

**Opção 2: Via CLI**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Cole: https://jabwsswwckximzlvjyax.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Cole a anon key

vercel --prod
```

---

## ✅ Checklist

- [ ] Migration SQL executada
- [ ] Bucket `avatars` criado (público)
- [ ] Usuário admin criado (opcional)
- [ ] Testado localmente
- [ ] Variáveis configuradas no Vercel
- [ ] Deploy realizado

---

**Me avise quando terminar os passos 1 e 2 para eu te ajudar a testar!** 🚀
