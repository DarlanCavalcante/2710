const NodeCache = require('node-cache');

class CacheManager {
    constructor() {
        // Cache principal com TTL de 5 minutos
        this.cache = new NodeCache({ 
            stdTTL: 300, // 5 minutos
            checkperiod: 60, // Verifica por chaves expiradas a cada minuto
            useClones: false // Melhor performance
        });

        // Cache para consultas de produtos (TTL maior)
        this.productCache = new NodeCache({ 
            stdTTL: 600, // 10 minutos
            checkperiod: 120
        });

        // Cache para configurações (TTL muito alto)
        this.settingsCache = new NodeCache({ 
            stdTTL: 1800, // 30 minutos
            checkperiod: 300
        });

        // Estatísticas de cache
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Log de eventos importantes
        this.cache.on('set', (key, value) => {
            this.stats.sets++;
            console.log(`[CACHE] SET: ${key}`);
        });

        this.cache.on('del', (key, value) => {
            this.stats.deletes++;
            console.log(`[CACHE] DELETE: ${key}`);
        });

        this.cache.on('expired', (key, value) => {
            console.log(`[CACHE] EXPIRED: ${key}`);
        });
    }

    // Método genérico para get
    get(key, cacheType = 'default') {
        const cache = this.getCache(cacheType);
        const value = cache.get(key);
        
        if (value !== undefined) {
            this.stats.hits++;
            console.log(`[CACHE] HIT: ${key}`);
            return value;
        } else {
            this.stats.misses++;
            console.log(`[CACHE] MISS: ${key}`);
            return null;
        }
    }

    // Método genérico para set
    set(key, value, ttl = null, cacheType = 'default') {
        const cache = this.getCache(cacheType);
        
        if (ttl) {
            return cache.set(key, value, ttl);
        } else {
            return cache.set(key, value);
        }
    }

    // Método genérico para delete
    del(key, cacheType = 'default') {
        const cache = this.getCache(cacheType);
        return cache.del(key);
    }

    // Método para invalidar padrões
    invalidatePattern(pattern) {
        const keys = this.cache.keys();
        const keysToDelete = keys.filter(key => key.includes(pattern));
        
        keysToDelete.forEach(key => {
            this.cache.del(key);
        });

        console.log(`[CACHE] Invalidated ${keysToDelete.length} keys matching pattern: ${pattern}`);
        return keysToDelete.length;
    }

    // Método para invalidar cache de produtos
    invalidateProducts() {
        this.productCache.flushAll();
        this.invalidatePattern('products');
        this.invalidatePattern('categories'); // Categorias podem afetar produtos
        console.log('[CACHE] Invalidated all product-related cache');
    }

    // Método para invalidar cache de configurações
    invalidateSettings() {
        this.settingsCache.flushAll();
        this.invalidatePattern('settings');
        console.log('[CACHE] Invalidated all settings cache');
    }

    // Obter cache apropriado
    getCache(type) {
        switch (type) {
            case 'products':
                return this.productCache;
            case 'settings':
                return this.settingsCache;
            default:
                return this.cache;
        }
    }

    // Estatísticas do cache
    getStats() {
        const defaultStats = this.cache.getStats();
        const productStats = this.productCache.getStats();
        const settingsStats = this.settingsCache.getStats();

        return {
            ...this.stats,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100 || 0,
            caches: {
                default: {
                    keys: defaultStats.keys,
                    hits: defaultStats.hits,
                    misses: defaultStats.misses,
                    ksize: defaultStats.ksize,
                    vsize: defaultStats.vsize
                },
                products: {
                    keys: productStats.keys,
                    hits: productStats.hits,
                    misses: productStats.misses,
                    ksize: productStats.ksize,
                    vsize: productStats.vsize
                },
                settings: {
                    keys: settingsStats.keys,
                    hits: settingsStats.hits,
                    misses: settingsStats.misses,
                    ksize: settingsStats.ksize,
                    vsize: settingsStats.vsize
                }
            }
        };
    }

    // Limpar todos os caches
    flushAll() {
        this.cache.flushAll();
        this.productCache.flushAll();
        this.settingsCache.flushAll();
        console.log('[CACHE] All caches flushed');
    }

    // Middleware Express para cache automático
    middleware(options = {}) {
        const {
            ttl = 300,
            cacheType = 'default',
            keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
            skipCache = () => false
        } = options;

        return (req, res, next) => {
            // Pular cache se especificado
            if (skipCache(req)) {
                return next();
            }

            const key = keyGenerator(req);
            const cachedResponse = this.get(key, cacheType);

            if (cachedResponse) {
                console.log(`[CACHE] Serving cached response for: ${key}`);
                return res.json(cachedResponse);
            }

            // Interceptar a resposta para armazenar no cache
            const originalJson = res.json;
            res.json = (data) => {
                // Só armazenar respostas de sucesso
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    this.set(key, data, ttl, cacheType);
                }
                return originalJson.call(res, data);
            };

            next();
        };
    }
}

// Singleton
const cacheManager = new CacheManager();

module.exports = cacheManager;