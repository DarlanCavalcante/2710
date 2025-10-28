# Tech10 Backend - Docker Configuration
FROM node:18-alpine

# Informações da imagem
LABEL maintainer="Tech10 Informática"
LABEL description="Sistema de gerenciamento completo para Tech10"
LABEL version="1.0.0"

# Criar usuário não-root
RUN addgroup -g 1001 -S tech10 && \
    adduser -S tech10 -u 1001

# Instalar dependências do sistema
RUN apk add --no-cache \
    sqlite \
    curl \
    bash \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configurar timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fonte
COPY backend/ ./

# Criar diretórios necessários
RUN mkdir -p database uploads logs && \
    chown -R tech10:tech10 /app

# Configurar usuário
USER tech10

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Comando padrão
CMD ["npm", "start"]