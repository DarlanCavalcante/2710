# 🚀 Guia de Deploy - Tech10 Backend em Servidor

## 📋 Pré-requisitos do Servidor

### 1. Sistema Operacional
- **Ubuntu 20.04+ / CentOS 8+ / Debian 10+**
- **Windows Server 2019+** (opcional)

### 2. Software Necessário
```bash
# Node.js 16+ (recomendado: 18.x LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (Process Manager)
sudo npm install -g pm2

# Nginx (Proxy Reverso)
sudo apt update
sudo apt install nginx

# Certbot (SSL - Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Git
sudo apt install git
```

### 3. Configurações do Sistema
```bash
# Aumentar limites de arquivos
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Configurar swap (se necessário)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

## 🔧 Preparação do Projeto

### 1. Clone do Repositório
```bash
# No servidor
cd /var/www
sudo mkdir tech10
sudo chown $USER:$USER tech10
cd tech10

# Clone do projeto
git clone https://github.com/DarlanCavalcante/2710.git .
```

### 2. Configuração do Backend
```bash
cd backend

# Instalar dependências
npm ci --production

# Criar diretórios necessários
mkdir -p database uploads logs

# Configurar permissões
chmod 755 database uploads logs
```

### 3. Configuração do Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações (use nano ou vim)
nano .env
```

### 4. Variáveis de Ambiente para Produção
```env
# Ambiente
NODE_ENV=production
PORT=3001

# Segurança - GERE NOVOS SECRETS!
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=SEU_SESSION_SECRET_AQUI_64_CHARS
JWT_SECRET=SEU_JWT_SECRET_AQUI_64_CHARS

# Banco de dados
DB_PATH=./database/tech10.db

# Upload de arquivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate limiting (produção)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=1000

# Admin padrão
ADMIN_EMAIL=seu@email.com
ADMIN_PASSWORD=SuaSenhaSegura123!

# URLs do servidor
SITE_URL=https://seudominio.com
ADMIN_URL=https://admin.seudominio.com
```

## 🗄️ Configuração do Banco de Dados

```bash
# Inicializar banco de dados
npm run init-db

# Verificar se foi criado
ls -la database/
```

## ⚙️ Configuração do PM2

### 1. Arquivo de Configuração PM2
```bash
# Criar ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tech10-backend',
    script: 'server.js',
    cwd: '/var/www/tech10/backend',
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
```

### 2. Iniciar com PM2
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js --env production

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer na tela

# Verificar status
pm2 status
pm2 logs tech10-backend
```

## 🔒 Configuração do Nginx

### 1. Configuração do Site
```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/tech10
```

```nginx
# Configuração Nginx - Tech10
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    # Redirect para HTTPS
    return 301 https://$server_name$request_uri;
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.seudominio.com;
    
    # SSL Configuration (será configurado pelo Certbot)
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    # Proxy para Backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static files (uploads)
    location /uploads/ {
        alias /var/www/tech10/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # Admin Panel
    location /admin/ {
        proxy_pass http://localhost:3001/admin/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    root /var/www/tech10;
    index index.html;
    
    # SSL Configuration (será configurado pelo Certbot)
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main site
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Ativar Site
```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/tech10 /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

## 🔐 Configuração do SSL (Let's Encrypt)

```bash
# Obter certificados SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com -d api.seudominio.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔥 Configuração do Firewall

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Verificar status
sudo ufw status
```

## 📊 Monitoramento e Logs

### 1. Logs do Sistema
```bash
# Ver logs PM2
pm2 logs tech10-backend

# Ver logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver logs do sistema
journalctl -u nginx -f
```

### 2. Monitoramento PM2
```bash
# Dashboard PM2
pm2 monit

# Status detalhado
pm2 show tech10-backend

# Restart se necessário
pm2 restart tech10-backend
```

## 🚀 Scripts de Deploy Automatizado

### 1. Script de Update
```bash
# Criar deploy.sh
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando deploy do Tech10..."

# Backup do banco
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
```

### 2. Script de Backup
```bash
# Criar backup.sh
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/tech10"
DATE=$(date +%Y%m%d-%H%M%S)

# Criar diretório de backup
sudo mkdir -p $BACKUP_DIR

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
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/tech10/backup.sh") | crontab -
```

## 🔍 Verificação Final

### 1. Checklist de Deploy
- [ ] Node.js 16+ instalado
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado com SSL
- [ ] Firewall configurado
- [ ] Banco de dados inicializado
- [ ] Variáveis de ambiente configuradas
- [ ] Backup automático agendado
- [ ] Logs funcionando
- [ ] Site acessível via HTTPS

### 2. Testes
```bash
# Testar API
curl -I https://api.seudominio.com/api/health

# Testar site
curl -I https://seudominio.com

# Verificar certificado SSL
openssl s_client -connect seudominio.com:443 -servername seudominio.com
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de permissão na pasta uploads**
   ```bash
   sudo chown -R $USER:www-data backend/uploads
   sudo chmod -R 755 backend/uploads
   ```

2. **PM2 não inicia no boot**
   ```bash
   pm2 unstartup
   pm2 startup
   pm2 save
   ```

3. **Nginx erro 502**
   ```bash
   # Verificar se backend está rodando
   pm2 status
   # Verificar logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Problemas de SSL**
   ```bash
   sudo certbot renew --dry-run
   sudo nginx -t
   ```

## 📞 Suporte

Para suporte adicional:
- Verificar logs: `pm2 logs tech10-backend`
- Status dos serviços: `sudo systemctl status nginx`
- Monitoramento: Acesse `https://seudominio.com/admin/monitor.html`

---

**🎉 Seu backend Tech10 está pronto para produção!**