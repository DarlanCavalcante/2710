const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    const dbDir = path.join(__dirname);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = path.join(dbDir, 'tech10.db');
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Erro ao conectar com banco:', err);
          reject(err);
        } else {
          console.log('✅ Conectado ao banco SQLite');
          resolve();
        }
      });
    });
  }

  async init() {
    try {
      await this.connect();
      await this.createTables();
      await this.insertDefaultData();
      console.log('🗃️ Database inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar database:', error);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Usuários
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
      )`,

      // Categorias
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT DEFAULT '#1a73e8',
        parent_id INTEGER,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories (id)
      )`,

      // Produtos
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        short_description TEXT,
        price DECIMAL(10,2),
        sale_price DECIMAL(10,2),
        sku TEXT UNIQUE,
        stock INTEGER DEFAULT 0,
        category_id INTEGER,
        images TEXT, -- JSON array of image paths
        features TEXT, -- JSON array of features
        specifications TEXT, -- JSON object
        is_featured BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        meta_title TEXT,
        meta_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,

      // Configurações do site
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'text', -- text, number, boolean, json
        group_name TEXT DEFAULT 'general',
        label TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Logs de atividade
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        table_name TEXT,
        record_id INTEGER,
        old_values TEXT, -- JSON
        new_values TEXT, -- JSON
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Sessões
      `CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expire DATETIME NOT NULL
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Criar índices
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
      `CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)`,
      `CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active)`,
      `CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire)`
    ];

    for (const index of indexes) {
      await this.run(index);
    }
  }

  async insertDefaultData() {
    // Verificar se já existe usuário admin
    const adminExists = await this.get('SELECT id FROM users WHERE email = ?', [process.env.ADMIN_EMAIL || 'admin@tech10info.com']);
    
    if (!adminExists) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Tech10@2025', 10);
      
      await this.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [process.env.ADMIN_EMAIL || 'admin@tech10info.com', hashedPassword, 'Administrador Tech10', 'admin']
      );
      console.log('👤 Usuário admin criado');
    }

    // Categorias padrão
    const categories = [
      { name: 'Computadores', slug: 'computadores', description: 'Desktops e All-in-One', icon: 'fas fa-desktop', color: '#1a73e8' },
      { name: 'Notebooks', slug: 'notebooks', description: 'Notebooks e Ultrabooks', icon: 'fas fa-laptop', color: '#34a853' },
      { name: 'Smartphones', slug: 'smartphones', description: 'Celulares e Smartphones', icon: 'fas fa-mobile-alt', color: '#ea4335' },
      { name: 'Tablets', slug: 'tablets', description: 'Tablets e iPads', icon: 'fas fa-tablet-alt', color: '#fbbc04' },
      { name: 'Periféricos', slug: 'perifericos', description: 'Mouse, Teclado, Webcam', icon: 'fas fa-keyboard', color: '#9c27b0' },
      { name: 'Componentes', slug: 'componentes', description: 'Hardware e Componentes', icon: 'fas fa-microchip', color: '#ff5722' },
      { name: 'Serviços', slug: 'servicos', description: 'Manutenção e Suporte', icon: 'fas fa-tools', color: '#607d8b' }
    ];

    for (const category of categories) {
      const exists = await this.get('SELECT id FROM categories WHERE slug = ?', [category.slug]);
      if (!exists) {
        await this.run(
          'INSERT INTO categories (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)',
          [category.name, category.slug, category.description, category.icon, category.color]
        );
      }
    }

    // Configurações padrão do site
    const settings = [
      { key: 'site_name', value: 'Tech10 Informática e Tecnologia', type: 'text', group_name: 'general', label: 'Nome do Site' },
      { key: 'site_description', value: 'Mais de 20 anos de experiência em tecnologia', type: 'text', group_name: 'general', label: 'Descrição' },
      { key: 'contact_email', value: 'contato@tech10info.com', type: 'email', group_name: 'contact', label: 'Email de Contato' },
      { key: 'contact_phone', value: '(55) 99999-9999', type: 'text', group_name: 'contact', label: 'Telefone' },
      { key: 'contact_whatsapp', value: '5555999999999', type: 'text', group_name: 'contact', label: 'WhatsApp' },
      { key: 'social_instagram', value: 'https://www.instagram.com/tech10info/', type: 'url', group_name: 'social', label: 'Instagram' },
      { key: 'social_facebook', value: '', type: 'url', group_name: 'social', label: 'Facebook' },
      { key: 'social_twitter', value: '', type: 'url', group_name: 'social', label: 'Twitter' },
      { key: 'address', value: 'Rua Dr. Bozano, 968 - Loja 8, Santa Maria/RS', type: 'text', group_name: 'contact', label: 'Endereço' },
      { key: 'products_per_page', value: '12', type: 'number', group_name: 'display', label: 'Produtos por Página' }
    ];

    for (const setting of settings) {
      const exists = await this.get('SELECT id FROM settings WHERE key = ?', [setting.key]);
      if (!exists) {
        await this.run(
          'INSERT INTO settings (key, value, type, group_name, label) VALUES (?, ?, ?, ?, ?)',
          [setting.key, setting.value, setting.type, setting.group_name, setting.label]
        );
      }
    }

    console.log('📝 Dados padrão inseridos');
  }

  // Métodos auxiliares
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();