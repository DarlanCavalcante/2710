#!/bin/bash
# 💾 SCRIPT DE BACKUP LOCAL - TECH10

echo "💾 TECH10 - BACKUP LOCAL"
echo "======================="

# Data e hora atual
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="Tech10_Website_Backup_$DATE"

echo "📅 Data do backup: $(date)"
echo "📁 Nome do backup: $BACKUP_NAME"

# Criar diretório de backup na área de trabalho
DESKTOP_PATH="$HOME/Desktop"
BACKUP_PATH="$DESKTOP_PATH/$BACKUP_NAME"

echo "🔄 Criando backup..."
mkdir -p "$BACKUP_PATH"

# Copiar arquivos essenciais do projeto
echo "📂 Copiando arquivos do projeto..."

# Site principal
cp index.html "$BACKUP_PATH/"
cp -r css "$BACKUP_PATH/"
cp -r js "$BACKUP_PATH/"

# PWA
cp manifest.json "$BACKUP_PATH/"
cp sw.js "$BACKUP_PATH/"

# Imagens originais
cp -r imagem "$BACKUP_PATH/"

# Imagens otimizadas (se existir)
if [ -d "imagem-otimizada" ]; then
    cp -r imagem-otimizada "$BACKUP_PATH/"
    echo "✅ Imagens otimizadas incluídas"
fi

# Documentação
cp README.md "$BACKUP_PATH/" 2>/dev/null || echo "ℹ️  README.md não encontrado"
cp RELATORIO-FINAL-OTIMIZACAO.md "$BACKUP_PATH/" 2>/dev/null || echo "ℹ️  Relatório não encontrado"
cp FERRAMENTAS-RECOMENDADAS.md "$BACKUP_PATH/" 2>/dev/null || echo "ℹ️  Ferramentas não encontrado"

# Ferramentas de desenvolvimento
cp package.json "$BACKUP_PATH/" 2>/dev/null
cp vite.config.js "$BACKUP_PATH/" 2>/dev/null
cp postcss.config.js "$BACKUP_PATH/" 2>/dev/null

# Scripts úteis
cp otimizar-imagens.py "$BACKUP_PATH/" 2>/dev/null
cp gerar-picture-tags.py "$BACKUP_PATH/" 2>/dev/null
cp picture-tags-geradas.html "$BACKUP_PATH/" 2>/dev/null

# Criar arquivo README do backup
cat > "$BACKUP_PATH/LEIA-ME-BACKUP.md" << EOF
# 💾 BACKUP TECH10 WEBSITE
**Data do backup:** $(date)
**Versão:** Completa

## 📁 Conteúdo do backup:

### 🌐 Site Principal:
- \`index.html\` - Página principal
- \`css/\` - Estilos CSS
- \`js/\` - JavaScript

### 📱 PWA (Progressive Web App):
- \`manifest.json\` - Configuração PWA
- \`sw.js\` - Service Worker

### 🖼️ Imagens:
- \`imagem/\` - Imagens originais
- \`imagem-otimizada/\` - Imagens otimizadas (87.8% menor)

### 🛠️ Ferramentas:
- \`otimizar-imagens.py\` - Script de otimização
- \`gerar-picture-tags.py\` - Gerador de HTML
- \`package.json\` - Dependências
- \`vite.config.js\` - Build config

### 📊 Estatísticas:
- **Tamanho original das imagens:** 67.3 MB
- **Tamanho otimizado:** 8.2 MB  
- **Economia:** 87.8% (59.1 MB)
- **Formatos:** WebP + JPEG fallback
- **PWA:** Instalável como app

## 🚀 Como usar:

1. **Servidor local:**
   \`\`\`bash
   python3 -m http.server 8000
   \`\`\`

2. **Otimizar novas imagens:**
   \`\`\`bash
   python3 otimizar-imagens.py
   \`\`\`

3. **Gerar picture tags:**
   \`\`\`bash
   python3 gerar-picture-tags.py
   \`\`\`

## 🔗 Links importantes:
- **GitHub:** https://github.com/DarlanCavalcante/2710
- **Instagram:** https://www.instagram.com/tech10info/

---
*Backup criado automaticamente - Tech10 Informática*
EOF

# Calcular tamanho do backup
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

echo ""
echo "✅ BACKUP CONCLUÍDO!"
echo "==================="
echo "📁 Local: $BACKUP_PATH"
echo "📊 Tamanho: $BACKUP_SIZE"
echo ""

# Listar conteúdo
echo "📋 Conteúdo do backup:"
ls -la "$BACKUP_PATH"

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. ✅ Backup salvo na Área de Trabalho"
echo "2. 📤 Copie para pen drive/HD externo se desejar"
echo "3. ☁️  Considere backup na nuvem (Google Drive, iCloud, etc.)"
echo ""
echo "💡 DICA: Execute este script regularmente para manter backups atuais!"

# Opção para abrir o diretório
read -p "🤔 Abrir pasta do backup no Finder? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "$BACKUP_PATH"
fi

echo "🎉 Processo concluído!"