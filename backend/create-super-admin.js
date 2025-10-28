const bcrypt = require('bcrypt');
const db = require('./database/index.js');

async function createSuperAdmin() {
    try {
        console.log('🔐 Criando usuário administrador superior...');
        
        // Conectar ao banco
        await db.connect();
        
        const email = 'darlancavalcante@gmail.com';
        const password = 'D@rl@n34461011'; 
        const name = 'Darlan Cavalcante';
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Verificar se o usuário já existe
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (existingUser) {
            console.log('👤 Usuário já existe. Atualizando senha...');
            
            // Atualizar usuário existente
            await db.run(`
                UPDATE users 
                SET password = ?, name = ?, role = 'super_admin', updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            `, [hashedPassword, name, email]);
            
            console.log('✅ Usuário administrador superior atualizado!');
            
        } else {
            console.log('👤 Criando novo usuário administrador superior...');
            
            // Criar novo usuário
            await db.run(`
                INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
                VALUES (?, ?, ?, 'super_admin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [name, email, hashedPassword]);
            
            console.log('✅ Usuário administrador superior criado!');
        }
        
        // Verificar o usuário criado
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        console.log('📋 Dados do usuário:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Ativo: ${user.is_active ? 'Sim' : 'Não'}`);
        
        console.log('\n🎉 USUÁRIO ADMINISTRADOR SUPERIOR CONFIGURADO!');
        console.log('=====================================');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Senha: ${password}`);
        console.log(`👑 Nível: Super Administrador`);
        console.log('=====================================');
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário administrador:', error);
        process.exit(1);
    } finally {
        // Fechar conexão
        if (db.db) {
            await db.close();
        }
    }
}

// Executar
createSuperAdmin();