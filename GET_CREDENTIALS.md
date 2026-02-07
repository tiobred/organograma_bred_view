# 📋 Como Pegar as Credenciais do Supabase

## Passo 1: Acessar o Dashboard

1. Abra seu navegador e vá para: https://supabase.com/dashboard
2. Faça login se necessário

## Passo 2: Abrir o Projeto "OrgonagromaTioBred"

1. Na lista de projetos, clique em **"OrgonagromaTioBred"**
2. Aguarde o projeto carregar

## Passo 3: Ir nas Configurações de API

1. No menu lateral esquerdo, clique no ícone de **engrenagem (⚙️)** chamado **"Settings"**
2. No submenu que aparece, clique em **"API"**

## Passo 4: Copiar as Credenciais

Você verá uma página com várias informações. Preciso que você copie:

### **Project URL** (URL do Projeto)
- Está na seção chamado **"Configuration"** ou **"Project API keys"**
- Formato: `https://xxxxxxxxxx.supabase.co`
- **COPIE este valor completo**

### **anon public** key (Chave Anon Pública)
- Está na mesma seção, com o título **"anon" "public"** ou **"anon key"**
- É uma string MUITO LONGA que começa com `eyJ...`
- **COPIE este valor completo** (clique no botão de copiar ao lado)

⚠️ **NÃO copie a "service_role" key!** Precisamos da chave "anon" ou "anon public"

---

## Depois de Copiar

Cole aqui os dois valores no seguinte formato:

```
PROJECT_URL: [cole a URL aqui]
ANON_KEY: [cole a chave anon aqui]
```

Assim que você colar, eu atualizo o arquivo `.env.local` automaticamente! 🚀
