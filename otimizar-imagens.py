#!/usr/bin/env python3
"""
🚀 OTIMIZADOR DE IMAGENS - TECH10
Análise e otimização automática de imagens para web
"""

import os
import shutil
from pathlib import Path
from PIL import Image, ImageOps
import subprocess

def format_bytes(bytes_size):
    """Formatar bytes em formato legível"""
    bytes_size = int(bytes_size)
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024**2:
        return f"{bytes_size/1024:.1f} KB"
    elif bytes_size < 1024**3:
        return f"{bytes_size/(1024**2):.1f} MB"
    else:
        return f"{bytes_size/(1024**3):.1f} GB"

def otimizar_imagem(input_path, output_path, quality=85, max_width=1920):
    """Otimizar uma imagem individual"""
    try:
        with Image.open(input_path) as img:
            # Corrigir orientação EXIF
            img = ImageOps.exif_transpose(img)
            
            # Redimensionar se necessário
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Converter para RGB se necessário
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Salvar otimizada
            img.save(output_path, 'JPEG', quality=quality, optimize=True, progressive=True)
            return True
    except Exception as e:
        print(f"❌ Erro ao otimizar {input_path}: {e}")
        return False

def converter_para_webp(input_path, output_path, quality=80):
    """Converter imagem para WebP"""
    try:
        with Image.open(input_path) as img:
            img = ImageOps.exif_transpose(img)
            img.save(output_path, 'WebP', quality=quality, optimize=True)
            return True
    except Exception as e:
        print(f"❌ Erro ao converter {input_path} para WebP: {e}")
        return False

def main():
    print("🚀 OTIMIZADOR DE IMAGENS - TECH10\n")
    
    # Criar diretório de saída
    output_dir = Path("imagem-otimizada")
    output_dir.mkdir(exist_ok=True)
    
    # Extensões suportadas
    extensions = {'.jpg', '.jpeg', '.png', '.gif'}
    
    stats = {
        'total_original': 0,
        'total_otimizado': 0,
        'arquivos_processados': 0,
        'arquivos_webp': 0
    }
    
    print("🔍 Processando imagens...\n")
    
    # Processar todas as imagens
    for root, dirs, files in os.walk("imagem"):
        for file in files:
            input_path = Path(root) / file
            
            if input_path.suffix.lower() in extensions:
                try:
                    # Criar estrutura de diretórios de saída
                    relative_path = input_path.relative_to("imagem")
                    output_subdir = output_dir / relative_path.parent
                    output_subdir.mkdir(parents=True, exist_ok=True)
                    
                    # Caminhos de saída
                    output_jpg = output_subdir / f"{relative_path.stem}.jpg"
                    output_webp = output_subdir / f"{relative_path.stem}.webp"
                    
                    # Tamanho original
                    tamanho_original = input_path.stat().st_size
                    stats['total_original'] += tamanho_original
                    
                    print(f"📸 {relative_path}")
                    print(f"   Original: {format_bytes(tamanho_original)}")
                    
                    # Otimizar para JPEG
                    if otimizar_imagem(input_path, output_jpg):
                        tamanho_otimizado = output_jpg.stat().st_size
                        stats['total_otimizado'] += tamanho_otimizado
                        economia_jpg = tamanho_original - tamanho_otimizado
                        percentual_jpg = (economia_jpg / tamanho_original) * 100
                        
                        print(f"   📦 JPEG otimizado: {format_bytes(tamanho_otimizado)} "
                              f"({percentual_jpg:.1f}% menor)")
                    
                    # Converter para WebP
                    if converter_para_webp(input_path, output_webp):
                        tamanho_webp = output_webp.stat().st_size
                        economia_webp = tamanho_original - tamanho_webp
                        percentual_webp = (economia_webp / tamanho_original) * 100
                        
                        print(f"   🚀 WebP: {format_bytes(tamanho_webp)} "
                              f"({percentual_webp:.1f}% menor)")
                        stats['arquivos_webp'] += 1
                    
                    stats['arquivos_processados'] += 1
                    print()
                    
                except Exception as e:
                    print(f"❌ Erro ao processar {input_path}: {e}")
    
    # Relatório final
    economia_total = stats['total_original'] - stats['total_otimizado']
    percentual_total = (economia_total / stats['total_original']) * 100 if stats['total_original'] > 0 else 0
    
    print("\n" + "="*50)
    print("📊 RELATÓRIO FINAL DE OTIMIZAÇÃO")
    print("="*50)
    print(f"📸 Arquivos processados: {stats['arquivos_processados']}")
    print(f"📦 Tamanho original: {format_bytes(stats['total_original'])}")
    print(f"🚀 Tamanho otimizado: {format_bytes(stats['total_otimizado'])}")
    print(f"💾 Economia total: {format_bytes(economia_total)} ({percentual_total:.1f}%)")
    print(f"🌐 Arquivos WebP criados: {stats['arquivos_webp']}")
    print(f"📁 Imagens salvas em: {output_dir}")
    
    print("\n🛠️  PRÓXIMOS PASSOS:")
    print("1. Revisar as imagens otimizadas")
    print("2. Substituir as originais pelas otimizadas")
    print("3. Implementar <picture> tags para WebP")
    print("4. Configurar lazy loading")

if __name__ == "__main__":
    try:
        from PIL import Image, ImageOps
        main()
    except ImportError:
        print("❌ Pillow não encontrado. Instalando...")
        print("Execute: pip3 install Pillow")
        print("Depois rode novamente este script.")