// Système d'analytics avancé avec ML et prédictions
const advancedAnalytics = {
    config: {
        // Configuration générale
        enabled: true,
        debug: false,
        sampleRate: 100, // 100%
        
        // Tracking
        tracking: {
            pageviews: true,
            events: true,
            timing: true,
            errors: true,
            performance: true
        },

        // Événements
        events: {
            scroll: true,
            clicks: true,
            forms: true,
            media: true,
            custom: true
        },

        // Sessions
        session: {
            timeout: 30, // minutes
            tracking: true,
            attribution: true
        },

        // Utilisateurs
        users: {
            tracking: true,
            profiling: true,
            segmentation: true,
            prediction: true
        },

        // Machine Learning
        ml: {
            enabled: true,
            clustering: true,
            prediction: true,
            recommendation: true
        },

        // Reporting
        reporting: {
            enabled: true,
            realtime: true,
            automated: true,
            custom: true
        },

        // Intégrations
        integrations: {
            ga: true,      // Google Analytics
            gtm: true,     // Google Tag Manager
            fb: true,      // Facebook Pixel
            custom: true   // API personnalisée
        }
    },

    // État du système
    state: {
        session: null,
        user: null,
        events: [],
        metrics: {},
        predictions: {}
    },

    // Initialisation
    init: async function() {
        if (!this.config.enabled) return;

        await this.loadState();
        this.setupTracking();
        this.setupML();
        this.setupReporting();
        this.initializeIntegrations();
        this.startSession();
    },

    // Charge l'état
    loadState: async function() {
        try {
            // Charge la session
            const session = this.loadSession();
            this.state.session = session;

            // Charge l'utilisateur
            const user = await this.loadUser();
            this.state.user = user;

            // Charge les événements
            const events = await this.loadEvents();
            this.state.events = events;

            // Charge les métriques
            const metrics = await this.loadMetrics();
            this.state.metrics = metrics;

        } catch (error) {
            this.logError('Erreur de chargement de l\'état:', error);
        }
    },

    // Configure le tracking
    setupTracking: function() {
        // Configure le tracking de pages
        if (this.config.tracking.pageviews) {
            this.setupPageTracking();
        }

        // Configure le tracking d'événements
        if (this.config.tracking.events) {
            this.setupEventTracking();
        }

        // Configure le tracking de timing
        if (this.config.tracking.timing) {
            this.setupTimingTracking();
        }

        // Configure le tracking d'erreurs
        if (this.config.tracking.errors) {
            this.setupErrorTracking();
        }

        // Configure le tracking de performance
        if (this.config.tracking.performance) {
            this.setupPerformanceTracking();
        }
    },

    // Configure le tracking de pages
    setupPageTracking: function() {
        // Suit les vues de page
        this.trackPageView();

        // Suit la navigation
        window.addEventListener('popstate', () => {
            this.trackPageView();
        });

        // Suit les changements de hash
        window.addEventListener('hashchange', () => {
            this.trackPageView();
        });
    },

    // Suit une vue de page
    trackPageView: function() {
        const pageData = {
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now()
        };

        this.trackEvent('pageview', pageData);
        this.updateSession(pageData);
    },

    // Configure le tracking d'événements
    setupEventTracking: function() {
        // Suit les scrolls
        if (this.config.events.scroll) {
            this.setupScrollTracking();
        }

        // Suit les clics
        if (this.config.events.clicks) {
            this.setupClickTracking();
        }

        // Suit les formulaires
        if (this.config.events.forms) {
            this.setupFormTracking();
        }

        // Suit les médias
        if (this.config.events.media) {
            this.setupMediaTracking();
        }
    },

    // Configure le tracking de scroll
    setupScrollTracking: function() {
        let maxScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = (window.scrollY + window.innerHeight) / 
                                   document.documentElement.scrollHeight * 100;
                    
                    if (scrolled > maxScroll) {
                        maxScroll = scrolled;
                        if (maxScroll >= 25 && maxScroll % 25 === 0) {
                            this.trackEvent('scroll_depth', {
                                depth: maxScroll
                            });
                        }
                    }

                    ticking = false;
                });

                ticking = true;
            }
        });
    },

    // Configure le tracking de clics
    setupClickTracking: function() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Suit les liens
            if (target.tagName === 'A') {
                this.trackEvent('link_click', {
                    href: target.href,
                    text: target.textContent,
                    location: this.getElementPath(target)
                });
            }

            // Suit les boutons
            if (target.tagName === 'BUTTON') {
                this.trackEvent('button_click', {
                    text: target.textContent,
                    location: this.getElementPath(target)
                });
            }
        });
    },

    // Configure le tracking de formulaires
    setupFormTracking: function() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            
            this.trackEvent('form_submit', {
                id: form.id,
                action: form.action,
                fields: this.getFormFields(form)
            });
        });

        // Suit les champs de formulaire
        document.addEventListener('change', (e) => {
            const field = e.target;
            if (field.form) {
                this.trackEvent('form_field_change', {
                    form: field.form.id,
                    field: field.name,
                    type: field.type
                });
            }
        });
    },

    // Configure le tracking de médias
    setupMediaTracking: function() {
        // Suit les vidéos
        document.querySelectorAll('video').forEach(video => {
            this.setupVideoTracking(video);
        });

        // Suit l'audio
        document.querySelectorAll('audio').forEach(audio => {
            this.setupAudioTracking(audio);
        });
    },

    // Configure le tracking de timing
    setupTimingTracking: function() {
        // Suit les performances de chargement
        window.addEventListener('load', () => {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            this.trackTiming('page_load', loadTime);
        });

        // Suit le First Paint
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-paint') {
                    this.trackTiming('first_paint', entry.startTime);
                }
            }
        });

        observer.observe({ entryTypes: ['paint'] });
    },

    // Configure le tracking d'erreurs
    setupErrorTracking: function() {
        window.addEventListener('error', (e) => {
            this.trackError({
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error ? e.error.stack : null
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.trackError({
                message: e.reason.message,
                type: 'unhandled_rejection',
                stack: e.reason.stack
            });
        });
    },

    // Configure le tracking de performance
    setupPerformanceTracking: function() {
        // Suit les métriques Web Vitals
        this.trackWebVitals();

        // Suit les ressources
        this.trackResources();

        // Suit la mémoire
        this.trackMemory();
    },

    // Configure le Machine Learning
    setupML: function() {
        if (!this.config.ml.enabled) return;

        // Configure le clustering
        if (this.config.ml.clustering) {
            this.setupClustering();
        }

        // Configure la prédiction
        if (this.config.ml.prediction) {
            this.setupPrediction();
        }

        // Configure les recommandations
        if (this.config.ml.recommendation) {
            this.setupRecommendation();
        }
    },

    // Configure le clustering
    setupClustering: function() {
        // Analyse les segments d'utilisateurs
        setInterval(() => {
            this.analyzeUserSegments();
        }, 24 * 60 * 60 * 1000); // Une fois par jour
    },

    // Analyse les segments d'utilisateurs
    analyzeUserSegments: async function() {
        try {
            // Récupère les données utilisateur
            const userData = await this.getUserData();

            // Applique l'algorithme de clustering
            const clusters = this.applyKMeans(userData);

            // Met à jour les segments
            this.updateUserSegments(clusters);

        } catch (error) {
            this.logError('Erreur d\'analyse des segments:', error);
        }
    },

    // Configure la prédiction
    setupPrediction: function() {
        // Prédit le comportement utilisateur
        setInterval(() => {
            this.predictUserBehavior();
        }, 60 * 60 * 1000); // Une fois par heure
    },

    // Prédit le comportement utilisateur
    predictUserBehavior: async function() {
        try {
            // Récupère l'historique utilisateur
            const history = await this.getUserHistory();

            // Applique le modèle de prédiction
            const predictions = this.applyPredictionModel(history);

            // Met à jour les prédictions
            this.updatePredictions(predictions);

        } catch (error) {
            this.logError('Erreur de prédiction:', error);
        }
    },

    // Configure les recommandations
    setupRecommendation: function() {
        // Génère des recommandations
        setInterval(() => {
            this.generateRecommendations();
        }, 15 * 60 * 1000); // Toutes les 15 minutes
    },

    // Génère des recommandations
    generateRecommendations: async function() {
        try {
            // Récupère les préférences utilisateur
            const preferences = await this.getUserPreferences();

            // Applique l'algorithme de recommandation
            const recommendations = this.applyRecommendationAlgorithm(preferences);

            // Met à jour les recommandations
            this.updateRecommendations(recommendations);

        } catch (error) {
            this.logError('Erreur de recommandation:', error);
        }
    },

    // Configure le reporting
    setupReporting: function() {
        if (!this.config.reporting.enabled) return;

        // Configure le reporting en temps réel
        if (this.config.reporting.realtime) {
            this.setupRealtimeReporting();
        }

        // Configure le reporting automatisé
        if (this.config.reporting.automated) {
            this.setupAutomatedReporting();
        }

        // Configure le reporting personnalisé
        if (this.config.reporting.custom) {
            this.setupCustomReporting();
        }
    },

    // Configure le reporting en temps réel
    setupRealtimeReporting: function() {
        // Met à jour les métriques en temps réel
        setInterval(() => {
            this.updateRealtimeMetrics();
        }, 5000); // Toutes les 5 secondes
    },

    // Met à jour les métriques en temps réel
    updateRealtimeMetrics: async function() {
        try {
            // Récupère les dernières métriques
            const metrics = await this.getRealtimeMetrics();

            // Met à jour le dashboard
            this.updateDashboard(metrics);

            // Vérifie les alertes
            this.checkAlerts(metrics);

        } catch (error) {
            this.logError('Erreur de mise à jour des métriques:', error);
        }
    },

    // Configure le reporting automatisé
    setupAutomatedReporting: function() {
        // Génère des rapports quotidiens
        this.scheduleReport('daily', '00:00');

        // Génère des rapports hebdomadaires
        this.scheduleReport('weekly', 'monday 00:00');

        // Génère des rapports mensuels
        this.scheduleReport('monthly', '1 00:00');
    },

    // Programme un rapport
    scheduleReport: function(frequency, time) {
        // Calcule le prochain horaire
        const nextSchedule = this.calculateNextSchedule(frequency, time);

        setTimeout(() => {
            this.generateReport(frequency);
            this.scheduleReport(frequency, time);
        }, nextSchedule - Date.now());
    },

    // Génère un rapport
    generateReport: async function(frequency) {
        try {
            // Récupère les données pour la période
            const data = await this.getReportData(frequency);

            // Génère le rapport
            const report = this.createReport(data, frequency);

            // Envoie le rapport
            await this.sendReport(report);

        } catch (error) {
            this.logError('Erreur de génération de rapport:', error);
        }
    },

    // Initialise les intégrations
    initializeIntegrations: function() {
        // Initialise Google Analytics
        if (this.config.integrations.ga) {
            this.initializeGA();
        }

        // Initialise Google Tag Manager
        if (this.config.integrations.gtm) {
            this.initializeGTM();
        }

        // Initialise Facebook Pixel
        if (this.config.integrations.fb) {
            this.initializeFB();
        }

        // Initialise l'API personnalisée
        if (this.config.integrations.custom) {
            this.initializeCustomAPI();
        }
    },

    // Utilitaires
    getElementPath: function(element) {
        const path = [];
        while (element) {
            let selector = element.tagName.toLowerCase();
            
            if (element.id) {
                selector += `#${element.id}`;
            } else if (element.className) {
                selector += `.${element.className.split(' ').join('.')}`;
            }
            
            path.unshift(selector);
            element = element.parentElement;
        }
        return path.join(' > ');
    },

    getFormFields: function(form) {
        const fields = {};
        for (const field of form.elements) {
            if (field.name) {
                fields[field.name] = {
                    type: field.type,
                    value: field.type === 'password' ? '[REDACTED]' : field.value
                };
            }
        }
        return fields;
    },

    calculateNextSchedule: function(frequency, time) {
        const now = new Date();
        let next = new Date();

        switch (frequency) {
            case 'daily':
                next.setHours(time.split(':')[0], time.split(':')[1], 0, 0);
                if (next <= now) next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                const day = time.split(' ')[0].toLowerCase();
                const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = days.indexOf(day);
                next.setHours(time.split(' ')[1].split(':')[0], time.split(' ')[1].split(':')[1], 0, 0);
                while (next.getDay() !== targetDay || next <= now) {
                    next.setDate(next.getDate() + 1);
                }
                break;
            case 'monthly':
                next.setDate(parseInt(time.split(' ')[0]));
                next.setHours(time.split(' ')[1].split(':')[0], time.split(' ')[1].split(':')[1], 0, 0);
                while (next <= now) {
                    next.setMonth(next.getMonth() + 1);
                }
                break;
        }

        return next.getTime();
    },

    logError: function(message, error) {
        if (this.config.debug) {
            console.error(message, error);
        }
        
        this.trackError({
            message: message,
            error: error.message,
            stack: error.stack
        });
    }
};

// Initialise le système d'analytics
document.addEventListener('DOMContentLoaded', () => {
    advancedAnalytics.init();
});
