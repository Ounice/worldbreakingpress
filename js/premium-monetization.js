// Système de monétisation premium avancé
const premiumMonetization = {
    config: {
        // Configuration générale
        enabled: true,
        currency: 'EUR',
        vatRate: 20, // 20%
        
        // Plans d'abonnement
        subscriptionPlans: {
            monthly: {
                price: 9.99,
                features: [
                    'Contenu exclusif',
                    'Sans publicité',
                    'Articles premium',
                    'Newsletters exclusives',
                    'Accès anticipé'
                ],
                trialDays: 7
            },
            yearly: {
                price: 99.99,
                features: [
                    'Tous les avantages mensuels',
                    'Économisez 20%',
                    'Webinaires exclusifs',
                    'Support prioritaire',
                    'Badge premium'
                ],
                trialDays: 14
            },
            lifetime: {
                price: 499.99,
                features: [
                    'Accès à vie',
                    'Tous les avantages précédents',
                    'Événements VIP',
                    'Contenu archivé',
                    'Support dédié'
                ],
                limited: true,
                limitedSpots: 100
            }
        },

        // Contenu premium
        premiumContent: {
            articles: true,
            analysis: true,
            videos: true,
            podcasts: true,
            ebooks: true
        },

        // Paiement
        payment: {
            providers: ['stripe', 'paypal'],
            currencies: ['EUR', 'USD', 'GBP'],
            installments: true,
            autoRenew: true
        },

        // Promotions
        promotions: {
            enabled: true,
            referral: true,
            seasonal: true,
            firstTime: true,
            winback: true
        },

        // Analytics
        analytics: {
            enabled: true,
            tracking: true,
            reporting: true,
            forecasting: true
        }
    },

    // État du système
    state: {
        currentUser: null,
        subscription: null,
        paymentMethod: null,
        promotions: [],
        analytics: {}
    },

    // Initialisation
    init: async function() {
        if (!this.config.enabled) return;

        await this.loadState();
        this.setupPaymentSystem();
        this.setupSubscriptionSystem();
        this.setupPremiumContent();
        this.setupPromotions();
        this.setupAnalytics();
        this.createPremiumUI();
    },

    // Charge l'état
    loadState: async function() {
        try {
            // Charge l'utilisateur actuel
            const user = await this.loadCurrentUser();
            this.state.currentUser = user;

            // Charge l'abonnement
            if (user) {
                const subscription = await this.loadSubscription(user.id);
                this.state.subscription = subscription;
            }

            // Charge les promotions actives
            const promotions = await this.loadActivePromotions();
            this.state.promotions = promotions;

        } catch (error) {
            console.error('Erreur de chargement de l\'état:', error);
        }
    },

    // Configure le système de paiement
    setupPaymentSystem: function() {
        // Initialise Stripe
        if (this.config.payment.providers.includes('stripe')) {
            this.initializeStripe();
        }

        // Initialise PayPal
        if (this.config.payment.providers.includes('paypal')) {
            this.initializePayPal();
        }

        // Configure les paiements échelonnés
        if (this.config.payment.installments) {
            this.setupInstallments();
        }
    },

    // Initialise Stripe
    initializeStripe: function() {
        const stripe = Stripe('your_publishable_key');
        this.stripe = stripe;

        // Configure les éléments Stripe
        const elements = stripe.elements();
        
        // Crée l'élément de carte
        const card = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#32325d',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        // Stocke pour utilisation ultérieure
        this.stripeCard = card;
    },

    // Configure le système d'abonnement
    setupSubscriptionSystem: function() {
        // Configure la gestion des abonnements
        this.setupSubscriptionManagement();
        
        // Configure le renouvellement automatique
        if (this.config.payment.autoRenew) {
            this.setupAutoRenewal();
        }
        
        // Configure les notifications
        this.setupSubscriptionNotifications();
    },

    // Configure la gestion des abonnements
    setupSubscriptionManagement: function() {
        // Gère les changements de plan
        this.handlePlanChanges();
        
        // Gère les annulations
        this.handleCancellations();
        
        // Gère les remboursements
        this.handleRefunds();
    },

    // Configure le contenu premium
    setupPremiumContent: function() {
        // Marque le contenu premium
        this.markPremiumContent();
        
        // Configure les aperçus
        this.setupPremiumPreviews();
        
        // Configure le paywall
        this.setupPaywall();
    },

    // Marque le contenu premium
    markPremiumContent: function() {
        // Articles premium
        document.querySelectorAll('.article').forEach(article => {
            if (article.dataset.premium === 'true') {
                this.addPremiumBadge(article);
                
                if (!this.hasAccess()) {
                    this.restrictContent(article);
                }
            }
        });
    },

    // Ajoute un badge premium
    addPremiumBadge: function(element) {
        const badge = document.createElement('div');
        badge.className = 'premium-badge';
        badge.innerHTML = `
            <span class="badge-icon">👑</span>
            <span class="badge-text">Premium</span>
        `;
        
        element.classList.add('premium-content');
        element.insertBefore(badge, element.firstChild);
    },

    // Restreint le contenu
    restrictContent: function(element) {
        const wrapper = document.createElement('div');
        wrapper.className = 'premium-overlay';
        
        const preview = element.cloneNode(true);
        preview.classList.add('content-preview');
        
        // Garde seulement 20% du contenu
        const content = preview.querySelector('.article-content');
        if (content) {
            const words = content.textContent.split(' ');
            const previewLength = Math.floor(words.length * 0.2);
            content.textContent = words.slice(0, previewLength).join(' ') + '...';
        }
        
        wrapper.appendChild(preview);
        
        // Ajoute le CTA
        const cta = this.createPremiumCTA();
        wrapper.appendChild(cta);
        
        element.parentNode.replaceChild(wrapper, element);
    },

    // Crée le CTA premium
    createPremiumCTA: function() {
        const cta = document.createElement('div');
        cta.className = 'premium-cta';
        cta.innerHTML = `
            <div class="cta-content">
                <h3>Contenu Premium</h3>
                <p>Abonnez-vous pour accéder à cet article et à tout notre contenu premium.</p>
                <div class="cta-features">
                    ${this.config.subscriptionPlans.monthly.features.map(feature => `
                        <div class="feature">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">${feature}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="cta-plans">
                    ${Object.entries(this.config.subscriptionPlans).map(([plan, details]) => `
                        <div class="plan ${plan}">
                            <h4>${this.formatPlanName(plan)}</h4>
                            <div class="price">
                                <span class="amount">${details.price}</span>
                                <span class="currency">${this.config.currency}</span>
                                ${plan !== 'lifetime' ? '<span class="period">/' + this.formatPeriod(plan) + '</span>' : ''}
                            </div>
                            ${details.trialDays ? `
                                <div class="trial">
                                    ${details.trialDays} jours d'essai gratuit
                                </div>
                            ` : ''}
                            <button class="subscribe-button" data-plan="${plan}">
                                Choisir
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Ajoute les gestionnaires d'événements
        cta.querySelectorAll('.subscribe-button').forEach(button => {
            button.addEventListener('click', () => {
                this.startSubscription(button.dataset.plan);
            });
        });

        return cta;
    },

    // Démarre l'abonnement
    startSubscription: async function(plan) {
        try {
            // Vérifie si l'utilisateur est connecté
            if (!this.state.currentUser) {
                await this.showLoginPrompt();
                return;
            }

            // Vérifie les promotions applicables
            const promotion = await this.checkPromotions(plan);

            // Affiche le formulaire de paiement
            const paymentMethod = await this.showPaymentForm(plan, promotion);

            // Crée l'abonnement
            const subscription = await this.createSubscription(plan, paymentMethod, promotion);

            // Met à jour l'état
            this.state.subscription = subscription;
            this.refreshAccess();

            // Affiche la confirmation
            this.showSubscriptionConfirmation(subscription);

        } catch (error) {
            console.error('Erreur d\'abonnement:', error);
            this.showError(error);
        }
    },

    // Affiche le formulaire de paiement
    showPaymentForm: async function(plan, promotion) {
        return new Promise((resolve, reject) => {
            const modal = document.createElement('div');
            modal.className = 'payment-modal';
            modal.innerHTML = `
                <div class="payment-form">
                    <h3>Finaliser votre abonnement</h3>
                    <div class="plan-details">
                        <h4>${this.formatPlanName(plan)}</h4>
                        <div class="price">
                            ${promotion ? `
                                <span class="original-price">
                                    ${this.config.subscriptionPlans[plan].price}${this.config.currency}
                                </span>
                            ` : ''}
                            <span class="final-price">
                                ${this.calculatePrice(plan, promotion)}${this.config.currency}
                            </span>
                            ${plan !== 'lifetime' ? `
                                <span class="period">/${this.formatPeriod(plan)}</span>
                            ` : ''}
                        </div>
                        ${promotion ? `
                            <div class="promotion">
                                ${promotion.description}
                            </div>
                        ` : ''}
                    </div>
                    <div class="payment-methods">
                        <div class="method-selector">
                            ${this.config.payment.providers.map(provider => `
                                <label class="method">
                                    <input type="radio" name="payment-method" 
                                        value="${provider}" 
                                        ${provider === 'stripe' ? 'checked' : ''}>
                                    <img src="/images/payment/${provider}.png" 
                                        alt="${provider}">
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="card-element"></div>
                    <button class="pay-button">
                        Payer ${this.calculatePrice(plan, promotion)}${this.config.currency}
                    </button>
                </div>
            `;

            document.body.appendChild(modal);

            // Monte l'élément de carte Stripe
            const cardElement = modal.querySelector('.card-element');
            this.stripeCard.mount(cardElement);

            // Gère le paiement
            modal.querySelector('.pay-button').addEventListener('click', async () => {
                try {
                    const result = await this.processPayment(plan, promotion);
                    modal.remove();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });
    },

    // Traite le paiement
    processPayment: async function(plan, promotion) {
        try {
            // Crée l'intention de paiement
            const intent = await this.createPaymentIntent(plan, promotion);

            // Confirme le paiement avec Stripe
            const result = await this.stripe.confirmCardPayment(intent.client_secret, {
                payment_method: {
                    card: this.stripeCard,
                    billing_details: {
                        name: this.state.currentUser.name,
                        email: this.state.currentUser.email
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.paymentMethod;

        } catch (error) {
            console.error('Erreur de paiement:', error);
            throw error;
        }
    },

    // Configure les promotions
    setupPromotions: function() {
        if (!this.config.promotions.enabled) return;

        // Configure le système de parrainage
        if (this.config.promotions.referral) {
            this.setupReferralSystem();
        }

        // Configure les promotions saisonnières
        if (this.config.promotions.seasonal) {
            this.setupSeasonalPromotions();
        }

        // Configure les promotions première fois
        if (this.config.promotions.firstTime) {
            this.setupFirstTimePromotions();
        }

        // Configure les promotions de reconquête
        if (this.config.promotions.winback) {
            this.setupWinbackPromotions();
        }
    },

    // Configure le système de parrainage
    setupReferralSystem: function() {
        // Génère le code de parrainage
        const referralCode = this.generateReferralCode();

        // Crée l'interface de parrainage
        this.createReferralUI(referralCode);

        // Configure le suivi des parrainages
        this.trackReferrals();
    },

    // Configure les analytics
    setupAnalytics: function() {
        if (!this.config.analytics.enabled) return;

        // Configure le suivi
        if (this.config.analytics.tracking) {
            this.setupAnalyticsTracking();
        }

        // Configure les rapports
        if (this.config.analytics.reporting) {
            this.setupAnalyticsReporting();
        }

        // Configure les prévisions
        if (this.config.analytics.forecasting) {
            this.setupAnalyticsForecasting();
        }
    },

    // Utilitaires
    formatPlanName: function(plan) {
        const names = {
            monthly: 'Mensuel',
            yearly: 'Annuel',
            lifetime: 'À vie'
        };
        return names[plan] || plan;
    },

    formatPeriod: function(plan) {
        const periods = {
            monthly: 'mois',
            yearly: 'an'
        };
        return periods[plan] || '';
    },

    calculatePrice: function(plan, promotion) {
        let price = this.config.subscriptionPlans[plan].price;
        
        if (promotion) {
            price = price * (1 - promotion.discount);
        }
        
        return price.toFixed(2);
    },

    hasAccess: function() {
        return this.state.subscription && 
               this.state.subscription.status === 'active';
    },

    generateReferralCode: function() {
        return 'REF' + Math.random().toString(36).substr(2, 9).toUpperCase();
    },

    showError: function(error) {
        const message = document.createElement('div');
        message.className = 'error-message';
        message.textContent = error.message;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
};

// Initialise le système de monétisation premium
document.addEventListener('DOMContentLoaded', () => {
    premiumMonetization.init();
});
