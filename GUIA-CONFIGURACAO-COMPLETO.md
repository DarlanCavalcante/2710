# 🔧 Guia de Configuração Completo - Tech10

## 📋 Índice
1. [Pré-Requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Configuração do Backend](#configuração-do-backend)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Configuração de Segurança](#configuração-de-segurança)
6. [Configuração do Frontend](#configuração-do-frontend)
7. [Configuração do Painel Admin](#configuração-do-painel-admin)
8. [Configuração de Deploy](#configuração-de-deploy)
9. [Solução de Problemas](#solução-de-problemas)

---

## 🛠️ Pré-Requisitos

### Software Necessário
```bash
# 1. Node.js (versão 16 ou superior)
# Baixe em: https://nodejs.org/

# 2. Git
# Baixe em: https://git-scm.com/

# 3. Editor de código (VS Code recomendado)
# Baixe em: https://code.visualstudio.com/
```

### Verificar Instalações
```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Git
git --version
```

---

## ⚙️ Configuração do Ambiente

### 1. Clonar o Projeto
```bash
# Clone do GitHub
git clone https://github.com/DarlanCavalcante/2710.git
cd 2710

# OU extrair do backup
unzip tech10-backup-YYYYMMDD-HHMMSS.zip
cd 2710-1
```

### 2. Estrutura do Projeto
```
2710-1/
├── backend/           # Servidor Node.js
├── admin/            # Painel administrativo
├── js/               # Scripts do frontend
├── css/              # Estilos
├── imagem/           # Assets de imagem
└── index.html        # Página principal
```

---

## 🔐 Configuração do Backend

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
```

**Conteúdo do .env:**
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_2024
JWT_EXPIRES_IN=24h

# Configurações do Banco
DB_PATH=./database/tech10.db

# Configurações de Segurança
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Gerar JWT Secret Seguro
```bash
# Gerar uma chave segura
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copiar o resultado para JWT_SECRET no .env
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Inicializar o Banco
```bash
cd backend
node init-db.js
```

### 2. Criar Usuário Administrador
```bash
node create-super-admin.js
```

**Credenciais padrão:**
- **Usuário:** admin
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere essas credenciais após o primeiro login!

### 3. Adicionar Produtos de Exemplo
```bash
node add-sample-products.js
```

---

## 🔒 Configuração de Segurança

### 1. Content Security Policy (CSP)
O arquivo `backend/server.js` já contém configurações de CSP. Para personalizar:

```javascript
// Em backend/server.js, encontre a seção CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'sha256-HASH_DO_SEU_SCRIPT'"
      ],
      // ... outras diretivas
    },
  },
}));
```

### 2. Configurar CORS
```javascript
// Em backend/server.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. Rate Limiting
```javascript
// Já configurado em backend/server.js
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100
});
```

---

## 🎨 Configuração do Frontend

### 1. Configuração da Empresa
Edite o arquivo `js/empresa-config.js`:

```javascript
window.empresaConfig = {
    nome: "Tech10",
    slogan: "Assistência Técnica Especializada",
    telefone: "(85) 99999-9999",
    email: "contato@tech10.com.br",
    endereco: "Rua das Tecnologias, 123",
    // ... outras configurações
};
```

### 2. Configuração de Estilos
Personalize o arquivo `css/styles.css`:

```css
:root {
  --cor-primaria: #007bff;
  --cor-secundaria: #6c757d;
  --cor-fundo: #f8f9fa;
  /* ... outras variáveis */
}
```

### 3. Configuração de Imagens
- Coloque o favicon em: `/favicon.ico`
- Imagens da empresa em: `/imagem/`
- Logos em: `/imagem/favico/`

---

## 👥 Configuração do Painel Admin

### 1. Acessar o Painel
```
URL: http://localhost:3000/admin/
Login: admin
Senha: admin123
```

### 2. Configurações Básicas
No painel admin, configure:

#### **Configurações Gerais:**
- Nome da empresa
- Slogan
- Telefone de contato
- Email
- Endereço

#### **Configurações de Aparência:**
- Cor primária
- Cor secundária
- Logo da empresa
- Favicon

#### **Configurações de SEO:**
- Título da página
- Descrição meta
- Palavras-chave

### 3. Gerenciar Produtos
- **Adicionar:** Clique em "Adicionar Produto"
- **Editar:** Clique no ícone de edição
- **Excluir:** Clique no ícone de lixeira
- **Categorias:** Gerencie na aba "Categorias"

### 4. Estrutura de Produtos
```json
{
  "nome": "Nome do Produto/Serviço",
  "descricao": "Descrição detalhada",
  "preco": "99.99",
  "categoria": "assistencia",
  "imagem": "/imagem/produto.jpg",
  "destaque": true
}
```

---

## 🚀 Configuração de Deploy

### 1. Desenvolvimento Local
```bash
# Terminal 1: Iniciar backend
cd backend
npm start

# Terminal 2: Servir frontend (opcional)
cd ..
python -m http.server 8080
# OU
npx serve .
```

### 2. Deploy em Produção

#### **Preparar para Produção:**
```bash
# 1. Configurar variáveis de ambiente para produção
NODE_ENV=production
PORT=80
CORS_ORIGIN=https://seudominio.com

# 2. Instalar dependências de produção
cd backend
npm ci --production

# 3. Configurar banco para produção
node init-db.js
```

#### **Deploy com PM2:**
```bash
# Instalar PM2
npm install -g pm2

# Criar arquivo ecosystem.config.js
cd backend
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'tech10-backend',
    script: 'server.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Iniciar com PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Deploy com Nginx
**Configuração nginx:**
```nginx
server {
    listen 80;
    server_name seudominio.com;
    
    # Frontend
    location / {
        root /caminho/para/2710-1;
        index index.html;
        try_files $uri $uri/ =404;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin
    location /admin/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🛠️ Solução de Problemas

### Problemas Comuns

#### **1. Servidor não inicia**
```bash
# Verificar se a porta está em uso
lsof -i :3000

# Matar processo se necessário
kill -9 PID

# Verificar logs
cd backend
npm start
```

#### **2. Erro de CORS**
- Verificar `CORS_ORIGIN` no .env
- Confirmar se o frontend está na mesma origem
- Verificar configuração no `backend/server.js`

#### **3. Erro de CSP (Content Security Policy)**
```javascript
// Adicionar hash do script em backend/server.js
scriptSrc: [
  "'self'",
  "'sha256-NOVO_HASH_AQUI'"
]
```

**Gerar hash do script:**
```bash
echo -n "SEU_SCRIPT_AQUI" | openssl dgst -sha256 -binary | openssl base64
```

#### **4. Banco de dados corrompido**
```bash
cd backend
rm database/tech10.db
node init-db.js
node create-super-admin.js
```

#### **5. Problemas de autenticação**
- Verificar JWT_SECRET no .env
- Limpar cookies do navegador
- Verificar se o token não expirou

### Logs e Debugging

#### **1. Verificar logs do servidor**
```bash
cd backend
npm start
# Observar mensagens de erro no console
```

#### **2. Logs do PM2**
```bash
pm2 logs tech10-backend
pm2 monit
```

#### **3. Debug do frontend**
- Abrir DevTools (F12)
- Verificar aba Console
- Verificar aba Network para erros de API

---

## 📱 Configurações Avançadas

### 1. SSL/HTTPS
```bash
# Gerar certificados SSL
sudo certbot --nginx -d seudominio.com

# Configurar redirecionamento HTTPS no nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. Backup Automático
Crie um script de backup:

```bash
#!/bin/bash
# backup-automatico.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backup/tech10"
PROJECT_DIR="/caminho/para/2710-1"

# Criar backup
mkdir -p $BACKUP_DIR
zip -r "$BACKUP_DIR/tech10-backup-$DATE.zip" $PROJECT_DIR

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "tech10-backup-*.zip" -mtime +7 -delete

echo "Backup criado: tech10-backup-$DATE.zip"
```

**Automatizar com cron:**
```bash
crontab -e
# Adicionar linha para backup diário às 2h
0 2 * * * /caminho/para/backup-automatico.sh
```

### 3. Monitoramento
```bash
# Instalar ferramentas de monitoramento
npm install -g pm2-logrotate
pm2 install pm2-server-monit
```

---

## 📞 Suporte

### Contatos para Suporte
- **GitHub:** https://github.com/DarlanCavalcante/2710
- **Issues:** https://github.com/DarlanCavalcante/2710/issues

### Recursos Úteis
- **Node.js Docs:** https://nodejs.org/docs/
- **Express.js Docs:** https://expressjs.com/
- **SQLite Docs:** https://sqlite.org/docs.html
- **PM2 Docs:** https://pm2.keymetrics.io/docs/

---

## 📝 Notas Importantes

1. **Sempre faça backup** antes de alterações importantes
2. **Mantenha as dependências atualizadas** regularmente
3. **Use HTTPS em produção** sempre
4. **Monitore os logs** regularmente
5. **Teste todas as alterações** em ambiente de desenvolvimento primeiro

---

**Última atualização:** 28 de outubro de 2025
**Versão do guia:** 1.0