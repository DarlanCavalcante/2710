#!/usr/bin/env node

/**
 * 🗃️ SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS
 * Cria e inicializa o banco SQLite com dados padrão
 */

const db = require('./database');

async function initDatabase() {
  console.log('🚀 Inicializando banco de dados Tech10...\n');
  
  try {
    await db.init();
    
    console.log('\n✅ Banco de dados inicializado com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   • users (usuários)');
    console.log('   • categories (categorias)');
    console.log('   • products (produtos)');
    console.log('   • settings (configurações)');
    console.log('   • activity_logs (logs de atividade)');
    console.log('   • sessions (sessões)');
    
    console.log('\n🔑 Usuário admin criado:');
    console.log('   • Email: admin@tech10.com');
    console.log('   • Senha: admin123');
    
    console.log('\n🏷️ Categorias padrão criadas');
    console.log('⚙️ Configurações padrão inseridas');
    
    console.log('\n🎉 Pronto para usar!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro ao inicializar banco:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;