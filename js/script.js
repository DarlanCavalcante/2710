// Estado global da aplicação
const state = {
    cart: [],
    products: [],
    filteredProducts: [],
    currentFilter: 'all',
    dicas: [],
    currentDicaPage: 0,
    dicasPerPage: 3,
    currentScreenSize: 'desktop'
};

// Dados dos produtos (simulação de uma API)
const productsData = [
    {
        id: 1,
        name: 'Notebook Dell Inspiron 15',
        description: 'Intel Core i5, 8GB RAM, 256GB SSD, Tela 15.6"',
        price: 2499.99,
        oldPrice: 2799.99,
        category: 'notebook',
        image: 'notebook-dell.jpg',
        badge: '10% OFF',
        inStock: true
    },
    {
        id: 2,
        name: 'Desktop Gamer RGB',
        description: 'AMD Ryzen 5, 16GB RAM, GTX 1660, 500GB SSD',
        price: 3299.99,
        oldPrice: null,
        category: 'desktop',
        image: 'desktop-gamer.jpg',
        badge: 'NOVO',
        inStock: true
    },
    {
        id: 3,
        name: 'iPhone 14 Pro Max',
        description: '256GB, Câmera ProRAW, Tela Super Retina XDR',
        price: 8999.99,
        oldPrice: 9499.99,
        category: 'smartphone',
        image: 'iphone-14.jpg',
        badge: '5% OFF',
        inStock: true
    },
    {
        id: 4,
        name: 'Teclado Mecânico RGB',
        description: 'Switch Blue, Retroiluminado, ABNT2',
        price: 299.99,
        oldPrice: null,
        category: 'acessorio',
        image: 'teclado-mecanico.jpg',
        badge: null,
        inStock: true
    },
    {
        id: 5,
        name: 'Monitor 4K 27"',
        description: 'IPS, 60Hz, USB-C, HDR10',
        price: 1899.99,
        oldPrice: 2199.99,
        category: 'acessorio',
        image: 'monitor-4k.jpg',
        badge: '15% OFF',
        inStock: true
    },
    {
        id: 6,
        name: 'MacBook Air M2',
        description: 'Chip M2, 8GB RAM, 256GB SSD, Tela 13.3"',
        price: 7999.99,
        oldPrice: null,
        category: 'notebook',
        image: 'macbook-air.jpg',
        badge: 'LANÇAMENTO',
        inStock: true
    },
    {
        id: 7,
        name: 'Samsung Galaxy S23',
        description: '128GB, Câmera 50MP, Tela AMOLED 6.1"',
        price: 3499.99,
        oldPrice: 3799.99,
        category: 'smartphone',
        image: 'galaxy-s23.jpg',
        badge: '8% OFF',
        inStock: true
    },
    {
        id: 8,
        name: 'Headset Gamer 7.1',
        description: 'Som Surround, Microfone Noise Cancelling',
        price: 199.99,
        oldPrice: null,
        category: 'acessorio',
        image: 'headset-gamer.jpg',
        badge: null,
        inStock: false
    }
];

// Dados das Dicas do Especialista
const dicasData = [
    {
        id: 1,
        title: 'Como Evitar Superaquecimento do Notebook',
        description: 'Dicas essenciais para manter seu notebook funcionando na temperatura ideal e prolongar sua vida útil.',
        image: 'imagem/propaganda loja/dica-especialista-evitar-aquecimento-notebook.jpeg',
        content: 'O superaquecimento é um dos principais problemas que afetam notebooks. Para evitar este problema: 1) Mantenha as entradas de ar sempre limpas, 2) Use o notebook em superfícies rígidas e planas, 3) Evite obstruir as saídas de ventilação, 4) Faça limpeza regular do sistema de refrigeração.',
        tags: ['Notebook', 'Manutenção', 'Temperatura'],
        difficulty: 2,
        readTime: '3 min',
        category: 'Manutenção'
    },
    {
        id: 2,
        title: 'Importância do Carregador Original',
        description: 'Entenda por que usar o carregador original é fundamental para a segurança e durabilidade do seu equipamento.',
        image: 'imagem/propaganda loja/dica-especialista-carregador-original.jpeg',
        content: 'Usar carregadores não originais pode causar sérios danos ao seu equipamento. Carregadores falsificados não possuem os mesmos controles de qualidade e podem: 1) Fornecer voltagem incorreta, 2) Causar superaquecimento, 3) Danificar a bateria permanentemente, 4) Representar risco de incêndio.',
        tags: ['Segurança', 'Carregador', 'Bateria'],
        difficulty: 1,
        readTime: '2 min',
        category: 'Segurança'
    },
    {
        id: 3,
        title: 'Ventilação Adequada para Equipamentos',
        description: 'Como garantir ventilação adequada para seus equipamentos eletrônicos funcionarem perfeitamente.',
        image: 'imagem/propaganda loja/dica-ventilacaoadequada.jpeg',
        content: 'A ventilação adequada é crucial para o bom funcionamento dos equipamentos eletrônicos. Siga estas dicas: 1) Deixe pelo menos 15cm de espaço livre ao redor do equipamento, 2) Evite locais fechados sem circulação de ar, 3) Use suportes que elevem notebooks da superfície, 4) Considere ventiladores externos em ambientes muito quentes.',
        tags: ['Ventilação', 'Cuidados', 'Performance'],
        difficulty: 1,
        readTime: '3 min',
        category: 'Cuidados'
    },
    {
        id: 4,
        title: 'Limpeza Regular e Manutenção Preventiva',
        description: 'A importância da limpeza regular para manter seus equipamentos sempre funcionando como novos.',
        image: 'imagem/propaganda loja/dica-limpeza-regular-manutencao.jpeg',
        content: 'A manutenção preventiva é a chave para a longevidade dos equipamentos: 1) Faça limpeza externa semanalmente com pano seco, 2) Limpeza interna profissional a cada 6 meses, 3) Mantenha software sempre atualizado, 4) Faça backup regular dos dados importantes, 5) Monitore a temperatura do sistema regularmente.',
        tags: ['Limpeza', 'Manutenção', 'Preventiva'],
        difficulty: 2,
        readTime: '4 min',
        category: 'Manutenção'
    },
    {
        id: 5,
        title: 'Cuidados com Temperatura Ambiente',
        description: 'Como a temperatura do ambiente afeta seus equipamentos e o que fazer para protegê-los.',
        image: 'imagem/propaganda loja/dica-deolhona temperatura.jpeg',
        content: 'A temperatura ambiente tem impacto direto na performance e vida útil dos equipamentos: 1) Mantenha a temperatura entre 18°C e 24°C, 2) Evite exposição direta ao sol, 3) Use ar condicionado em dias muito quentes, 4) Monitore sinais de superaquecimento como lentidão ou desligamentos inesperados.',
        tags: ['Temperatura', 'Ambiente', 'Cuidados'],
        difficulty: 1,
        readTime: '2 min',
        category: 'Ambiente'
    },
    {
        id: 6,
        title: 'Evite Ambientes Quentes',
        description: 'Por que você deve evitar usar equipamentos eletrônicos em locais com temperatura elevada.',
        image: 'imagem/propaganda loja/dica-eviteambientesquentes.jpeg',
        content: 'Ambientes quentes são inimigos dos equipamentos eletrônicos: 1) Temperatura alta reduz performance do processador, 2) Acelera degradação da bateria, 3) Pode causar travamentos e instabilidade, 4) Em casos extremos, pode danificar componentes permanentemente. Sempre prefira ambientes climatizados.',
        tags: ['Temperatura', 'Performance', 'Segurança'],
        difficulty: 1,
        readTime: '2 min',
        category: 'Ambiente'
    },
    {
        id: 7,
        title: 'O que Fazer Quando PC/Notebook Molha',
        description: 'Procedimentos de emergência para quando seu equipamento entra em contato com líquidos.',
        image: 'imagem/propaganda loja/dica-pc-notebook-molhou.jpeg',
        content: 'Se seu equipamento molhou, aja rapidamente: 1) DESLIGUE IMEDIATAMENTE o equipamento, 2) Remova a bateria se possível, 3) Seque externamente com pano absorvente, 4) Deixe secar em local arejado por pelo menos 48h, 5) NÃO LIGUE antes de ter certeza que está completamente seco, 6) Procure assistência técnica especializada.',
        tags: ['Emergência', 'Líquidos', 'Primeiros Socorros'],
        difficulty: 3,
        readTime: '4 min',
        category: 'Emergência'
    },
    {
        id: 8,
        title: 'Proteja Seu Equipamento',
        description: 'Medidas essenciais de proteção para manter seus equipamentos seguros e funcionando por mais tempo.',
        image: 'imagem/propaganda loja/dica-proteja-seubem.jpeg',
        content: 'Proteger seus equipamentos é investir no futuro: 1) Use capas e cases de qualidade, 2) Instale antivírus confiável, 3) Faça backups regulares, 4) Evite downloads de fontes duvidosas, 5) Mantenha sistema operacional atualizado, 6) Use estabilizadores ou nobreaks, 7) Transporte com cuidado.',
        tags: ['Proteção', 'Segurança', 'Cuidados'],
        difficulty: 2,
        readTime: '5 min',
        category: 'Proteção'
    },
    {
        id: 9,
        title: 'Quando Levar para Assistência Técnica',
        description: 'Saiba identificar os sinais de que é hora de procurar ajuda profissional especializada.',
        image: 'imagem/propaganda loja/dica-leveparassistencia.jpeg',
        content: 'Procure assistência técnica quando: 1) Equipamento apresenta travamentos frequentes, 2) Superaquecimento constante, 3) Ruídos estranhos no funcionamento, 4) Tela com problemas de imagem, 5) Bateria não carrega ou descarrega muito rápido, 6) Lentidão extrema mesmo após limpeza de software, 7) Qualquer dano físico visível.',
        tags: ['Assistência', 'Diagnóstico', 'Profissional'],
        difficulty: 1,
        readTime: '3 min',
        category: 'Assistência'
    }
];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    state.products = productsData;
    state.filteredProducts = productsData;
    state.dicas = dicasData;
    
    setupResponsiveDicas();
    setupEventListeners();
    renderProducts();
    renderDicas();
    updateCartCount();
    setupScrollEffects();
    setupMobileMenu();
    setupHeroVideo();
    initializeGallery();
    initializeBackToTop();
}

// Função para configurar dicas responsivas
function setupResponsiveDicas() {
    function updateDicasPerPage() {
        const screenWidth = window.innerWidth;
        let newDicasPerPage;
        let newScreenSize;
        
        if (screenWidth <= 480) {
            // Mobile pequeno - 1 dica
            newDicasPerPage = 1;
            newScreenSize = 'mobile-small';
        } else if (screenWidth <= 768) {
            // Mobile/Tablet - 2 dicas
            newDicasPerPage = 2;
            newScreenSize = 'mobile';
        } else if (screenWidth <= 1024) {
            // Tablet grande - 2 dicas
            newDicasPerPage = 2;
            newScreenSize = 'tablet';
        } else if (screenWidth <= 1366) {
            // Desktop pequeno - 3 dicas
            newDicasPerPage = 3;
            newScreenSize = 'desktop';
        } else {
            // Desktop grande - 3 dicas
            newDicasPerPage = 3;
            newScreenSize = 'desktop-large';
        }
        
        // Só atualiza se mudou
        if (newDicasPerPage !== state.dicasPerPage || newScreenSize !== state.currentScreenSize) {
            state.dicasPerPage = newDicasPerPage;
            state.currentScreenSize = newScreenSize;
            
            // Ajustar página atual para não ultrapassar os limites
            const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
            if (state.currentDicaPage >= totalPages) {
                state.currentDicaPage = Math.max(0, totalPages - 1);
            }
            
            // Re-renderizar dicas se já foram carregadas
            if (state.dicas.length > 0) {
                renderDicas();
            }
        }
    }
    
    // Executar na inicialização
    updateDicasPerPage();
    
    // Escutar mudanças na tela
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateDicasPerPage, 250);
    });
}

// Event Listeners
function setupEventListeners() {
    // Filtros de produtos
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Carrinho
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }
    
    const closeCart = document.getElementById('closeCart');
    if (closeCart) {
        closeCart.addEventListener('click', closeCartModal);
    }
    
    // Formulário de contato
    const contatoForm = document.getElementById('contatoForm');
    if (contatoForm) {
        contatoForm.addEventListener('submit', handleContactForm);
    }
    
    // Navegação das dicas
    const prevDica = document.getElementById('prevDica');
    const nextDica = document.getElementById('nextDica');
    if (prevDica) prevDica.addEventListener('click', () => changeDicaPage(-1));
    if (nextDica) nextDica.addEventListener('click', () => changeDicaPage(1));
    
    // Navegação suave
    const navLinks = document.querySelectorAll('.nav-link, .btn');
    navLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cartModal');
        if (event.target === modal) {
            closeCartModal();
        }
    });
}

// Manipulação de produtos
function renderProducts() {
    const grid = document.getElementById('produtosGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    state.filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.dataset.category = product.category;
    
    const badgeHtml = product.badge ? 
        `<div class="produto-badge">${product.badge}</div>` : '';
    
    const oldPriceHtml = product.oldPrice ? 
        `<span class="price-old">R$ ${formatPrice(product.oldPrice)}</span>` : '';
    
    const stockClass = product.inStock ? '' : 'out-of-stock';
    const stockText = product.inStock ? 'Adicionar ao Carrinho' : 'Fora de Estoque';
    
    card.innerHTML = `
        <div class="produto-image">
            <i class="fas fa-laptop"></i>
            ${badgeHtml}
        </div>
        <div class="produto-info">
            <h3 class="produto-title">${product.name}</h3>
            <p class="produto-description">${product.description}</p>
            <div class="produto-price">
                ${oldPriceHtml}
                <span class="price-current">R$ ${formatPrice(product.price)}</span>
            </div>
            <div class="produto-actions">
                <button class="btn btn-small btn-cart ${stockClass}" 
                        onclick="addToCart(${product.id})"
                        ${!product.inStock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${stockText}
                </button>
                <button class="btn btn-small btn-favorite" onclick="toggleFavorite(${product.id})">
                    <i class="far fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function formatPrice(price) {
    return price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Filtros
function handleFilterClick(event) {
    const filter = event.target.dataset.filter;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filtrar produtos
    filterProducts(filter);
}

function filterProducts(filter) {
    state.currentFilter = filter;
    
    if (filter === 'all') {
        state.filteredProducts = state.products;
    } else {
        state.filteredProducts = state.products.filter(product => 
            product.category === filter
        );
    }
    
    renderProducts();
    animateProductCards();
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filterProducts(state.currentFilter);
        return;
    }
    
    state.filteredProducts = state.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    renderProducts();
    animateProductCards();
}

function animateProductCards() {
    const cards = document.querySelectorAll('.produto-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Carrinho de compras
function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !product.inStock) return;
    
    const existingItem = state.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartCount();
    showCartNotification(product.name);
    saveCartToStorage();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCartItems();
    saveCartToStorage();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = state.cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartCount();
        renderCartItems();
        saveCartToStorage();
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'block';
        renderCartItems();
    }
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (state.cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Seu carrinho está vazio</p>';
        cartTotal.textContent = 'Total: R$ 0,00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    state.cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
        `;
        
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemElement.innerHTML = `
            <div style="flex: 1;">
                <h4 style="margin-bottom: 0.5rem;">${item.name}</h4>
                <p style="color: #666; font-size: 0.875rem;">R$ ${formatPrice(item.price)} cada</p>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" 
                            style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" 
                            style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                </div>
                <span style="font-weight: 600; min-width: 80px; text-align: right;">R$ ${formatPrice(itemTotal)}</span>
                <button onclick="removeFromCart(${item.id})" 
                        style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 1.25rem;">×</button>
            </div>
        `;
        
        cartItems.appendChild(itemElement);
    });
    
    cartTotal.textContent = `Total: R$ ${formatPrice(total)}`;
}

function showCartNotification(productName) {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.textContent = `${productName} foi adicionado ao carrinho!`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function toggleFavorite(productId) {
    const button = event.target.closest('.btn-favorite');
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        button.style.background = '#ef4444';
        button.style.color = 'white';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        button.style.background = '#e2e8f0';
        button.style.color = '#64748b';
    }
}

// Armazenamento local
function saveCartToStorage() {
    localStorage.setItem('techstore_cart', JSON.stringify(state.cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('techstore_cart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Formulário de contato
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const mensagem = document.getElementById('mensagem').value;
    
    // Validação básica
    if (!nome || !email || !mensagem) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Simular envio
    showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
    event.target.reset();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#2563eb'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1001;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Navegação suave
function handleSmoothScroll(event) {
    const href = event.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
        event.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Efeitos de scroll
function setupScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header shrink effect
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.category-card, .produto-card, .servico-card').forEach(el => {
        observer.observe(el);
    });
}

// Menu mobile
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
}

// Setup do vídeo hero
function setupHeroVideo() {
    const video = document.querySelector('.hero-video video');
    if (video) {
        // Garantir que o vídeo seja reproduzido
        video.addEventListener('loadeddata', function() {
            video.play().catch(function(error) {
                console.log('Erro ao reproduzir vídeo:', error);
            });
        });
        
        // Pausar/reproduzir vídeo quando a seção não estiver visível (performance)
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(e => console.log('Erro ao reproduzir:', e));
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(document.querySelector('.hero'));
        
        // Controle de volume e loop
        video.volume = 0;
        video.loop = true;
        video.muted = true;
        
        // Fallback para dispositivos que não suportam autoplay
        setTimeout(() => {
            if (video.paused) {
                video.play().catch(e => console.log('Autoplay não suportado'));
            }
        }, 1000);
    }
}

// Gerenciamento das Dicas do Especialista
function renderDicas() {
    const grid = document.getElementById('dicasGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const startIndex = state.currentDicaPage * state.dicasPerPage;
    const endIndex = startIndex + state.dicasPerPage;
    const dicasToShow = state.dicas.slice(startIndex, endIndex);
    
    dicasToShow.forEach(dica => {
        const dicaCard = createDicaCard(dica);
        grid.appendChild(dicaCard);
    });
    
    updateDicaNavigation();
    createDicaDots();
}

function createDicaCard(dica) {
    const card = document.createElement('div');
    card.className = 'dica-card';
    card.onclick = () => openDicaModal(dica);
    
    const difficultyStars = createDifficultyStars(dica.difficulty);
    
    card.innerHTML = `
        <div class="dica-image">
            <img src="${dica.image}" alt="${dica.title}" loading="lazy">
            <div class="dica-badge">${dica.category}</div>
        </div>
        <div class="dica-content">
            <h3 class="dica-title">${dica.title}</h3>
            <p class="dica-description">${dica.description}</p>
            <div class="dica-tags">
                ${dica.tags.map(tag => `<span class="dica-tag">${tag}</span>`).join('')}
            </div>
            <div class="dica-footer">
                <div class="dica-difficulty">
                    <span>Dificuldade:</span>
                    <div class="difficulty-stars">${difficultyStars}</div>
                </div>
                <div class="dica-read-time">
                    <i class="fas fa-clock"></i> ${dica.readTime}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function createDifficultyStars(difficulty) {
    let stars = '';
    for (let i = 1; i <= 3; i++) {
        if (i <= difficulty) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function changeDicaPage(direction) {
    const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
    const newPage = state.currentDicaPage + direction;
    
    if (newPage >= 0 && newPage < totalPages) {
        state.currentDicaPage = newPage;
        renderDicas();
    }
}

function updateDicaNavigation() {
    const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
    const prevBtn = document.getElementById('prevDica');
    const nextBtn = document.getElementById('nextDica');
    
    if (prevBtn) {
        prevBtn.disabled = state.currentDicaPage === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = state.currentDicaPage === totalPages - 1;
    }
}

function createDicaDots() {
    const dotsContainer = document.getElementById('dicasDots');
    if (!dotsContainer) return;
    
    const totalPages = Math.ceil(state.dicas.length / state.dicasPerPage);
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = `dica-dot ${i === state.currentDicaPage ? 'active' : ''}`;
        dot.onclick = () => goToDicaPage(i);
        dotsContainer.appendChild(dot);
    }
}

function goToDicaPage(page) {
    state.currentDicaPage = page;
    renderDicas();
}

// Variável para armazenar a posição do scroll
let scrollPosition = 0;

function openDicaModal(dica) {
    // Salvar posição atual do scroll
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Criar modal se não existir
    let modal = document.getElementById('dicaModal');
    if (!modal) {
        modal = createDicaModal();
        document.body.appendChild(modal);
    }
    
    // Preencher conteúdo do modal
    const modalImg = modal.querySelector('.dica-modal-header img');
    const modalTitle = modal.querySelector('.dica-modal-title');
    const modalCategory = modal.querySelector('.dica-modal-category');
    const modalDifficulty = modal.querySelector('.dica-modal-difficulty');
    const modalReadTime = modal.querySelector('.dica-modal-read-time');
    const modalTags = modal.querySelector('.dica-modal-tags');
    const modalContent = modal.querySelector('.dica-modal-text');
    
    if (modalImg) modalImg.src = dica.image;
    if (modalTitle) modalTitle.textContent = dica.title;
    if (modalCategory) modalCategory.textContent = dica.category;
    if (modalDifficulty) modalDifficulty.innerHTML = createDifficultyStars(dica.difficulty);
    if (modalReadTime) modalReadTime.textContent = dica.readTime;
    if (modalTags) modalTags.innerHTML = dica.tags.map(tag => `<span class="dica-tag">${tag}</span>`).join('');
    if (modalContent) modalContent.textContent = dica.content;
    
    // Prevenir scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    
    modal.style.display = 'block';
}

function closeDicaModal() {
    const modal = document.getElementById('dicaModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restaurar posição do scroll
        window.scrollTo(0, scrollPosition);
    }
}

function createDicaModal() {
    const modal = document.createElement('div');
    modal.id = 'dicaModal';
    modal.className = 'dica-modal';
    
    modal.innerHTML = `
        <div class="dica-modal-content">
            <div class="dica-modal-header">
                <img src="" alt="">
                <button class="dica-modal-close">&times;</button>
            </div>
            <div class="dica-modal-body">
                <h2 class="dica-modal-title"></h2>
                <div class="dica-modal-meta">
                    <div class="dica-modal-category"></div>
                    <div class="dica-modal-difficulty"></div>
                    <div class="dica-modal-read-time"></div>
                </div>
                <div class="dica-modal-tags"></div>
                <div class="dica-modal-text"></div>
            </div>
        </div>
    `;
    
    // Event listeners para fechar modal
    const closeBtn = modal.querySelector('.dica-modal-close');
    closeBtn.onclick = () => closeDicaModal();
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeDicaModal();
        }
    };
    
    // Adicionar listener para tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeDicaModal();
        }
    });
    
    return modal;
}

// Inicializar carrinho do localStorage ao carregar
window.addEventListener('load', function() {
    loadCartFromStorage();
    registerServiceWorker();
});

// Registrar Service Worker para PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Tech10 PWA: Service Worker registrado:', registration.scope);
                
                // Verificar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('Nova versão disponível! Recarregue a página.', 'info');
                        }
                    });
                });
            })
            .catch(error => {
                console.error('❌ Tech10 PWA: Erro ao registrar Service Worker:', error);
            });
    }
}

// Adicionar estilos CSS dinamicamente para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .header.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .header {
        transition: transform 0.3s ease, background 0.3s ease;
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .out-of-stock {
        background: #9ca3af !important;
        cursor: not-allowed !important;
    }
`;

document.head.appendChild(style);

// Gallery functionality for About section
let currentGallerySlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    slides[currentGallerySlide].classList.remove('active');
    dots[currentGallerySlide].classList.remove('active');
    
    // Calculate new slide index
    currentGallerySlide += direction;
    
    if (currentGallerySlide >= slides.length) {
        currentGallerySlide = 0;
    } else if (currentGallerySlide < 0) {
        currentGallerySlide = slides.length - 1;
    }
    
    // Add active class to new slide and dot
    slides[currentGallerySlide].classList.add('active');
    dots[currentGallerySlide].classList.add('active');
}

function currentSlide(slideIndex) {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    slides[currentGallerySlide].classList.remove('active');
    dots[currentGallerySlide].classList.remove('active');
    
    // Set new slide index (convert from 1-based to 0-based)
    currentGallerySlide = slideIndex - 1;
    
    // Add active class to new slide and dot
    slides[currentGallerySlide].classList.add('active');
    dots[currentGallerySlide].classList.add('active');
}

function initializeGallery() {
    const gallery = document.getElementById('lojaGallery');
    
    if (!gallery) return;
    
    // Auto-rotate gallery every 5 seconds
    setInterval(() => {
        changeSlide(1);
    }, 5000);
    
    console.log('📸 Galeria da loja inicializada!');
}

// Back to Top functionality
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    console.log('🔝 Botão Voltar ao Topo inicializado!');
}