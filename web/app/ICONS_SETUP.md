# 📱 Configuração de Ícones - Next.js App Router

No Next.js 13+ com App Router, você pode adicionar ícones de forma simples colocando arquivos na pasta `app/`.

## 📋 Arquivos Necessários

Coloque estes arquivos na pasta `app/`:

```
app/
  ├── favicon.ico      ✅ (já existe)
  ├── icon.png        ⚠️ (precisa criar)
  └── apple-icon.png  ⚠️ (precisa criar)
```

## 🎨 Especificações dos Ícones

### `icon.png`
- **Tamanho**: 512x512 pixels (ou múltiplos de 32)
- **Formato**: PNG
- **Uso**: Ícone padrão do site (favicon moderno)

### `apple-icon.png`
- **Tamanho**: 180x180 pixels (padrão Apple)
- **Formato**: PNG
- **Uso**: Ícone quando adicionado à tela inicial no iOS

### `favicon.ico`
- **Tamanho**: 16x16, 32x32, 48x48 (múltiplos tamanhos em um arquivo)
- **Formato**: ICO
- **Uso**: Favicon tradicional (já existe)

## 🛠️ Como Criar os Ícones

### Opção 1: Gerador Online (Recomendado)

1. **Crie um ícone base** (512x512px) com:
   - Logo do AI Job Tracker
   - Ou use um gerador: https://favicon.io/
   - Ou use: https://realfavicongenerator.net/

2. **Baixe os arquivos gerados**

3. **Renomeie e coloque em `app/`**:
   - `icon.png` → `app/icon.png`
   - `apple-touch-icon.png` → `app/apple-icon.png`

### Opção 2: Usar o Favicon Existente

Se você já tem um `favicon.ico`, pode convertê-lo:

```bash
# Usando ImageMagick (se tiver instalado)
convert favicon.ico -resize 512x512 icon.png
convert favicon.ico -resize 180x180 apple-icon.png
```

### Opção 3: Criar Manualmente

Use qualquer editor de imagens (Photoshop, GIMP, Figma):
- Crie um design 512x512px
- Exporte como `icon.png`
- Redimensione para 180x180px e exporte como `apple-icon.png`

## ✅ Verificação

Após adicionar os arquivos, o Next.js automaticamente:
- ✅ Detecta `icon.png` e usa como favicon moderno
- ✅ Detecta `apple-icon.png` para iOS
- ✅ Mantém `favicon.ico` para compatibilidade

**Não precisa configurar nada no código!** O Next.js faz isso automaticamente.

## 🔍 Testar

1. Execute: `npm run dev`
2. Abra: http://localhost:3000
3. Verifique a aba do navegador (deve mostrar o ícone)
4. No mobile iOS, adicione à tela inicial para testar `apple-icon.png`

## 📚 Referência

- [Next.js Metadata Icons](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
- [Favicon Generator](https://favicon.io/)

---

**💡 Dica:** Se não tiver os ícones agora, o site funciona normalmente. O Next.js usará o `favicon.ico` existente como fallback.

