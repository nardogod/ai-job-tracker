# 🔑 Configuração de Variáveis de Ambiente

Para usar a funcionalidade de análise de matches com Claude AI, você precisa configurar a API key da Anthropic.

## 📝 Passos para Configurar

### 1. Obter API Key da Anthropic

1. Acesse: https://console.anthropic.com/
2. Crie uma conta ou faça login
3. Vá em "API Keys"
4. Crie uma nova API key
5. Copie a chave (ela só aparece uma vez!)

### 2. Criar arquivo `.env.local`

No diretório `ai-job-tracker/web/`, crie um arquivo chamado `.env.local`:

```bash
cd ai-job-tracker/web
```

Crie o arquivo `.env.local` com o seguinte conteúdo:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:**
- Substitua `sk-ant-api03-...` pela sua chave real
- **NUNCA** commite o arquivo `.env.local` no git
- O arquivo `.env.local` já está no `.gitignore`

### 3. Reiniciar o servidor

Após criar o arquivo `.env.local`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

### 4. Verificar se está funcionando

1. Acesse: http://localhost:3000
2. Crie um perfil
3. Busque por jobs
4. Clique em "Analyze Matches"
5. Se tudo estiver configurado corretamente, você verá os match scores! 🎉

## 🔍 Troubleshooting

### Erro: "AI service not configured"

- Verifique se o arquivo `.env.local` existe em `ai-job-tracker/web/`
- Verifique se a variável `ANTHROPIC_API_KEY` está definida
- Reinicie o servidor após criar/editar o arquivo
- Certifique-se de que não há espaços extras na chave

### Verificar se a variável está carregada

No terminal onde o servidor está rodando, você pode verificar se a variável está sendo carregada (mas não verá o valor completo por segurança).

## 📚 Recursos

- [Anthropic Console](https://console.anthropic.com/)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

