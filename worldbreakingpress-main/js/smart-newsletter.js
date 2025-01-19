// Système de newsletter avancé avec personnalisation et automation
const smartNewsletter = {
    config: {
        // Configuration générale
        enabled: true,
        defaultTemplate: 'modern',
        maxNewslettersPerWeek: 5,
        
        // Types de newsletters
        types: {
            daily: {
                enabled: true,
                time: '08:00',
                maxArticles: 5
            },
            weekly: {
                enabled: true,
                day: 'monday',
                time: '10:00',
                maxArticles: 10
            },
            breaking: {
                enabled: true,
                threshold: 0.8 // Score d'importance minimum
            },
            digest: {
                enabled: true,
                frequency: 'bi-weekly',
                categories: ['tech', 'business', 'politics']
            },
            personalized: {
                enabled: true,
                aiPowered: true,
                interestBased: true
            }
        },

        // Personnalisation
        personalization: {
            aiEnabled: true,
            topicsEnabled: true,
            formatPreferences: true,
            timingPreferences: true
        },

        // Analytics
        analytics: {
            enabled: true,
            trackOpens: true,
            trackClicks: true,
            trackConversions: true,
            heatmap: true
        },

        // A/B Testing
        abTesting: {
            enabled: true,
            variants: ['subject', 'content', 'timing', 'format']
        }
    },

    // État du système
    state: {
        subscribers: [],
        campaigns: [],
        templates: {},
        analytics: {},
        abTests: []
    },

    // Initialisation
    init: async function() {
        if (!this.config.enabled) return;

        await this.loadState();
        this.setupNewsletterSystem();
        this.initializeTemplates();
        this.setupAnalytics();
        this.setupABTesting();
        this.setupAutomation();
        this.createSubscriptionUI();
    },

    // Charge l'état
    loadState: async function() {
        try {
            // Charge les abonnés
            const subscribers = await this.loadSubscribers();
            this.state.subscribers = subscribers;

            // Charge les campagnes
            const campaigns = await this.loadCampaigns();
            this.state.campaigns = campaigns;

            // Charge les templates
            const templates = await this.loadTemplates();
            this.state.templates = templates;

            // Charge les analytics
            const analytics = await this.loadAnalytics();
            this.state.analytics = analytics;

            // Charge les tests A/B
            const abTests = await this.loadABTests();
            this.state.abTests = abTests;
        } catch (error) {
            console.error('Erreur de chargement de l\'état:', error);
        }
    },

    // Configure le système de newsletter
    setupNewsletterSystem: function() {
        // Configure les différents types de newsletters
        this.setupDailyNewsletter();
        this.setupWeeklyNewsletter();
        this.setupBreakingNewsletter();
        this.setupDigestNewsletter();
        this.setupPersonalizedNewsletter();
    },

    // Configure la newsletter quotidienne
    setupDailyNewsletter: function() {
        if (!this.config.types.daily.enabled) return;

        // Programme l'envoi quotidien
        const scheduleDaily = () => {
            const now = new Date();
            const [hours, minutes] = this.config.types.daily.time.split(':');
            const scheduledTime = new Date(now);
            scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (now > scheduledTime) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }

            const delay = scheduledTime - now;
            setTimeout(() => {
                this.sendDailyNewsletter();
                scheduleDaily(); // Reprogramme pour le lendemain
            }, delay);
        };

        scheduleDaily();
    },

    // Envoie la newsletter quotidienne
    async sendDailyNewsletter: function() {
        try {
            // Récupère les meilleurs articles du jour
            const articles = await this.getBestArticles(
                this.config.types.daily.maxArticles
            );

            // Personnalise pour chaque abonné
            for (const subscriber of this.state.subscribers) {
                if (!this.shouldSendDaily(subscriber)) continue;

                // Personnalise le contenu
                const personalizedContent = await this.personalizeContent(
                    articles,
                    subscriber
                );

                // Crée la newsletter
                const newsletter = await this.createNewsletter(
                    'daily',
                    personalizedContent,
                    subscriber
                );

                // Envoie la newsletter
                await this.sendNewsletter(newsletter, subscriber);
            }
        } catch (error) {
            console.error('Erreur d\'envoi de la newsletter quotidienne:', error);
        }
    },

    // Configure la newsletter hebdomadaire
    setupWeeklyNewsletter: function() {
        if (!this.config.types.weekly.enabled) return;

        // Programme l'envoi hebdomadaire
        const scheduleWeekly = () => {
            const now = new Date();
            const targetDay = this.getDayNumber(this.config.types.weekly.day);
            const [hours, minutes] = this.config.types.weekly.time.split(':');
            const scheduledTime = new Date(now);
            
            scheduledTime.setDate(
                scheduledTime.getDate() + (targetDay + 7 - scheduledTime.getDay()) % 7
            );
            scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (now > scheduledTime) {
                scheduledTime.setDate(scheduledTime.getDate() + 7);
            }

            const delay = scheduledTime - now;
            setTimeout(() => {
                this.sendWeeklyNewsletter();
                scheduleWeekly(); // Reprogramme pour la semaine suivante
            }, delay);
        };

        scheduleWeekly();
    },

    // Configure la newsletter breaking news
    setupBreakingNewsletter: function() {
        if (!this.config.types.breaking.enabled) return;

        // Écoute les breaking news via WebSocket
        const ws = new WebSocket('wss://api.worldbreakingpress.com/breaking-news');
        
        ws.onmessage = async (event) => {
            const news = JSON.parse(event.data);
            if (this.isBreakingNewsWorthy(news)) {
                await this.sendBreakingNewsletter(news);
            }
        };

        ws.onclose = () => {
            // Reconnexion automatique
            setTimeout(() => this.setupBreakingNewsletter(), 3000);
        };
    },

    // Configure la newsletter digest
    setupDigestNewsletter: function() {
        if (!this.config.types.digest.enabled) return;

        // Programme l'envoi du digest
        const scheduleDigest = () => {
            const frequency = this.config.types.digest.frequency;
            const delay = this.getDigestDelay(frequency);
            
            setTimeout(() => {
                this.sendDigestNewsletter();
                scheduleDigest(); // Reprogramme le prochain digest
            }, delay);
        };

        scheduleDigest();
    },

    // Configure la newsletter personnalisée
    setupPersonalizedNewsletter: function() {
        if (!this.config.types.personalized.enabled) return;

        // Analyse le comportement des utilisateurs
        this.trackUserBehavior();
        
        // Programme les newsletters personnalisées
        this.schedulePersonalizedNewsletters();
    },

    // Suit le comportement des utilisateurs
    trackUserBehavior: function() {
        // Suit les articles lus
        document.querySelectorAll('.article').forEach(article => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.logArticleRead(
                            article.dataset.category,
                            article.dataset.id
                        );
                    }
                });
            }, {
                threshold: 0.5
            });

            observer.observe(article);
        });

        // Suit les clics sur les liens
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                this.logLinkClick(link.href);
            }
        });

        // Suit le temps passé sur les articles
        let startTime = Date.now();
        let currentArticle = null;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    currentArticle = entry.target;
                    startTime = Date.now();
                } else if (currentArticle === entry.target) {
                    const timeSpent = Date.now() - startTime;
                    this.logTimeSpent(
                        currentArticle.dataset.id,
                        timeSpent
                    );
                    currentArticle = null;
                }
            });
        }, {
            threshold: 0.5
        });

        document.querySelectorAll('.article').forEach(article => {
            observer.observe(article);
        });
    },

    // Programme les newsletters personnalisées
    schedulePersonalizedNewsletters: function() {
        // Vérifie chaque jour les opportunités d'envoi
        setInterval(async () => {
            const subscribers = await this.getActiveSubscribers();
            
            for (const subscriber of subscribers) {
                if (this.shouldSendPersonalized(subscriber)) {
                    await this.sendPersonalizedNewsletter(subscriber);
                }
            }
        }, 24 * 60 * 60 * 1000); // Vérifie toutes les 24 heures
    },

    // Configure les analytics
    setupAnalytics: function() {
        if (!this.config.analytics.enabled) return;

        // Configure le tracking d'ouvertures
        if (this.config.analytics.trackOpens) {
            this.setupOpenTracking();
        }

        // Configure le tracking de clics
        if (this.config.analytics.trackClicks) {
            this.setupClickTracking();
        }

        // Configure le tracking de conversions
        if (this.config.analytics.trackConversions) {
            this.setupConversionTracking();
        }

        // Configure la heatmap
        if (this.config.analytics.heatmap) {
            this.setupHeatmap();
        }
    },

    // Configure les tests A/B
    setupABTesting: function() {
        if (!this.config.abTesting.enabled) return;

        // Configure les tests pour chaque variant
        this.config.abTesting.variants.forEach(variant => {
            this.setupVariantTest(variant);
        });
    },

    // Configure l'automation
    setupAutomation: function() {
        // Configure les séquences automatisées
        this.setupWelcomeSequence();
        this.setupReengagementSequence();
        this.setupReferralSequence();
    },

    // Crée l'interface d'abonnement
    createSubscriptionUI: function() {
        const container = document.createElement('div');
        container.className = 'newsletter-subscription';
        container.innerHTML = `
            <div class="subscription-form">
                <h3>Restez informé</h3>
                <p>Recevez nos meilleures actualités directement dans votre boîte mail</p>
                <form>
                    <div class="form-group">
                        <input type="email" placeholder="Votre email" required>
                    </div>
                    <div class="preferences">
                        <h4>Vos préférences</h4>
                        <div class="frequency-options">
                            <label>
                                <input type="checkbox" name="daily" checked>
                                Quotidien
                            </label>
                            <label>
                                <input type="checkbox" name="weekly">
                                Hebdomadaire
                            </label>
                            <label>
                                <input type="checkbox" name="breaking" checked>
                                Breaking News
                            </label>
                        </div>
                        <div class="topics">
                            <h4>Vos centres d'intérêt</h4>
                            <div class="topics-grid">
                                ${this.config.types.digest.categories.map(category => `
                                    <label>
                                        <input type="checkbox" name="topic-${category}">
                                        ${this.capitalizeFirst(category)}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <button type="submit">S'abonner</button>
                </form>
            </div>
        `;

        // Ajoute les gestionnaires d'événements
        const form = container.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubscription(form);
        });

        // Ajoute au DOM
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.appendChild(container);
        }
    },

    // Gère l'abonnement
    async handleSubscription(form) {
        const email = form.querySelector('input[type="email"]').value;
        const preferences = {
            frequency: {
                daily: form.querySelector('input[name="daily"]').checked,
                weekly: form.querySelector('input[name="weekly"]').checked,
                breaking: form.querySelector('input[name="breaking"]').checked
            },
            topics: this.config.types.digest.categories.filter(category =>
                form.querySelector(`input[name="topic-${category}"]`).checked
            )
        };

        try {
            await this.subscribeUser(email, preferences);
            this.showSuccessMessage(form);
            this.startWelcomeSequence(email);
        } catch (error) {
            this.showErrorMessage(form, error);
        }
    },

    // Abonne un utilisateur
    async subscribeUser(email, preferences) {
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, preferences })
        });

        if (!response.ok) {
            throw new Error('Erreur d\'abonnement');
        }

        // Ajoute à la liste des abonnés
        this.state.subscribers.push({
            email,
            preferences,
            subscribedAt: new Date().toISOString()
        });
    },

    // Démarre la séquence de bienvenue
    startWelcomeSequence(email) {
        const sequence = [
            {
                delay: 0,
                type: 'welcome',
                subject: 'Bienvenue sur World Breaking Press !'
            },
            {
                delay: 2 * 24 * 60 * 60 * 1000, // 2 jours
                type: 'tips',
                subject: 'Découvrez toutes nos fonctionnalités'
            },
            {
                delay: 5 * 24 * 60 * 60 * 1000, // 5 jours
                type: 'engagement',
                subject: 'Personnalisez votre expérience'
            }
        ];

        sequence.forEach(email => {
            setTimeout(() => {
                this.sendWelcomeEmail(email, email.type);
            }, email.delay);
        });
    },

    // Envoie un email de bienvenue
    async sendWelcomeEmail(subscriber, type) {
        const template = await this.getWelcomeTemplate(type);
        const content = this.personalizeTemplate(template, subscriber);

        await this.sendEmail({
            to: subscriber.email,
            subject: template.subject,
            html: content
        });
    },

    // Utilitaires
    capitalizeFirst: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    getDayNumber: function(day) {
        const days = {
            'sunday': 0,
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6
        };
        return days[day.toLowerCase()];
    },

    showSuccessMessage: function(form) {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = 'Abonnement réussi ! Vérifiez votre boîte mail.';
        form.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    },

    showErrorMessage: function(form, error) {
        const message = document.createElement('div');
        message.className = 'error-message';
        message.textContent = error.message;
        form.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
};

// Initialise le système de newsletter
document.addEventListener('DOMContentLoaded', () => {
    smartNewsletter.init();
});
