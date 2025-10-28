#!/usr/bin/env node

/**
 * 🔍 Monitor Avançado do Sistema Tech10
 * 
 * Este script monitora continuamente o sistema e detecta problemas automaticamente
 * Executa verificações de segurança, performance e integridade
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const crypto = require('crypto');

class SystemMonitor {
    constructor() {
        this.projectRoot = process.cwd();
        this.checks = [];
        this.issues = [];
        this.startTime = Date.now();
        
        console.log('🔍 Tech10 System Monitor Iniciado');
        console.log('==================================');
    }

    /**
     * Executar todas as verificações
     */
    async runAllChecks() {
        console.log('⏳ Executando verificações do sistema...\n');

        // Verificações básicas
        await this.checkSystemHealth();
        await this.checkFileIntegrity();
        await this.checkSecurity();
        await this.checkPerformance();
        await this.checkDependencies();
        await this.checkBackend();
        await this.checkDatabase();

        // Gerar relatório
        this.generateReport();
    }

    /**
     * Verificar saúde básica do sistema
     */
    async checkSystemHealth() {
        console.log('🏥 Verificando saúde do sistema...');
        
        const health = {
            name: 'System Health',
            status: 'ok',
            details: {}
        };

        try {
            // Verificar espaço em disco
            const stats = fs.statSync(this.projectRoot);
            health.details.filesystem = 'accessible';

            // Verificar memória do processo
            const memUsage = process.memoryUsage();
            health.details.memory = {
                used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
            };

            // Verificar uptime
            health.details.uptime = Math.floor(process.uptime()) + 's';

            console.log('  ✅ Sistema operacional');
            
        } catch (error) {
            health.status = 'error';
            health.error = error.message;
            this.addIssue('critical', 'System Health', error.message);
            console.log('  ❌ Problemas no sistema');
        }

        this.checks.push(health);
    }

    /**
     * Verificar integridade dos arquivos críticos
     */
    async checkFileIntegrity() {
        console.log('📁 Verificando integridade dos arquivos...');

        const requiredFiles = [
            'index.html',
            'backend/server.js',
            'backend/package.json',
            'backend/.env.example',
            'css/styles.css',
            'js/script.js',
            'admin/dashboard.html'
        ];

        const integrity = {
            name: 'File Integrity',
            status: 'ok',
            details: { missing: [], present: [] }
        };

        for (const file of requiredFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                integrity.details.present.push(file);
            } else {
                integrity.details.missing.push(file);
                integrity.status = 'warning';
                this.addIssue('high', 'Missing File', `Arquivo crítico ausente: ${file}`);
            }
        }

        // Verificar arquivos de teste (não deveriam existir)
        const testFiles = [
            'teste-dicas.html',
            'teste-tech10.html',
            'teste-video.html',
            'test-dicas-fix.html'
        ];

        const testFound = testFiles.filter(file => 
            fs.existsSync(path.join(this.projectRoot, file))
        );

        if (testFound.length > 0) {
            integrity.status = 'warning';
            this.addIssue('medium', 'Test Files', `Arquivos de teste encontrados: ${testFound.join(', ')}`);
        }

        console.log(`  ✅ ${integrity.details.present.length} arquivos críticos encontrados`);
        if (integrity.details.missing.length > 0) {
            console.log(`  ⚠️  ${integrity.details.missing.length} arquivos ausentes`);
        }
        if (testFound.length > 0) {
            console.log(`  ⚠️  ${testFound.length} arquivos de teste encontrados`);
        }

        this.checks.push(integrity);
    }

    /**
     * Verificações de segurança
     */
    async checkSecurity() {
        console.log('🔒 Verificando segurança...');

        const security = {
            name: 'Security',
            status: 'ok',
            details: {}
        };

        try {
            // Verificar .env
            const envPath = path.join(this.projectRoot, 'backend/.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                
                // Verificar secrets fracos
                if (envContent.includes('tech10_super_secret_key') || 
                    envContent.includes('change_in_production') ||
                    envContent.includes('123456')) {
                    security.status = 'critical';
                    security.details.weakSecrets = true;
                    this.addIssue('critical', 'Weak Secrets', 'Secrets padrão ou fracos detectados no .env');
                }

                // Verificar se JWT_SECRET tem tamanho adequado
                const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
                if (jwtMatch && jwtMatch[1].length < 32) {
                    security.status = 'warning';
                    this.addIssue('high', 'JWT Secret', 'JWT_SECRET muito curto (< 32 caracteres)');
                }
            } else {
                this.addIssue('high', 'Environment', 'Arquivo .env não encontrado');
            }

            // Verificar .gitignore
            const gitignorePath = path.join(this.projectRoot, '.gitignore');
            if (fs.existsSync(gitignorePath)) {
                const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
                if (!gitignoreContent.includes('.env') || !gitignoreContent.includes('node_modules')) {
                    security.status = 'warning';
                    this.addIssue('medium', 'Gitignore', '.gitignore incompleto - pode expor arquivos sensíveis');
                }
            }

            console.log('  ✅ Verificações de segurança completadas');

        } catch (error) {
            security.status = 'error';
            security.error = error.message;
            this.addIssue('high', 'Security Check', error.message);
            console.log('  ❌ Erro nas verificações de segurança');
        }

        this.checks.push(security);
    }

    /**
     * Verificar performance
     */
    async checkPerformance() {
        console.log('⚡ Verificando performance...');

        const performance = {
            name: 'Performance',
            status: 'ok',
            details: {}
        };

        try {
            // Verificar tamanho dos arquivos CSS/JS
            const cssPath = path.join(this.projectRoot, 'css/styles.css');
            const jsPath = path.join(this.projectRoot, 'js/script.js');

            if (fs.existsSync(cssPath)) {
                const cssSize = fs.statSync(cssPath).size;
                performance.details.cssSize = Math.round(cssSize / 1024) + 'KB';
                
                if (cssSize > 100000) { // > 100KB
                    performance.status = 'warning';
                    this.addIssue('medium', 'CSS Size', `CSS muito grande (${Math.round(cssSize/1024)}KB) - considere minificação`);
                }
            }

            if (fs.existsSync(jsPath)) {
                const jsSize = fs.statSync(jsPath).size;
                performance.details.jsSize = Math.round(jsSize / 1024) + 'KB';
                
                if (jsSize > 200000) { // > 200KB
                    performance.status = 'warning';
                    this.addIssue('medium', 'JS Size', `JavaScript muito grande (${Math.round(jsSize/1024)}KB) - considere minificação`);
                }
            }

            // Verificar imagens grandes
            const imagePath = path.join(this.projectRoot, 'imagem');
            if (fs.existsSync(imagePath)) {
                let totalImageSize = 0;
                const largeImages = [];

                const checkImages = (dir) => {
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        const stat = fs.statSync(filePath);
                        
                        if (stat.isDirectory()) {
                            checkImages(filePath);
                        } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
                            totalImageSize += stat.size;
                            if (stat.size > 1000000) { // > 1MB
                                largeImages.push(`${file} (${Math.round(stat.size/1024/1024)}MB)`);
                            }
                        }
                    }
                };

                checkImages(imagePath);
                performance.details.totalImageSize = Math.round(totalImageSize / 1024 / 1024) + 'MB';
                
                if (largeImages.length > 0) {
                    performance.status = 'warning';
                    this.addIssue('medium', 'Large Images', `Imagens grandes encontradas: ${largeImages.join(', ')}`);
                }
            }

            console.log('  ✅ Análise de performance completada');

        } catch (error) {
            performance.status = 'error';
            performance.error = error.message;
            console.log('  ❌ Erro na análise de performance');
        }

        this.checks.push(performance);
    }

    /**
     * Verificar dependências
     */
    async checkDependencies() {
        console.log('📦 Verificando dependências...');

        const dependencies = {
            name: 'Dependencies',
            status: 'ok',
            details: {}
        };

        return new Promise((resolve) => {
            const backendPath = path.join(this.projectRoot, 'backend');
            
            if (!fs.existsSync(path.join(backendPath, 'package.json'))) {
                dependencies.status = 'error';
                this.addIssue('critical', 'Dependencies', 'package.json não encontrado no backend');
                this.checks.push(dependencies);
                console.log('  ❌ package.json não encontrado');
                return resolve();
            }

            // Executar npm audit
            exec('npm audit --audit-level=moderate', { cwd: backendPath }, (error, stdout, stderr) => {
                if (error && !error.message.includes('found 0 vulnerabilities')) {
                    dependencies.status = 'warning';
                    dependencies.details.audit = 'vulnerabilities found';
                    this.addIssue('high', 'NPM Audit', 'Vulnerabilidades encontradas nas dependências');
                    console.log('  ⚠️  Vulnerabilidades encontradas');
                } else {
                    dependencies.details.audit = 'no vulnerabilities';
                    console.log('  ✅ Nenhuma vulnerabilidade encontrada');
                }

                // Verificar dependências desatualizadas
                exec('npm outdated --json', { cwd: backendPath }, (error, stdout, stderr) => {
                    if (stdout && stdout.trim()) {
                        try {
                            const outdated = JSON.parse(stdout);
                            const outdatedCount = Object.keys(outdated).length;
                            if (outdatedCount > 0) {
                                dependencies.status = 'warning';
                                dependencies.details.outdated = outdatedCount;
                                this.addIssue('medium', 'Outdated Dependencies', 
                                    `${outdatedCount} dependências desatualizadas`);
                                console.log(`  ⚠️  ${outdatedCount} dependências desatualizadas`);
                            }
                        } catch (parseError) {
                            // Ignorar erros de parsing
                        }
                    }

                    this.checks.push(dependencies);
                    resolve();
                });
            });
        });
    }

    /**
     * Verificar status do backend
     */
    async checkBackend() {
        console.log('🖥️  Verificando backend...');

        const backend = {
            name: 'Backend',
            status: 'unknown',
            details: {}
        };

        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: process.env.PORT || 3000,
                path: '/api/health',
                method: 'GET',
                timeout: 5000
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const healthData = JSON.parse(data);
                        backend.status = healthData.status === 'healthy' ? 'ok' : 'warning';
                        backend.details = healthData;
                        console.log(`  ✅ Backend respondendo (${res.statusCode})`);
                    } catch (error) {
                        backend.status = 'warning';
                        backend.details.response = res.statusCode;
                        console.log(`  ⚠️  Backend respondeu mas sem JSON válido (${res.statusCode})`);
                    }
                    this.checks.push(backend);
                    resolve();
                });
            });

            req.on('error', (error) => {
                backend.status = 'offline';
                backend.error = error.message;
                this.addIssue('medium', 'Backend Offline', 'Servidor backend não está respondendo');
                console.log('  ⚠️  Backend offline');
                this.checks.push(backend);
                resolve();
            });

            req.on('timeout', () => {
                req.destroy();
                backend.status = 'timeout';
                this.addIssue('medium', 'Backend Timeout', 'Servidor backend não respondeu a tempo');
                console.log('  ⚠️  Backend timeout');
                this.checks.push(backend);
                resolve();
            });

            req.end();
        });
    }

    /**
     * Verificar banco de dados
     */
    async checkDatabase() {
        console.log('🗄️  Verificando banco de dados...');

        const database = {
            name: 'Database',
            status: 'ok',
            details: {}
        };

        try {
            const dbPath = path.join(this.projectRoot, 'backend/database/tech10.db');
            
            if (fs.existsSync(dbPath)) {
                const stats = fs.statSync(dbPath);
                database.details.size = Math.round(stats.size / 1024) + 'KB';
                database.details.lastModified = stats.mtime.toISOString();
                
                // Verificar se o banco não está muito grande (indicativo de logs não rotacionados)
                if (stats.size > 50000000) { // > 50MB
                    database.status = 'warning';
                    this.addIssue('medium', 'Database Size', 
                        `Banco de dados muito grande (${Math.round(stats.size/1024/1024)}MB) - considere limpeza`);
                }

                console.log(`  ✅ Banco de dados encontrado (${database.details.size})`);
            } else {
                database.status = 'error';
                this.addIssue('critical', 'Database Missing', 'Arquivo de banco de dados não encontrado');
                console.log('  ❌ Banco de dados não encontrado');
            }

        } catch (error) {
            database.status = 'error';
            database.error = error.message;
            this.addIssue('critical', 'Database Error', error.message);
            console.log('  ❌ Erro ao verificar banco de dados');
        }

        this.checks.push(database);
    }

    /**
     * Adicionar um problema à lista
     */
    addIssue(severity, category, message) {
        this.issues.push({
            severity,
            category,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Gerar relatório final
     */
    generateReport() {
        const duration = Date.now() - this.startTime;
        
        console.log('\n📊 RELATÓRIO DE MONITORAMENTO');
        console.log('=============================');
        console.log(`⏱️  Duração: ${duration}ms`);
        console.log(`🔍 Verificações: ${this.checks.length}`);
        console.log(`⚠️  Problemas: ${this.issues.length}`);

        // Resumo por status
        const statusCounts = {};
        this.checks.forEach(check => {
            statusCounts[check.status] = (statusCounts[check.status] || 0) + 1;
        });

        console.log('\n📈 Status das Verificações:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            const icon = status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '❌';
            console.log(`  ${icon} ${status}: ${count}`);
        });

        // Listar problemas por severidade
        if (this.issues.length > 0) {
            console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');

            const severityOrder = ['critical', 'high', 'medium', 'low'];
            severityOrder.forEach(severity => {
                const severityIssues = this.issues.filter(issue => issue.severity === severity);
                if (severityIssues.length > 0) {
                    const icon = severity === 'critical' ? '🔴' : 
                                severity === 'high' ? '🟠' : 
                                severity === 'medium' ? '🟡' : '🔵';
                    
                    console.log(`\n${icon} ${severity.toUpperCase()} (${severityIssues.length}):`);
                    severityIssues.forEach(issue => {
                        console.log(`  • [${issue.category}] ${issue.message}`);
                    });
                }
            });

            // Recomendações
            console.log('\n💡 RECOMENDAÇÕES:');
            
            const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
            const highCount = this.issues.filter(i => i.severity === 'high').length;

            if (criticalCount > 0) {
                console.log('  🔴 AÇÃO IMEDIATA NECESSÁRIA - Problemas críticos encontrados!');
            } else if (highCount > 0) {
                console.log('  🟠 Ação recomendada - Problemas de alta prioridade encontrados');
            } else {
                console.log('  🟢 Sistema em boa condição - Apenas melhorias menores necessárias');
            }

        } else {
            console.log('\n🎉 EXCELENTE! Nenhum problema encontrado!');
        }

        // Salvar relatório em arquivo
        this.saveReport();
        
        console.log('\n📄 Relatório detalhado salvo em: system-monitor-report.json');
        console.log('🔍 Execute novamente com: node system-monitor.js');
    }

    /**
     * Salvar relatório em arquivo JSON
     */
    saveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            duration: Date.now() - this.startTime,
            summary: {
                totalChecks: this.checks.length,
                totalIssues: this.issues.length,
                criticalIssues: this.issues.filter(i => i.severity === 'critical').length,
                highIssues: this.issues.filter(i => i.severity === 'high').length,
                mediumIssues: this.issues.filter(i => i.severity === 'medium').length,
                lowIssues: this.issues.filter(i => i.severity === 'low').length
            },
            checks: this.checks,
            issues: this.issues,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                cwd: process.cwd(),
                memoryUsage: process.memoryUsage()
            }
        };

        fs.writeFileSync(
            path.join(this.projectRoot, 'system-monitor-report.json'),
            JSON.stringify(report, null, 2)
        );
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const monitor = new SystemMonitor();
    monitor.runAllChecks().catch(error => {
        console.error('❌ Erro durante monitoramento:', error);
        process.exit(1);
    });
}

module.exports = SystemMonitor;