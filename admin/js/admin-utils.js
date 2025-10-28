/**
 * 🛠️ TECH10 ADMIN UTILS
 * Utilitários e funções auxiliares
 */

class AdminUtils {
  constructor() {
    this.toastContainer = null;
    this.modals = new Map();
    this.init();
  }

  init() {
    this.createToastContainer();
    this.bindGlobalEvents();
    this.setupKeyboardShortcuts();
  }

  // 🍞 SISTEMA DE TOASTS
  createToastContainer() {
    if (document.getElementById('toast-container')) return;

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    
    this.toastContainer = container;
  }

  showToast(message, type = 'info', duration = 5000) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = this.getToastIcon(type);
    
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">
          <i class="fas ${icon}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Adicionar animação de entrada
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    this.toastContainer.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    // Auto-remover
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast);
      }, duration);
    }

    return toast;
  }

  removeToast(toast) {
    if (!toast || !toast.parentElement) return;

    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }

  getToastIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-triangle',
      warning: 'fa-exclamation-circle',
      info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
  }

  // 📝 SISTEMA DE MODAIS
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return false;

    // Fechar outros modais
    this.closeAllModals();

    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Adicionar classe de animação
    requestAnimationFrame(() => {
      modal.classList.add('modal-open');
    });

    // Focar no primeiro input
    const firstInput = modal.querySelector('input, select, textarea, button');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    // Adicionar ao mapa de modais ativos
    this.modals.set(modalId, modal);

    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';

    return true;
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return false;

    modal.classList.remove('modal-open');
    
    setTimeout(() => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }, 300);

    // Remover do mapa
    this.modals.delete(modalId);

    // Restaurar scroll se não há outros modais
    if (this.modals.size === 0) {
      document.body.style.overflow = '';
    }

    return true;
  }

  closeAllModals() {
    const openModals = Array.from(this.modals.keys());
    openModals.forEach(modalId => this.closeModal(modalId));
  }

  // 📋 SISTEMA DE CONFIRMAÇÃO
  showConfirm(message, options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmação',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'warning'
      } = options;

      const modal = document.createElement('div');
      modal.className = 'modal confirm-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>
              <i class="fas ${this.getConfirmIcon(type)}"></i>
              ${title}
            </h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="cancel">
              ${cancelText}
            </button>
            <button class="btn btn-${type}" data-action="confirm">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      // Event handlers
      modal.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        if (action === 'confirm') {
          resolve(true);
          document.body.removeChild(modal);
        } else if (action === 'cancel') {
          resolve(false);
          document.body.removeChild(modal);
        }
      });

      document.body.appendChild(modal);
      modal.style.display = 'block';
      
      // Focar no botão de cancelar por segurança
      modal.querySelector('[data-action="cancel"]').focus();
    });
  }

  getConfirmIcon(type) {
    const icons = {
      danger: 'fa-exclamation-triangle',
      warning: 'fa-question-circle',
      info: 'fa-info-circle',
      success: 'fa-check-circle'
    };
    return icons[type] || 'fa-question-circle';
  }

  // 📱 UTILITÁRIOS DE RESPONSIVE
  isMobile() {
    return window.innerWidth <= 768;
  }

  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }

  // 📅 UTILITÁRIOS DE DATA
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    };
    
    return new Date(date).toLocaleDateString('pt-BR', defaultOptions);
  }

  formatDateTime(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Date(date).toLocaleDateString('pt-BR', defaultOptions);
  }

  getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return this.formatDate(date);
  }

  // 💰 UTILITÁRIOS DE FORMATAÇÃO
  formatCurrency(value, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  formatNumber(value, options = {}) {
    return new Intl.NumberFormat('pt-BR', options).format(value);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // 🔤 UTILITÁRIOS DE STRING
  slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-'); // Remove hífens duplicados
  }

  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  truncate(text, length = 100, suffix = '...') {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  }

  // 🔍 UTILITÁRIOS DE VALIDAÇÃO
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  // 📋 UTILITÁRIOS DE CLIPBOARD
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copiado para a área de transferência!', 'success');
      return true;
    } catch (error) {
      console.error('Erro ao copiar:', error);
      this.showToast('Erro ao copiar texto', 'error');
      return false;
    }
  }

  // 🎨 UTILITÁRIOS DE TEMA
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
  }

  getTheme() {
    return localStorage.getItem('admin-theme') || 'light';
  }

  toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }

  // 💾 UTILITÁRIOS DE STORAGE
  saveToStorage(key, data) {
    try {
      localStorage.setItem(`admin-${key}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
      return false;
    }
  }

  loadFromStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`admin-${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Erro ao carregar do storage:', error);
      return defaultValue;
    }
  }

  removeFromStorage(key) {
    localStorage.removeItem(`admin-${key}`);
  }

  // ⌨️ ATALHOS DE TECLADO
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S = Salvar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const saveBtn = document.querySelector('[data-save-settings], [data-save]');
        if (saveBtn && !saveBtn.disabled) {
          saveBtn.click();
        }
      }

      // ESC = Fechar modal
      if (e.key === 'Escape') {
        this.closeAllModals();
      }

      // Ctrl/Cmd + K = Busca global
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-global-search]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  // 🌐 EVENTOS GLOBAIS
  bindGlobalEvents() {
    // Fechar modais clicando fora
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        if (modalId) {
          this.closeModal(modalId);
        }
      }
    });

    // Botões de fechar modal
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-close-modal]')) {
        const modalId = e.target.getAttribute('data-close-modal') || 
                       e.target.closest('.modal')?.id;
        if (modalId) {
          this.closeModal(modalId);
        }
      }
    });

    // Botões de cópia
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-copy]')) {
        const text = e.target.getAttribute('data-copy');
        this.copyToClipboard(text);
      }
    });

    // Toggle de tema
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-toggle-theme]')) {
        this.toggleTheme();
      }
    });
  }

  // 🔄 LOADING STATES
  showGlobalLoading(message = 'Carregando...') {
    if (document.getElementById('global-loading')) return;

    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.className = 'global-loading';
    loading.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>${message}</p>
      </div>
    `;

    document.body.appendChild(loading);
  }

  hideGlobalLoading() {
    const loading = document.getElementById('global-loading');
    if (loading) {
      document.body.removeChild(loading);
    }
  }

  // 🎯 SCROLL UTILITÁRIOS
  scrollToTop(smooth = true) {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'instant'
    });
  }

  scrollToElement(element, offset = 0) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
  }

  // 🖨️ PRINT UTILITÁRIOS
  printElement(selector) {
    const element = document.querySelector(selector);
    if (!element) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impressão - Tech10 Admin</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}

// Criar instância global
window.adminUtils = new AdminUtils();

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminUtils;
}