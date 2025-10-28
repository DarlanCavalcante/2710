const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('./auth');
const db = require('../database');
const router = express.Router();

// Função para gerar slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Listar categorias
router.get('/', async (req, res) => {
  try {
    const { active = '1', parent = null, tree = false } = req.query;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (active !== 'all') {
      whereClause += ' AND c.is_active = ?';
      params.push(active === '1' ? 1 : 0);
    }

    if (parent !== null) {
      if (parent === 'null' || parent === '') {
        whereClause += ' AND parent_id IS NULL';
      } else {
        whereClause += ' AND parent_id = ?';
        params.push(parent);
      }
    }

    const sql = `
      SELECT 
        c.*,
        COUNT(p.id) as products_count,
        pc.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      LEFT JOIN categories pc ON c.parent_id = pc.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;

    const categories = await db.all(sql, params);

    if (tree === 'true') {
      // Organizar em árvore
      const categoryMap = {};
      const rootCategories = [];

      // Criar mapa de categorias
      categories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, children: [] };
      });

      // Organizar hierarquia
      categories.forEach(cat => {
        if (cat.parent_id) {
          if (categoryMap[cat.parent_id]) {
            categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
          }
        } else {
          rootCategories.push(categoryMap[cat.id]);
        }
      });

      res.json(rootCategories);
    } else {
      res.json(categories);
    }

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const category = await db.get(`
      SELECT 
        c.*,
        COUNT(p.id) as products_count,
        pc.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Buscar subcategorias
    const subcategories = await db.all(
      'SELECT * FROM categories WHERE parent_id = ? ORDER BY sort_order ASC, name ASC',
      [req.params.id]
    );

    res.json({
      ...category,
      subcategories
    });

  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar categoria
router.post('/', [
  requireAuth,
  body('name').notEmpty().trim(),
  body('description').optional(),
  body('icon').optional(),
  body('color').optional().isHexColor(),
  body('parent_id').optional().isInt({ min: 1 })
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
      name,
      description = '',
      icon = 'fas fa-tag',
      color = '#1a73e8',
      parent_id = null,
      sort_order = 0
    } = req.body;

    // Gerar slug único
    let slug = generateSlug(name);
    const existingSlug = await db.get('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Verificar se parent_id existe
    if (parent_id) {
      const parentExists = await db.get('SELECT id FROM categories WHERE id = ?', [parent_id]);
      if (!parentExists) {
        return res.status(400).json({ error: 'Categoria pai não encontrada' });
      }
    }

    // Inserir categoria
    const result = await db.run(`
      INSERT INTO categories (name, slug, description, icon, color, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, slug, description, icon, color, parent_id, sort_order]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, record_id, new_values) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, 'create', 'categories', result.id, JSON.stringify({ name, slug })]
    );

    res.status(201).json({
      message: 'Categoria criada com sucesso',
      id: result.id,
      slug
    });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar categoria
router.put('/:id', [
  requireAuth,
  body('name').notEmpty().trim(),
  body('color').optional().isHexColor(),
  body('parent_id').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const categoryId = req.params.id;
    
    // Verificar se categoria existe
    const existingCategory = await db.get('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const {
      name,
      description = existingCategory.description,
      icon = existingCategory.icon,
      color = existingCategory.color,
      parent_id = existingCategory.parent_id,
      sort_order = existingCategory.sort_order,
      is_active = existingCategory.is_active
    } = req.body;

    // Verificar se não está tentando ser pai de si mesma
    if (parent_id && parseInt(parent_id) === parseInt(categoryId)) {
      return res.status(400).json({ error: 'Categoria não pode ser pai de si mesma' });
    }

    // Verificar loops na hierarquia
    if (parent_id) {
      const checkLoop = async (parentId, targetId) => {
        const parent = await db.get('SELECT parent_id FROM categories WHERE id = ?', [parentId]);
        if (!parent) return false;
        if (parent.parent_id === parseInt(targetId)) return true;
        if (parent.parent_id) return await checkLoop(parent.parent_id, targetId);
        return false;
      };

      const hasLoop = await checkLoop(parent_id, categoryId);
      if (hasLoop) {
        return res.status(400).json({ error: 'Hierarquia circular detectada' });
      }
    }

    // Atualizar slug se nome mudou
    let slug = existingCategory.slug;
    if (name !== existingCategory.name) {
      slug = generateSlug(name);
      const existingSlug = await db.get('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, categoryId]);
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Atualizar categoria
    await db.run(`
      UPDATE categories SET
        name = ?, slug = ?, description = ?, icon = ?, color = ?,
        parent_id = ?, sort_order = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, slug, description, icon, color, parent_id, sort_order, is_active, categoryId]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.userId, 'update', 'categories', categoryId, JSON.stringify(existingCategory), JSON.stringify({ name, slug })]
    );

    res.json({ message: 'Categoria atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Reordenar categorias
router.put('/reorder', requireAuth, async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Lista de categorias inválida' });
    }

    // Atualizar ordem de cada categoria
    for (let i = 0; i < categories.length; i++) {
      const { id, sort_order } = categories[i];
      await db.run(
        'UPDATE categories SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [sort_order, id]
      );
    }

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, new_values) VALUES (?, ?, ?, ?)',
      [req.session.userId, 'reorder', 'categories', JSON.stringify(categories)]
    );

    res.json({ message: 'Ordem das categorias atualizada com sucesso' });

  } catch (error) {
    console.error('Erro ao reordenar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar categoria
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [categoryId]);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Verificar se há produtos nesta categoria
    const productsCount = await db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [categoryId]);
    if (productsCount.count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar categoria com produtos',
        productsCount: productsCount.count
      });
    }

    // Verificar se há subcategorias
    const subcategoriesCount = await db.get('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?', [categoryId]);
    if (subcategoriesCount.count > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar categoria com subcategorias',
        subcategoriesCount: subcategoriesCount.count
      });
    }

    // Deletar categoria
    await db.run('DELETE FROM categories WHERE id = ?', [categoryId]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, 'delete', 'categories', categoryId, JSON.stringify(category)]
    );

    res.json({ message: 'Categoria deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas da categoria
router.get('/:id/stats', async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Verificar se categoria existe
    const category = await db.get('SELECT name FROM categories WHERE id = ?', [categoryId]);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Estatísticas
    const stats = await db.get(`
      SELECT 
        COUNT(p.id) as total_products,
        COUNT(CASE WHEN p.is_active = 1 THEN 1 END) as active_products,
        COUNT(CASE WHEN p.is_featured = 1 THEN 1 END) as featured_products,
        AVG(p.price) as avg_price,
        MIN(p.price) as min_price,
        MAX(p.price) as max_price,
        SUM(p.stock) as total_stock
      FROM products p
      WHERE p.category_id = ?
    `, [categoryId]);

    // Subcategorias
    const subcategoriesCount = await db.get(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [categoryId]
    );

    res.json({
      category_name: category.name,
      products: {
        total: stats.total_products || 0,
        active: stats.active_products || 0,
        featured: stats.featured_products || 0,
        stock: stats.total_stock || 0
      },
      pricing: {
        average: parseFloat(stats.avg_price) || 0,
        minimum: parseFloat(stats.min_price) || 0,
        maximum: parseFloat(stats.max_price) || 0
      },
      subcategories: subcategoriesCount.count || 0
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;