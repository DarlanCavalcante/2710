#!/bin/bash

# 📦 TECH10 BACKUP SCRIPT
# Cria backup completo do projeto usando zip nativo do macOS

echo "🚀 Tech10 Backup Generator"
echo "========================="
echo ""

# Configurações
PROJECT_ROOT="$(pwd)"
BACKUP_DIR="$PROJECT_ROOT/backup"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="tech10-backup-$TIMESTAMP.zip"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

echo "📋 Criando backup: $BACKUP_NAME"
echo "📍 Local: $BACKUP_PATH"
echo ""

# Criar arquivo temporário com lista de arquivos
TEMP_LIST="/tmp/tech10_backup_list.txt"

echo "📝 Preparando lista de arquivos..."

# Arquivos principais
cat > "$TEMP_LIST" << EOF
index.html
configurar-imagem-sobre.html
exemplo-configuracao.js
gerador-configuracao.html
IMAGEM-SOBRE.md
PERSONALIZACAO.md
README.md
teste-dicas.html
teste-tech10.html
teste-video.html
css/
js/
admin/
backend/
imagem/favico/
.gitignore
sw.js
manifest.json
create-backup.sh
EOF

# Limpar lista (remover arquivos que não existem)
FINAL_LIST="/tmp/tech10_final_list.txt"
> "$FINAL_LIST"

while IFS= read -r item; do
    if [[ -e "$item" ]]; then
        echo "$item" >> "$FINAL_LIST"
        echo "  ✓ $item"
    fi
done < "$TEMP_LIST"

echo ""
echo "📦 Criando arquivo ZIP..."

# Criar ZIP excluindo arquivos desnecessários
zip -r "$BACKUP_PATH" . \
    -i@"$FINAL_LIST" \
    -x "node_modules/*" \
    -x "backend/node_modules/*" \
    -x "backend/uploads/*" \
    -x "backend/*.log" \
    -x "backend/.env" \
    -x "imagem/imagens\ tecnologia/*" \
    -x "imagem/propaganda\ loja/*" \
    -x ".git/*" \
    -x "backup/*" \
    -x "*.DS_Store" \
    -x "*.log" \
    -q

# Verificar se o backup foi criado
if [[ -f "$BACKUP_PATH" ]]; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    
    echo ""
    echo "✅ Backup criado com sucesso!"
    echo "📁 Arquivo: $BACKUP_NAME"
    echo "📏 Tamanho: $BACKUP_SIZE"
    echo "📍 Local: $BACKUP_PATH"
    echo ""
    
    # Criar arquivo de informações
    INFO_FILE="$BACKUP_DIR/backup-info-$TIMESTAMP.json"
    
    cat > "$INFO_FILE" << EOF
{
  "name": "$BACKUP_NAME",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "project": "Tech10",
  "version": "1.0.0",
  "size": "$BACKUP_SIZE",
  "files_included": [
    "Frontend (HTML, CSS, JS)",
    "Backend Node.js/Express",
    "Admin Interface",
    "Database Schema",
    "Configuration Files",
    "Documentation"
  ],
  "excluded": [
    "node_modules/",
    "backend/uploads/",
    "imagem/ (parcial)",
    ".env files",
    "log files",
    ".git/"
  ],
  "restore_instructions": {
    "1": "Extrair o arquivo ZIP",
    "2": "cd backend && npm install",
    "3": "npm start para iniciar o servidor",
    "4": "Acessar http://localhost:3000"
  },
  "requirements": {
    "Node.js": ">= 16.0.0",
    "NPM": ">= 8.0.0",
    "OS": "Windows, macOS, Linux"
  }
}
EOF
    
    echo "📋 Informações do backup: backup-info-$TIMESTAMP.json"
    echo ""
    echo "🎯 Conteúdo do backup:"
    echo "   • Frontend completo (HTML, CSS, JS)"
    echo "   • Sistema administrativo"
    echo "   • Backend Node.js/Express"
    echo "   • Banco de dados SQLite"
    echo "   • Configurações e documentação"
    echo ""
    echo "📂 Para restaurar:"
    echo "   1. Extrair o ZIP"
    echo "   2. cd backend && npm install"
    echo "   3. npm start"
    echo ""
    
    # Listar arquivos de backup
    echo "📋 Backups disponíveis:"
    ls -la "$BACKUP_DIR"/*.zip 2>/dev/null | tail -5
    
else
    echo ""
    echo "❌ Erro ao criar backup!"
    exit 1
fi

# Limpar arquivos temporários
rm -f "$TEMP_LIST" "$FINAL_LIST"

echo ""
echo "🎉 Backup concluído!"