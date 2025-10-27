# TechStore - Site da Loja de Informática

Uma página web moderna e responsiva para loja de informática, desenvolvida com HTML5, CSS3 e JavaScript vanilla.

## 🚀 Características

#### ✨ **Design Profissional:**
- Layout moderno com cores azul e cinza
- **Vídeo de fundo** na seção principal (hero section)
- Totalmente responsivo (desktop, tablet, mobile)
- Animações suaves e efeitos visuais
- Tipografia profissional (Google Fonts)

### Funcionalidades

#### 🛒 E-commerce
- Catálogo de produtos interativo
- Carrinho de compras funcional
- Filtros por categoria (Notebooks, Desktops, Smartphones, Acessórios)
- Sistema de busca em tempo real
- Gerenciamento de quantidade de produtos
- Persistência do carrinho no localStorage

#### 📱 Interface
- Header fixo com navegação suave
- Menu mobile responsivo
- Modal do carrinho de compras
- Formulário de contato funcional
- Sistema de notificações

#### 🎨 Experiência do Usuário
- Navegação suave entre seções
- Efeitos de scroll personalizados
- Cards de produtos animados
- Sistema de favoritos
- Feedback visual para todas as ações

## 📁 Estrutura do Projeto

```
Site Loja/
├── index.html          # Página principal
├── css/
│   └── styles.css     # Estilos responsivos
├── js/
│   └── script.js      # Funcionalidades JavaScript
└── imagem/            # Pasta de imagens existente
    ├── favico/        # Ícones do site
    ├── imagens tecnologia/
    └── propaganda loja/
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica moderna
- **CSS3**: 
  - Flexbox e Grid Layout
  - Custom Properties (variáveis CSS)
  - Animações e transições
  - Media queries para responsividade
- **JavaScript ES6+**:
  - Módulos e arrow functions
  - Local Storage API
  - Intersection Observer API
  - Event delegation

## 🎯 Seções da Página

### 1. Header
- Logo da empresa
- Menu de navegação
- Barra de busca
- Ícone do carrinho com contador

### 2. Hero Section
- **Vídeo de fundo** profissional e impactante
- Apresentação principal com overlay
- Call-to-action buttons
- Animações de ícones flutuantes
- Reprodução automática com controles inteligentes

### 3. Categorias
- 6 categorias principais
- Cards interativos com hover effects

### 4. Produtos
- Grid responsivo de produtos
- Filtros por categoria
- Sistema de busca
- Cards com informações completas

### 5. Serviços
- Manutenção, Montagem e Suporte
- Listas de benefícios
- Design profissional

### 6. Dicas do Especialista
- **9 dicas técnicas** com imagens reais
- **Sistema de navegação** com dots e setas
- **Modal expandido** para leitura completa
- **Categorização** por tipo de dica
- **Níveis de dificuldade** com estrelas
- **Tags** para fácil identificação
- **Tempo de leitura** estimado

### 7. Sobre Nós
- História da empresa
- Estatísticas impressionantes
- Layout em duas colunas

### 8. Contato
- Informações completas
- Formulário funcional
- Validação de campos

### 9. Footer
- Links organizados
- Redes sociais
- Informações de contato

## 🚀 Como Usar

1. **Abrir o Site**:
   - Abra o arquivo `index.html` em qualquer navegador moderno
   - Ou use um servidor local para melhor experiência

2. **Navegar pelos Produtos**:
   - Use os filtros para encontrar produtos específicos
   - Use a barra de busca para pesquisar
   - Clique nos produtos para ver detalhes

3. **Gerenciar Carrinho**:
   - Adicione produtos clicando em "Adicionar ao Carrinho"
   - Clique no ícone do carrinho para ver itens
   - Modifique quantidades ou remova itens

4. **Entrar em Contato**:
   - Preencha o formulário na seção de contato
   - Todas as informações de contato estão disponíveis

## 🎨 Personalização

### Cores
As cores principais estão definidas como variáveis CSS no arquivo `styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --accent-color: #f59e0b;
    /* ... outras cores */
}
```

### Produtos
Para adicionar/modificar produtos, edite o array `productsData` no arquivo `script.js`:
```javascript
const productsData = [
    {
        id: 1,
        name: 'Nome do Produto',
        description: 'Descrição detalhada',
        price: 999.99,
        category: 'notebook',
        // ... outras propriedades
    }
];
```

### Informações da Empresa
- Edite as informações de contato no HTML
- Modifique textos da seção "Sobre"
- Atualize links das redes sociais

## 📱 Responsividade

O site é totalmente responsivo com breakpoints para:
- **Desktop**: > 768px
- **Tablet**: 768px - 480px  
- **Mobile**: < 480px

## 🔧 Funcionalidades Técnicas

### JavaScript
- **Estado Global**: Gerenciamento centralizado do estado da aplicação
- **Event Delegation**: Manipulação eficiente de eventos
- **Local Storage**: Persistência do carrinho entre sessões
- **Intersection Observer**: Animações baseadas em scroll
- **Debouncing**: Otimização da busca em tempo real

### CSS
- **CSS Grid & Flexbox**: Layouts modernos e flexíveis
- **Custom Properties**: Variáveis CSS para fácil manutenção
- **Animações**: Keyframes e transições suaves
- **Media Queries**: Design responsivo

## 🎯 Melhorias Futuras

- Integração com gateway de pagamento
- Sistema de avaliações de produtos
- Chat online
- Painel administrativo
- Integração com API de produtos
- Sistema de cupons de desconto
- Newsletter
- Blog integrado

## 📞 Suporte

Para dúvidas ou sugestões sobre o site:
- Email: contato@techstore.com
- Telefone: (11) 99999-9999

---

**Desenvolvido com ❤️ para sua loja de informática**