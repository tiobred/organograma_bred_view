# 🚀 Guia de Deploy no Vercel

Este guia explica como publicar o **OrgaView** na internet usando a Vercel.

## ⚠️ Antes de Começar

Certifique-se de que o projeto está rodando sem erros localmente:
1. Pare o servidor (`CTRL+C`)
2. Rode `npm run build`
3. Se aparecer "Compiled successfully", você está pronto!

---

## 🌎 Opção 1: Deploy via Site da Vercel (Recomendado)

### 1. Enviar código para o GitHub
Se você ainda não enviou seu código para o GitHub:
1. Crie um repositório no GitHub.
2. Rode no terminal:
   ```bash
   git add .
   git commit -m "Preparando para deploy"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   git push -u origin main
   ```

### 2. Criar Projeto na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o repositório do Git que você acabou de criar.
4. **Configure o Framework:** Escolha "Next.js" (se já não estiver selecionado).

### 3. Configurar Variáveis de Ambiente (CRÍTICO!)
Na tela de configuração do projeto, procure a seção **Environment Variables** e adicione estas 3 chaves (copie do seu `.env.local`):

| Nome (Key) | Valor (Value) |
|------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jabwsswwckximzlvjyax.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Sua chave pública anon)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Sua chave secreta service_role)* |
> **IMPORTANTE:** Sem a `SUPABASE_SERVICE_ROLE_KEY`, o upload de imagens NÃO funcionará.

### 4. Deploy
Clique em **"Deploy"**. A Vercel vai construir o projeto e te dar uma URL (ex: `orgaview-app.vercel.app`).

---

## 💻 Opção 2: Deploy via Terminal (Vercel CLI)

Se preferir fazer tudo por linha de comando:

1. Instale a CLI da Vercel globalmente (se não tiver):
   ```bash
   npm i -g vercel
   ```

2. Faça login:
   ```bash
   vercel login
   ```

3. Inicie o deploy:
   ```bash
   vercel
   ```
   - Responda `Y` para configurar o projeto.
   - Aceite as configurações padrão.
   - **Variáveis de Ambiente:** No terminal, ele pode perguntar se você quer linkar as variáveis.
   - **Recomendado:** Após o deploy inicial, vá no painel da Vercel e adicione as variáveis manually se necessário, ou use o comando `vercel env add`.
   
4. Redeploy (para aplicar as variáveis):
   ```bash
   vercel --prod
   ```

---

## 🎉 Testando o Deploy

1. Acesse a URL gerada (ex: `https://seu-app.vercel.app`).
2. Faça login (lembre-se que o banco de dados é o Supabase na nuvem, então seus usuários e dados já estarão lá!).
3. **Teste Crítico:** Tente editar um funcionário e **trocar a foto** para garantir que a permissão de upload está funcionando.
