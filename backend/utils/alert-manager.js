const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class AlertManager {
    constructor() {
        this.alertHistory = [];
        this.emailTransporter = null;
        this.webhookUrl = null;
        this.alertRules = {
            cpu: { threshold: 80, enabled: true, cooldown: 300000 }, // 5 min cooldown
            memory: { threshold: 85, enabled: true, cooldown: 300000 },
            responseTime: { threshold: 2000, enabled: true, cooldown: 180000 }, // 3 min
            errorRate: { threshold: 5, enabled: true, cooldown: 180000 },
            diskSpace: { threshold: 90, enabled: true, cooldown: 600000 }, // 10 min
            requestsPerMinute: { threshold: 1000, enabled: false, cooldown: 300000 }
        };
        
        this.lastAlertTimes = {};
        this.setupEmailTransporter();
    }

    // Configurar transporter de email
    setupEmailTransporter() {
        try {
            if (!process.env.ALERT_EMAIL_USER || !process.env.ALERT_EMAIL_PASS) {
                console.log('[ALERTS] Variáveis de email não configuradas - alertas por email desabilitados');
                return;
            }

            // Configuração para Gmail (você pode alterar para outros provedores)
            this.emailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.ALERT_EMAIL_USER,
                    pass: process.env.ALERT_EMAIL_PASS
                }
            });

            console.log('[ALERTS] Sistema de email configurado');
        } catch (error) {
            console.warn('[ALERTS] Email não configurado:', error.message);
        }
    }

    // Configurar webhook (Slack, Discord, etc.)
    setWebhook(url) {
        this.webhookUrl = url;
        console.log('[ALERTS] Webhook configurado');
    }

    // Adicionar regra de alerta personalizada
    addRule(name, config) {
        this.alertRules[name] = {
            threshold: config.threshold,
            enabled: config.enabled !== false,
            cooldown: config.cooldown || 300000,
            message: config.message,
            severity: config.severity || 'warning'
        };
        console.log(`[ALERTS] Regra '${name}' adicionada`);
    }

    // Verificar se deve enviar alerta (cooldown)
    shouldSendAlert(alertType) {
        const lastTime = this.lastAlertTimes[alertType];
        const cooldown = this.alertRules[alertType]?.cooldown || 300000;
        
        if (!lastTime) return true;
        return (Date.now() - lastTime) > cooldown;
    }

    // Processar alerta
    async processAlert(type, message, severity = 'warning', metrics = {}) {
        const rule = this.alertRules[type];
        
        // Verificar se a regra está ativa
        if (!rule || !rule.enabled) return;

        // Verificar cooldown
        if (!this.shouldSendAlert(type)) {
            console.log(`[ALERTS] Alerta '${type}' em cooldown`);
            return;
        }

        const alert = {
            id: Date.now() + Math.random(),
            type,
            message,
            severity,
            timestamp: Date.now(),
            metrics,
            acknowledged: false
        };

        // Armazenar no histórico
        this.alertHistory.push(alert);
        this.lastAlertTimes[type] = Date.now();

        // Manter apenas os últimos 500 alertas
        if (this.alertHistory.length > 500) {
            this.alertHistory.shift();
        }

        console.log(`[ALERTS] Processando alerta: ${message}`);

        // Enviar notificações
        await this.sendNotifications(alert);

        return alert;
    }

    // Enviar notificações
    async sendNotifications(alert) {
        const notifications = [];

        // Email
        if (this.emailTransporter && process.env.ALERT_EMAIL_TO) {
            notifications.push(this.sendEmailAlert(alert));
        }

        // Webhook
        if (this.webhookUrl) {
            notifications.push(this.sendWebhookAlert(alert));
        }

        // Log
        notifications.push(this.logAlert(alert));

        try {
            await Promise.allSettled(notifications);
        } catch (error) {
            console.error('[ALERTS] Erro ao enviar notificações:', error);
        }
    }

    // Enviar alerta por email
    async sendEmailAlert(alert) {
        if (!this.emailTransporter) return;

        const severityEmojis = {
            info: 'ℹ️',
            warning: '⚠️',
            critical: '🚨'
        };

        const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'warning' ? '#d97706' : '#2563eb'}; color: white; padding: 20px; text-align: center;">
                <h1>${severityEmojis[alert.severity]} Tech10 System Alert</h1>
            </div>
            
            <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">Alert Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px; font-weight: bold;">Type:</td>
                        <td style="padding: 8px;">${alert.type}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px; font-weight: bold;">Severity:</td>
                        <td style="padding: 8px;"><span style="color: ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'warning' ? '#d97706' : '#2563eb'};">${alert.severity.toUpperCase()}</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px; font-weight: bold;">Time:</td>
                        <td style="padding: 8px;">${new Date(alert.timestamp).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Message:</td>
                        <td style="padding: 8px;">${alert.message}</td>
                    </tr>
                </table>

                ${alert.metrics && Object.keys(alert.metrics).length > 0 ? `
                <h3 style="color: #374151; margin-top: 20px;">Metrics:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${Object.entries(alert.metrics).map(([key, value]) => `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px; font-weight: bold;">${key}:</td>
                        <td style="padding: 8px;">${value}</td>
                    </tr>
                    `).join('')}
                </table>
                ` : ''}
                
                <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-left: 4px solid #0284c7;">
                    <p style="margin: 0; color: #0c4a6e;">
                        <strong>Action Required:</strong> Please check your system immediately and take appropriate action.
                    </p>
                </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>This is an automated alert from Tech10 System Monitor</p>
                <p>Server: ${require('os').hostname()}</p>
            </div>
        </div>
        `;

        const mailOptions = {
            from: process.env.ALERT_EMAIL_USER,
            to: process.env.ALERT_EMAIL_TO,
            subject: `🚨 Tech10 Alert - ${alert.severity.toUpperCase()}: ${alert.type}`,
            html: emailHTML
        };

        try {
            await this.emailTransporter.sendMail(mailOptions);
            console.log('[ALERTS] Email enviado com sucesso');
        } catch (error) {
            console.error('[ALERTS] Erro ao enviar email:', error);
        }
    }

    // Enviar alerta via webhook
    async sendWebhookAlert(alert) {
        if (!this.webhookUrl) return;

        const payload = {
            text: `🚨 **Tech10 Alert**`,
            attachments: [{
                color: alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'good',
                fields: [
                    { title: 'Type', value: alert.type, short: true },
                    { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
                    { title: 'Message', value: alert.message, short: false },
                    { title: 'Time', value: new Date(alert.timestamp).toISOString(), short: true }
                ]
            }]
        };

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('[ALERTS] Webhook enviado com sucesso');
            } else {
                console.error('[ALERTS] Erro no webhook:', response.status);
            }
        } catch (error) {
            console.error('[ALERTS] Erro ao enviar webhook:', error);
        }
    }

    // Log do alerta
    async logAlert(alert) {
        const logDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, 'alerts.log');
        const logEntry = `[${new Date(alert.timestamp).toISOString()}] [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}\n`;

        try {
            fs.appendFileSync(logFile, logEntry);
        } catch (error) {
            console.error('[ALERTS] Erro ao escrever log:', error);
        }
    }

    // Obter histórico de alertas
    getAlerts(filters = {}) {
        let alerts = [...this.alertHistory];

        if (filters.severity) {
            alerts = alerts.filter(alert => alert.severity === filters.severity);
        }

        if (filters.type) {
            alerts = alerts.filter(alert => alert.type === filters.type);
        }

        if (filters.since) {
            alerts = alerts.filter(alert => alert.timestamp >= filters.since);
        }

        if (filters.acknowledged !== undefined) {
            alerts = alerts.filter(alert => alert.acknowledged === filters.acknowledged);
        }

        return alerts.sort((a, b) => b.timestamp - a.timestamp);
    }

    // Marcar alerta como reconhecido
    acknowledgeAlert(alertId, userId = null) {
        const alert = this.alertHistory.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedBy = userId;
            alert.acknowledgedAt = Date.now();
            console.log(`[ALERTS] Alerta ${alertId} reconhecido`);
            return true;
        }
        return false;
    }

    // Obter estatísticas dos alertas
    getStats() {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        const last1h = now - (60 * 60 * 1000);

        const recentAlerts = this.alertHistory.filter(a => a.timestamp >= last24h);
        const hourlyAlerts = this.alertHistory.filter(a => a.timestamp >= last1h);

        return {
            total: this.alertHistory.length,
            last24h: recentAlerts.length,
            lastHour: hourlyAlerts.length,
            bySeverity: {
                critical: recentAlerts.filter(a => a.severity === 'critical').length,
                warning: recentAlerts.filter(a => a.severity === 'warning').length,
                info: recentAlerts.filter(a => a.severity === 'info').length
            },
            byType: recentAlerts.reduce((acc, alert) => {
                acc[alert.type] = (acc[alert.type] || 0) + 1;
                return acc;
            }, {}),
            unacknowledged: this.alertHistory.filter(a => !a.acknowledged).length
        };
    }

    // Configurar regras a partir de arquivo
    loadRulesFromFile(filePath) {
        try {
            const rules = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            Object.assign(this.alertRules, rules);
            console.log('[ALERTS] Regras carregadas do arquivo');
        } catch (error) {
            console.error('[ALERTS] Erro ao carregar regras:', error);
        }
    }

    // Salvar regras em arquivo
    saveRulesToFile(filePath) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(this.alertRules, null, 2));
            console.log('[ALERTS] Regras salvas no arquivo');
        } catch (error) {
            console.error('[ALERTS] Erro ao salvar regras:', error);
        }
    }
}

// Singleton
const alertManager = new AlertManager();

module.exports = alertManager;