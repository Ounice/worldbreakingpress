// Configuration AdSense optimisée pour maximiser les revenus
const adsenseConfig = {
    // Emplacements des publicités
    adPlacements: {
        // Bannière en haut de l'article
        topBanner: {
            selector: '.article-header',
            position: 'after',
            format: 'auto',
            responsive: true,
            style: {
                display: 'block',
                marginBottom: '2rem',
                textAlign: 'center'
            }
        },
        // Publicité dans le contenu
        inContent: {
            selector: '.article-body p',
            frequency: 4, // Toutes les 4 paragraphes
            format: 'auto',
            responsive: true,
            style: {
                display: 'block',
                margin: '2rem auto',
                textAlign: 'center'
            }
        },
        // Publicité sidebar (pour grands écrans)
        sidebar: {
            selector: '.article-content',
            position: 'beside',
            format: 'vertical',
            minScreenWidth: 1200, // Uniquement sur grands écrans
            style: {
                position: 'sticky',
                top: '2rem'
            }
        },
        // Bannière entre les articles connexes
        relatedContent: {
            selector: '.related-articles',
            position: 'before',
            format: 'auto',
            responsive: true,
            style: {
                display: 'block',
                margin: '2rem auto',
                textAlign: 'center'
            }
        }
    },

    // Paramètres globaux
    globalSettings: {
        enableAutoAds: true, // Active les publicités automatiques
        enableAnchorAds: true, // Active les publicités ancrées en bas
        enableInArticleAds: true, // Active les publicités dans l'article
        enableResponsive: true, // Adapte les publicités à la taille de l'écran
        prefetchAds: true, // Précharge les publicités pour de meilleures performances
    },

    // Optimisations pour mobile
    mobileSettings: {
        enableAnchorAds: true,
        anchorPosition: 'bottom', // En bas sur mobile
        refreshInterval: 30, // Rafraîchit les publicités toutes les 30 secondes
    },

    // Paramètres de ciblage
    targeting: {
        enablePersonalizedAds: true,
        enableTopics: true,
        enableViewedContent: true,
    },

    // Optimisations de performance
    performance: {
        lazyLoad: true, // Charge les publicités à la demande
        preconnect: true, // Préconnexion aux serveurs AdSense
        timeout: 2000, // Timeout pour le chargement des publicités
    },

    // Fonction d'initialisation
    init: function() {
        // Vérifie si AdBlock est activé
        this.checkAdBlocker();
        
        // Initialise les emplacements publicitaires
        this.initializePlacements();
        
        // Configure les événements de suivi
        this.setupTracking();
        
        // Optimise pour mobile
        if (window.innerWidth <= 768) {
            this.applyMobileSettings();
        }
    },

    // Vérifie la présence d'un bloqueur de publicités
    checkAdBlocker: function() {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        
        window.setTimeout(function() {
            if (testAd.offsetHeight === 0) {
                // AdBlock détecté
                console.log('AdBlock detected');
                // Affiche un message courtois demandant de désactiver AdBlock
                this.showAdBlockMessage();
            }
            testAd.remove();
        }, 100);
    },

    // Message pour les utilisateurs d'AdBlock
    showAdBlockMessage: function() {
        const message = document.createElement('div');
        message.className = 'adblock-message';
        message.innerHTML = `
            <div class="adblock-notice">
                <h3>Nous avons besoin de votre soutien !</h3>
                <p>Nous remarquons que vous utilisez un bloqueur de publicités. Notre contenu est gratuit grâce à la publicité.</p>
                <p>Pour continuer à nous soutenir, merci de désactiver votre bloqueur pour World Breaking Press.</p>
                <button onclick="this.parentElement.style.display='none'">J'ai compris</button>
            </div>
        `;
        document.body.appendChild(message);
    },

    // Initialise les emplacements publicitaires
    initializePlacements: function() {
        Object.keys(this.adPlacements).forEach(placement => {
            const config = this.adPlacements[placement];
            const elements = document.querySelectorAll(config.selector);
            
            elements.forEach((element, index) => {
                if (placement === 'inContent' && (index + 1) % config.frequency !== 0) {
                    return;
                }
                
                const adElement = document.createElement('div');
                adElement.className = `ad-container ad-${placement}`;
                Object.assign(adElement.style, config.style);
                
                if (config.position === 'after') {
                    element.after(adElement);
                } else if (config.position === 'before') {
                    element.before(adElement);
                } else if (config.position === 'beside' && window.innerWidth >= config.minScreenWidth) {
                    // Crée une mise en page avec sidebar
                    const wrapper = document.createElement('div');
                    wrapper.className = 'content-with-sidebar';
                    element.parentNode.insertBefore(wrapper, element);
                    wrapper.appendChild(element);
                    wrapper.appendChild(adElement);
                }
            });
        });
    },

    // Configure le suivi des performances
    setupTracking: function() {
        // Suivi des impressions
        document.querySelectorAll('.ad-container').forEach(ad => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Enregistre l'impression
                        this.logAdImpression(ad.className);
                    }
                });
            });
            observer.observe(ad);
        });
    },

    // Enregistre les impressions publicitaires
    logAdImpression: function(adClass) {
        // Envoie les données à Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_impression', {
                'event_category': 'Advertising',
                'event_label': adClass
            });
        }
    },

    // Applique les paramètres mobiles
    applyMobileSettings: function() {
        Object.assign(this.globalSettings, this.mobileSettings);
        
        // Optimise la disposition des publicités pour mobile
        document.querySelectorAll('.ad-sidebar').forEach(ad => ad.style.display = 'none');
        document.querySelectorAll('.ad-container').forEach(ad => {
            ad.style.margin = '1rem auto';
            ad.style.maxWidth = '100%';
        });
    }
};

// Initialise la configuration AdSense au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    adsenseConfig.init();
});
