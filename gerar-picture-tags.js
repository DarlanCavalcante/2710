#!/usr/bin/env node
/**
 * 🚀 GERADOR DE PICTURE TAGS - TECH10
 * Gera automaticamente tags <picture> otimizadas para todas as imagens
 */

const fs = require('fs');
const path = require('path');

function gerarPictureTag(imagePath, alt = '', classes = '', lazy = true) {
    const ext = path.extname(imagePath);
    const nameWithoutExt = imagePath.replace(ext, '');
    
    const webpPath = `${nameWithoutExt}.webp`;
    const jpgPath = `${nameWithoutExt}.jpg`;
    
    const lazyAttr = lazy ? ' loading="lazy"' : '';
    const classAttr = classes ? ` class="${classes}"` : '';
    
    return `<picture>
    <source srcset="${webpPath}" type="image/webp">
    <img src="${jpgPath}" alt="${alt}"${classAttr}${lazyAttr}>
</picture>`;
}

function processarDiretorio(dir) {
    console.log('🖼️  GERADOR DE PICTURE TAGS - TECH10\n');
    
    const extensions = ['.jpg', '.jpeg', '.png'];
    const pictureTagsFile = 'picture-tags-geradas.html';
    
    let output = `<!-- 🚀 PICTURE TAGS OTIMIZADAS - TECH10 -->
<!-- Gerado automaticamente em ${new Date().toLocaleString('pt-BR')} -->

`;
    
    function percorrerDiretorio(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
            const itemPath = path.join(currentDir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                percorrerDiretorio(itemPath);
            } else if (extensions.includes(path.extname(item).toLowerCase())) {
                const relativePath = path.relative('.', itemPath).replace(/\\/g, '/');
                const fileName = path.basename(item, path.extname(item));
                
                // Gerar alt text baseado no nome do arquivo
                const altText = fileName
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                
                const pictureTag = gerarPictureTag(relativePath, altText, 'img-responsive');
                
                output += `<!-- ${relativePath} -->\n`;
                output += pictureTag + '\n\n';
                
                console.log(`✅ ${relativePath}`);
            }
        });
    }
    
    if (fs.existsSync(dir)) {
        percorrerDiretorio(dir);
        
        // Adicionar CSS recomendado
        output += `
<!-- 🎨 CSS RECOMENDADO -->
<style>
.img-responsive {
    max-width: 100%;
    height: auto;
    display: block;
}

/* Lazy loading smooth effect */
img[loading="lazy"] {
    opacity: 0;
    transition: opacity 0.3s;
}

img[loading="lazy"].loaded {
    opacity: 1;
}

/* WebP not supported fallback */
.no-webp picture source[type="image/webp"] {
    display: none;
}
</style>

<!-- 📱 JAVASCRIPT PARA LAZY LOADING -->
<script>
// Detectar suporte WebP
function supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

// Adicionar classe se não suporta WebP
if (!supportsWebP()) {
    document.documentElement.classList.add('no-webp');
}

// Lazy loading observer
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            observer.unobserve(img);
        }
    });
});

// Observar todas as imagens lazy
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
});
</script>`;
        
        fs.writeFileSync(pictureTagsFile, output);
        
        console.log(`\n📄 Arquivo gerado: ${pictureTagsFile}`);
        console.log('🎯 Copie e cole as tags no seu HTML!');
        
    } else {
        console.log(`❌ Diretório não encontrado: ${dir}`);
    }
}

// Executar
processarDiretorio('imagem');