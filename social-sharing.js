// Système de partage social avancé avec viralité et analytics
const socialSharing = {
    config: {
        // Configuration générale
        enabled: true,
        platforms: {
            facebook: true,
            twitter: true,
            linkedin: true,
            whatsapp: true,
            telegram: true,
            email: true
        },

        // Personnalisation
        customization: {
            buttonStyle: 'modern', // modern, classic, minimal
            iconStyle: 'solid',    // solid, outline, branded
            position: 'sidebar',   // sidebar, inline, floating
            mobilePosition: 'bottom' // bottom, floating
        },

        // Fonctionnalités avancées
        features: {
            shareCount: true,      // Affiche le nombre de partages
            copyLink: true,        // Bouton de copie de lien
            qrCode: true,          // Génère un QR code
            scheduling: true,      // Programmation de partages
            analytics: true        // Suivi des partages
        },

        // Viralité
        virality: {
            incentives: true,      // Récompenses pour le partage
            referralTracking: true, // Suivi des références
            socialProof: true,     // Preuve sociale
            shareGoals: true       // Objectifs de partage
        },

        // Analytics
        analytics: {
            trackShares: true,     // Suit les partages
            trackClicks: true,     // Suit les clics
            trackConversions: true, // Suit les conversions
            heatmap: true          // Carte de chaleur
        }
    },

    // État du système
    state: {
        totalShares: 0,
        platformShares: {},
        activeReferrals: [],
        shareGoals: {},
        analytics: {}
    },

    // Initialisation
    init: function() {
        if (!this.config.enabled) return;

        this.loadState();
        this.setupSharingButtons();
        this.setupViralitySystem();
        this.setupAnalytics();
        this.initializeFloatingBar();
        this.setupMobileOptimization();
    },

    // Charge l'état
    loadState: function() {
        const stored = localStorage.getItem('wbp_social_state');
        if (stored) {
            this.state = {...this.state, ...JSON.parse(stored)};
        }
        this.saveState();
    },

    // Configure les boutons de partage
    setupSharingButtons: function() {
        // Crée les boutons pour chaque plateforme
        const buttons = this.createSharingButtons();
        
        // Ajoute les boutons selon la position configurée
        this.addButtonsToPage(buttons);
        
        // Configure les événements
        this.setupButtonEvents(buttons);
    },

    // Crée les boutons de partage
    createSharingButtons: function() {
        const container = document.createElement('div');
        container.className = `sharing-buttons ${this.config.customization.buttonStyle}`;

        // Ajoute les boutons pour chaque plateforme activée
        Object.entries(this.config.platforms).forEach(([platform, enabled]) => {
            if (!enabled) return;

            const button = document.createElement('button');
            button.className = `share-button ${platform}`;
            button.innerHTML = `
                <i class="icon-${platform} ${this.config.customization.iconStyle}"></i>
                ${this.config.features.shareCount ? 
                    `<span class="share-count">${this.getShareCount(platform)}</span>` : 
                    ''}
            `;

            container.appendChild(button);
        });

        // Ajoute les fonctionnalités avancées
        if (this.config.features.copyLink) {
            this.addCopyLinkButton(container);
        }

        if (this.config.features.qrCode) {
            this.addQRCodeButton(container);
        }

        return container;
    },

    // Ajoute les boutons à la page
    addButtonsToPage: function(buttons) {
        switch (this.config.customization.position) {
            case 'sidebar':
                this.addToSidebar(buttons);
                break;
            case 'inline':
                this.addInline(buttons);
                break;
            case 'floating':
                this.addFloating(buttons);
                break;
        }

        // Ajoute la version mobile
        this.addMobileButtons(buttons);
    },

    // Ajoute à la barre latérale
    addToSidebar: function(buttons) {
        const sidebar = document.createElement('div');
        sidebar.className = 'sharing-sidebar';
        sidebar.appendChild(buttons.cloneNode(true));

        document.body.appendChild(sidebar);

        // Rend la barre latérale sticky
        this.makeSidebarSticky(sidebar);
    },

    // Rend la barre latérale sticky
    makeSidebarSticky: function(sidebar) {
        const article = document.querySelector('.article-content');
        if (!article) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        sidebar.classList.add('sticky');
                    } else {
                        sidebar.classList.remove('sticky');
                    }
                });
            },
            {
                threshold: 0
            }
        );

        observer.observe(article);
    },

    // Ajoute en ligne
    addInline: function(buttons) {
        const article = document.querySelector('.article-content');
        if (!article) return;

        const inlineContainer = document.createElement('div');
        inlineContainer.className = 'sharing-inline';
        inlineContainer.appendChild(buttons.cloneNode(true));

        // Ajoute au début et à la fin de l'article
        article.insertBefore(inlineContainer.cloneNode(true), article.firstChild);
        article.appendChild(inlineContainer.cloneNode(true));
    },

    // Ajoute en flottant
    addFloating: function(buttons) {
        const floating = document.createElement('div');
        floating.className = 'sharing-floating';
        floating.appendChild(buttons.cloneNode(true));

        document.body.appendChild(floating);

        // Anime l'apparition
        this.animateFloating(floating);
    },

    // Anime la barre flottante
    animateFloating: function(floating) {
        let lastScroll = window.scrollY;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScroll = window.scrollY;
                    
                    if (currentScroll > lastScroll) {
                        floating.classList.add('hidden');
                    } else {
                        floating.classList.remove('hidden');
                    }

                    lastScroll = currentScroll;
                    ticking = false;
                });

                ticking = true;
            }
        });
    },

    // Ajoute les boutons mobiles
    addMobileButtons: function(buttons) {
        const mobileContainer = document.createElement('div');
        mobileContainer.className = `sharing-mobile ${this.config.customization.mobilePosition}`;
        mobileContainer.appendChild(buttons.cloneNode(true));

        document.body.appendChild(mobileContainer);

        // Gère l'affichage mobile
        this.handleMobileDisplay(mobileContainer);
    },

    // Gère l'affichage mobile
    handleMobileDisplay: function(container) {
        if (this.config.customization.mobilePosition === 'bottom') {
            // Affiche/cache selon le scroll
            let lastScroll = window.scrollY;
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const currentScroll = window.scrollY;
                        
                        if (currentScroll > lastScroll) {
                            container.classList.add('hidden');
                        } else {
                            container.classList.remove('hidden');
                        }

                        lastScroll = currentScroll;
                        ticking = false;
                    });

                    ticking = true;
                }
            });
        }
    },

    // Configure les événements des boutons
    setupButtonEvents: function(container) {
        // Événements de partage
        container.querySelectorAll('.share-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const platform = e.currentTarget.className.split(' ')[1];
                this.share(platform);
            });
        });

        // Événements de copie de lien
        const copyButton = container.querySelector('.copy-link');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.copyLink();
            });
        }

        // Événements de QR Code
        const qrButton = container.querySelector('.qr-code');
        if (qrButton) {
            qrButton.addEventListener('click', () => {
                this.showQRCode();
            });
        }
    },

    // Partage sur une plateforme
    share: function(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const text = encodeURIComponent(this.getMetaDescription());

        let shareUrl;
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
                break;
            case 'whatsapp':
                shareUrl = `whatsapp://send?text=${title}%20${url}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${title}&body=${text}%20${url}`;
                break;
        }

        // Ouvre la fenêtre de partage
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            this.trackShare(platform);
        }
    },

    // Copie le lien
    copyLink: function() {
        const url = window.location.href;
        
        navigator.clipboard.writeText(url).then(() => {
            this.showCopySuccess();
            this.trackShare('copy');
        }).catch(error => {
            console.error('Erreur de copie:', error);
            this.showCopyError();
        });
    },

    // Affiche le QR Code
    showQRCode: function() {
        const url = window.location.href;
        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-modal';
        qrContainer.innerHTML = `
            <div class="qr-content">
                <h3>Scannez pour partager</h3>
                <div id="qr-code"></div>
                <button class="close-qr">&times;</button>
            </div>
        `;

        document.body.appendChild(qrContainer);

        // Génère le QR code
        new QRCode(document.getElementById('qr-code'), {
            text: url,
            width: 256,
            height: 256
        });

        // Fermeture
        qrContainer.querySelector('.close-qr').addEventListener('click', () => {
            qrContainer.remove();
        });

        this.trackShare('qr');
    },

    // Configure le système de viralité
    setupViralitySystem: function() {
        if (!this.config.virality.enabled) return;

        // Configure les incitations
        if (this.config.virality.incentives) {
            this.setupShareIncentives();
        }

        // Configure le suivi des références
        if (this.config.virality.referralTracking) {
            this.setupReferralTracking();
        }

        // Configure la preuve sociale
        if (this.config.virality.socialProof) {
            this.setupSocialProof();
        }

        // Configure les objectifs de partage
        if (this.config.virality.shareGoals) {
            this.setupShareGoals();
        }
    },

    // Configure les incitations au partage
    setupShareIncentives: function() {
        // Définit les récompenses
        const rewards = {
            shares: {
                5: { points: 100, badge: '🌟 Influenceur Débutant' },
                25: { points: 500, badge: '🏆 Influenceur Pro' },
                100: { points: 2000, badge: '👑 Super Influenceur' }
            },
            referrals: {
                3: { points: 200, badge: '🤝 Ambassadeur Bronze' },
                10: { points: 1000, badge: '🥈 Ambassadeur Argent' },
                50: { points: 5000, badge: '🥇 Ambassadeur Or' }
            }
        };

        // Vérifie et attribue les récompenses
        this.checkAndAwardIncentives(rewards);
    },

    // Configure le suivi des références
    setupReferralTracking: function() {
        // Génère un code de référence unique
        const referralCode = this.generateReferralCode();

        // Ajoute le code aux liens de partage
        this.addReferralToLinks(referralCode);

        // Suit les conversions
        this.trackReferralConversions();
    },

    // Configure la preuve sociale
    setupSocialProof: function() {
        // Crée l'élément de preuve sociale
        const proofElement = document.createElement('div');
        proofElement.className = 'social-proof';
        proofElement.innerHTML = `
            <div class="proof-content">
                <div class="share-stats">
                    <span class="total-shares">${this.state.totalShares}</span> partages
                </div>
                <div class="recent-shares">
                    ${this.getRecentShares()}
                </div>
            </div>
        `;

        // Ajoute à la page
        const sharingContainer = document.querySelector('.sharing-buttons');
        if (sharingContainer) {
            sharingContainer.appendChild(proofElement);
        }

        // Met à jour en temps réel
        this.setupRealtimeProof(proofElement);
    },

    // Configure les objectifs de partage
    setupShareGoals: function() {
        // Définit les objectifs
        const goals = {
            daily: { target: 10, reward: 100 },
            weekly: { target: 50, reward: 500 },
            monthly: { target: 200, reward: 2000 }
        };

        // Crée l'interface des objectifs
        this.createGoalsUI(goals);

        // Suit la progression
        this.trackGoalsProgress(goals);
    },

    // Configure les analytics
    setupAnalytics: function() {
        if (!this.config.analytics.enabled) return;

        // Suit les partages
        if (this.config.analytics.trackShares) {
            this.setupShareTracking();
        }

        // Suit les clics
        if (this.config.analytics.trackClicks) {
            this.setupClickTracking();
        }

        // Suit les conversions
        if (this.config.analytics.trackConversions) {
            this.setupConversionTracking();
        }

        // Configure la heatmap
        if (this.config.analytics.heatmap) {
            this.setupHeatmap();
        }
    },

    // Utilitaires
    getMetaDescription: function() {
        const meta = document.querySelector('meta[name="description"]');
        return meta ? meta.getAttribute('content') : '';
    },

    getShareCount: function(platform) {
        return this.state.platformShares[platform] || 0;
    },

    showCopySuccess: function() {
        const message = document.createElement('div');
        message.className = 'copy-message success';
        message.textContent = 'Lien copié !';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    },

    showCopyError: function() {
        const message = document.createElement('div');
        message.className = 'copy-message error';
        message.textContent = 'Erreur de copie';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    },

    generateReferralCode: function() {
        return 'REF' + Math.random().toString(36).substr(2, 9).toUpperCase();
    },

    getRecentShares: function() {
        // Simule des partages récents
        const recent = [
            { name: 'Pierre', time: '2 min' },
            { name: 'Marie', time: '5 min' },
            { name: 'Jean', time: '10 min' }
        ];

        return recent.map(share => `
            <div class="recent-share">
                ${share.name} a partagé il y a ${share.time}
            </div>
        `).join('');
    },

    trackShare: function(platform) {
        // Incrémente les compteurs
        this.state.totalShares++;
        this.state.platformShares[platform] = (this.state.platformShares[platform] || 0) + 1;

        // Met à jour l'affichage
        this.updateShareCounts();

        // Enregistre l'analytics
        this.logShareAnalytics(platform);

        // Sauvegarde l'état
        this.saveState();
    },

    updateShareCounts: function() {
        document.querySelectorAll('.share-count').forEach(counter => {
            const platform = counter.closest('.share-button').className.split(' ')[1];
            counter.textContent = this.getShareCount(platform);
        });
    },

    saveState: function() {
        localStorage.setItem('wbp_social_state', JSON.stringify(this.state));
    }
};

// Initialise le système de partage social
document.addEventListener('DOMContentLoaded', () => {
    socialSharing.init();
});
