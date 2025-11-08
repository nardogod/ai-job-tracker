# AI Job Tracker

CLI tool para buscar vagas AI Engineer na Suécia usando Claude API.

## 🚀 Tech Stack

- **TypeScript** (strict mode)
- **Node.js** (>=18.0.0)
- **Claude API** (Anthropic)
- **SQLite** (database)
- **Jest** (testing)

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm ou yarn
- Anthropic API Key

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd ai-job-tracker
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env e adicione sua ANTHROPIC_API_KEY
```

## 🧪 Desenvolvimento

### Scripts Disponíveis

- `npm run build` - Compila TypeScript para JavaScript
- `npm run build:watch` - Compila em modo watch
- `npm run dev` - Executa em modo desenvolvimento
- `npm test` - Executa todos os testes
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura
- `npm run test:unit` - Executa apenas testes unitários
- `npm run test:integration` - Executa apenas testes de integração
- `npm run lint` - Verifica código com ESLint
- `npm run lint:fix` - Corrige problemas de lint automaticamente
- `npm run type-check` - Verifica tipos sem compilar
- `npm run clean` - Remove arquivos gerados (dist, coverage)

### Workflow TDD

Este projeto segue o workflow TDD (Test-Driven Development):

1. **RED**: Escreva um teste que falha
2. **GREEN**: Escreva código mínimo para passar o teste
3. **REFACTOR**: Melhore o código mantendo os testes passando

## 📁 Estrutura do Projeto

```
ai-job-tracker/
├── src/
│   ├── cli/          # CLI entry points
│   ├── core/         # Core business logic
│   ├── services/     # External services (Claude API, SQLite)
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── tests/
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
├── config/           # Configuration files
├── data/             # Database files (gitignored)
└── dist/             # Compiled JavaScript (gitignored)
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

- `ANTHROPIC_API_KEY`: Sua chave da API Anthropic
- `DB_PATH`: Caminho para o banco de dados SQLite
- `LOG_LEVEL`: Nível de log (info, debug, error)
- `MAX_RESULTS`: Número máximo de resultados
- `SEARCH_LOCATION`: Localização para busca (padrão: Sweden)
- `SEARCH_KEYWORDS`: Palavras-chave separadas por vírgula

## 📝 Licença

ISC

## 🤝 Contribuindo

1. Siga o workflow TDD
2. Mantenha cobertura de testes >= 80%
3. Use TypeScript strict mode
4. Execute `npm run lint` antes de commitar

