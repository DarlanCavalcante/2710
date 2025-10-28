const os = require('os');
const process = require('process');
const fs = require('fs');
const path = require('path');
const alertManager = require('./alert-manager');

class SystemMonitor {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            requests: {
                total: 0,
                byMethod: {},
                byEndpoint: {},
                byStatus: {},
                responseTime: []
            },
            system: {
                cpu: [],
                memory: [],
                uptime: 0
            },
            errors: []
        };

        this.thresholds = {
            cpu: 80, // %
            memory: 85, // %
            responseTime: 2000, // ms
            errorRate: 5, // %
            requestsPerMinute: 1000
        };

        this.alertCallbacks = [];
        this.isMonitoring = false;
        this.monitoringInterval = null;
    }

    // Iniciar monitoramento
    start(intervalMs = 30000) { // 30 segundos
        if (this.isMonitoring) {
            console.log('[MONITOR] Sistema de monitoramento já está rodando');
            return;
        }

        this.isMonitoring = true;
        console.log('[MONITOR] Iniciando sistema de monitoramento...');

        // Coletar métricas periodicamente
        this.monitoringInterval = setInterval(() => {
            this.collectSystemMetrics();
            this.checkAlerts();
        }, intervalMs);

        // Coletar métricas iniciais
        this.collectSystemMetrics();
    }

    // Parar monitoramento
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        console.log('[MONITOR] Sistema de monitoramento parado');
    }

    // Middleware Express para monitorar requests
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Incrementar contador de requests
            this.metrics.requests.total++;
            
            // Contar por método
            const method = req.method;
            this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
            
            // Contar por endpoint
            const endpoint = req.route ? req.route.path : req.path;
            this.metrics.requests.byEndpoint[endpoint] = (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;

            // Interceptar resposta para medir tempo
            const originalSend = res.send;
            res.send = function(data) {
                const responseTime = Date.now() - startTime;
                
                // Armazenar tempo de resposta
                this.metrics.requests.responseTime.push(responseTime);
                
                // Manter apenas os últimos 1000 tempos de resposta
                if (this.metrics.requests.responseTime.length > 1000) {
                    this.metrics.requests.responseTime.shift();
                }
                
                // Contar por status
                const status = res.statusCode;
                const statusRange = `${Math.floor(status / 100)}xx`;
                this.metrics.requests.byStatus[statusRange] = (this.metrics.requests.byStatus[statusRange] || 0) + 1;
                
                // Log de request lento
                if (responseTime > this.thresholds.responseTime) {
                    console.warn(`[MONITOR] Request lento: ${method} ${endpoint} - ${responseTime}ms`);
                }
                
                return originalSend.call(res, data);
            }.bind(this);

            next();
        };
    }

    // Coletar métricas do sistema
    collectSystemMetrics() {
        // CPU
        const cpuUsage = this.getCPUUsage();
        this.metrics.system.cpu.push({
            timestamp: Date.now(),
            usage: cpuUsage
        });

        // Memory
        const memoryUsage = this.getMemoryUsage();
        this.metrics.system.memory.push({
            timestamp: Date.now(),
            ...memoryUsage
        });

        // Uptime
        this.metrics.system.uptime = Date.now() - this.startTime;

        // Manter apenas os últimos 100 pontos de dados
        if (this.metrics.system.cpu.length > 100) {
            this.metrics.system.cpu.shift();
        }
        if (this.metrics.system.memory.length > 100) {
            this.metrics.system.memory.shift();
        }
    }

    // Calcular uso de CPU
    getCPUUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        return Math.round(100 - (100 * totalIdle / totalTick));
    }

    // Obter uso de memória
    getMemoryUsage() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const processMemory = process.memoryUsage();

        return {
            total: totalMem,
            free: freeMem,
            used: usedMem,
            usedPercent: Math.round((usedMem / totalMem) * 100),
            process: processMemory
        };
    }

    // Obter uso de disco
    async getDiskUsage() {
        try {
            const stats = fs.statSync('.');
            // Esta é uma implementação simplificada
            // Em produção, você usaria uma biblioteca como 'check-disk-space'
            return {
                total: stats.size || 0,
                free: 0,
                used: 0,
                usedPercent: 0
            };
        } catch (error) {
            console.error('[MONITOR] Erro ao obter uso de disco:', error);
            return { total: 0, free: 0, used: 0, usedPercent: 0 };
        }
    }

    // Verificar alertas
    async checkAlerts() {
        const now = Date.now();
        
        // CPU alert
        const latestCPU = this.metrics.system.cpu[this.metrics.system.cpu.length - 1];
        if (latestCPU && latestCPU.usage > this.thresholds.cpu) {
            await alertManager.processAlert(
                'cpu', 
                `CPU alto: ${latestCPU.usage}%`, 
                latestCPU.usage > 95 ? 'critical' : 'warning',
                { cpuUsage: `${latestCPU.usage}%`, threshold: `${this.thresholds.cpu}%` }
            );
        }

        // Memory alert
        const latestMemory = this.metrics.system.memory[this.metrics.system.memory.length - 1];
        if (latestMemory && latestMemory.usedPercent > this.thresholds.memory) {
            await alertManager.processAlert(
                'memory', 
                `Memória alta: ${latestMemory.usedPercent}%`, 
                latestMemory.usedPercent > 95 ? 'critical' : 'warning',
                { 
                    memoryUsage: `${latestMemory.usedPercent}%`, 
                    threshold: `${this.thresholds.memory}%`,
                    usedGB: `${(latestMemory.used / 1024 / 1024 / 1024).toFixed(2)}GB`,
                    totalGB: `${(latestMemory.total / 1024 / 1024 / 1024).toFixed(2)}GB`
                }
            );
        }

        // Response time alert
        if (this.metrics.requests.responseTime.length > 0) {
            const avgResponseTime = this.getAverageResponseTime();
            if (avgResponseTime > this.thresholds.responseTime) {
                await alertManager.processAlert(
                    'responseTime', 
                    `Tempo de resposta alto: ${avgResponseTime}ms`, 
                    avgResponseTime > 5000 ? 'critical' : 'warning',
                    { averageResponseTime: `${avgResponseTime}ms`, threshold: `${this.thresholds.responseTime}ms` }
                );
            }
        }

        // Error rate alert
        const errorRate = this.getErrorRate();
        if (errorRate > this.thresholds.errorRate) {
            await alertManager.processAlert(
                'errorRate', 
                `Taxa de erro alta: ${errorRate}%`, 
                errorRate > 15 ? 'critical' : 'warning',
                { 
                    errorRate: `${errorRate}%`, 
                    threshold: `${this.thresholds.errorRate}%`,
                    totalRequests: this.metrics.requests.total,
                    totalErrors: (this.metrics.requests.byStatus['4xx'] || 0) + (this.metrics.requests.byStatus['5xx'] || 0)
                }
            );
        }

        // Disk space alert (new)
        const diskUsage = await this.getDiskUsage();
        if (diskUsage.usedPercent > 90) {
            await alertManager.processAlert(
                'diskSpace',
                `Espaço em disco baixo: ${diskUsage.usedPercent}%`,
                diskUsage.usedPercent > 95 ? 'critical' : 'warning',
                {
                    diskUsage: `${diskUsage.usedPercent}%`,
                    freeSpace: `${(diskUsage.free / 1024 / 1024 / 1024).toFixed(2)}GB`,
                    totalSpace: `${(diskUsage.total / 1024 / 1024 / 1024).toFixed(2)}GB`
                }
            );
        }
    }

    // Obter alertas do AlertManager
    getAlerts() {
        return alertManager.getAlerts({ acknowledged: false });
    }

    // Adicionar callback de alerta
    onAlert(callback) {
        this.alertCallbacks.push(callback);
    }

    // Obter estatísticas
    getStats() {
        return {
            requests: {
                ...this.metrics.requests,
                averageResponseTime: this.getAverageResponseTime(),
                requestsPerMinute: this.getRequestsPerMinute(),
                errorRate: this.getErrorRate()
            },
            system: {
                ...this.metrics.system,
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                nodeVersion: process.version,
                currentCPU: this.getCPUUsage(),
                currentMemory: this.getMemoryUsage()
            },
            alerts: this.getAlerts(),
            alertStats: alertManager.getStats(),
            uptime: Date.now() - this.startTime,
            isMonitoring: this.isMonitoring
        };
    }

    // Calcular tempo médio de resposta
    getAverageResponseTime() {
        if (this.metrics.requests.responseTime.length === 0) return 0;
        
        const sum = this.metrics.requests.responseTime.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.metrics.requests.responseTime.length);
    }

    // Calcular requests por minuto
    getRequestsPerMinute() {
        const oneMinuteAgo = Date.now() - 60000;
        // Esta é uma aproximação simples - em produção, você manteria timestamps
        return Math.round(this.metrics.requests.total / ((Date.now() - this.startTime) / 60000));
    }

    // Calcular taxa de erro
    getErrorRate() {
        const total = this.metrics.requests.total;
        if (total === 0) return 0;
        
        const errors = (this.metrics.requests.byStatus['4xx'] || 0) + (this.metrics.requests.byStatus['5xx'] || 0);
        return Math.round((errors / total) * 100);
    }

    // Resetar métricas
    reset() {
        this.metrics = {
            requests: {
                total: 0,
                byMethod: {},
                byEndpoint: {},
                byStatus: {},
                responseTime: []
            },
            system: {
                cpu: [],
                memory: [],
                uptime: 0
            },
            errors: []
        };
        this.startTime = Date.now();
        console.log('[MONITOR] Métricas resetadas');
    }

    // Salvar relatório
    async saveReport(filePath = null) {
        if (!filePath) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filePath = path.join(__dirname, `../reports/monitor-report-${timestamp}.json`);
        }

        const reportDir = path.dirname(filePath);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const report = {
            timestamp: new Date().toISOString(),
            stats: this.getStats(),
            period: {
                start: new Date(this.startTime).toISOString(),
                end: new Date().toISOString(),
                duration: Date.now() - this.startTime
            }
        };

        fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
        console.log(`[MONITOR] Relatório salvo em: ${filePath}`);
        
        return filePath;
    }
}

// Singleton
const systemMonitor = new SystemMonitor();

module.exports = systemMonitor;