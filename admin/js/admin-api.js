/**
 * 🔌 TECH10 ADMIN API
 * Cliente para comunicação with backend
 */

class AdminAPI {
  constructor() {
    this.baseURL = '/api';
    this.isAuthenticated = false;
    this.user = null;
  }

  // 🔄 Método genérico para requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include', // Importante para cookies de sessão
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // 🔐 AUTENTICAÇÃO
  async login(email, password) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      this.isAuthenticated = true;
      this.user = data.user;
      return data;
    } catch (error) {
      this.isAuthenticated = false;
      this.user = null;
      throw error;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
      this.isAuthenticated = false;
      this.user = null;
    } catch (error) {
      // Mesmo com erro, limpar estado local
      this.isAuthenticated = false;
      this.user = null;
      throw error;
    }
  }

  async checkAuth() {
    try {
      const data = await this.request('/auth/me');
      this.isAuthenticated = true;
      this.user = data.user;
      return data.user;
    } catch (error) {
      this.isAuthenticated = false;
      this.user = null;
      return null;
    }
  }

  async changePassword(currentPassword, newPassword) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async updateProfile(name, email) {
    const data = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email })
    });
    
    if (data.user) {
      this.user = { ...this.user, ...data.user };
    }
    
    return data;
  }

  // 📊 DASHBOARD
  async getDashboard() {
    return await this.request('/dashboard');
  }

  async getCategoryStats() {
    return await this.request('/dashboard/category-stats');
  }

  async getProductsReport(days = 30) {
    return await this.request(`/dashboard/products-report?days=${days}`);
  }

  async getBackup() {
    const response = await fetch(`${this.baseURL}/dashboard/backup`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Erro ao gerar backup');
    }
    
    return response.blob();
  }

  async cleanupLogs(days = 90) {
    return await this.request(`/dashboard/cleanup-logs?days=${days}`, {
      method: 'DELETE'
    });
  }

  // 📦 PRODUTOS
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/products?${query}`);
  }

  async getProduct(id) {
    return await this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    const formData = new FormData();
    
    // Adicionar campos de texto
    Object.keys(productData).forEach(key => {
      if (key !== 'images' && productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });

    // Adicionar imagens
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    return await this.request('/products', {
      method: 'POST',
      headers: {}, // Remove Content-Type para FormData
      body: formData
    });
  }

  async updateProduct(id, productData) {
    const formData = new FormData();
    
    Object.keys(productData).forEach(key => {
      if (key !== 'images' && productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });

    if (productData.images && productData.images.length > 0) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    return await this.request(`/products/${id}`, {
      method: 'PUT',
      headers: {},
      body: formData
    });
  }

  async deleteProduct(id) {
    return await this.request(`/products/${id}`, { method: 'DELETE' });
  }

  async removeProductImage(productId, imageIndex) {
    return await this.request(`/products/${productId}/images/${imageIndex}`, {
      method: 'DELETE'
    });
  }

  // 🏷️ CATEGORIAS
  async getCategories(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/categories?${query}`);
  }

  async getCategory(id) {
    return await this.request(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return await this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id, categoryData) {
    return await this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id) {
    return await this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  async reorderCategories(categories) {
    return await this.request('/categories/reorder', {
      method: 'PUT',
      body: JSON.stringify({ categories })
    });
  }

  async getCategoryStats(id) {
    return await this.request(`/categories/${id}/stats`);
  }

  // ⚙️ CONFIGURAÇÕES
  async getSettings(group = null) {
    const query = group ? `?group=${group}` : '';
    return await this.request(`/settings${query}`);
  }

  async getSetting(key) {
    return await this.request(`/settings/${key}`);
  }

  async updateSetting(key, value) {
    return await this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }

  async updateSettings(settings) {
    return await this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings })
    });
  }

  async createSetting(settingData) {
    return await this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(settingData)
    });
  }

  async deleteSetting(key) {
    return await this.request(`/settings/${key}`, { method: 'DELETE' });
  }

  async resetSettings(group = null) {
    return await this.request('/settings/reset', {
      method: 'POST',
      body: JSON.stringify({ group_name: group })
    });
  }
}

// Instância global da API
window.adminAPI = new AdminAPI();