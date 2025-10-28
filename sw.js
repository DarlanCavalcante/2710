// Service Worker para Tech10 PWA
const CACHE_NAME = 'tech10-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/script.js',
  '/js/empresa-config.js',
  '/manifest.json',
  // Imagens críticas
  '/imagem/favico/favicon.ico',
  '/imagem/propaganda loja/foto-loja1.jpeg',
  '/imagem/propaganda loja/foto-loja2.jpeg',
  // CDNs
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('🚀 Tech10 SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Tech10 SW: Armazenando arquivos em cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Tech10 SW: Cache criado com sucesso');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('🔄 Tech10 SW: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Tech10 SW: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Tech10 SW: Ativado com sucesso');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições (Strategy: Cache First)
self.addEventListener('fetch', event => {
  // Apenas interceptar requisições GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requisições de chrome-extension e outras não HTTP
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna da cache
        if (response) {
          console.log('📦 Tech10 SW: Servindo do cache:', event.request.url);
          return response;
        }

        // Cache miss - busca na rede
        console.log('🌐 Tech10 SW: Buscando na rede:', event.request.url);
        return fetch(event.request).then(response => {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta para armazenar no cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // Cache apenas recursos da mesma origem ou CDNs conhecidos
              if (event.request.url.startsWith(self.location.origin) || 
                  event.request.url.includes('cdnjs.cloudflare.com') ||
                  event.request.url.includes('fonts.googleapis.com')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // Rede indisponível - retorna página offline se for navegação
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Notificações Push (para futuras implementações)
self.addEventListener('push', event => {
  console.log('📢 Tech10 SW: Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova promoção disponível!',
    icon: '/imagem/favico/favicon.ico',
    badge: '/imagem/favico/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Produtos',
        icon: '/imagem/favico/favicon.ico'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/imagem/favico/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Tech10 Informática', options)
  );
});

// Click em notificações
self.addEventListener('notificationclick', event => {
  console.log('🖱️ Tech10 SW: Notificação clicada:', event.notification.tag);
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#produtos')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
  } else {
    // Click na notificação principal
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync em background (para formulários offline)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Tech10 SW: Sincronização em background');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronização de dados offline
  console.log('📊 Tech10 SW: Executando sincronização...');
}