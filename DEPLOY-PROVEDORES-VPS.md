# 🌍 Deploy Tech10 - Guia por Provedor VPS

## 🚀 Instalação Rápida (Qualquer VPS)

```bash
# 1. Conectar ao servidor
ssh root@SEU_IP_DO_SERVIDOR

# 2. Baixar e executar script automatizado
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash

# 3. Seguir as instruções interativas
```

---

## 🔥 DigitalOcean

### 1. Criar Droplet
- **Imagem**: Ubuntu 22.04 LTS
- **Plano**: Basic ($6/mês - 1GB RAM, 1 vCPU)
- **Região**: Mais próxima de você
- **Autenticação**: SSH Key (recomendado)

### 2. Configuração DNS
```bash
# No painel da DigitalOcean, adicionar registros DNS:
# A Record: @ → SEU_IP
# A Record: www → SEU_IP  
# A Record: api → SEU_IP
```

### 3. Deploy
```bash
# Conectar
ssh root@SEU_DROPLET_IP

# Executar script
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash
```

### 4. Backup Automático
- Ativar backup automático no painel DigitalOcean
- Configurar Spaces para backup de arquivos (opcional)

---

## ⚡ Vultr

### 1. Deploy Instance
- **OS**: Ubuntu 22.04 LTS  
- **Plan**: Regular Performance ($6/mês)
- **Location**: Mais próxima
- **Server Hostname**: tech10-server

### 2. Firewall
```bash
# Vultr tem firewall integrado
# Liberar portas: 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

### 3. Deploy
```bash
ssh root@SEU_VULTR_IP
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash
```

---

## 🌊 Linode

### 1. Criar Linode
- **Distribution**: Ubuntu 22.04 LTS
- **Plan**: Nanode 1GB ($5/mês)
- **Region**: Mais próxima
- **Root Password**: Criar senha forte

### 2. Configuração
```bash
# Conectar
ssh root@SEU_LINODE_IP

# Atualizar e instalar
apt update && apt upgrade -y

# Executar script
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash
```

### 3. Firewall Cloud (recomendado)
- Ativar Cloud Firewall no painel Linode
- Regras: SSH (22), HTTP (80), HTTPS (443)

---

## ☁️ AWS EC2

### 1. Lançar Instância
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t3.micro (Free Tier)
- **Security Group**: HTTP, HTTPS, SSH
- **Key Pair**: Criar ou usar existente

### 2. Configuração
```bash
# Conectar (substitua pela sua key)
ssh -i "sua-key.pem" ubuntu@SEU_EC2_IP

# Executar como root
sudo su -

# Deploy
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash
```

### 3. Elastic IP (recomendado)
- Alocar e associar Elastic IP
- Atualizar DNS para o IP fixo

---

## 🏔️ Google Cloud Platform

### 1. Compute Engine
- **Machine Type**: e2-micro (Free Tier)
- **Boot Disk**: Ubuntu 22.04 LTS
- **Firewall**: Allow HTTP/HTTPS traffic

### 2. Deploy
```bash
# Conectar via SSH no console ou:
gcloud compute ssh NOME_DA_INSTANCIA

# Executar script
sudo curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash
```

### 3. Firewall Rules
```bash
# Liberar portas no console GCP ou:
gcloud compute firewall-rules create allow-http --allow tcp:80
gcloud compute firewall-rules create allow-https --allow tcp:443
```

---

## 🔵 Azure

### 1. Criar VM
- **Image**: Ubuntu Server 22.04 LTS
- **Size**: B1s (1 vCPU, 1GB RAM)
- **Authentication**: SSH public key
- **Inbound Ports**: HTTP, HTTPS, SSH

### 2. Deploy
```bash
# Conectar
ssh azureuser@SEU_AZURE_IP

# Executar com privilégios
sudo su -
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash
```

---

## 🐳 Deploy com Docker

### 1. Servidor com Docker
```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy do Projeto
```bash
# Clonar repositório
git clone https://github.com/DarlanCavalcante/2710.git
cd 2710

# Configurar ambiente
cp backend/.env.example backend/.env
# Editar backend/.env com suas configurações

# Subir containers
docker-compose up -d

# Verificar status
docker-compose ps
docker-compose logs -f
```

### 3. SSL com Let's Encrypt
```bash
# Instalar certbot
sudo apt install certbot

# Obter certificados
sudo certbot certonly --standalone -d seudominio.com -d www.seudominio.com

# Copiar certificados para pasta ssl/
sudo mkdir ssl
sudo cp /etc/letsencrypt/live/seudominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/seudominio.com/privkey.pem ssl/key.pem

# Reiniciar nginx
docker-compose restart nginx
```

---

## 🛡️ Hardening de Segurança

### 1. SSH Security
```bash
# Desabilitar login root
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Mudar porta SSH (opcional)
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Reiniciar SSH
systemctl restart sshd
```

### 2. Fail2Ban
```bash
# Instalar
apt install fail2ban

# Configurar
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 2
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

### 3. Firewall Avançado
```bash
# UFW rules
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw logging on
ufw --force enable
```

---

## 📊 Monitoramento

### 1. Logs Centralizados
```bash
# Instalar Logrotate
cat > /etc/logrotate.d/tech10 << EOF
/var/www/tech10/backend/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 tech10 tech10
    postrotate
        /bin/kill -USR1 \$(cat /var/run/nginx.pid) 2>/dev/null || true
    endscript
}
EOF
```

### 2. Monitoramento Uptime
```bash
# Script de health check
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
URL="https://seudominio.com/api/health"
if ! curl -f -s $URL > /dev/null; then
    echo "ALERT: $URL is down!" | mail -s "Tech10 Down" admin@seudominio.com
    systemctl restart nginx
    sudo -u tech10 pm2 restart tech10-backend
fi
EOF

chmod +x /usr/local/bin/health-check.sh

# Agendar verificação a cada 5 minutos
echo "*/5 * * * * /usr/local/bin/health-check.sh" | crontab -
```

---

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro 502 Bad Gateway**
   ```bash
   # Verificar se backend está rodando
   sudo -u tech10 pm2 status
   sudo -u tech10 pm2 restart tech10-backend
   ```

2. **SSL não funciona**
   ```bash
   # Renovar certificados
   certbot renew
   systemctl reload nginx
   ```

3. **Banco de dados corrompido**
   ```bash
   # Restaurar backup
   cp /var/backups/tech10/tech10-db-YYYYMMDD-HHMMSS.db backend/database/tech10.db
   sudo -u tech10 pm2 restart tech10-backend
   ```

4. **Espaço em disco cheio**
   ```bash
   # Limpar logs antigos
   find /var/log -name "*.log" -mtime +7 -delete
   
   # Limpar backups antigos
   find /var/backups/tech10 -mtime +30 -delete
   ```

---

## 📞 Suporte e Manutenção

### Comandos Úteis

```bash
# Status geral
./monitor.sh

# Logs em tempo real
sudo -u tech10 pm2 logs --lines 50

# Backup manual
./backup.sh

# Deploy/atualização
./deploy.sh

# Reiniciar tudo
sudo -u tech10 pm2 restart all
systemctl restart nginx
```

### Contatos de Emergência
- **Monitoramento**: https://seudominio.com/admin/monitor.html
- **Logs**: `/var/www/tech10/backend/logs/`
- **Backups**: `/var/backups/tech10/`

---

**🎯 Seu Tech10 está pronto para produção profissional!**