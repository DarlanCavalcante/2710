const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('./auth');
const db = require('../database');
const router = express.Router();

// Configurar upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // máximo 10 imagens
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  }
});

// Função para gerar slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Listar produtos
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sort = 'created_at', 
      order = 'DESC',
      active = '1'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    let params = [];

    // Filtros
    if (active !== 'all') {
      whereClause += ' AND p.is_active = ?';
      params.push(active === '1' ? 1 : 0);
    }

    if (category) {
      whereClause += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Query principal
    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const products = await db.all(sql, params);

    // Contar total
    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countParams = params.slice(0, -2); // Remove limit e offset
    const { total } = await db.get(countSql, countParams);

    // Processar imagens
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      features: product.features ? JSON.parse(product.features) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {}
    }));

    res.json({
      products: processedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Processar campos JSON
    const processedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      features: product.features ? JSON.parse(product.features) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {}
    };

    res.json(processedProduct);

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar produto
router.post('/', [
  requireAuth,
  upload.array('images', 10),
  body('name').notEmpty().trim(),
  body('description').optional(),
  body('price').optional().isFloat({ min: 0 }),
  body('category_id').optional().isInt({ min: 1 })
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
      short_description = '',
      price = 0,
      sale_price = null,
      sku = '',
      stock = 0,
      category_id = null,
      features = '[]',
      specifications = '{}',
      is_featured = 0,
      meta_title = '',
      meta_description = ''
    } = req.body;

    // Gerar slug único
    let slug = generateSlug(name);
    const existingSlug = await db.get('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Processar imagens enviadas
    const imagesPaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Otimizar imagem
          const optimizedPath = file.path.replace(path.extname(file.path), '-optimized.webp');
          await sharp(file.path)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(optimizedPath);

          imagesPaths.push(`/uploads/products/${path.basename(optimizedPath)}`);
          
          // Remover arquivo original
          fs.unlinkSync(file.path);
        } catch (imgError) {
          console.error('Erro ao processar imagem:', imgError);
          imagesPaths.push(`/uploads/products/${file.filename}`);
        }
      }
    }

    // Inserir produto
    const result = await db.run(`
      INSERT INTO products (
        name, slug, description, short_description, price, sale_price,
        sku, stock, category_id, images, features, specifications,
        is_featured, meta_title, meta_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, slug, description, short_description, price, sale_price,
      sku, stock, category_id, JSON.stringify(imagesPaths), features, specifications,
      is_featured, meta_title, meta_description
    ]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, record_id, new_values) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, 'create', 'products', result.id, JSON.stringify({ name, slug })]
    );

    res.status(201).json({
      message: 'Produto criado com sucesso',
      id: result.id,
      slug
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar produto
router.put('/:id', [
  requireAuth,
  upload.array('images', 10),
  body('name').notEmpty().trim(),
  body('price').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const productId = req.params.id;
    
    // Verificar se produto existe
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const {
      name,
      description = existingProduct.description,
      short_description = existingProduct.short_description,
      price = existingProduct.price,
      sale_price = existingProduct.sale_price,
      sku = existingProduct.sku,
      stock = existingProduct.stock,
      category_id = existingProduct.category_id,
      features = existingProduct.features,
      specifications = existingProduct.specifications,
      is_featured = existingProduct.is_featured,
      is_active = existingProduct.is_active,
      meta_title = existingProduct.meta_title,
      meta_description = existingProduct.meta_description
    } = req.body;

    // Atualizar slug se nome mudou
    let slug = existingProduct.slug;
    if (name !== existingProduct.name) {
      slug = generateSlug(name);
      const existingSlug = await db.get('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, productId]);
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Processar novas imagens
    let currentImages = existingProduct.images ? JSON.parse(existingProduct.images) : [];
    
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        try {
          const optimizedPath = file.path.replace(path.extname(file.path), '-optimized.webp');
          await sharp(file.path)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(optimizedPath);

          newImages.push(`/uploads/products/${path.basename(optimizedPath)}`);
          fs.unlinkSync(file.path);
        } catch (imgError) {
          console.error('Erro ao processar imagem:', imgError);
          newImages.push(`/uploads/products/${file.filename}`);
        }
      }
      currentImages = [...currentImages, ...newImages];
    }

    // Atualizar produto
    await db.run(`
      UPDATE products SET
        name = ?, slug = ?, description = ?, short_description = ?,
        price = ?, sale_price = ?, sku = ?, stock = ?,
        category_id = ?, images = ?, features = ?, specifications = ?,
        is_featured = ?, is_active = ?, meta_title = ?, meta_description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, slug, description, short_description, price, sale_price,
      sku, stock, category_id, JSON.stringify(currentImages), features, specifications,
      is_featured, is_active, meta_title, meta_description, productId
    ]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.userId, 'update', 'products', productId, JSON.stringify(existingProduct), JSON.stringify({ name, slug })]
    );

    res.json({ message: 'Produto atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar produto
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Deletar imagens físicas
    if (product.images) {
      const images = JSON.parse(product.images);
      for (const imagePath of images) {
        const fullPath = path.join(__dirname, '../', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // Deletar produto
    await db.run('DELETE FROM products WHERE id = ?', [productId]);

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, 'delete', 'products', productId, JSON.stringify(product)]
    );

    res.json({ message: 'Produto deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover imagem específica
router.delete('/:id/images/:imageIndex', requireAuth, async (req, res) => {
  try {
    const { id: productId, imageIndex } = req.params;
    
    const product = await db.get('SELECT images FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const images = product.images ? JSON.parse(product.images) : [];
    const index = parseInt(imageIndex);
    
    if (index < 0 || index >= images.length) {
      return res.status(400).json({ error: 'Índice de imagem inválido' });
    }

    // Remover arquivo físico
    const imagePath = images[index];
    const fullPath = path.join(__dirname, '../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remover do array
    images.splice(index, 1);

    // Atualizar produto
    await db.run(
      'UPDATE products SET images = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(images), productId]
    );

    res.json({ message: 'Imagem removida com sucesso' });

  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;