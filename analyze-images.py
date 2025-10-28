#!/usr/bin/env python3
"""
Script de Análise de Imagens - Tech10
Analisa tamanho das imagens e estima economia com otimização
"""

import os
import sys
from pathlib import Path

def format_bytes(bytes_size):
    """Formatar bytes em formato legível"""
    if bytes_size == 0:
        return "0 Bytes"
    
    bytes_size = int(bytes_size)  # Garantir que é inteiro
    k = 1024
    sizes = ["Bytes", "KB", "MB", "GB"]
    
    if bytes_size < k:
        return f"{bytes_size} Bytes"
    elif bytes_size < k * k:
        return f"{round(bytes_size / k, 2)} KB"
    elif bytes_size < k * k * k:
        return f"{round(bytes_size / (k * k), 2)} MB"
    else:
        return f"{round(bytes_size / (k * k * k), 2)} GB"

def analyze_images():
    """Analisar todas as imagens no diretório"""
    print("🖼️  ANALISADOR DE IMAGENS - TECH10\n")
    
    image_dir = Path("imagem")
    if not image_dir.exists():
        print("❌ Diretório 'imagem' não encontrado!")
        return
    
    extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    total_original = 0
    files_processed = 0
    
    print("🔍 Escaneando imagens...\n")
    
    for root, dirs, files in os.walk(image_dir):
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in extensions:
                try:
                    size = file_path.stat().st_size
                    total_original += size
                    files_processed += 1
                    
                    relative_path = file_path.relative_to(Path.cwd())
                    print(f"📁 {relative_path}")
                    print(f"   Tamanho atual: {format_bytes(size)}")
                    
                    # Estimativa de redução com WebP (70% de economia em média)
                    if file_path.suffix.lower() != '.webp':
                        estimated_webp = size * 0.3
                        savings = size - estimated_webp
                        print(f"   🚀 Estimado WebP: {format_bytes(estimated_webp)} ({format_bytes(savings)} economizados)")
                    else:
                        print("   ✅ Já está otimizado (WebP)")
                    print()
                    
                except Exception as e:
                    print(f"❌ Erro ao processar {file_path}: {e}")
    
    # Estimativa total
    total_optimized = total_original * 0.3  # 70% de redução média
    savings = total_original - total_optimized
    
    print("📊 RELATÓRIO DE ANÁLISE:\n")
    print(f"📸 Imagens encontradas: {files_processed}")
    print(f"📦 Tamanho total atual: {format_bytes(total_original)}")
    print(f"🚀 Tamanho estimado otimizado: {format_bytes(total_optimized)}")
    print(f"💾 Economia estimada: {format_bytes(savings)} ({round((savings / total_original) * 100) if total_original > 0 else 0}% menor)")
    
    print("\n🛠️  FERRAMENTAS RECOMENDADAS:\n")
    
    if total_original > 5 * 1024 * 1024:  # > 5MB
        print("⚠️  ALTA PRIORIDADE - Imagens muito grandes!")
        print("📋 Implementar IMEDIATAMENTE:")
    else:
        print("📋 Recomendações de otimização:")
    
    print("""
1. 🚀 Vite + Plugin de Imagens:
   npm install --save-dev vite @vitejs/plugin-legacy vite-plugin-imagemin

2. 📦 ImageMin para otimização:
   npm install --save-dev imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant

3. 🖼️  Formato HTML otimizado:
   <picture>
     <source srcset="imagem.webp" type="image/webp">
     <img src="imagem.jpg" alt="Descrição" loading="lazy">
   </picture>

4. 📱 Lazy Loading automático:
   Implementar Intersection Observer para carregamento sob demanda
""")
    
    print("✨ BENEFÍCIOS ESPERADOS:")
    if total_original > 0:
        time_savings = (savings / (1024 * 1024)) * 2  # ~2s por MB em 3G
        print(f"• Site {round(time_savings, 1)}s mais rápido (conexão 3G)")
        print(f"• {format_bytes(savings)} menos dados consumidos")
        print(f"• {round(((savings / total_original) * 100))}% melhoria no Core Web Vitals")
    
    print("• Melhor ranking no Google")
    print("• Experiência mobile aprimorada")
    print("• Menor taxa de abandono")

if __name__ == "__main__":
    analyze_images()