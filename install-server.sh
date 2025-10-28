#!/bin/bash

# 🚀 Script de Instalação Automática - Tech10 Backend
# Uso: ./install-server.sh [dominio] [email]

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar argumentos
if [ $# -lt 2 ]; then
    error "Uso: ./install-server.sh [dominio] [email]
    
Exemplo: ./install-server.sh meusite.com admin@meusite.com"
fi

DOMAIN=$1
EMAIL=$2
PROJECT_DIR="/var/www/tech10"

log "🚀 Iniciando instalação do Tech10 Backend..."
log "📍 Domínio: $DOMAIN"
log "📧 Email: $EMAIL"

# Verificar se é root ou tem sudo
if [ "$EUID" -ne 0 ]; then
    if ! command -v sudo &> /dev/null; then
        error "Este script precisa ser executado como root ou ter sudo disponível"
    fi
    SUDO="sudo"
else
    SUDO=""
fi

# 1. Atualizar sistema
log "📦 Atualizando sistema..."
$SUDO apt update && $SUDO apt upgrade -y

# 2. Instalar dependências
log "🔧 Instalando dependências..."
$SUDO apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates

# 3. Instalar Node.js 18.x LTS
log "📱 Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs
else
    info "Node.js já está instalado: $(node -v)"
fi

# 4. Instalar PM2
log "⚙️ Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    $SUDO npm install -g pm2
else
    info "PM2 já está instalado: $(pm2 -v)"
fi

# 5. Instalar Nginx
log "🌐 Instalando Nginx..."
if ! command -v nginx &> /dev/null; then
    $SUDO apt install -y nginx
    $SUDO systemctl enable nginx
    $SUDO systemctl start nginx
else
    info "Nginx já está instalado: $(nginx -v 2>&1)"
fi

# 6. Instalar Certbot
log "🔒 Instalando Certbot..."
if ! command -v certbot &> /dev/null; then
    $SUDO apt install -y certbot python3-certbot-nginx
else
    info "Certbot já está instalado: $(certbot --version)"
fi

# 7. Instalar Git
log "📥 Instalando Git..."
if ! command -v git &> /dev/null; then
    $SUDO apt install -y git
else
    info "Git já está instalado: $(git --version)"
fi

# 8. Configurar limites do sistema
log "⚡ Configurando limites do sistema..."
if ! grep -q "65536" /etc/security/limits.conf; then
    echo "* soft nofile 65536" | $SUDO tee -a /etc/security/limits.conf
    echo "* hard nofile 65536" | $SUDO tee -a /etc/security/limits.conf
fi

# 9. Configurar swap se necessário
log "💾 Verificando swap..."
if [ $(free | grep Swap | awk '{print $2}') -eq 0 ]; then
    warning "Configurando swap de 2GB..."
    $SUDO fallocate -l 2G /swapfile
    $SUDO chmod 600 /swapfile
    $SUDO mkswap /swapfile
    $SUDO swapon /swapfile
    echo '/swapfile swap swap defaults 0 0' | $SUDO tee -a /etc/fstab
fi

# 10. Criar diretório do projeto
log "📁 Criando diretório do projeto..."
$SUDO mkdir -p $PROJECT_DIR
$SUDO chown $USER:$USER $PROJECT_DIR

# 11. Clonar repositório
log "📥 Clonando repositório..."
if [ ! -d "$PROJECT_DIR/.git" ]; then
    cd /tmp
    git clone https://github.com/DarlanCavalcante/2710.git tech10-temp
    cp -r tech10-temp/* $PROJECT_DIR/
    rm -rf tech10-temp
    cd $PROJECT_DIR
else
    cd $PROJECT_DIR
    git pull origin main
fi

# 12. Configurar backend
log "🔧 Configurando backend..."
cd $PROJECT_DIR/backend

# Instalar dependências
npm ci --production

# Criar diretórios necessários
mkdir -p database uploads logs
chmod 755 database uploads logs

# 13. Configurar ambiente
log "🌍 Configurando variáveis de ambiente..."
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Gerar secrets seguros
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Substituir valores no .env
    sed -i "s/your_session_secret_here_min_64_chars/$SESSION_SECRET/" .env
    sed -i "s/your_jwt_secret_here_min_64_chars/$JWT_SECRET/" .env
    sed -i "s/development/production/" .env
    sed -i "s/http:\/\/localhost:3000/https:\/\/$DOMAIN/" .env
    sed -i "s/http:\/\/localhost:3001/https:\/\/api.$DOMAIN/" .env
    sed -i "s/admin@tech10info.com/$EMAIL/" .env
    sed -i "s/change_this_password_in_production/$(openssl rand -base64 32)/" .env
    sed -i "s/RATE_LIMIT_MAX=100/RATE_LIMIT_MAX=1000/" .env
    
    log "✅ Arquivo .env configurado"
else
    warning "Arquivo .env já existe, mantendo configurações atuais"
fi

# 14. Inicializar banco de dados
log "🗄️ Inicializando banco de dados..."
if [ ! -f database/tech10.db ]; then
    npm run init-db
    log "✅ Banco de dados inicializado"
else
    info "Banco de dados já existe"
fi

# 15. Configurar PM2
log "⚙️ Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'tech10-backend',
    script: 'server.js',
    cwd: '$PROJECT_DIR/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'database'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -1 | $SUDO bash

# 16. Configurar Nginx
log "🌐 Configurando Nginx..."
$SUDO tee /etc/nginx/sites-available/tech10 > /dev/null << EOF
# Configuração Nginx - Tech10
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN;
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;
    
    # SSL será configurado pelo Certbot
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /uploads/ {
        alias $PROJECT_DIR/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    root $PROJECT_DIR;
    index index.html;
    
    # SSL será configurado pelo Certbot
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site
$SUDO ln -sf /etc/nginx/sites-available/tech10 /etc/nginx/sites-enabled/
$SUDO nginx -t && $SUDO systemctl reload nginx

# 17. Configurar SSL
log "🔒 Configurando SSL..."
$SUDO certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# 18. Configurar firewall
log "🔥 Configurando firewall..."
if command -v ufw &> /dev/null; then
    $SUDO ufw --force reset
    $SUDO ufw allow ssh
    $SUDO ufw allow 'Nginx Full'
    $SUDO ufw --force enable
fi

# 19. Configurar backups
log "💾 Configurando backup automático..."
cd $PROJECT_DIR
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/tech10"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco
cp backend/database/tech10.db $BACKUP_DIR/tech10-db-$DATE.db

# Backup dos uploads
tar -czf $BACKUP_DIR/tech10-uploads-$DATE.tar.gz backend/uploads/

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "tech10-*" -mtime +7 -delete

echo "✅ Backup realizado: $BACKUP_DIR"
EOF

chmod +x backup.sh

# Agendar backup diário
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -

# 20. Script de deploy
log "🚀 Criando script de deploy..."
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando deploy do Tech10..."

# Backup do banco antes do deploy
cp backend/database/tech10.db backend/database/backup-$(date +%Y%m%d-%H%M%S).db

# Atualizar código
git pull origin main

# Instalar dependências
cd backend
npm ci --production

# Restart aplicação
pm2 restart tech10-backend

# Verificar status
pm2 status

echo "✅ Deploy concluído!"
EOF

chmod +x deploy.sh

# 21. Verificações finais
log "🔍 Executando verificações finais..."

# Verificar se PM2 está rodando
if ! pm2 status | grep -q "tech10-backend"; then
    error "PM2 não está rodando a aplicação"
fi

# Verificar se Nginx está funcionando
if ! $SUDO systemctl is-active --quiet nginx; then
    error "Nginx não está ativo"
fi

# Verificar se a porta está aberta
if ! netstat -tlnp | grep -q ":3001"; then
    error "Backend não está rodando na porta 3001"
fi

# Teste básico da API
sleep 5
if ! curl -f -s http://localhost:3001/api/health > /dev/null; then
    warning "API não está respondendo no localhost (normal se ainda não estiver totalmente configurada)"
fi

log "🎉 Instalação concluída com sucesso!"
log ""
log "📋 Próximos passos:"
log "1. Acesse https://$DOMAIN para ver o site"
log "2. Acesse https://api.$DOMAIN/admin para o painel administrativo"
log "3. Use o email: $EMAIL e a senha gerada automaticamente"
log "4. Altere a senha do admin em: https://api.$DOMAIN/admin/settings"
log ""
log "🔧 Comandos úteis:"
log "• Ver logs: pm2 logs tech10-backend"
log "• Status: pm2 status"
log "• Reiniciar: pm2 restart tech10-backend"
log "• Deploy: $PROJECT_DIR/deploy.sh"
log "• Backup: $PROJECT_DIR/backup.sh"
log ""
log "📊 Monitoramento: https://$DOMAIN/admin/monitor.html"
log ""
warning "IMPORTANTE: Altere as senhas padrão em produção!"
warning "Verifique o arquivo .env em: $PROJECT_DIR/backend/.env"