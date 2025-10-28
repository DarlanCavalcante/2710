const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = ['SESSION_SECRET', 'JWT_SECRET', 'NODE_ENV'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Variáveis de ambiente obrigatórias não configuradas: ${missingVars.join(', ')}`);
  console.error('Por favor, configure o arquivo .env corretamente.');
  process.exit(1);
}

const { router: authRoutes } = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const cacheManager = require('./utils/cache');
const systemMonitor = require('./utils/system-monitor');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    retryAfter: process.env.RATE_LIMIT_WINDOW || 15
  }
});

// Rate limiting mais permissivo para monitoramento
const monitorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requisições por 15 minutos
  message: {
    error: 'Limite de requisições do monitoramento excedido.',
    retryAfter: 15
  }
});

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": [
        "'self'", 
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'sha256-vqHlv6a466BBC1MfOA5ff7vLBqUMggY0ioIiEMlXNPM='",
        "'sha256-ieoeWczDHkReVBsRBqaal5AFMlBtNjMzgwKvLqi/tSU='",
        "'sha256-Bj/Lij6hasCNihf0rxi3yWizgojdGoK4sc7XSyGjIGw='",
        "'sha256-9I/rkfhyRLhW+LcAI5a9q9sGA54on1PsOUABPXjjsw0='"
      ],
      "script-src-attr": [
        "'unsafe-hashes'",
        "'sha256-Jw5NghBkRZFrm6K45vNtyPk754rmysyQHbrzcGEEwQw='",
        "'sha256-bN4uy6irkMZtDkB2a4oHROBMg+Q+iZI/NJuqwZ6Qbi8='"
      ],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      "img-src": ["'self'", "data:", "blob:"],
      "font-src": ["'self'", "https://cdnjs.cloudflare.com"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3001',
  process.env.SITE_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sistema de monitoramento
app.use(systemMonitor.middleware());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir o site principal (frontend) - ANTES do admin
app.use(express.static(path.join(__dirname, '..'), {
  index: 'index.html',
  // Ignorar rotas que começam com /admin ou /api
  setHeaders: (res, path) => {
    if (path.includes('/admin/') || path.includes('/api/')) {
      return;
    }
  }
}));

// Servir o painel admin
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Routes da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Rotas para monitoramento (com rate limiting específico)
app.get('/api/monitor/stats', monitorLimiter, (req, res) => {
  res.json(systemMonitor.getStats());
});

app.get('/api/monitor/cache', monitorLimiter, (req, res) => {
  res.json(cacheManager.getStats());
});

// Rotas para alertas
const alertManager = require('./utils/alert-manager');

app.get('/api/monitor/alerts', monitorLimiter, (req, res) => {
  const alerts = alertManager.getAlerts(req.query);
  res.json(alerts);
});

app.get('/api/monitor/alerts/stats', monitorLimiter, (req, res) => {
  res.json(alertManager.getStats());
});

app.post('/api/monitor/alerts/:id/acknowledge', monitorLimiter, (req, res) => {
  const { id } = req.params;
  const success = alertManager.acknowledgeAlert(id, req.session?.userId);
  
  if (success) {
    res.json({ message: 'Alerta reconhecido com sucesso' });
  } else {
    res.status(404).json({ error: 'Alerta não encontrado' });
  }
});

// Rota para servir o painel admin
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Rota principal da API
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 Tech10 Backend API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      dashboard: '/api/dashboard',
      settings: '/api/settings'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Arquivo muito grande. Máximo 5MB permitido.'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Inicializar banco de dados e servidor
const db = require('./database');

async function startServer() {
  try {
    // Inicializar banco de dados
    await db.connect();
    console.log('✅ Banco de dados conectado');
    
    // Inicializar sistema de monitoramento
    systemMonitor.start();
    console.log('✅ Sistema de monitoramento iniciado');
    
    // Configurar alertas de sistema
    systemMonitor.onAlert((alert) => {
      console.log(`🚨 ALERTA [${alert.severity.toUpperCase()}]: ${alert.message}`);
      // Aqui você pode adicionar notificações por email, Slack, etc.
    });

    // Inicializar servidor
    app.listen(PORT, () => {
      console.log(`
🚀 TECH10 BACKEND INICIADO
========================
📍 Servidor: http://localhost:${PORT}
🔧 Admin: http://localhost:${PORT}/admin
📊 API: http://localhost:${PORT}/api
📈 Monitor: http://localhost:${PORT}/api/monitor/stats
🗄️  Cache: http://localhost:${PORT}/api/monitor/cache
🌟 Ambiente: ${process.env.NODE_ENV}
⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;