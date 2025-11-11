# 🚀 Comandos Rápidos para Deploy

## 1. Inicializar Git e Push

```powershell
cd ai-job-tracker
git init
git add .
git commit -m "feat: AI Job Tracker - Ready for deploy"
git remote add origin https://github.com/nardogod/ai-job-tracker.git
git branch -M main
git push -u origin main
```

## 2. Deploy na Vercel

### Via Dashboard:
1. Acesse: https://vercel.com
2. Import: `nardogod/ai-job-tracker`
3. Root Directory: `web`
4. Env Var: `ANTHROPIC_API_KEY` = sua-chave-aqui
5. Deploy!

### Via CLI:
```powershell
npm i -g vercel
cd web
vercel
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

---

**📖 Para instruções detalhadas, veja:** [DEPLOY.md](./DEPLOY.md)

