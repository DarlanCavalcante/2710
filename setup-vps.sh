#!/bin/bash

# 🚀 Configuração Rápida para VPS - Tech10
# Compatível com: DigitalOcean, Vultr, Linode, AWS EC2, Google Cloud

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }
warning() { echo -e "${YELLOW}[AVISO] $1${NC}"; }
error() { echo -e "${RED}[ERRO] $1${NC}"; exit 1; }

echo -e "${BLUE}"
cat << 'EOF'
  ╔══════════════════════════════════════════════╗
  ║            TECH10 - SETUP VPS                ║
  ║        Configuração Automática v2.0          ║
  ╚══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Detectar sistema operacional
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    error "Sistema operacional não suportado"
fi

log "Sistema detectado: $OS $VER"

# Verificar recursos do servidor
MEMORY=$(free -m | awk 'NR==2{printf "%.0fMB", $2}')
CORES=$(nproc)
DISK=$(df -h / | awk 'NR==2{print $4}')

info "Recursos do servidor:"
info "  • CPU: $CORES cores"
info "  • RAM: $MEMORY"
info "  • Disco disponível: $DISK"

if [ "${MEMORY%MB}" -lt 1024 ]; then
    warning "RAM baixa detectada. Recomendamos pelo menos 1GB para produção."
fi

# Coletar informações do usuário
echo ""
read -p "🌐 Digite seu domínio (ex: meusite.com): " DOMAIN
read -p "📧 Digite seu email para SSL: " EMAIL
read -p "🔐 Digite uma senha para o admin (ou Enter para gerar): " ADMIN_PASS

if [ -z "$ADMIN_PASS" ]; then
    ADMIN_PASS=$(openssl rand -base64 24)
    warning "Senha gerada automaticamente: $ADMIN_PASS"
    warning "ANOTE ESTA SENHA!"
fi

echo ""
log "Configurações:"
log "  • Domínio: $DOMAIN"
log "  • Email: $EMAIL"
log "  • Senha admin: [oculta]"
echo ""

read -p "Continuar com a instalação? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Função para Ubuntu/Debian
install_ubuntu_debian() {
    log "Configurando para Ubuntu/Debian..."
    
    # Atualizar sistema
    apt update && apt upgrade -y
    
    # Instalar dependências
    apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
    
    # Node.js 18.x LTS
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Outras dependências
    apt install -y nginx git certbot python3-certbot-nginx ufw htop
    
    # PM2
    npm install -g pm2
}

# Função para CentOS/RHEL/Rocky
install_centos_rhel() {
    log "Configurando para CentOS/RHEL/Rocky..."
    
    # Atualizar sistema
    yum update -y
    
    # EPEL Repository
    yum install -y epel-release
    
    # Node.js 18.x
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
    
    # Outras dependências
    yum install -y nginx git certbot python3-certbot-nginx firewalld htop
    
    # PM2
    npm install -g pm2
    
    # Iniciar serviços
    systemctl enable nginx firewalld
    systemctl start nginx firewalld
    
    # Configurar firewall
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --reload
}

# Detectar e instalar dependências
case "$OS" in
    "Ubuntu"*|"Debian"*)
        install_ubuntu_debian
        FIREWALL_CMD="ufw"
        ;;
    "CentOS"*|"Red Hat"*|"Rocky"*)
        install_centos_rhel
        FIREWALL_CMD="firewalld"
        ;;
    *)
        error "Sistema operacional não suportado: $OS"
        ;;
esac

# Configurar usuário e diretórios
USER_HOME="/home/tech10"
PROJECT_DIR="/var/www/tech10"

# Criar usuário tech10 se não existir
if ! id "tech10" &>/dev/null; then
    log "Criando usuário tech10..."
    useradd -m -s /bin/bash tech10
    usermod -aG sudo tech10 2>/dev/null || usermod -aG wheel tech10 2>/dev/null
fi

# Criar diretório do projeto
mkdir -p $PROJECT_DIR
chown tech10:tech10 $PROJECT_DIR

# Baixar e executar script principal como usuário tech10
log "Baixando projeto..."
cd $PROJECT_DIR
git clone https://github.com/DarlanCavalcante/2710.git .
chown -R tech10:tech10 $PROJECT_DIR

# Configurar backend
log "Configurando backend..."
cd backend

# Instalar dependências
sudo -u tech10 npm ci --production

# Criar diretórios
sudo -u tech10 mkdir -p database uploads logs
chmod 755 database uploads logs

# Configurar ambiente
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Gerar secrets
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Configurar .env
    sed -i "s/your_session_secret_here_min_64_chars/$SESSION_SECRET/" .env
    sed -i "s/your_jwt_secret_here_min_64_chars/$JWT_SECRET/" .env
    sed -i "s/development/production/" .env
    sed -i "s/http:\/\/localhost:3000/https:\/\/$DOMAIN/" .env
    sed -i "s/http:\/\/localhost:3001/https:\/\/api.$DOMAIN/" .env
    sed -i "s/admin@tech10info.com/$EMAIL/" .env
    sed -i "s/change_this_password_in_production/$ADMIN_PASS/" .env
    sed -i "s/RATE_LIMIT_MAX=100/RATE_LIMIT_MAX=2000/" .env
    
    chown tech10:tech10 .env
fi

# Inicializar banco
log "Inicializando banco de dados..."
sudo -u tech10 npm run init-db

# Configurar PM2
log "Configurando PM2..."
sudo -u tech10 cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'tech10-backend',
    script: 'server.js',
    instances: $CORES,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '512M',
    restart_delay: 2000,
    max_restarts: 10
  }]
};
EOF

# Iniciar aplicação
sudo -u tech10 pm2 start ecosystem.config.js --env production
sudo -u tech10 pm2 save

# Configurar PM2 startup
env PATH=$PATH:/usr/bin pm2 startup systemd -u tech10 --hp /home/tech10 | bash

# Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/tech10 << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
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
    }
    
    location /uploads/ {
        alias $PROJECT_DIR/backend/uploads/;
        expires 30d;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    root $PROJECT_DIR;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/tech10 /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Configurar SSL
log "Configurando SSL..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

# Configurar renovação automática SSL
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Configurar firewall Ubuntu
if [ "$FIREWALL_CMD" = "ufw" ]; then
    ufw --force reset
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
fi

# Scripts utilitários
log "Criando scripts utilitários..."
cd $PROJECT_DIR

# Script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/tech10"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR
cp backend/database/tech10.db $BACKUP_DIR/tech10-db-$DATE.db
tar -czf $BACKUP_DIR/tech10-uploads-$DATE.tar.gz backend/uploads/
find $BACKUP_DIR -name "tech10-*" -mtime +7 -delete
echo "Backup realizado: $BACKUP_DIR"
EOF

# Script de deploy
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Atualizando Tech10..."
cp backend/database/tech10.db backend/database/backup-$(date +%Y%m%d-%H%M%S).db
git pull origin main
cd backend && npm ci --production
pm2 restart tech10-backend
pm2 status
echo "✅ Atualização concluída!"
EOF

# Script de monitoramento
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "📊 Status do Sistema Tech10"
echo "=========================="
echo "🔥 PM2 Status:"
pm2 status
echo ""
echo "🌐 Nginx Status:"
systemctl status nginx --no-pager -l
echo ""
echo "💾 Uso de Disco:"
df -h / | tail -1
echo ""
echo "🧠 Uso de Memória:"
free -h
echo ""
echo "⚡ CPU Load:"
uptime
EOF

chmod +x backup.sh deploy.sh monitor.sh
chown tech10:tech10 backup.sh deploy.sh monitor.sh

# Configurar backup automático
echo "0 2 * * * $PROJECT_DIR/backup.sh" | crontab -

# Configurar monitoramento
echo "*/5 * * * * $PROJECT_DIR/monitor.sh >> /var/log/tech10-monitor.log 2>&1" | crontab -

# Otimizações finais
log "Aplicando otimizações finais..."

# Otimizar Nginx
sed -i 's/# server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf
sed -i 's/worker_connections 768;/worker_connections 1024;/' /etc/nginx/nginx.conf

# Otimizar sistema
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'fs.file-max=65536' >> /etc/sysctl.conf
sysctl -p

# Criar swap se necessário (apenas se < 2GB RAM)
if [ "${MEMORY%MB}" -lt 2048 ] && [ ! -f /swapfile ]; then
    log "Criando swap de 1GB..."
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
fi

# Verificações finais
log "Executando verificações finais..."
sleep 5

# Verificar PM2
if ! sudo -u tech10 pm2 status | grep -q "online"; then
    error "PM2 não está funcionando corretamente"
fi

# Verificar Nginx
if ! systemctl is-active --quiet nginx; then
    error "Nginx não está ativo"
fi

# Verificar SSL
if ! curl -I https://$DOMAIN &>/dev/null; then
    warning "SSL pode não estar funcionando corretamente"
fi

# Informações finais
echo ""
echo -e "${GREEN}🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO! 🎉${NC}"
echo ""
echo -e "${BLUE}📋 INFORMAÇÕES DO SISTEMA:${NC}"
echo -e "   🌐 Site: https://$DOMAIN"
echo -e "   🔧 API: https://api.$DOMAIN"
echo -e "   👤 Admin: https://api.$DOMAIN/admin"
echo -e "   📧 Email: $EMAIL"
echo -e "   🔐 Senha: $ADMIN_PASS"
echo ""
echo -e "${BLUE}🛠️ COMANDOS ÚTEIS:${NC}"
echo -e "   📊 Status: $PROJECT_DIR/monitor.sh"
echo -e "   🚀 Deploy: $PROJECT_DIR/deploy.sh"
echo -e "   💾 Backup: $PROJECT_DIR/backup.sh"
echo -e "   📱 Logs PM2: sudo -u tech10 pm2 logs"
echo -e "   🌐 Logs Nginx: tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}⚠️ IMPORTANTE:${NC}"
echo -e "   • Altere a senha do admin após o primeiro login"
echo -e "   • Configure DNS do domínio para este servidor"
echo -e "   • Monitore logs regularmente"
echo -e "   • Backup automático configurado para 02:00"
echo ""
echo -e "${GREEN}✅ Tech10 está rodando em produção!${NC}"