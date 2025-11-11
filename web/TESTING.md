# 🧪 Guia de Testes - Swedish Companies Scraper

Este guia mostra como testar todas as funcionalidades do scraper de empresas suecas.

## 📋 Índice

1. [Testes Unitários](#testes-unitários)
2. [Testar API Endpoint](#testar-api-endpoint)
3. [Testar Componente UI](#testar-componente-ui)
4. [Testes Manuais](#testes-manuais)

---

## 1. Testes Unitários

### Executar todos os testes

```bash
cd ai-job-tracker/web
npm test
```

### Executar apenas os testes do JobScraperService

```bash
npm test -- JobScraperService.lever.test.ts
```

### Executar com verbose (mais detalhes)

```bash
npm test -- JobScraperService.lever.test.ts --verbose
```

### Executar em modo watch (re-executa ao salvar arquivos)

```bash
npm test -- --watch
```

### Gerar relatório de cobertura

```bash
npm run test:coverage
```

### Testes específicos

```bash
# Apenas testes de scraping individual
npm test -- JobScraperService.lever.test.ts -t "should scrape"

# Apenas testes de filtro
npm test -- JobScraperService.lever.test.ts -t "should filter"

# Apenas testes de AI/ML
npm test -- JobScraperService.lever.test.ts -t "should identify AI"
```

---

## 2. Testar API Endpoint

### Iniciar servidor de desenvolvimento

```bash
cd ai-job-tracker/web
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

### Testar via cURL

#### Scraping de todas as empresas

```bash
curl "http://localhost:3000/api/scrape/swedish-companies"
```

#### Filtrar apenas jobs de AI/ML

```bash
curl "http://localhost:3000/api/scrape/swedish-companies?aiOnly=true"
```

#### Filtrar apenas Stockholm

```bash
curl "http://localhost:3000/api/scrape/swedish-companies?stockholmOnly=true"
```

#### Filtrar AI/ML + Stockholm

```bash
curl "http://localhost:3000/api/scrape/swedish-companies?aiOnly=true&stockholmOnly=true"
```

#### Incluir jobs remotos (Remote/Hybrid)

```bash
# AI/ML jobs incluindo remotos
curl "http://localhost:3000/api/scrape/swedish-companies?aiOnly=true&includeRemote=true"

# Stockholm + Remote
curl "http://localhost:3000/api/scrape/swedish-companies?stockholmOnly=true&includeRemote=true"

# Apenas remotos (sem filtro Stockholm)
curl "http://localhost:3000/api/scrape/swedish-companies?includeRemote=true"
```

#### Testar sem filtros de localização (ver total de vagas)

```bash
# Ver todas as vagas de AI/ML sem filtro de localização
curl "http://localhost:3000/api/scrape/swedish-companies?aiOnly=true&stockholmOnly=false"

# Ver todas as vagas sem filtros
curl "http://localhost:3000/api/scrape/swedish-companies"
```

#### Scraping de uma empresa específica

```bash
# Klarna
curl "http://localhost:3000/api/scrape/swedish-companies?company=klarna"

# Spotify
curl "http://localhost:3000/api/scrape/swedish-companies?company=spotify"

# Binance
curl "http://localhost:3000/api/scrape/swedish-companies?company=binance"
```

#### Formato JSON bonito (com jq)

```bash
curl "http://localhost:3000/api/scrape/swedish-companies?aiOnly=true" | jq
```

### Testar via PowerShell (Windows)

```powershell
# Todas as empresas
Invoke-WebRequest -Uri "http://localhost:3000/api/scrape/swedish-companies" | Select-Object -ExpandProperty Content

# Com filtros
Invoke-WebRequest -Uri "http://localhost:3000/api/scrape/swedish-companies?aiOnly=true&stockholmOnly=true" | Select-Object -ExpandProperty Content
```

### Testar via Postman/Insomnia

1. **Método:** GET
2. **URL:** `http://localhost:3000/api/scrape/swedish-companies`
3. **Query Parameters:**
   - `company` (opcional): `klarna`, `spotify`, `binance`, etc.
   - `aiOnly` (opcional): `true` ou `false`
   - `stockholmOnly` (opcional): `true` ou `false`

### Exemplo de Resposta

```json
{
  "success": true,
  "totalCompanies": 5,
  "successfulScrapes": 5,
  "failedScrapes": 0,
  "totalJobs": 25,
  "filteredJobs": 12,
  "companies": [
    {
      "id": "klarna",
      "name": "Klarna",
      "url": "https://jobs.lever.co/klarna",
      "jobsCount": 5,
      "jobs": [
        {
          "title": "Machine Learning Engineer",
          "location": "Stockholm, Sweden",
          "url": "https://jobs.lever.co/klarna/machine-learning-engineer",
          "isAIRelated": true,
          "department": "Engineering"
        }
      ]
    }
  ],
  "duration": 1250
}
```

---

## 3. Testar Componente UI

### Acessar a interface

1. Inicie o servidor:
   ```bash
   cd ai-job-tracker/web
   npm run dev
   ```

2. Abra no navegador:
   ```
   http://localhost:3000
   ```

3. Procure pelo componente `SwedishCompaniesPanel` na página

### Funcionalidades para testar

- ✅ **Lista de empresas:** Verifica se todas as empresas suecas aparecem
- ✅ **Toggle AI/ML:** Ativa/desativa filtro de jobs de AI/ML
- ✅ **Toggle Stockholm:** Ativa/desativa filtro de localização Stockholm
- ✅ **Scraping individual:** Clica em "Scrape" para cada empresa
- ✅ **Scraping em batch:** Clica em "Scrape All" para todas as empresas
- ✅ **Exibição de resultados:** Verifica se os jobs aparecem corretamente
- ✅ **Loading states:** Verifica se o loading aparece durante scraping
- ✅ **Error handling:** Testa comportamento com erros de rede

---

## 4. Testes Manuais

### Teste 1: Scraping Básico

1. Acesse `http://localhost:3000`
2. Clique em "Scrape All"
3. Verifique se jobs aparecem
4. Verifique se os campos estão preenchidos (title, location, url)

### Teste 2: Filtro AI/ML

1. Ative o toggle "AI/ML Only"
2. Clique em "Scrape All"
3. Verifique se apenas jobs relacionados a AI/ML aparecem
4. Verifique se `isAIRelated: true` nos jobs retornados

### Teste 3: Filtro Stockholm

1. Ative o toggle "Stockholm Only"
2. Clique em "Scrape All"
3. Verifique se apenas jobs de Stockholm aparecem
4. Verifique se `location` contém "Stockholm" ou "Sweden"

### Teste 3.1: Filtro Stockholm + Remote

1. Ative o toggle "Stockholm Only" e "Include Remote"
2. Clique em "Scrape All"
3. Verifique se aparecem jobs de Stockholm, Sweden, Remote ou Hybrid
4. Verifique se `location` contém "Stockholm", "Sweden", "Remote" ou "Hybrid"

### Teste 4: Filtros Combinados

1. Ative ambos os toggles (AI/ML + Stockholm)
2. Clique em "Scrape All"
3. Verifique se apenas jobs de AI/ML em Stockholm aparecem

### Teste 4.1: Filtros Combinados com Remote

1. Ative os toggles (AI/ML + Stockholm + Remote)
2. Clique em "Scrape All"
3. Verifique se aparecem jobs de AI/ML em Stockholm, Sweden, Remote ou Hybrid

### Teste 5: Scraping Individual

1. Para cada empresa na lista:
   - Clique em "Scrape" individual
   - Verifique se apenas jobs daquela empresa aparecem
   - Verifique se o nome da empresa está correto

### Teste 6: Cache

1. Faça um scraping
2. Aguarde alguns segundos
3. Faça o mesmo scraping novamente
4. Verifique se a resposta é mais rápida (cache funcionando)

### Teste 6.1: Melhor Detecção com Keywords Alternativas

1. Teste scraping de empresas que podem ter 0 resultados
2. Verifique se jobs aparecem mesmo sem keywords AI/ML explícitas
3. Verifique se keywords alternativas por empresa estão funcionando:
   - Klarna: fraud, payment, fintech, risk
   - Binance: blockchain, crypto, trading, quant
   - Palantir: data platform, analytics, software engineer
   - Spotify: recommendation, audio, music, streaming
   - Trustly: payment, banking, fintech, risk

### Teste 7: Rate Limiting

1. Faça scraping de múltiplas empresas em sequência
2. Verifique se há delay entre requisições (500ms por padrão)
3. Verifique se não há erros de rate limit

### Teste 8: Error Handling

1. Desconecte a internet
2. Tente fazer scraping
3. Verifique se o erro é exibido de forma amigável

---

## 🔍 Debugging

### Ver logs no console

No modo desenvolvimento, os logs aparecem no terminal onde o servidor está rodando:

```bash
npm run dev
```

### Verificar cache stats

Adicione um endpoint temporário para verificar o cache:

```typescript
// app/api/scrape/cache-stats/route.ts
import { NextResponse } from 'next/server';
import { scraperService } from '@/lib/services/JobScraperService';

export async function GET() {
  const stats = scraperService.getCacheStats();
  return NextResponse.json(stats);
}
```

Acesse: `http://localhost:3000/api/scrape/cache-stats`

### Verificar requisições HTTP

Abra o DevTools do navegador (F12) e vá na aba "Network" para ver todas as requisições.

---

## 📊 Checklist de Testes

- [ ] Testes unitários passando (19 testes)
- [ ] API endpoint responde corretamente
- [ ] Filtro `aiOnly` funciona
- [ ] Filtro `stockholmOnly` funciona
- [ ] Filtro `includeRemote` funciona
- [ ] Filtros combinados funcionam
- [ ] Scraping individual por empresa funciona
- [ ] Scraping em batch funciona
- [ ] Cache está funcionando
- [ ] Rate limiting está funcionando
- [ ] Error handling está funcionando
- [ ] Keywords alternativas por empresa funcionam
- [ ] Detecção melhorada para empresas com 0 resultados
- [ ] UI exibe resultados corretamente
- [ ] Loading states aparecem
- [ ] Logs aparecem no console (dev mode)

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Reinstale as dependências
cd ai-job-tracker/web
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 already in use"

```bash
# Use outra porta
npm run dev -- -p 3001
```

### Testes falhando

```bash
# Limpe o cache do Jest
npm test -- --clearCache
```

### API não responde

1. Verifique se o servidor está rodando
2. Verifique se a porta está correta
3. Verifique os logs no terminal

---

## 📝 Notas

- Os testes usam mocks para não fazer requisições HTTP reais
- O cache tem TTL de 5 minutos por padrão
- Rate limiting é de 500ms entre requisições
- Em produção, desative os logs para melhor performance

