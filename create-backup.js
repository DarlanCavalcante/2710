#!/usr/bin/env node

/**
 * 📦 TECH10 BACKUP GENERATOR
 * Cria backup completo do projeto em formato ZIP
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class BackupGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'backup');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.backupName = `tech10-backup-${this.timestamp}.zip`;
    this.backupPath = path.join(this.backupDir, this.backupName);
  }

  async createBackup() {
    try {
      console.log('🚀 Iniciando backup do Tech10...\n');
      
      // Criar diretório de backup se não existir
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Criar stream de escrita
      const output = fs.createWriteStream(this.backupPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Compressão máxima
      });

      // Event listeners
      output.on('close', () => {
        const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`\n✅ Backup criado com sucesso!`);
        console.log(`📁 Arquivo: ${this.backupName}`);
        console.log(`📏 Tamanho: ${sizeInMB} MB`);
        console.log(`📍 Local: ${this.backupPath}\n`);
        
        this.createBackupInfo();
      });

      output.on('error', (err) => {
        console.error('❌ Erro ao criar backup:', err);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('⚠️  Aviso:', err);
        } else {
          throw err;
        }
      });

      archive.on('error', (err) => {
        throw err;
      });

      // Conectar archive ao output
      archive.pipe(output);

      // Adicionar arquivos ao backup
      await this.addFilesToBackup(archive);

      // Finalizar archive
      await archive.finalize();

    } catch (error) {
      console.error('💥 Erro durante o backup:', error);
      process.exit(1);
    }
  }

  async addFilesToBackup(archive) {
    console.log('📋 Adicionando arquivos ao backup...\n');

    // 1. Arquivos principais do projeto
    const mainFiles = [
      'index.html',
      'configurar-imagem-sobre.html',
      'exemplo-configuracao.js',
      'gerador-configuracao.html',
      'IMAGEM-SOBRE.md',
      'PERSONALIZACAO.md',
      'README.md',
      'teste-dicas.html',
      'teste-tech10.html',
      'teste-video.html',
      'package.json',
      'package-lock.json'
    ];

    mainFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
        console.log(`  ✓ ${file}`);
      }
    });

    // 2. Pasta CSS
    const cssDir = path.join(this.projectRoot, 'css');
    if (fs.existsSync(cssDir)) {
      archive.directory(cssDir, 'css');
      console.log('  ✓ css/');
    }

    // 3. Pasta JS
    const jsDir = path.join(this.projectRoot, 'js');
    if (fs.existsSync(jsDir)) {
      archive.directory(jsDir, 'js');
      console.log('  ✓ js/');
    }

    // 4. Pasta de imagens (seletiva)
    const imagemDir = path.join(this.projectRoot, 'imagem');
    if (fs.existsSync(imagemDir)) {
      // Adicionar apenas arquivos essenciais, não todas as imagens
      const essentialImages = [
        'favico',
        'logo.png',
        'logo.jpg',
        'favicon.ico'
      ];

      essentialImages.forEach(item => {
        const itemPath = path.join(imagemDir, item);
        if (fs.existsSync(itemPath)) {
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            archive.directory(itemPath, `imagem/${item}`);
          } else {
            archive.file(itemPath, { name: `imagem/${item}` });
          }
          console.log(`  ✓ imagem/${item}`);
        }
      });
    }

    // 5. Backend completo
    const backendDir = path.join(this.projectRoot, 'backend');
    if (fs.existsSync(backendDir)) {
      // Adicionar todos os arquivos do backend exceto node_modules
      archive.glob('**/*', {
        cwd: backendDir,
        ignore: ['node_modules/**', 'uploads/**', '*.log', '.env']
      }, { prefix: 'backend/' });
      console.log('  ✓ backend/ (excluindo node_modules e uploads)');
    }

    // 6. Admin completo
    const adminDir = path.join(this.projectRoot, 'admin');
    if (fs.existsSync(adminDir)) {
      archive.directory(adminDir, 'admin');
      console.log('  ✓ admin/');
    }

    // 7. Configurações do Git
    const gitFiles = ['.gitignore', '.gitattributes'];
    gitFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
        console.log(`  ✓ ${file}`);
      }
    });

    // 8. Service Worker e PWA
    const pwaFiles = ['sw.js', 'manifest.json'];
    pwaFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: file });
        console.log(`  ✓ ${file}`);
      }
    });

    console.log('\n📦 Compactando arquivos...');
  }

  createBackupInfo() {
    const infoFile = path.join(this.backupDir, `backup-info-${this.timestamp}.json`);
    
    const backupInfo = {
      name: this.backupName,
      created_at: new Date().toISOString(),
      project: 'Tech10',
      version: '1.0.0',
      size: this.getFileSize(this.backupPath),
      files_included: [
        'Frontend (HTML, CSS, JS)',
        'Backend Node.js/Express',
        'Admin Interface',
        'Database Schema',
        'Configuration Files',
        'Documentation'
      ],
      excluded: [
        'node_modules/',
        'uploads/',
        'imagem/ (parcial)',
        '.env files',
        'log files'
      ],
      restore_instructions: {
        "1": "Extrair o arquivo ZIP",
        "2": "cd backend && npm install",
        "3": "npm start para iniciar o servidor",
        "4": "Acessar http://localhost:3000"
      },
      requirements: {
        "Node.js": ">= 16.0.0",
        "NPM": ">= 8.0.0",
        "OS": "Windows, macOS, Linux"
      }
    };

    fs.writeFileSync(infoFile, JSON.stringify(backupInfo, null, 2));
    console.log(`📋 Informações do backup salvas em: backup-info-${this.timestamp}.json`);
  }

  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const sizeInBytes = stats.size;
    const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
    return `${sizeInMB} MB`;
  }
}

// Executar backup se chamado diretamente
if (require.main === module) {
  const generator = new BackupGenerator();
  generator.createBackup();
}

module.exports = BackupGenerator;