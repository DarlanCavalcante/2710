# ====================================
# CONFIGURAÇÕES DE ALERTAS - TECH10
# ====================================

# Para habilitar alertas por email, configure as variáveis abaixo no seu arquivo .env

# === CONFIGURAÇÕES DE EMAIL ===
# Para Gmail:
# ALERT_EMAIL_USER=seu-email@gmail.com
# ALERT_EMAIL_PASS=sua-senha-de-app
# ALERT_EMAIL_TO=admin@tech10.com,devops@tech10.com

# Para outros provedores de email, você pode modificar o arquivo:
# backend/utils/alert-manager.js

# === CONFIGURAÇÕES DE WEBHOOK ===
# Para Slack:
# ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Para Discord:
# ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

# === EXEMPLOS DE CONFIGURAÇÃO ===

# Gmail (mais comum):
# ALERT_EMAIL_USER=admin@gmail.com
# ALERT_EMAIL_PASS=abcd efgh ijkl mnop  # Senha de app do Gmail
# ALERT_EMAIL_TO=admin@tech10.com

# Outlook/Hotmail:
# ALERT_EMAIL_USER=admin@outlook.com
# ALERT_EMAIL_PASS=sua-senha
# ALERT_EMAIL_TO=admin@tech10.com

# === COMO CONFIGURAR SENHA DE APP NO GMAIL ===
# 1. Acesse https://myaccount.google.com/security
# 2. Ative a verificação em duas etapas
# 3. Vá em "Senhas de app"
# 4. Gere uma senha para "Mail"
# 5. Use essa senha no ALERT_EMAIL_PASS

# === TESTANDO OS ALERTAS ===
# Após configurar, reinicie o servidor
# Os alertas serão enviados automaticamente quando:
# - CPU > 80%
# - Memória > 85%
# - Tempo de resposta > 2000ms
# - Taxa de erro > 5%

# Exemplo de arquivo .env completo:
# NODE_ENV=development
# SESSION_SECRET=sua-chave-secreta-muito-longa-e-segura-123
# JWT_SECRET=sua-chave-jwt-muito-longa-e-segura-456
# PORT=3001
# 
# # Alertas
# ALERT_EMAIL_USER=admin@gmail.com
# ALERT_EMAIL_PASS=abcd efgh ijkl mnop
# ALERT_EMAIL_TO=admin@tech10.com