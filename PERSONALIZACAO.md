# 🏪 COMO PERSONALIZAR SEU SITE COM OS DADOS DA SUA EMPRESA

## 📋 Instruções Rápidas

Para personalizar o site com os dados da sua empresa, edite apenas o arquivo:
**`js/empresa-config.js`**

## ✏️ O QUE EDITAR:

### 1. INFORMAÇÕES BÁSICAS
```javascript
nome: "SUA EMPRESA AQUI", // Nome da sua loja
slogan: "Seu slogan aqui", // Frase principal do hero
descricao: "Descrição da sua empresa", // Aparece no footer
```

### 2. CONTATO
```javascript
telefone: "(11) 99999-9999", // Seu telefone
whatsapp: "5511999999999", // WhatsApp no formato: 55 + DDD + número
email: "seuemail@empresa.com", // Seu email
```

### 3. ENDEREÇO
```javascript
endereco: {
    rua: "Sua Rua, 123",
    bairro: "Seu Bairro", 
    cidade: "Sua Cidade",
    estado: "SP", // Sigla do estado
    cep: "00000-000"
},
```

### 4. HORÁRIOS
```javascript
horarios: {
    semana: "Segunda a Sexta: 8h às 18h",
    sabado: "Sábado: 9h às 17h", 
    domingo: "Domingo: Fechado"
},
```

### 5. REDES SOCIAIS
```javascript
social: {
    facebook: "https://facebook.com/suaempresa",
    instagram: "https://instagram.com/suaempresa", 
    twitter: "https://twitter.com/suaempresa",
    whatsappLink: "https://wa.me/5511999999999", // Link do WhatsApp
    tiktok: "", // Deixe vazio se não tiver
    youtube: "" // Deixe vazio se não tiver
},
```

### 6. ESTATÍSTICAS (Seção "Sobre")
```javascript
stats: {
    anosExperiencia: "15+", // Anos da sua empresa
    clientesSatisfeitos: "3000+", // Número de clientes
    produtosDisponiveis: "800+" // Produtos que vendem
},
```

### 7. SOBRE A EMPRESA
```javascript
sobre: {
    historia: "Conte a história da sua empresa aqui...",
    missao: "Descreva a missão da sua empresa..."
},
```

### 8. SEO (Otimização para Google)
```javascript
seo: {
    titulo: "Nome da Empresa - Informática",
    descricao: "Descrição para aparecer no Google"
}
```

## 🚀 COMO USAR:

1. **Abra o arquivo**: `js/empresa-config.js`
2. **Edite os valores** entre aspas com seus dados reais
3. **Salve o arquivo**
4. **Atualize a página** no navegador

## ✅ EXEMPLO PRÁTICO:

Se sua empresa se chama "TechMaster", está localizada em São Paulo e o telefone é (11) 98765-4321:

```javascript
nome: "TechMaster",
telefone: "(11) 98765-4321",
whatsapp: "5511987654321",
email: "contato@techmaster.com.br",
endereco: {
    rua: "Av. Paulista, 1000",
    bairro: "Bela Vista",
    cidade: "São Paulo", 
    estado: "SP",
    cep: "01310-100"
},
```

## ⚠️ DICAS IMPORTANTES:

- **WhatsApp**: Use o formato completo: 55 + código da cidade + número
- **Redes Sociais**: Cole o link completo (https://...)
- **Aspas**: Sempre mantenha as aspas nos textos
- **Vírgulas**: Não esqueça das vírgulas no final de cada linha
- **Links vazios**: Use `""` (aspas vazias) se não tiver a rede social

## 📱 WHATSAPP:

Para o WhatsApp funcionar corretamente:
- **whatsapp**: `"5511987654321"` (para o sistema)
- **whatsappLink**: `"https://wa.me/5511987654321"` (para o link)

## 🔄 ATUALIZAÇÕES AUTOMÁTICAS:

Depois de editar o arquivo, as seguintes seções são atualizadas automaticamente:
- ✅ Logo/Nome da empresa
- ✅ Título da página (aba do navegador)
- ✅ Seção Hero (título principal)
- ✅ Informações de contato
- ✅ Endereço completo
- ✅ Horários de funcionamento
- ✅ Links das redes sociais
- ✅ Estatísticas na seção "Sobre"
- ✅ Textos sobre a empresa
- ✅ Copyright no footer

## 🆘 PROBLEMAS?

Se algo não estiver funcionando:
1. Verifique se salvou o arquivo `empresa-config.js`
2. Atualize a página (F5 ou Ctrl+F5)
3. Verifique se não removeu aspas ou vírgulas por engano
4. Abra o console do navegador (F12) para ver erros

---

**🎯 Resultado**: Após editar o arquivo, todo o site será personalizado automaticamente com os dados da sua empresa!