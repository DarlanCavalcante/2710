# 📦 Tech10 Backup System

Este diretório contém os backups do projeto Tech10.

## 🎯 Sobre os Backups

Os backups são criados automaticamente e incluem:

- ✅ **Frontend completo**: HTML, CSS, JavaScript
- ✅ **Sistema administrativo**: Interface de gerenciamento
- ✅ **Backend Node.js**: Servidor Express com APIs
- ✅ **Banco de dados**: Schema SQLite
- ✅ **Configurações**: Arquivos de configuração
- ✅ **Documentação**: README e guias

## 🚀 Como Criar um Backup

### Método 1: Script Bash (Recomendado)
```bash
./create-backup.sh
```

### Método 2: Script Node.js (Se Node estiver instalado)
```bash
node create-backup.js
```

## 📂 Estrutura dos Arquivos

- `tech10-backup-YYYY-MM-DD_HH-MM-SS.zip` - Arquivo de backup
- `backup-info-YYYY-MM-DD_HH-MM-SS.json` - Informações do backup

## 🔄 Como Restaurar um Backup

1. **Extrair o arquivo ZIP**:
   ```bash
   unzip tech10-backup-YYYY-MM-DD_HH-MM-SS.zip -d tech10-restored/
   ```

2. **Entrar no diretório do backend**:
   ```bash
   cd tech10-restored/backend
   ```

3. **Instalar dependências**:
   ```bash
   npm install
   ```

4. **Iniciar o servidor**:
   ```bash
   npm start
   ```

5. **Acessar o sistema**:
   - Site: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin`

## ⚠️ Arquivos Excluídos dos Backups

Para otimizar o tamanho, os seguintes arquivos são excluídos:

- `node_modules/` - Dependências (reinstalar com npm install)
- `backend/uploads/` - Uploads de usuários
- `imagem/` - Apenas favicons são incluídos
- `.env` - Variáveis de ambiente (criar novamente)
- `.git/` - Histórico do Git
- `*.log` - Arquivos de log

## 🛡️ Segurança

- Os backups não incluem senhas ou tokens
- Dados sensíveis devem ser configurados após restauração
- Mantenha os backups em local seguro

## 📊 Informações Técnicas

**Requisitos para restauração:**
- Node.js >= 16.0.0
- NPM >= 8.0.0
- Sistema operacional: Windows, macOS ou Linux

**Tamanho médio do backup:** ~30KB (sem uploads)

## 🕒 Retenção de Backups

É recomendado manter apenas os últimos 10 backups para economizar espaço:

```bash
# Remover backups antigos (manter apenas os 10 mais recentes)
ls -t tech10-backup-*.zip | tail -n +11 | xargs rm -f
```