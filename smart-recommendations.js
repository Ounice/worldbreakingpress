// Système de recommandation intelligent pour maximiser l'engagement
const smartRecommendations = {
    // Configuration du système
    config: {
        maxRecommendations: 6,
        refreshInterval: 30000, // 30 secondes
        categories: ['tech', 'business', 'lifestyle', 'environment', 'culture'],
        weights: {
            category: 0.3,
            tags: 0.2,
            readTime: 0.1,
            popularity: 0.2,
            recency: 0.2
        }
    },

    // Données utilisateur
    userData: {
        readArticles: new Set(),
        preferences: {},
        sessionTime: 0,
        categoryAffinities: {},
        lastInteractions: []
    },

    // Suivi du comportement utilisateur
    tracking: {
        startTime: null,
        scrollDepth: 0,
        interactions: 0,
        timeOnPage: 0
    },

    // Initialisation du système
    init: function() {
        this.loadUserPreferences();
        this.trackUserBehavior();
        this.initializeRecommendationWidgets();
        this.setupInfiniteScroll();
        this.initializePersonalization();
    },

    // Charge les préférences utilisateur depuis localStorage
    loadUserPreferences: function() {
        const stored = localStorage.getItem('wbp_user_prefs');
        if (stored) {
            this.userData = {...this.userData, ...JSON.parse(stored)};
        }
        this.updateCategoryAffinities();
    },

    // Suit le comportement de l'utilisateur
    trackUserBehavior: function() {
        this.tracking.startTime = Date.now();

        // Suit la profondeur de défilement
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            this.tracking.scrollDepth = (scrolled / height) * 100;
            this.updateEngagementScore();
        });

        // Suit les clics
        document.addEventListener('click', (e) => {
            if (e.target.closest('article')) {
                this.tracking.interactions++;
                this.updateEngagementScore();
            }
        });

        // Met à jour le temps passé sur la page
        setInterval(() => {
            this.tracking.timeOnPage = (Date.now() - this.tracking.startTime) / 1000;
            this.updateEngagementScore();
        }, 1000);
    },

    // Calcule et met à jour le score d'engagement
    updateEngagementScore: function() {
        const score = (
            (this.tracking.scrollDepth * 0.4) +
            (this.tracking.interactions * 10 * 0.3) +
            (Math.min(this.tracking.timeOnPage / 300, 1) * 0.3)
        );

        // Met à jour les préférences utilisateur
        if (score > 0.7) {
            const category = document.querySelector('.category-tag')?.textContent.toLowerCase();
            if (category) {
                this.userData.categoryAffinities[category] = 
                    (this.userData.categoryAffinities[category] || 0) + 1;
                this.saveUserPreferences();
            }
        }
    },

    // Initialise les widgets de recommandation
    initializeRecommendationWidgets: function() {
        // Widget de recommandation dans la sidebar
        this.createSidebarRecommendations();
        
        // Widget de recommandation en fin d'article
        this.createEndOfArticleRecommendations();
        
        // Widget flottant
        this.createFloatingRecommendations();

        // Rafraîchit les recommandations périodiquement
        setInterval(() => {
            this.refreshRecommendations();
        }, this.config.refreshInterval);
    },

    // Crée les recommandations de la sidebar
    createSidebarRecommendations: function() {
        const sidebar = document.createElement('div');
        sidebar.className = 'recommendations-sidebar';
        sidebar.innerHTML = `
            <div class="recommendations-widget">
                <h3>Articles Recommandés</h3>
                <div class="recommendations-list"></div>
            </div>
        `;
        
        const content = document.querySelector('.article-content');
        if (content) {
            content.parentNode.insertBefore(sidebar, content.nextSibling);
        }
    },

    // Crée les recommandations en fin d'article
    createEndOfArticleRecommendations: function() {
        const endRecommendations = document.createElement('div');
        endRecommendations.className = 'end-article-recommendations';
        endRecommendations.innerHTML = `
            <h3>À lire également</h3>
            <div class="recommendations-grid"></div>
        `;
        
        const articleEnd = document.querySelector('.article-footer');
        if (articleEnd) {
            articleEnd.before(endRecommendations);
        }
    },

    // Crée le widget de recommandations flottant
    createFloatingRecommendations: function() {
        const floating = document.createElement('div');
        floating.className = 'floating-recommendations';
        floating.innerHTML = `
            <div class="floating-header">
                <h4>Trending</h4>
                <button class="close-floating">&times;</button>
            </div>
            <div class="floating-content"></div>
        `;
        
        document.body.appendChild(floating);
        
        // Gestion de la fermeture
        floating.querySelector('.close-floating').addEventListener('click', () => {
            floating.classList.add('hidden');
        });
    },

    // Met en place le défilement infini
    setupInfiniteScroll: function() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMoreArticles();
                }
            });
        }, options);

        const sentinel = document.createElement('div');
        sentinel.className = 'infinite-scroll-sentinel';
        document.querySelector('.article-content').appendChild(sentinel);
        observer.observe(sentinel);
    },

    // Charge plus d'articles pour le défilement infini
    loadMoreArticles: function() {
        // Simule le chargement d'articles
        const recommendations = this.getPersonalizedRecommendations();
        this.renderArticles(recommendations);
    },

    // Obtient des recommandations personnalisées
    getPersonalizedRecommendations: function() {
        // Combine les différents facteurs pour le score
        const currentCategory = document.querySelector('.category-tag')?.textContent.toLowerCase();
        
        return this.availableArticles
            .map(article => ({
                ...article,
                score: this.calculateArticleScore(article, currentCategory)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, this.config.maxRecommendations);
    },

    // Calcule le score d'un article pour les recommandations
    calculateArticleScore: function(article, currentCategory) {
        const weights = this.config.weights;
        let score = 0;

        // Score basé sur la catégorie
        if (article.category === currentCategory) {
            score += weights.category;
        }

        // Score basé sur les tags
        const commonTags = this.getCommonTags(article.tags);
        score += (commonTags / article.tags.length) * weights.tags;

        // Score basé sur la popularité
        score += (article.views / 1000) * weights.popularity;

        // Score basé sur la récence
        const ageInDays = (Date.now() - new Date(article.date)) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 1 - (ageInDays / 30)) * weights.recency;

        return score;
    },

    // Obtient les tags communs avec les préférences utilisateur
    getCommonTags: function(articleTags) {
        const userTags = new Set(this.userData.preferences.tags || []);
        return articleTags.filter(tag => userTags.has(tag)).length;
    },

    // Met à jour les affinités de catégorie
    updateCategoryAffinities: function() {
        const total = Object.values(this.userData.categoryAffinities)
            .reduce((sum, value) => sum + value, 0);
        
        if (total > 0) {
            Object.keys(this.userData.categoryAffinities).forEach(category => {
                this.userData.categoryAffinities[category] /= total;
            });
        }
    },

    // Sauvegarde les préférences utilisateur
    saveUserPreferences: function() {
        localStorage.setItem('wbp_user_prefs', JSON.stringify(this.userData));
    },

    // Rafraîchit les recommandations
    refreshRecommendations: function() {
        const recommendations = this.getPersonalizedRecommendations();
        
        // Met à jour les différents widgets
        this.updateSidebarRecommendations(recommendations);
        this.updateEndRecommendations(recommendations);
        this.updateFloatingRecommendations(recommendations);
    },

    // Initialise la personnalisation
    initializePersonalization: function() {
        // Détecte les préférences de l'utilisateur
        this.detectUserPreferences();
        
        // Met en place le suivi des interactions
        this.trackInteractions();
        
        // Adapte l'interface utilisateur
        this.adaptUserInterface();
    },

    // Détecte les préférences utilisateur
    detectUserPreferences: function() {
        // Analyse l'historique de navigation
        const history = localStorage.getItem('wbp_reading_history');
        if (history) {
            const parsed = JSON.parse(history);
            this.analyzeReadingPatterns(parsed);
        }

        // Détecte le moment de la journée
        const hour = new Date().getHours();
        this.userData.timePreference = 
            hour < 12 ? 'morning' : 
            hour < 17 ? 'afternoon' : 
            'evening';
    },

    // Analyse les patterns de lecture
    analyzeReadingPatterns: function(history) {
        const patterns = history.reduce((acc, article) => {
            acc.categories[article.category] = (acc.categories[article.category] || 0) + 1;
            acc.readTimes.push(article.timeSpent);
            return acc;
        }, { categories: {}, readTimes: [] });

        // Calcule le temps de lecture moyen
        const avgReadTime = patterns.readTimes.reduce((a, b) => a + b, 0) / patterns.readTimes.length;
        this.userData.preferences.avgReadTime = avgReadTime;

        // Met à jour les affinités de catégorie
        Object.assign(this.userData.categoryAffinities, patterns.categories);
    },

    // Suit les interactions utilisateur
    trackInteractions: function() {
        document.addEventListener('click', (e) => {
            const article = e.target.closest('article');
            if (article) {
                this.logInteraction({
                    type: 'article_click',
                    articleId: article.dataset.id,
                    timestamp: Date.now()
                });
            }
        });
    },

    // Enregistre une interaction
    logInteraction: function(interaction) {
        this.userData.lastInteractions.push(interaction);
        if (this.userData.lastInteractions.length > 100) {
            this.userData.lastInteractions.shift();
        }
        this.saveUserPreferences();
    },

    // Adapte l'interface utilisateur
    adaptUserInterface: function() {
        // Adapte la mise en page selon les préférences
        const preferredLayout = this.userData.preferences.layout || 'default';
        document.body.setAttribute('data-layout', preferredLayout);

        // Adapte la taille du texte
        if (this.userData.preferences.fontSize) {
            document.documentElement.style.setProperty(
                '--base-font-size', 
                this.userData.preferences.fontSize + 'px'
            );
        }
    }
};

// Initialise le système de recommandation
document.addEventListener('DOMContentLoaded', () => {
    smartRecommendations.init();
});
