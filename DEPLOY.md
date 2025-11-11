# 🚀 Guia Completo de Deploy - AI Job Tracker

Este guia mostra como fazer deploy do AI Job Tracker na Vercel.

## 📋 Pré-requisitos

- ✅ Conta no [GitHub](https://github.com)
- ✅ Conta no [Vercel](https://vercel.com)
- ✅ Anthropic API Key ([Obter aqui](https://console.anthropic.com/))
- ✅ Repositório criado: https://github.com/nardogod/ai-job-tracker

## 🔧 Passo 1: Inicializar Git e Fazer Push

### 1.1 Navegar para o diretório

```powershell
cd ai-job-tracker
```

### 1.2 Inicializar Git (se ainda não tiver)

```powershell
git init
```

### 1.3 Adicionar arquivos

```powershell
git add .
```

### 1.4 Verificar o que será commitado

```powershell
git status
```

**⚠️ IMPORTANTE:** Certifique-se de que `.env.local` e arquivos `.db` NÃO estão sendo adicionados (devem estar no `.gitignore`).

### 1.5 Fazer commit inicial

```powershell
git commit -m "feat: AI Job Tracker - Ready for deploy

- ✅ Next.js web application with job scraping
- ✅ AI match analysis using Claude API  
- ✅ Swedish companies job scraper
- ✅ Profile management
- ✅ Complete test suite (64+ tests)
- ✅ Ready for Vercel deployment"
```

### 1.6 Conectar ao GitHub

```powershell
# Adicionar remote (se ainda não tiver)
git remote add origin https://github.com/nardogod/ai-job-tracker.git

# Verificar remote
git remote -v

# Renomear branch para main
git branch -M main

# Fazer push
git push -u origin main
```

**Se der erro de autenticação:**
- Use Personal Access Token do GitHub
- Ou configure SSH keys

## 🌐 Passo 2: Deploy na Vercel

### Opção A: Via Dashboard (Recomendado) ⭐

1. **Acesse:** https://vercel.com/
2. **Sign up/Login** (use conta GitHub)
3. **Clique em "Add New Project"**
4. **Import Git Repository**
   - Selecione: `nardogod/ai-job-tracker`
5. **Configure o projeto:**
   ```
   Framework Preset: Next.js
   Root Directory: web
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```
   
   **⚠️ IMPORTANTE:** A Vercel detecta automaticamente Next.js, mas você precisa:
   - Definir **Root Directory** como `web`
   - Deixar os outros campos como padrão

6. **Environment Variables** (⚠️ CRÍTICO!):
   - Clique em "Environment Variables"
   - Adicione:
     ```
     Name: ANTHROPIC_API_KEY
     Value: sk-ant-api03-sua-chave-aqui
     ```
   - Marque para todos os ambientes: Production, Preview, Development

7. **Deploy!** 🚀
   - Clique em "Deploy"
   - Aguarde o build (2-3 minutos)
   - Você receberá uma URL: `https://ai-job-tracker-xxxxx.vercel.app`

### Opção B: Via CLI

```powershell
# Instalar Vercel CLI (global)
npm i -g vercel

# Fazer login
vercel login

# Navegar para pasta web
cd web

# Deploy inicial
vercel

# Adicionar variável de ambiente
vercel env add ANTHROPIC_API_KEY
# Cole sua API key quando solicitado
# Selecione: Production, Preview, Development

# Deploy para produção
vercel --prod
```

## ✅ Passo 3: Verificar Deploy

Após o deploy, você receberá uma URL como:
```
https://ai-job-tracker-xxxxx.vercel.app
```

### Testar Funcionalidades

1. ✅ **Acesse a URL**
2. ✅ **Criar Perfil**: Clique em "Create Profile"
3. ✅ **Buscar Jobs**: Cole URLs ou use Swedish Companies
4. ✅ **Analisar Matches**: Clique em "🤖 Analyze Match"
5. ✅ **Ver Resultados**: Match scores devem aparecer

### Verificar Logs

Na Vercel Dashboard:
- **Deployments** → Selecione o deploy → **Logs**
- Verifique se não há erros
- Procure por: `[DEBUG] Analyze API` para ver se a API key está sendo carregada

## 🔍 Troubleshooting

### ❌ Erro: "Build failed"

**Possíveis causas:**
- Root Directory incorreto
- Dependências faltando
- Erro de TypeScript

**Solução:**
1. Verifique se `Root Directory` = `web`
2. Verifique os logs de build na Vercel
3. Teste localmente: `cd web && npm run build`

### ❌ Erro: "API key not configured"

**Solução:**
1. Verifique se `ANTHROPIC_API_KEY` foi adicionada nas Environment Variables
2. Certifique-se de que está marcada para **Production**
3. Reinicie o deployment após adicionar a variável
4. Verifique os logs para ver se a variável está sendo carregada

### ❌ Erro: "Module not found"

**Solução:**
1. Verifique se todas as dependências estão no `package.json`
2. Execute `npm install` localmente para verificar
3. Verifique se `node_modules` não está no `.gitignore` incorretamente

### ❌ Erro: "Database locked" ou SQLite errors

**Solução:**
- O SQLite funciona na Vercel, mas pode ter limitações
- Considere usar um banco de dados remoto (PostgreSQL, etc.) para produção
- Por enquanto, o SQLite local funciona para desenvolvimento

## 📊 Monitoramento

### Vercel Dashboard

- **Analytics**: Veja métricas de uso, page views, etc.
- **Logs**: Veja logs de erro em tempo real
- **Deployments**: Histórico de deploys
- **Environment Variables**: Gerencie variáveis de ambiente

### API Usage Tracking

O sistema já rastreia:
- ✅ Tokens usados (input/output)
- ✅ Custo por análise
- ✅ Total de requisições
- ✅ Ver em: Logs da Vercel ou console do browser

## 🔄 Atualizações Futuras

Para fazer deploy de atualizações:

```powershell
cd ai-job-tracker

# Fazer mudanças nos arquivos...

# Adicionar e commitar
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

**A Vercel fará deploy automático!** 🎉

- Cada push na branch `main` = novo deploy
- Pull requests = preview deployments

## 📝 Notas Importantes

- ⚠️ **NUNCA** commite o arquivo `.env.local` no git
- ✅ O `.gitignore` já está configurado corretamente
- ✅ A API key deve ser adicionada apenas nas Environment Variables da Vercel
- ✅ O banco de dados SQLite será criado automaticamente na Vercel
- ✅ O arquivo `vercel.json` já está configurado com `rootDirectory: web`

## 🎯 Checklist Final

Antes de fazer deploy, verifique:

- [ ] `.env.local` está no `.gitignore`
- [ ] `*.db` está no `.gitignore`
- [ ] `node_modules` está no `.gitignore`
- [ ] Todos os testes passam: `npm test`
- [ ] Build funciona localmente: `cd web && npm run build`
- [ ] Repositório está no GitHub
- [ ] API key está pronta para adicionar na Vercel

## 🎉 Pronto!

Seu AI Job Tracker está no ar! 🚀

**URL:** `https://seu-projeto.vercel.app`

---

**Precisa de ajuda?** 
- Abra uma issue no GitHub: https://github.com/nardogod/ai-job-tracker/issues
- Veja os logs na Vercel Dashboard
- Verifique a documentação: [README.md](./README.md)
