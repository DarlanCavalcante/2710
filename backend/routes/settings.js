const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('./auth');
const db = require('../database');
const cacheManager = require('../utils/cache');
const router = express.Router();

// Listar todas as configurações
router.get('/', 
  requireAuth,
  cacheManager.middleware({
    ttl: 1800, // 30 minutos
    cacheType: 'settings',
    keyGenerator: (req) => {
      const { group } = req.query;
      return `settings:list:${group || 'all'}`;
    }
  }),
  async (req, res) => {
  try {
    const { group } = req.query;

    let whereClause = '';
    let params = [];

    if (group) {
      whereClause = 'WHERE group_name = ?';
      params.push(group);
    }

    const settings = await db.all(`
      SELECT * FROM settings 
      \${whereClause}
      ORDER BY group_name, key
    `, params);

    // Agrupar por group_name
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.group_name]) {
        acc[setting.group_name] = [];
      }
      acc[setting.group_name].push(setting);
      return acc;
    }, {});

    res.json(groupedSettings);

  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar configurações públicas (SEM AUTENTICAÇÃO)
router.get('/public', async (req, res) => {
  try {
    const publicKeys = [
      'site_name', 'site_description', 'contact_email', 'contact_phone',
      'contact_whatsapp', 'social_instagram', 'social_facebook', 'social_twitter',
      'address', 'products_per_page'
    ];
    
    const placeholders = publicKeys.map(() => '?').join(',');
    
    const settings = await db.all(`
      SELECT key, value FROM settings 
      WHERE key IN (${placeholders})
    `, publicKeys);

    res.json(settings);

  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar configuração específica
router.get('/:key', requireAuth, async (req, res) => {
  try {
    const setting = await db.get('SELECT * FROM settings WHERE key = ?', [req.params.key]);

    if (!setting) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Processar valor baseado no tipo
    let processedValue = setting.value;
    switch (setting.type) {
      case 'number':
        processedValue = parseFloat(setting.value) || 0;
        break;
      case 'boolean':
        processedValue = setting.value === 'true' || setting.value === '1';
        break;
      case 'json':
        try {
          processedValue = JSON.parse(setting.value);
        } catch {
          processedValue = {};
        }
        break;
    }

    res.json({
      ...setting,
      value: processedValue
    });

  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configuração
router.put('/:key', [
  requireAuth,
  body('value').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { key } = req.params;
    const { value } = req.body;

    // Verificar se configuração existe
    const existing = await db.get('SELECT * FROM settings WHERE key = ?', [key]);
    if (!existing) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Processar valor baseado no tipo
    let processedValue = value;
    if (existing.type === 'json' && typeof value === 'object') {
      processedValue = JSON.stringify(value);
    } else if (existing.type === 'boolean') {
      processedValue = value ? '1' : '0';
    } else {
      processedValue = String(value);
    }

    // Atualizar configuração
    await db.run(
      'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [processedValue, key]
    );

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, new_values) VALUES (?, ?, ?, ?)',
      [req.session.userId, 'update_setting', 'settings', JSON.stringify({ key, old_value: existing.value, new_value: processedValue })]
    );

    res.json({ message: 'Configuração atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar múltiplas configurações
router.put('/', [
  requireAuth,
  body('settings').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { settings } = req.body;
    const updatedSettings = [];

    for (const setting of settings) {
      const { key, value } = setting;

      // Verificar se configuração existe
      const existing = await db.get('SELECT * FROM settings WHERE key = ?', [key]);
      if (!existing) {
        continue; // Pular configurações que não existem
      }

      // Processar valor baseado no tipo
      let processedValue = value;
      if (existing.type === 'json' && typeof value === 'object') {
        processedValue = JSON.stringify(value);
      } else if (existing.type === 'boolean') {
        processedValue = value ? '1' : '0';
      } else {
        processedValue = String(value);
      }

      // Atualizar configuração
      await db.run(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [processedValue, key]
      );

      updatedSettings.push({ key, old_value: existing.value, new_value: processedValue });
    }

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, new_values) VALUES (?, ?, ?, ?)',
      [req.session.userId, 'bulk_update_settings', 'settings', JSON.stringify(updatedSettings)]
    );

    res.json({ 
      message: `\${updatedSettings.length} configurações atualizadas com sucesso`,
      updated_count: updatedSettings.length
    });

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova configuração
router.post('/', [
  requireAuth,
  body('key').notEmpty().trim(),
  body('value').notEmpty(),
  body('type').optional().isIn(['text', 'number', 'boolean', 'json', 'url', 'email']),
  body('group_name').notEmpty().trim(),
  body('label').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const {
      key,
      value,
      type = 'text',
      group_name,
      label,
      description = ''
    } = req.body;

    // Verificar se chave já existe
    const existing = await db.get('SELECT id FROM settings WHERE key = ?', [key]);
    if (existing) {
      return res.status(400).json({ error: 'Chave de configuração já existe' });
    }

    // Processar valor baseado no tipo
    let processedValue = value;
    if (type === 'json' && typeof value === 'object') {
      processedValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      processedValue = value ? '1' : '0';
    } else {
      processedValue = String(value);
    }

    // Inserir configuração
    const result = await db.run(`
      INSERT INTO settings (key, value, type, group_name, label, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [key, processedValue, type, group_name, label, description]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, record_id, new_values) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, 'create', 'settings', result.id, JSON.stringify({ key, value: processedValue })]
    );

    res.status(201).json({
      message: 'Configuração criada com sucesso',
      id: result.id
    });

  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar configuração
router.delete('/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await db.get('SELECT * FROM settings WHERE key = ?', [key]);
    if (!setting) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Verificar se é uma configuração essencial (não pode ser deletada)
    const essentialKeys = [
      'site_name', 'site_description', 'contact_email', 'contact_phone'
    ];

    if (essentialKeys.includes(key)) {
      return res.status(400).json({ error: 'Não é possível deletar configuração essencial' });
    }

    // Deletar configuração
    await db.run('DELETE FROM settings WHERE key = ?', [key]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, old_values) VALUES (?, ?, ?, ?)',
      [req.session.userId, 'delete', 'settings', JSON.stringify(setting)]
    );

    res.json({ message: 'Configuração deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Resetar configurações para padrão
router.post('/reset', requireAuth, async (req, res) => {
  try {
    const { group_name } = req.body;

    let whereClause = '';
    let params = [];

    if (group_name) {
      whereClause = 'WHERE group_name = ?';
      params.push(group_name);
    }

    // Buscar configurações antes do reset
    const settingsBeforeReset = await db.all(`SELECT * FROM settings \${whereClause}`, params);

    // Configurações padrão
    const defaultSettings = {
      'site_name': 'Tech10 Informática e Tecnologia',
      'site_description': 'Mais de 20 anos de experiência em tecnologia',
      'contact_email': 'contato@tech10info.com',
      'contact_phone': '(55) 99999-9999',
      'contact_whatsapp': '5555999999999',
      'social_instagram': 'https://www.instagram.com/tech10info/',
      'social_facebook': '',
      'social_twitter': '',
      'address': 'Rua Dr. Bozano, 968 - Loja 8, Santa Maria/RS',
      'products_per_page': '12'
    };

    let resetCount = 0;

    for (const setting of settingsBeforeReset) {
      if (defaultSettings[setting.key]) {
        await db.run(
          'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
          [defaultSettings[setting.key], setting.key]
        );
        resetCount++;
      }
    }

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, new_values) VALUES (?, ?, ?, ?)',
      [req.session.userId, 'reset_settings', 'settings', JSON.stringify({ group_name, reset_count: resetCount })]
    );

    res.json({ 
      message: `\${resetCount} configurações resetadas para o padrão`,
      reset_count: resetCount
    });

  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
