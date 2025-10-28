#!/bin/bash
# 🚀 Deploy Script for Tech10 Website

echo "🚀 TECH10 DEPLOY SCRIPT"
echo "======================="

# Verificar se está no diretório correto
if [ ! -f "index.html" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

echo "📋 Preparando arquivos para deploy..."

# Criar diretório de build temporário
mkdir -p build
echo "✅ Diretório build criado"

# Copiar arquivos essenciais
cp index.html build/
cp -r css build/
cp -r js build/
cp -r imagem-otimizada build/imagem
cp manifest.json build/
cp sw.js build/
cp 404.html build/
cp netlify.toml build/

echo "✅ Arquivos copiados para build/"

# Verificar tamanho dos arquivos
echo "📊 Estatísticas do build:"
echo "----------------------------------------"
du -sh build/
echo "----------------------------------------"

# Contar arquivos
total_files=$(find build -type f | wc -l)
echo "📁 Total de arquivos: $total_files"

# Verificar imagens otimizadas
webp_count=$(find build/imagem -name "*.webp" 2>/dev/null | wc -l)
jpg_count=$(find build/imagem -name "*.jpg" 2>/dev/null | wc -l)
echo "🖼️  Imagens WebP: $webp_count"
echo "🖼️  Imagens JPG: $jpg_count"

echo ""
echo "🎯 PRONTO PARA DEPLOY!"
echo "======================"
echo ""
echo "📱 OPÇÕES DE DEPLOY:"
echo ""
echo "1️⃣  NETLIFY DRAG & DROP:"
echo "   • Acesse: https://app.netlify.com/"
echo "   • Arraste a pasta 'build' para a área de deploy"
echo ""
echo "2️⃣  NETLIFY GIT (Recomendado):"
echo "   • Acesse: https://app.netlify.com/"
echo "   • New site from Git → GitHub"
echo "   • Selecione: DarlanCavalcante/2710"
echo "   • Branch: main"
echo "   • Publish directory: / (raiz)"
echo ""
echo "3️⃣  VERCEL:"
echo "   • Acesse: https://vercel.com/"
echo "   • Import Project → GitHub"
echo "   • Selecione: DarlanCavalcante/2710"
echo ""
echo "✨ BENEFÍCIOS DO SEU SITE:"
echo "   🚀 87.8% menor em imagens"
echo "   📱 PWA instalável"
echo "   ⚡ Carregamento super rápido"
echo "   🔒 Headers de segurança"
echo "   📊 Cache otimizado"
echo ""

# Opção para fazer commit automático
read -p "🤔 Fazer commit das alterações de deploy? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "🚀 Deploy: Configuração Netlify + PWA + 404 page

✨ Deploy ready:
- netlify.toml configurado
- 404.html personalizada  
- Build script automatizado
- Headers de segurança
- Cache otimizado para performance"
    
    read -p "📤 Push para GitHub? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main
        echo "✅ Código enviado para GitHub!"
        echo "🌐 Pronto para deploy automático no Netlify!"
    fi
fi

echo ""
echo "🎉 SCRIPT CONCLUÍDO!"
echo "Seu site Tech10 está pronto para o mundo! 🌍"