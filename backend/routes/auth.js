const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const router = express.Router();

// Middleware de autenticação
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }
  next();
};

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await db.get(
      'SELECT * FROM users WHERE email = ? AND is_active = 1', 
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Criar sessão
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name;
    req.session.userRole = user.role;

    // Atualizar último login
    await db.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [user.id, 'login', req.ip, req.get('User-Agent')]
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [req.session.userId, 'logout', req.ip, req.get('User-Agent')]
    );

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao fazer logout' });
      }
      res.json({ message: 'Logout realizado com sucesso' });
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar autenticação
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, name, email, role, avatar, created_at, last_login FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Alterar senha
router.put('/change-password', [
  requireAuth,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Buscar usuário atual
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    
    // Verificar senha atual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Atualizar senha
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.session.userId]
    );

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [req.session.userId, 'change_password', req.ip, req.get('User-Agent')]
    );

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar perfil
router.put('/profile', [
  requireAuth,
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { name, email } = req.body;

    // Verificar se email já existe (exceto o usuário atual)
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.session.userId]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está em uso' });
    }

    // Atualizar usuário
    await db.run(
      'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, req.session.userId]
    );

    // Atualizar sessão
    req.session.userName = name;
    req.session.userEmail = email;

    // Log da atividade
    await db.run(
      'INSERT INTO activity_logs (user_id, action, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, 'update_profile', JSON.stringify({ name, email }), req.ip, req.get('User-Agent')]
    );

    res.json({ 
      message: 'Perfil atualizado com sucesso',
      user: { name, email }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = { router, requireAuth };