# 🚀 Script de Deploy - Passo a Passo

Execute estes comandos na ordem para fazer o deploy:

## 1️⃣ Preparar o Repositório

```powershell
# Navegar para o diretório do projeto
cd ai-job-tracker

# Verificar status do git
git status

# Adicionar todos os arquivos (exceto os ignorados)
git add .

# Verificar o que será commitado
git status
```

## 2️⃣ Fazer Commit

```powershell
git commit -m "feat: AI Job Tracker - Ready for deploy

- ✅ Next.js web application with job scraping
- ✅ AI match analysis using Claude API
- ✅ Swedish companies job scraper
- ✅ Profile management
- ✅ Complete test suite (64+ tests)
- ✅ Ready for Vercel deployment"
```

## 3️⃣ Conectar ao GitHub

```powershell
# Verificar se já existe remote
git remote -v

# Se não existir, adicionar:
git remote add origin https://github.com/nardogod/ai-job-tracker.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

## 4️⃣ Deploy na Vercel

### Via Dashboard:

1. Acesse: https://vercel.com/
2. Clique em "Add New Project"
3. Importe: `nardogod/ai-job-tracker`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. **Environment Variables**:
   - `ANTHROPIC_API_KEY` = `sua-chave-aqui`
6. Deploy! 🚀

### Via CLI:

```powershell
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login
vercel login

# Deploy (na pasta web)
cd web
vercel

# Adicionar variável de ambiente
vercel env add ANTHROPIC_API_KEY
# Cole sua API key quando solicitado

# Deploy para produção
vercel --prod
```

## ✅ Verificar Deploy

Após o deploy, você receberá uma URL como:
```
https://ai-job-tracker-xxxxx.vercel.app
```

Teste:
- ✅ Criar perfil
- ✅ Buscar jobs
- ✅ Analisar matches
- ✅ Ver match scores

---

**Pronto!** 🎉

