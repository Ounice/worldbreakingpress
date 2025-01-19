// Système de monétisation avancé pour optimiser les revenus
const monetizationEngine = {
    // Configuration du système
    config: {
        // Configuration AdSense
        adsense: {
            enabled: true,
            autoAds: true,
            inArticleAds: true,
            adUnits: {
                sidebar: 'ca-pub-XXXXXXXXXXXXXXXX',
                inContent: 'ca-pub-XXXXXXXXXXXXXXXX',
                sticky: 'ca-pub-XXXXXXXXXXXXXXXX'
            }
        },
        
        // Configuration Premium
        premium: {
            enabled: true,
            monthlyPrice: 9.99,
            yearlyPrice: 99.99,
            features: [
                'Contenu exclusif',
                'Sans publicité',
                'Analyses approfondies',
                'Newsletters premium',
                'Accès anticipé'
            ]
        },

        // Configuration Newsletter
        newsletter: {
            enabled: true,
            types: ['daily', 'weekly', 'premium'],
            popupDelay: 30000, // 30 secondes
            exitIntent: true
        },

        // Configuration Affiliés
        affiliate: {
            enabled: true,
            networks: ['Amazon', 'Trading212', 'Binance'],
            disclosureText: 'Cet article contient des liens d\'affiliation'
        }
    },

    // État du système
    state: {
        userStatus: 'free', // free, premium, trial
        adBlocker: false,
        newsletterSubscribed: false,
        viewCount: 0,
        lastVisit: null
    },

    // Initialisation
    init: function() {
        this.loadUserState();
        this.detectAdBlocker();
        this.setupMonetizationFeatures();
        this.initializeTracking();
        this.setupSubscriptionSystem();
    },

    // Charge l'état utilisateur
    loadUserState: function() {
        const stored = localStorage.getItem('wbp_monetization_state');
        if (stored) {
            this.state = {...this.state, ...JSON.parse(stored)};
        }
        this.state.lastVisit = Date.now();
        this.state.viewCount++;
        this.saveState();
    },

    // Sauvegarde l'état
    saveState: function() {
        localStorage.setItem('wbp_monetization_state', JSON.stringify(this.state));
    },

    // Détecte les bloqueurs de publicité
    detectAdBlocker: function() {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        
        window.setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                this.state.adBlocker = true;
                this.handleAdBlocker();
            }
            testAd.remove();
            this.saveState();
        }, 100);
    },

    // Gère la détection d'AdBlock
    handleAdBlocker: function() {
        if (this.state.userStatus === 'free') {
            this.showAdBlockMessage();
        }
    },

    // Affiche un message pour AdBlock
    showAdBlockMessage: function() {
        const message = document.createElement('div');
        message.className = 'adblock-message';
        message.innerHTML = `
            <div class="adblock-notice">
                <h3>Soutenez le journalisme de qualité</h3>
                <p>Nous avons détecté que vous utilisez un bloqueur de publicités.</p>
                <p>Notre contenu reste gratuit grâce à la publicité. Vous pouvez :</p>
                <div class="adblock-options">
                    <button class="btn-whitelist">Désactiver AdBlock</button>
                    <button class="btn-premium">Devenir Premium</button>
                </div>
            </div>
        `;

        document.body.appendChild(message);

        // Gestionnaires d'événements
        message.querySelector('.btn-premium').addEventListener('click', () => {
            this.showPremiumOffer();
        });
    },

    // Configure les fonctionnalités de monétisation
    setupMonetizationFeatures: function() {
        if (this.config.adsense.enabled && !this.state.adBlocker) {
            this.setupAdsense();
        }

        if (this.config.premium.enabled) {
            this.setupPremiumFeatures();
        }

        if (this.config.newsletter.enabled) {
            this.setupNewsletterSystem();
        }

        if (this.config.affiliate.enabled) {
            this.setupAffiliateSystem();
        }
    },

    // Configure AdSense
    setupAdsense: function() {
        // Placement intelligent des publicités
        this.insertInContentAds();
        this.insertSidebarAds();
        this.insertStickyAds();

        // Optimisation des emplacements publicitaires
        this.optimizeAdPlacements();
    },

    // Insère les publicités dans le contenu
    insertInContentAds: function() {
        if (!this.config.adsense.inArticleAds) return;

        const paragraphs = document.querySelectorAll('.article-body p');
        let adCount = 0;
        
        paragraphs.forEach((p, index) => {
            // Insère une pub tous les 4 paragraphes
            if ((index + 1) % 4 === 0 && adCount < 3) {
                const adContainer = document.createElement('div');
                adContainer.className = 'in-content-ad';
                adContainer.dataset.adSlot = this.config.adsense.adUnits.inContent;
                p.after(adContainer);
                adCount++;
            }
        });
    },

    // Configure les fonctionnalités premium
    setupPremiumFeatures: function() {
        // Ajoute les boutons d'abonnement
        this.insertPremiumCTA();
        
        // Masque le contenu premium pour les utilisateurs gratuits
        if (this.state.userStatus === 'free') {
            this.hidePremiumContent();
        }

        // Ajoute les badges premium
        this.addPremiumBadges();
    },

    // Insère les appels à l'action premium
    insertPremiumCTA: function() {
        const cta = document.createElement('div');
        cta.className = 'premium-cta';
        cta.innerHTML = `
            <div class="premium-offer">
                <h3>Passez à l'offre Premium</h3>
                <ul class="premium-features">
                    ${this.config.premium.features.map(feature => 
                        `<li><i class="fas fa-check"></i> ${feature}</li>`
                    ).join('')}
                </ul>
                <div class="premium-pricing">
                    <div class="price-option">
                        <h4>Mensuel</h4>
                        <div class="price">${this.config.premium.monthlyPrice}€</div>
                        <button class="btn-subscribe" data-plan="monthly">S'abonner</button>
                    </div>
                    <div class="price-option popular">
                        <h4>Annuel</h4>
                        <div class="price">${this.config.premium.yearlyPrice}€</div>
                        <div class="savings">Économisez 20%</div>
                        <button class="btn-subscribe" data-plan="yearly">S'abonner</button>
                    </div>
                </div>
            </div>
        `;

        // Ajoute les gestionnaires d'événements
        cta.querySelectorAll('.btn-subscribe').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSubscription(e.target.dataset.plan);
            });
        });

        // Insère le CTA à des endroits stratégiques
        const insertPoints = [
            '.article-footer',
            '.premium-content-preview'
        ];

        insertPoints.forEach(point => {
            const element = document.querySelector(point);
            if (element) {
                element.appendChild(cta.cloneNode(true));
            }
        });
    },

    // Gère les abonnements
    handleSubscription: function(plan) {
        // Affiche le formulaire de paiement
        this.showPaymentForm(plan);
    },

    // Affiche le formulaire de paiement
    showPaymentForm: function(plan) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-form">
                <h3>Finaliser votre abonnement</h3>
                <div class="plan-details">
                    <h4>Plan ${plan}</h4>
                    <div class="price">
                        ${plan === 'monthly' ? this.config.premium.monthlyPrice : this.config.premium.yearlyPrice}€
                    </div>
                </div>
                <form id="payment-form">
                    <div class="form-group">
                        <label>Carte bancaire</label>
                        <div id="card-element"></div>
                    </div>
                    <button type="submit" class="btn-pay">Payer</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialise le formulaire de paiement (exemple avec Stripe)
        this.initializePaymentProcessor(modal, plan);
    },

    // Configure le système de newsletter
    setupNewsletterSystem: function() {
        // Affiche le popup de newsletter au bon moment
        this.setupNewsletterTriggers();
        
        // Ajoute le formulaire d'inscription
        this.insertNewsletterForm();
    },

    // Configure les déclencheurs de newsletter
    setupNewsletterTriggers: function() {
        // Déclencheur basé sur le temps
        setTimeout(() => {
            if (!this.state.newsletterSubscribed) {
                this.showNewsletterPopup();
            }
        }, this.config.newsletter.popupDelay);

        // Déclencheur d'intention de sortie
        if (this.config.newsletter.exitIntent) {
            document.addEventListener('mouseout', (e) => {
                if (!this.state.newsletterSubscribed && 
                    e.clientY <= 0 && 
                    !localStorage.getItem('wbp_newsletter_popup_shown')) {
                    this.showNewsletterPopup();
                }
            });
        }
    },

    // Affiche le popup de newsletter
    showNewsletterPopup: function() {
        const popup = document.createElement('div');
        popup.className = 'newsletter-popup';
        popup.innerHTML = `
            <div class="newsletter-content">
                <h3>Restez informé</h3>
                <p>Recevez nos meilleures analyses directement dans votre boîte mail :</p>
                <form class="newsletter-form">
                    <input type="email" placeholder="Votre email" required>
                    <div class="newsletter-options">
                        <label>
                            <input type="radio" name="frequency" value="daily" checked>
                            Quotidien
                        </label>
                        <label>
                            <input type="radio" name="frequency" value="weekly">
                            Hebdomadaire
                        </label>
                    </div>
                    <button type="submit">S'inscrire</button>
                </form>
                <button class="close-popup">&times;</button>
            </div>
        `;

        document.body.appendChild(popup);
        localStorage.setItem('wbp_newsletter_popup_shown', 'true');

        // Gestionnaires d'événements
        popup.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewsletterSignup(e.target);
        });

        popup.querySelector('.close-popup').addEventListener('click', () => {
            popup.remove();
        });
    },

    // Gère l'inscription à la newsletter
    handleNewsletterSignup: function(form) {
        const email = form.querySelector('input[type="email"]').value;
        const frequency = form.querySelector('input[name="frequency"]:checked').value;

        // Envoie les données au serveur
        this.submitNewsletterSignup(email, frequency);
    },

    // Configure le système d'affiliation
    setupAffiliateSystem: function() {
        // Ajoute les divulgations d'affiliation
        this.addAffiliateDisclosures();
        
        // Transforme les liens en liens d'affiliation
        this.processAffiliateLinks();
    },

    // Ajoute les divulgations d'affiliation
    addAffiliateDisclosures: function() {
        const articles = document.querySelectorAll('.article-content');
        articles.forEach(article => {
            if (article.innerHTML.includes('affiliate-link')) {
                const disclosure = document.createElement('div');
                disclosure.className = 'affiliate-disclosure';
                disclosure.textContent = this.config.affiliate.disclosureText;
                article.insertBefore(disclosure, article.firstChild);
            }
        });
    },

    // Transforme les liens en liens d'affiliation
    processAffiliateLinks: function() {
        const links = document.querySelectorAll('a[data-affiliate]');
        links.forEach(link => {
            const network = link.dataset.affiliate;
            const productId = link.dataset.productId;
            
            if (this.config.affiliate.networks.includes(network)) {
                link.href = this.generateAffiliateLink(network, productId, link.href);
                link.classList.add('affiliate-link');
            }
        });
    },

    // Génère un lien d'affiliation
    generateAffiliateLink: function(network, productId, originalUrl) {
        // Logique de génération des liens d'affiliation selon le réseau
        switch (network) {
            case 'Amazon':
                return `${originalUrl}?tag=wbp-21`;
            case 'Trading212':
                return `${originalUrl}?ref=wbp`;
            case 'Binance':
                return `${originalUrl}?ref=wbp_binance`;
            default:
                return originalUrl;
        }
    },

    // Initialise le suivi des performances
    initializeTracking: function() {
        // Suit les impressions publicitaires
        this.trackAdImpressions();
        
        // Suit les conversions
        this.trackConversions();
        
        // Suit l'engagement
        this.trackEngagement();
    },

    // Suit les impressions publicitaires
    trackAdImpressions: function() {
        const adContainers = document.querySelectorAll('.ad-container');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.logAdImpression(entry.target.dataset.adSlot);
                }
            });
        }, {
            threshold: 0.5
        });

        adContainers.forEach(container => observer.observe(container));
    },

    // Enregistre une impression publicitaire
    logAdImpression: function(adSlot) {
        // Envoie les données à Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_impression', {
                'event_category': 'Advertising',
                'event_label': adSlot
            });
        }
    },

    // Suit les conversions
    trackConversions: function() {
        // Suit les inscriptions newsletter
        document.querySelectorAll('.newsletter-form').forEach(form => {
            form.addEventListener('submit', () => {
                this.logConversion('newsletter_signup');
            });
        });

        // Suit les abonnements premium
        document.querySelectorAll('.btn-subscribe').forEach(btn => {
            btn.addEventListener('click', () => {
                this.logConversion('premium_click');
            });
        });
    },

    // Enregistre une conversion
    logConversion: function(type) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'event_category': 'Conversions',
                'event_label': type
            });
        }
    },

    // Suit l'engagement
    trackEngagement: function() {
        // Temps passé sur la page
        let startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = (Date.now() - startTime) / 1000;
            this.logEngagement('time_on_page', timeSpent);
        });

        // Profondeur de défilement
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
            if (scrolled > maxScroll) {
                maxScroll = scrolled;
                if (maxScroll >= 25 && maxScroll % 25 === 0) {
                    this.logEngagement('scroll_depth', maxScroll);
                }
            }
        });
    },

    // Enregistre l'engagement
    logEngagement: function(type, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'engagement', {
                'event_category': 'Engagement',
                'event_label': type,
                'value': value
            });
        }
    }
};

// Initialise le système de monétisation
document.addEventListener('DOMContentLoaded', () => {
    monetizationEngine.init();
});
