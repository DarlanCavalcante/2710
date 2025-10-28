const db = require('./database');

async function addSampleProducts() {
  try {
    await db.connect();
    console.log('🔗 Conectado ao banco de dados');

    // Buscar categorias existentes
    const categories = await db.all('SELECT * FROM categories LIMIT 5');
    
    if (categories.length === 0) {
      console.log('⚠️ Nenhuma categoria encontrada. Execute init-db.js primeiro.');
      return;
    }

    console.log(`📁 Encontradas ${categories.length} categorias`);

    // Produtos de exemplo
    const sampleProducts = [
      {
        name: 'MacBook Air M2',
        slug: 'macbook-air-m2',
        description: 'MacBook Air com chip M2, tela Retina de 13.6 polegadas, 8GB RAM, 256GB SSD. Ultraportátil e poderoso para todas as suas tarefas.',
        short_description: 'MacBook Air M2 - 8GB RAM - 256GB SSD',
        price: 10999.00,
        sale_price: 9999.00,
        sku: 'APPLE-MBA-M2-256',
        stock: 5,
        category_id: categories[0].id,
        images: JSON.stringify(['/imagem/produtos/macbook-air-m2.jpg']),
        features: JSON.stringify([
          'Chip M2 da Apple',
          'Tela Liquid Retina de 13.6"',
          '8GB de memória unificada',
          '256GB de armazenamento SSD',
          'Bateria com até 18 horas de duração',
          'MagSafe 3 para carregamento'
        ]),
        is_featured: 1,
        is_active: 1
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        description: 'O smartphone mais avançado da Samsung. Tela de 6.8" Dynamic AMOLED 2X, câmera de 200MP, S Pen integrada e processador Snapdragon 8 Gen 3.',
        short_description: 'Galaxy S24 Ultra - 256GB - Titanium Black',
        price: 8999.00,
        sale_price: 7999.00,
        sku: 'SAMSUNG-S24U-256-BLK',
        stock: 8,
        category_id: categories[2]?.id || categories[0].id,
        images: JSON.stringify(['/imagem/produtos/galaxy-s24-ultra.jpg']),
        features: JSON.stringify([
          'Tela 6.8" Dynamic AMOLED 2X 120Hz',
          'Câmera principal de 200MP',
          '12GB de RAM',
          '256GB de armazenamento',
          'S Pen integrada',
          'Bateria de 5000mAh',
          'Carregamento rápido 45W'
        ]),
        is_featured: 1,
        is_active: 1
      },
      {
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        description: 'Notebook premium Dell XPS 15 com processador Intel Core i7 de 13ª geração, tela InfinityEdge 4K, 16GB RAM e SSD de 512GB.',
        short_description: 'Dell XPS 15 - i7 13ª Gen - 16GB - 512GB',
        price: 9999.00,
        sale_price: null,
        sku: 'DELL-XPS15-I7-512',
        stock: 3,
        category_id: categories[1]?.id || categories[0].id,
        images: JSON.stringify(['/imagem/produtos/dell-xps-15.jpg']),
        features: JSON.stringify([
          'Intel Core i7 13ª geração',
          'Tela 15.6" 4K InfinityEdge',
          '16GB DDR5 RAM',
          'SSD NVMe de 512GB',
          'NVIDIA GeForce RTX 4050',
          'Thunderbolt 4'
        ]),
        is_featured: 1,
        is_active: 1
      },
      {
        name: 'iPad Air M2',
        slug: 'ipad-air-m2',
        description: 'iPad Air com chip M2, tela Liquid Retina de 11 polegadas, suporte a Apple Pencil Pro e Magic Keyboard.',
        short_description: 'iPad Air M2 - 128GB - WiFi',
        price: 5999.00,
        sale_price: 5499.00,
        sku: 'APPLE-IPAD-AIR-M2-128',
        stock: 10,
        category_id: categories[3]?.id || categories[0].id,
        images: JSON.stringify(['/imagem/produtos/ipad-air-m2.jpg']),
        features: JSON.stringify([
          'Chip M2 da Apple',
          'Tela Liquid Retina de 11"',
          '128GB de armazenamento',
          'Câmera frontal 12MP ultra-angular',
          'Suporte a Apple Pencil Pro',
          'Compatível com Magic Keyboard'
        ]),
        is_featured: 1,
        is_active: 1
      },
      {
        name: 'Mouse Logitech MX Master 3S',
        slug: 'logitech-mx-master-3s',
        description: 'Mouse sem fio premium para produtividade. Sensor de 8000 DPI, rolagem MagSpeed silenciosa e bateria recarregável.',
        short_description: 'Mouse Logitech MX Master 3S',
        price: 599.00,
        sale_price: 499.00,
        sku: 'LOGI-MX-MASTER-3S',
        stock: 15,
        category_id: categories[4]?.id || categories[0].id,
        images: JSON.stringify(['/imagem/produtos/mx-master-3s.jpg']),
        features: JSON.stringify([
          'Sensor de 8000 DPI',
          'Rolagem MagSpeed silenciosa',
          '8 botões personalizáveis',
          'Bateria recarregável (até 70 dias)',
          'Conexão Bluetooth e USB-C',
          'Multi-dispositivo (3 dispositivos)'
        ]),
        is_featured: 0,
        is_active: 1
      },
      {
        name: 'Teclado Mecânico Keychron K8 Pro',
        slug: 'keychron-k8-pro',
        description: 'Teclado mecânico sem fio com switches hot-swappable, RGB personalizável e compatível com Windows e Mac.',
        short_description: 'Keychron K8 Pro - Red Switch',
        price: 899.00,
        sale_price: null,
        sku: 'KEYCHRON-K8-PRO-RED',
        stock: 7,
        category_id: categories[4]?.id || categories[0].id,
        images: JSON.stringify(['/imagem/produtos/keychron-k8-pro.jpg']),
        features: JSON.stringify([
          'Switches mecânicos hot-swappable',
          'Gateron Red Switches',
          'RGB per-key backlight',
          'Conexão sem fio e com fio',
          'Layout TKL (80%)',
          'Compatível Windows e Mac'
        ]),
        is_featured: 0,
        is_active: 1
      }
    ];

    console.log(`\n📦 Adicionando ${sampleProducts.length} produtos de exemplo...\n`);

    for (const product of sampleProducts) {
      // Verificar se produto já existe
      const exists = await db.get('SELECT id FROM products WHERE slug = ?', [product.slug]);
      
      if (exists) {
        console.log(`⏭️  Produto já existe: ${product.name}`);
        continue;
      }

      const result = await db.run(`
        INSERT INTO products (
          name, slug, description, short_description,
          price, sale_price, sku, stock, category_id,
          images, features, is_featured, is_active,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        product.name,
        product.slug,
        product.description,
        product.short_description,
        product.price,
        product.sale_price,
        product.sku,
        product.stock,
        product.category_id,
        product.images,
        product.features,
        product.is_featured,
        product.is_active
      ]);

      console.log(`✅ ${product.name} (ID: ${result.id})`);
    }

    console.log('\n🎉 Produtos de exemplo adicionados com sucesso!');
    console.log('\n📊 Resumo:');
    
    const totalProducts = await db.get('SELECT COUNT(*) as count FROM products');
    console.log(`   Total de produtos: ${totalProducts.count}`);
    
    const activeProducts = await db.get('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    console.log(`   Produtos ativos: ${activeProducts.count}`);
    
    const featuredProducts = await db.get('SELECT COUNT(*) as count FROM products WHERE is_featured = 1');
    console.log(`   Produtos em destaque: ${featuredProducts.count}`);

    console.log('\n🌐 Acesse:');
    console.log('   Site: http://localhost:3001/');
    console.log('   Admin: http://localhost:3001/admin');

  } catch (error) {
    console.error('❌ Erro ao adicionar produtos:', error);
  } finally {
    if (db.db) {
      await db.close();
    }
  }
}

// Executar
addSampleProducts();
