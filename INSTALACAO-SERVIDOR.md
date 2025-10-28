# 🎯 TECH10 - RESUMO DE INSTALAÇÃO EM SERVIDOR

## 🚀 3 Formas de Instalar seu Backend

### 1. 🔥 **INSTALAÇÃO AUTOMÁTICA (Recomendada)**
```bash
# Conecte ao seu servidor
ssh root@SEU_IP

# Execute o script automático
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash

# Digite seu domínio e email quando solicitado
# Exemplo: meusite.com e admin@meusite.com
```

**✅ O que faz automaticamente:**
- Instala Node.js, PM2, Nginx, Certbot
- Configura SSL automático
- Cria usuário de sistema
- Configura firewall
- Backup automático
- Monitoring em tempo real
- Scripts de deploy e manutenção

---

### 2. 🛠️ **INSTALAÇÃO PERSONALIZADA**
```bash
# Baixe o script
wget https://raw.githubusercontent.com/DarlanCavalcante/2710/main/install-server.sh

# Execute com seus parâmetros
chmod +x install-server.sh
./install-server.sh meudominio.com admin@meudominio.com
```

---

### 3. 🐳 **INSTALAÇÃO COM DOCKER**
```bash
# Clone o repositório
git clone https://github.com/DarlanCavalcante/2710.git
cd 2710

# Configure o ambiente
cp backend/.env.example backend/.env
nano backend/.env  # Configure suas variáveis

# Suba os containers
docker-compose up -d

# Verifique o status
docker-compose ps
```

---

## 🌍 **PROVEDORES TESTADOS**

| Provedor | Plano Mínimo | Preço/mês | Status |
|----------|-------------|-----------|---------|
| **DigitalOcean** | Basic Droplet 1GB | $6 | ✅ Testado |
| **Vultr** | Regular 1GB | $6 | ✅ Testado |
| **Linode** | Nanode 1GB | $5 | ✅ Testado |
| **AWS EC2** | t3.micro | $8-10 | ✅ Testado |
| **Google Cloud** | e2-micro | $6-8 | ✅ Testado |
| **Azure** | B1s | $7-9 | ✅ Testado |

---

## 📋 **REQUISITOS MÍNIMOS**

### Servidor
- **OS**: Ubuntu 20.04+, Debian 10+, CentOS 8+
- **RAM**: 1GB (recomendado: 2GB+)
- **CPU**: 1 vCPU (recomendado: 2+ vCPUs)
- **Disco**: 20GB (recomendado: 40GB+)
- **Rede**: IP público fixo

### Domínio
- Domínio próprio (ex: meusite.com)
- Acesso ao DNS para criar registros A
- Email válido para certificado SSL

---

## ⏱️ **TEMPO DE INSTALAÇÃO**

| Método | Tempo Estimado | Complexidade |
|--------|----------------|--------------|
| Script Automático | 5-10 minutos | ⭐ Fácil |
| Instalação Manual | 20-30 minutos | ⭐⭐ Médio |
| Docker | 10-15 minutos | ⭐⭐⭐ Avançado |

---

## 🎯 **APÓS A INSTALAÇÃO**

### URLs do seu site:
- **Site principal**: `https://seudominio.com`
- **API**: `https://api.seudominio.com`
- **Admin**: `https://api.seudominio.com/admin`
- **Monitor**: `https://seudominio.com/admin/monitor.html`

### Comandos úteis:
```bash
# Ver status dos serviços
./monitor.sh

# Deploy/atualizar código
./deploy.sh

# Backup manual
./backup.sh

# Ver logs
pm2 logs tech10-backend

# Reiniciar aplicação
pm2 restart tech10-backend
```

---

## 🆘 **SUPORTE RÁPIDO**

### Problemas comuns:

**1. Site não carrega (Error 502)**
```bash
pm2 restart tech10-backend
systemctl restart nginx
```

**2. SSL não funciona**
```bash
certbot renew
systemctl reload nginx
```

**3. Falta de espaço em disco**
```bash
./backup.sh  # Limpa arquivos antigos automaticamente
```

**4. Servidor lento**
```bash
htop  # Ver uso de CPU/RAM
pm2 monit  # Monitorar aplicação
```

---

## 📞 **CONTATO PARA AJUDA**

Se precisar de ajuda durante a instalação:

1. **Verificar logs**: `pm2 logs tech10-backend`
2. **Status do sistema**: `./monitor.sh`
3. **Documentação**: Ver `GUIA-DEPLOY-SERVIDOR.md`
4. **GitHub Issues**: Abrir issue no repositório

---

## 🎉 **VAMOS COMEÇAR?**

**Escolha sua opção e execute:**

```bash
# OPÇÃO 1: Automático (Mais Fácil)
curl -fsSL https://raw.githubusercontent.com/DarlanCavalcante/2710/main/setup-vps.sh | bash

# OPÇÃO 2: Personalizado
./install-server.sh seudominio.com seu@email.com

# OPÇÃO 3: Docker
docker-compose up -d
```

**🚀 Seu Tech10 estará online em minutos!**