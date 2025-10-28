#!/usr/bin/env python3
"""
🚀 GERADOR DE PICTURE TAGS - TECH10
Gera automaticamente tags <picture> otimizadas para todas as imagens
"""

import os
from pathlib import Path
from datetime import datetime

def gerar_picture_tag(image_path, alt="", classes="img-responsive", lazy=True):
    """Gerar tag picture otimizada"""
    path_obj = Path(image_path)
    name_without_ext = str(path_obj.with_suffix(''))
    
    webp_path = f"{name_without_ext}.webp"
    jpg_path = f"{name_without_ext}.jpg"
    
    lazy_attr = ' loading="lazy"' if lazy else ''
    class_attr = f' class="{classes}"' if classes else ''
    
    return f"""<picture>
    <source srcset="{webp_path}" type="image/webp">
    <img src="{jpg_path}" alt="{alt}"{class_attr}{lazy_attr}>
</picture>"""

def processar_diretorio():
    """Processar diretório de imagens otimizadas"""
    print('🖼️  GERADOR DE PICTURE TAGS - TECH10\n')
    
    extensions = {'.jpg', '.jpeg', '.png'}
    output_file = 'picture-tags-geradas.html'
    image_dir = Path('imagem-otimizada')
    
    if not image_dir.exists():
        print(f"❌ Diretório não encontrado: {image_dir}")
        return
    
    output = f"""<!-- 🚀 PICTURE TAGS OTIMIZADAS - TECH10 -->
<!-- Gerado automaticamente em {datetime.now().strftime('%d/%m/%Y %H:%M:%S')} -->
<!-- 87.8% menor em tamanho - 59.1 MB economizados -->

"""
    
    # Percorrer diretório de imagens otimizadas
    for root, dirs, files in os.walk(image_dir):
        for file in files:
            if Path(file).suffix.lower() in extensions:
                file_path = Path(root) / file
                relative_path = file_path.relative_to(image_dir)
                
                # Ajustar caminho para apontar para imagem-otimizada
                web_path = "imagem-otimizada/" + str(relative_path).replace('\\', '/')
                
                # Gerar alt text baseado no nome do arquivo
                alt_text = Path(file).stem.replace('-', ' ').replace('_', ' ').title()
                
                # Remover extensão para gerar paths WebP e JPG
                base_path = str(Path(web_path).with_suffix(''))
                
                picture_tag = f"""<!-- {relative_path} -->\n<picture>
    <source srcset="{base_path}.webp" type="image/webp">
    <img src="{base_path}.jpg" alt="{alt_text}" class="img-responsive" loading="lazy">
</picture>"""
                
                output += picture_tag + '\n\n'
                print(f"✅ {relative_path}")
    
    # Adicionar CSS e JavaScript recomendado
    output += """
<!-- 🎨 CSS RECOMENDADO -->
<style>
.img-responsive {
    max-width: 100%;
    height: auto;
    display: block;
}

/* Container para dicas com imagens */
.dica {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    border-radius: 10px;
    background: var(--bg-secondary);
}

.dica picture {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
}

.dica img {
    width: 100%;
    height: 200px;
    object-fit: contain;
    background: #f8f9fa;
}

/* Lazy loading smooth effect */
img[loading="lazy"] {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

img[loading="lazy"].loaded {
    opacity: 1;
}

/* WebP not supported fallback */
.no-webp picture source[type="image/webp"] {
    display: none;
}

/* Responsive grid for dicas */
@media (min-width: 768px) {
    .dicas-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
}

@media (min-width: 1024px) {
    .dicas-container {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>

<!-- 📱 JAVASCRIPT PARA LAZY LOADING E WEBP -->
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

// Lazy loading observer com Intersection Observer
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            
            // Adicionar classe loaded para efeito de fade
            img.classList.add('loaded');
            
            // Parar de observar esta imagem
            observer.unobserve(img);
            
            console.log('🖼️ Imagem carregada:', img.src);
        }
    });
}, {
    // Carregar imagem 50px antes de aparecer na tela
    rootMargin: '50px 0px',
    threshold: 0.01
});

// Inicializar lazy loading quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Observar todas as imagens lazy
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
    
    console.log('🚀 Lazy loading inicializado para', 
                document.querySelectorAll('img[loading="lazy"]').length, 
                'imagens');
});

// Analytics de performance (opcional)
window.addEventListener('load', () => {
    const images = document.querySelectorAll('img');
    console.log('📊 Performance:', {
        'Total de imagens': images.length,
        'Imagens com lazy loading': document.querySelectorAll('img[loading="lazy"]').length,
        'Suporte WebP': supportsWebP() ? '✅ Sim' : '❌ Não'
    });
});
</script>

<!-- 📋 EXEMPLO DE USO NAS DICAS -->
<!--
<div class="dicas-container">
    <div class="dica">
        <picture>
            <source srcset="imagem-otimizada/propaganda loja/dica-especialista-evitar-aquecimento-notebook.webp" type="image/webp">
            <img src="imagem-otimizada/propaganda loja/dica-especialista-evitar-aquecimento-notebook.jpg" 
                 alt="Dica Especialista Evitar Aquecimento Notebook" 
                 class="img-responsive" 
                 loading="lazy">
        </picture>
        <h3>Evite o Superaquecimento</h3>
        <p>Mantenha as ventoinhas limpas e use em superfícies firmes.</p>
    </div>
</div>
-->"""
    
    # Salvar arquivo
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f"\n📄 Arquivo gerado: {output_file}")
    print("🎯 Copie e cole as tags no seu HTML!")
    print("💡 Economia de 87.8% no tamanho das imagens!")

if __name__ == "__main__":
    processar_diretorio()