const express = require('express');
const { requireAuth } = require('./auth');
const db = require('../database');
const router = express.Router();

// Dashboard principal
router.get('/', requireAuth, async (req, res) => {
  try {
    // Estatísticas gerais
    const stats = await Promise.all([
      // Produtos
      db.get('SELECT COUNT(*) as total FROM products'),
      db.get('SELECT COUNT(*) as total FROM products WHERE is_active = 1'),
      db.get('SELECT COUNT(*) as total FROM products WHERE is_featured = 1'),
      db.get('SELECT COUNT(*) as total FROM products WHERE stock < 5'),
      
      // Categorias
      db.get('SELECT COUNT(*) as total FROM categories'),
      db.get('SELECT COUNT(*) as total FROM categories WHERE is_active = 1'),
      
      // Valores
      db.get('SELECT SUM(stock * price) as total FROM products WHERE is_active = 1'),
      db.get('SELECT AVG(price) as avg FROM products WHERE is_active = 1 AND price > 0')
    ]);

    // Produtos mais recentes
    const recentProducts = await db.all(`
      SELECT 
        p.id, p.name, p.price, p.stock, p.created_at,
        c.name as category_name, c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    // Categorias com mais produtos
    const topCategories = await db.all(`
      SELECT 
        c.id, c.name, c.color, c.icon,
        COUNT(p.id) as products_count,
        SUM(CASE WHEN p.is_active = 1 THEN 1 ELSE 0 END) as active_products
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY products_count DESC
      LIMIT 8
    `);

    // Produtos com estoque baixo
    const lowStockProducts = await db.all(`
      SELECT 
        p.id, p.name, p.stock, p.price,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.stock < 5
      ORDER BY p.stock ASC
      LIMIT 10
    `);

    // Atividades recentes
    const recentActivities = await db.all(`
      SELECT 
        al.*, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 15
    `);

    // Estatísticas por mês (últimos 6 meses)
    const monthlyStats = await db.all(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as products_added
      FROM products 
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `);

    res.json({
      stats: {
        products: {
          total: stats[0].total,
          active: stats[1].total,
          featured: stats[2].total,
          low_stock: stats[3].total
        },
        categories: {
          total: stats[4].total,
          active: stats[5].total
        },
        financial: {
          inventory_value: parseFloat(stats[6].total) || 0,
          average_price: parseFloat(stats[7].avg) || 0
        }
      },
      recent_products: recentProducts,
      top_categories: topCategories,
      low_stock_products: lowStockProducts,
      recent_activities: recentActivities.map(activity => ({
        ...activity,
        old_values: activity.old_values ? JSON.parse(activity.old_values) : null,
        new_values: activity.new_values ? JSON.parse(activity.new_values) : null
      })),
      monthly_stats: monthlyStats
    });

  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de produtos por categoria (gráfico)
router.get('/category-stats', requireAuth, async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COUNT(p.id) as total_products,
        COUNT(CASE WHEN p.is_active = 1 THEN 1 END) as active_products,
        COUNT(CASE WHEN p.is_featured = 1 THEN 1 END) as featured_products,
        SUM(p.stock) as total_stock,
        AVG(p.price) as avg_price
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.is_active = 1
      GROUP BY c.id, c.name, c.color, c.icon
      HAVING COUNT(p.id) > 0
      ORDER BY total_products DESC
    `);

    res.json(stats.map(stat => ({
      ...stat,
      avg_price: parseFloat(stat.avg_price) || 0
    })));

  } catch (error) {
    console.error('Erro ao buscar estatísticas por categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Relatório de vendas/produtos (últimos 30 dias)
router.get('/products-report', requireAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Produtos adicionados por dia
    const dailyProducts = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as products_added
      FROM products 
      WHERE created_at >= date('now', '-${parseInt(days)} days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Top produtos por categoria
    const topProductsByCategory = await db.all(`
      SELECT 
        c.name as category,
        c.color,
        p.name as product,
        p.price,
        p.stock,
        p.is_featured
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY c.name, p.created_at DESC
    `);

    // Distribuição de preços
    const priceDistribution = await db.all(`
      SELECT 
        CASE 
          WHEN price <= 100 THEN '0-100'
          WHEN price <= 500 THEN '101-500'
          WHEN price <= 1000 THEN '501-1000'
          WHEN price <= 2000 THEN '1001-2000'
          ELSE '2000+'
        END as price_range,
        COUNT(*) as count
      FROM products 
      WHERE is_active = 1 AND price > 0
      GROUP BY price_range
      ORDER BY 
        CASE price_range
          WHEN '0-100' THEN 1
          WHEN '101-500' THEN 2
          WHEN '501-1000' THEN 3
          WHEN '1001-2000' THEN 4
          ELSE 5
        END
    `);

    res.json({
      daily_products: dailyProducts,
      top_products_by_category: topProductsByCategory,
      price_distribution: priceDistribution
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Backup de dados
router.get('/backup', requireAuth, async (req, res) => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        categories: await db.all('SELECT * FROM categories ORDER BY id'),
        products: await db.all('SELECT * FROM products ORDER BY id'),
        settings: await db.all('SELECT * FROM settings ORDER BY id'),
        users: await db.all('SELECT id, email, name, role, created_at, last_login FROM users ORDER BY id')
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="tech10-backup-${Date.now()}.json"`);
    res.json(backup);

  } catch (error) {
    console.error('Erro ao gerar backup:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Limpar logs antigos
router.delete('/cleanup-logs', requireAuth, async (req, res) => {
  try {
    const { days = 90 } = req.query;

    const result = await db.run(
      `DELETE FROM activity_logs WHERE created_at < date('now', '-${parseInt(days)} days')`
    );

    // Log da atividade de limpeza
    await db.run(
      'INSERT INTO activity_logs (user_id, action, new_values) VALUES (?, ?, ?)',
      [req.session.userId, 'cleanup_logs', JSON.stringify({ days, deleted_records: result.changes })]
    );

    res.json({ 
      message: `${result.changes} registros de log removidos`,
      deleted_records: result.changes
    });

  } catch (error) {
    console.error('Erro ao limpar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;