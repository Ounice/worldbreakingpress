// Système d'optimisation des publicités Google
const adOptimization = {
    config: {
        // Configuration générale
        enabled: true,
        debug: false,
        
        // Emplacements publicitaires
        adSlots: {
            top: {
                id: 'div-gpt-ad-top',
                sizes: [[728, 90], [970, 90], [970, 250]],
                responsive: true,
                refresh: 30, // secondes
            },
            sidebar: {
                id: 'div-gpt-ad-sidebar',
                sizes: [[300, 600], [300, 250]],
                sticky: true,
                refresh: 45,
            },
            inArticle: {
                id: 'div-gpt-ad-in-article',
                sizes: [[728, 90], [300, 250]],
                responsive: true,
                refresh: 30,
            },
            footer: {
                id: 'div-gpt-ad-footer',
                sizes: [[728, 90], [970, 90]],
                responsive: true,
                refresh: 45,
            },
            mobile: {
                id: 'div-gpt-ad-mobile',
                sizes: [[300, 250], [320, 50]],
                responsive: true,
                refresh: 30,
            }
        },

        // Optimisation
        optimization: {
            lazy: true,           // Chargement paresseux
            refresh: true,        // Actualisation automatique
            viewability: true,    // Optimisation de la visibilité
            performance: true,    // Optimisation des performances
            responsive: true      // Design responsive
        },

        // Ciblage
        targeting: {
            contextual: true,     // Ciblage contextuel
            behavioral: true,     // Ciblage comportemental
            demographic: true,    // Ciblage démographique
            custom: true          // Ciblage personnalisé
        },

        // Analytics
        analytics: {
            enabled: true,
            viewability: true,
            revenue: true,
            performance: true
        }
    },

    // État du système
    state: {
        slots: {},
        viewability: {},
        revenue: {},
        performance: {}
    },

    // Initialisation
    init: function() {
        if (!this.config.enabled) return;

        this.setupGoogleTag();
        this.defineAdSlots();
        this.setupLazyLoading();
        this.setupRefresh();
        this.setupViewability();
        this.setupAnalytics();
        this.optimizePerformance();
    },

    // Configure Google Tag
    setupGoogleTag: function() {
        window.googletag = window.googletag || {cmd: []};
        
        googletag.cmd.push(() => {
            // Configuration globale
            googletag.pubads().enableSingleRequest();
            googletag.pubads().collapseEmptyDivs();
            googletag.pubads().setCentering(true);
            
            // Active le mode SRA (Single Request Architecture)
            googletag.pubads().disableInitialLoad();
            
            // Configure le ciblage
            this.setupTargeting();
            
            // Initialise les services
            googletag.enableServices();
        });
    },

    // Définit les emplacements publicitaires
    defineAdSlots: function() {
        googletag.cmd.push(() => {
            // Parcourt tous les emplacements configurés
            Object.entries(this.config.adSlots).forEach(([position, config]) => {
                // Crée l'emplacement
                const slot = googletag.defineSlot(
                    '/21735472839/' + position,
                    config.sizes,
                    config.id
                );

                if (slot) {
                    // Configure le responsive
                    if (config.responsive) {
                        this.setupResponsiveAd(slot, config);
                    }

                    // Ajoute le ciblage
                    this.addSlotTargeting(slot, position);

                    // Enregistre les événements
                    this.setupSlotEvents(slot, position);

                    // Enregistre l'emplacement
                    slot.addService(googletag.pubads());
                    this.state.slots[position] = slot;
                }
            });
        });
    },

    // Configure le chargement paresseux
    setupLazyLoading: function() {
        if (!this.config.optimization.lazy) return;

        // Crée l'observateur d'intersection
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const slotId = entry.target.id;
                        const position = this.getPositionFromId(slotId);
                        
                        if (position && this.state.slots[position]) {
                            googletag.cmd.push(() => {
                                googletag.display(slotId);
                                googletag.pubads().refresh([this.state.slots[position]]);
                            });
                            
                            // Arrête d'observer une fois chargé
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        // Observe tous les emplacements
        Object.values(this.config.adSlots).forEach(config => {
            const element = document.getElementById(config.id);
            if (element) {
                observer.observe(element);
            }
        });
    },

    // Configure l'actualisation automatique
    setupRefresh: function() {
        if (!this.config.optimization.refresh) return;

        // Actualise chaque emplacement selon sa configuration
        Object.entries(this.config.adSlots).forEach(([position, config]) => {
            if (config.refresh) {
                setInterval(() => {
                    const slot = this.state.slots[position];
                    if (slot && this.isSlotViewable(position)) {
                        googletag.cmd.push(() => {
                            googletag.pubads().refresh([slot]);
                        });
                    }
                }, config.refresh * 1000);
            }
        });
    },

    // Configure l'optimisation de la visibilité
    setupViewability: function() {
        if (!this.config.optimization.viewability) return;

        googletag.cmd.push(() => {
            // Configure les événements de visibilité
            googletag.pubads().addEventListener('impressionViewable', event => {
                const slot = event.slot;
                const position = this.getPositionFromSlot(slot);
                
                if (position) {
                    this.state.viewability[position] = true;
                    this.logViewability(position);
                }
            });
        });
    },

    // Configure les analytics
    setupAnalytics: function() {
        if (!this.config.analytics.enabled) return;

        googletag.cmd.push(() => {
            // Suit les impressions
            googletag.pubads().addEventListener('slotRenderEnded', event => {
                const slot = event.slot;
                const position = this.getPositionFromSlot(slot);
                
                if (position) {
                    this.logAdMetrics(position, {
                        rendered: !event.isEmpty,
                        size: event.size,
                        lineItemId: event.lineItemId,
                        creativeId: event.creativeId
                    });
                }
            });

            // Suit les revenus
            if (this.config.analytics.revenue) {
                this.setupRevenueTracking();
            }

            // Suit les performances
            if (this.config.analytics.performance) {
                this.setupPerformanceTracking();
            }
        });
    },

    // Configure le ciblage
    setupTargeting: function() {
        // Ciblage contextuel
        if (this.config.targeting.contextual) {
            this.setupContextualTargeting();
        }

        // Ciblage comportemental
        if (this.config.targeting.behavioral) {
            this.setupBehavioralTargeting();
        }

        // Ciblage démographique
        if (this.config.targeting.demographic) {
            this.setupDemographicTargeting();
        }

        // Ciblage personnalisé
        if (this.config.targeting.custom) {
            this.setupCustomTargeting();
        }
    },

    // Configure le ciblage contextuel
    setupContextualTargeting: function() {
        // Récupère les mots-clés de la page
        const keywords = this.extractKeywords();
        
        googletag.cmd.push(() => {
            googletag.pubads().setTargeting('keywords', keywords);
        });
    },

    // Configure le ciblage comportemental
    setupBehavioralTargeting: function() {
        // Récupère l'historique de navigation
        const history = this.getUserHistory();
        
        googletag.cmd.push(() => {
            googletag.pubads().setTargeting('interests', history.interests);
            googletag.pubads().setTargeting('recent_views', history.recentViews);
        });
    },

    // Configure le ciblage démographique
    setupDemographicTargeting: function() {
        // Récupère les données démographiques
        const demographics = this.getUserDemographics();
        
        googletag.cmd.push(() => {
            googletag.pubads().setTargeting('age', demographics.age);
            googletag.pubads().setTargeting('gender', demographics.gender);
            googletag.pubads().setTargeting('location', demographics.location);
        });
    },

    // Configure le ciblage personnalisé
    setupCustomTargeting: function() {
        // Récupère les segments personnalisés
        const segments = this.getCustomSegments();
        
        googletag.cmd.push(() => {
            Object.entries(segments).forEach(([key, value]) => {
                googletag.pubads().setTargeting(key, value);
            });
        });
    },

    // Optimise les performances
    optimizePerformance: function() {
        if (!this.config.optimization.performance) return;

        // Limite le nombre de requêtes
        this.batchRequests();

        // Précharge les créatifs
        this.preloadCreatives();

        // Optimise le rendu
        this.optimizeRendering();
    },

    // Regroupe les requêtes
    batchRequests: function() {
        googletag.cmd.push(() => {
            // Active le mode SRA
            googletag.pubads().enableSingleRequest();
            
            // Regroupe les refreshs
            this.batchRefreshes();
        });
    },

    // Regroupe les actualisations
    batchRefreshes: function() {
        const batchSize = 3;
        const slots = Object.values(this.state.slots);
        
        for (let i = 0; i < slots.length; i += batchSize) {
            const batch = slots.slice(i, i + batchSize);
            googletag.pubads().refresh(batch);
        }
    },

    // Précharge les créatifs
    preloadCreatives: function() {
        // Précharge les créatifs fréquents
        const frequentCreatives = this.getFrequentCreatives();
        
        frequentCreatives.forEach(creative => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = creative.url;
            document.head.appendChild(link);
        });
    },

    // Optimise le rendu
    optimizeRendering: function() {
        // Utilise requestAnimationFrame pour le rendu
        window.requestAnimationFrame(() => {
            googletag.cmd.push(() => {
                googletag.pubads().enableAsyncRendering();
            });
        });
    },

    // Utilitaires
    getPositionFromId: function(id) {
        return Object.entries(this.config.adSlots)
            .find(([, config]) => config.id === id)?.[0];
    },

    getPositionFromSlot: function(slot) {
        return Object.entries(this.state.slots)
            .find(([, s]) => s === slot)?.[0];
    },

    isSlotViewable: function(position) {
        const element = document.getElementById(this.config.adSlots[position].id);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    },

    extractKeywords: function() {
        const keywords = [];
        
        // Extrait les mots-clés des meta tags
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            keywords.push(...metaKeywords.content.split(','));
        }

        // Extrait les mots-clés du contenu
        const content = document.querySelector('article');
        if (content) {
            const text = content.textContent;
            const words = text.split(/\s+/);
            const frequency = {};
            
            words.forEach(word => {
                word = word.toLowerCase().replace(/[^\w\s]/g, '');
                if (word.length > 3) {
                    frequency[word] = (frequency[word] || 0) + 1;
                }
            });

            // Prend les 10 mots les plus fréquents
            keywords.push(
                ...Object.entries(frequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([word]) => word)
            );
        }

        return keywords;
    },

    getUserHistory: function() {
        // Simule l'historique utilisateur
        return {
            interests: ['news', 'technology', 'sports'],
            recentViews: ['article1', 'article2', 'article3']
        };
    },

    getUserDemographics: function() {
        // Simule les données démographiques
        return {
            age: '25-34',
            gender: 'M',
            location: 'Paris'
        };
    },

    getCustomSegments: function() {
        // Simule les segments personnalisés
        return {
            subscriber: 'premium',
            engagement: 'high',
            frequency: 'daily'
        };
    },

    getFrequentCreatives: function() {
        // Simule les créatifs fréquents
        return [
            { url: '/ads/creative1.jpg' },
            { url: '/ads/creative2.jpg' },
            { url: '/ads/creative3.jpg' }
        ];
    },

    logAdMetrics: function(position, metrics) {
        if (!this.config.analytics.enabled) return;

        // Enregistre les métriques
        this.state.performance[position] = {
            ...this.state.performance[position],
            ...metrics,
            timestamp: Date.now()
        };

        // Envoie les données à l'analytics
        if (window.ga) {
            ga('send', 'event', 'Ads', 'render', position, metrics);
        }
    },

    logViewability: function(position) {
        if (!this.config.analytics.viewability) return;

        // Enregistre la visibilité
        this.state.viewability[position] = {
            viewable: true,
            timestamp: Date.now()
        };

        // Envoie les données à l'analytics
        if (window.ga) {
            ga('send', 'event', 'Ads', 'viewable', position);
        }
    }
};

// Initialise le système d'optimisation des publicités
document.addEventListener('DOMContentLoaded', () => {
    adOptimization.init();
});
