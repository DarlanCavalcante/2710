#!/bin/bash

# 🧹 TECH10 BACKUP CLEANUP
# Remove backups antigos mantendo apenas os mais recentes

echo "🧹 Tech10 Backup Cleanup"
echo "======================="
echo ""

BACKUP_DIR="$(pwd)/backup"
KEEP_COUNT=${1:-10}  # Padrão: manter 10 backups

if [[ ! -d "$BACKUP_DIR" ]]; then
    echo "❌ Diretório de backup não encontrado: $BACKUP_DIR"
    exit 1
fi

cd "$BACKUP_DIR"

# Contar backups existentes
TOTAL_BACKUPS=$(ls tech10-backup-*.zip 2>/dev/null | wc -l)

echo "📊 Backups encontrados: $TOTAL_BACKUPS"
echo "🎯 Manter os mais recentes: $KEEP_COUNT"
echo ""

if [[ $TOTAL_BACKUPS -le $KEEP_COUNT ]]; then
    echo "✅ Nenhuma limpeza necessária"
    echo "   Todos os $TOTAL_BACKUPS backups serão mantidos"
    exit 0
fi

# Listar backups para remoção
TO_REMOVE=$((TOTAL_BACKUPS - KEEP_COUNT))
echo "🗑️  Backups para remoção: $TO_REMOVE"
echo ""

# Mostrar quais serão removidos
echo "📋 Arquivos que serão removidos:"
ls -t tech10-backup-*.zip | tail -n +$((KEEP_COUNT + 1)) | while read file; do
    SIZE=$(du -h "$file" | cut -f1)
    DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file")
    echo "   🗑️  $file ($SIZE, $DATE)"
done

echo ""
read -p "❓ Confirma a remoção? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Remover backups antigos
    REMOVED=0
    ls -t tech10-backup-*.zip | tail -n +$((KEEP_COUNT + 1)) | while read file; do
        if [[ -f "$file" ]]; then
            rm -f "$file"
            # Remover arquivo de info correspondente
            INFO_FILE="${file%.zip}"
            INFO_FILE="backup-info-${INFO_FILE#tech10-backup-}.json"
            [[ -f "$INFO_FILE" ]] && rm -f "$INFO_FILE"
            
            echo "   ✅ Removido: $file"
            ((REMOVED++))
        fi
    done
    
    echo ""
    echo "🎉 Limpeza concluída!"
    echo "📊 Backups mantidos: $KEEP_COUNT"
    
    # Mostrar backups restantes
    echo ""
    echo "📋 Backups restantes:"
    ls -la tech10-backup-*.zip 2>/dev/null | while read line; do
        echo "   📦 $line"
    done
    
else
    echo "❌ Limpeza cancelada"
fi

echo ""