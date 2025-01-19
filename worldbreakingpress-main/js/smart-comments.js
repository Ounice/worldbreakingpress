// Système de commentaires intelligent avec modération AI et engagement optimisé
const smartComments = {
    config: {
        // Configuration générale
        maxCommentsPerPage: 50,
        commentsPerLoad: 10,
        sortOptions: ['pertinence', 'recent', 'populaire'],
        moderationEnabled: true,
        aiModeration: true,
        realtimeUpdates: true,

        // Configuration AI
        aiConfig: {
            toxicityThreshold: 0.8,
            spamThreshold: 0.7,
            qualityThreshold: 0.6,
            languages: ['fr', 'en', 'es', 'ar'],
        },

        // Configuration engagement
        engagement: {
            upvotesEnabled: true,
            replyThreads: true,
            mediaAttachments: true,
            mentionsEnabled: true,
            shareEnabled: true
        },

        // Configuration récompenses
        rewards: {
            topCommenterBadge: true,
            expertBadge: true,
            contributorPoints: true
        }
    },

    // État du système
    state: {
        currentSort: 'pertinence',
        loadedComments: 0,
        totalComments: 0,
        userReputation: 0,
        moderationQueue: []
    },

    // Initialisation
    init: function() {
        this.setupCommentSystem();
        this.initializeAIModeration();
        this.setupRealtimeUpdates();
        this.initializeEngagement();
        this.setupRewards();
    },

    // Configuration du système de commentaires
    setupCommentSystem: function() {
        this.createCommentInterface();
        this.loadInitialComments();
        this.setupInfiniteScroll();
        this.initializeCommentEditor();
    },

    // Crée l'interface des commentaires
    createCommentInterface: function() {
        const container = document.createElement('section');
        container.className = 'comments-section';
        container.innerHTML = `
            <div class="comments-header">
                <h3>Discussion <span class="comment-count"></span></h3>
                <div class="comments-controls">
                    <select class="sort-select">
                        ${this.config.sortOptions.map(option => 
                            `<option value="${option}">${option.charAt(0).toUpperCase() + option.slice(1)}</option>`
                        ).join('')}
                    </select>
                    <button class="btn-collapse-all">Réduire tout</button>
                </div>
            </div>
            <div class="comment-editor">
                <div class="user-avatar"></div>
                <div class="editor-container">
                    <div class="editor" contenteditable="true" placeholder="Participez à la discussion..."></div>
                    <div class="editor-controls">
                        <button class="btn-emoji" title="Ajouter un emoji">😊</button>
                        <button class="btn-image" title="Ajouter une image">📷</button>
                        <button class="btn-gif" title="Ajouter un GIF">GIF</button>
                        <button class="btn-submit" disabled>Commenter</button>
                    </div>
                </div>
            </div>
            <div class="comments-list"></div>
            <div class="comments-loader" hidden>
                <div class="loader-spinner"></div>
            </div>
        `;

        // Ajoute au DOM
        const article = document.querySelector('.article-content');
        if (article) {
            article.after(container);
        }

        // Configure les événements
        this.setupCommentEvents(container);
    },

    // Configure les événements des commentaires
    setupCommentEvents: function(container) {
        // Tri des commentaires
        container.querySelector('.sort-select').addEventListener('change', (e) => {
            this.state.currentSort = e.target.value;
            this.reloadComments();
        });

        // Éditeur de commentaires
        const editor = container.querySelector('.editor');
        const submitBtn = container.querySelector('.btn-submit');

        editor.addEventListener('input', () => {
            submitBtn.disabled = editor.textContent.trim().length === 0;
        });

        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        // Boutons de contrôle
        container.querySelector('.btn-emoji').addEventListener('click', () => {
            this.showEmojiPicker(editor);
        });

        container.querySelector('.btn-image').addEventListener('click', () => {
            this.showImageUpload(editor);
        });

        container.querySelector('.btn-gif').addEventListener('click', () => {
            this.showGifPicker(editor);
        });

        submitBtn.addEventListener('click', () => {
            this.submitComment(editor.textContent);
        });
    },

    // Initialise la modération AI
    initializeAIModeration: function() {
        // Charge le modèle de modération
        this.loadModerationModel();

        // Configure les règles de modération
        this.setupModerationRules();

        // Configure le traitement en temps réel
        this.setupRealtimeModeration();
    },

    // Charge le modèle de modération
    loadModerationModel: async function() {
        try {
            // Utilise TensorFlow.js pour la modération
            const model = await tf.loadLayersModel('/models/moderation/model.json');
            this.moderationModel = model;
        } catch (error) {
            console.error('Erreur de chargement du modèle de modération:', error);
            // Fallback vers une modération basique
            this.moderationModel = null;
        }
    },

    // Configure les règles de modération
    setupModerationRules: function() {
        this.moderationRules = {
            // Détection de spam
            spam: {
                patterns: [
                    /\b(?:viagra|casino|lottery)\b/i,
                    /\b(?:make money fast|work from home)\b/i
                ],
                urls: {
                    maxCount: 2,
                    whitelist: ['worldbreakingpress.com', 'trusted-sources.com']
                }
            },
            // Détection de contenu toxique
            toxic: {
                patterns: [
                    /\b(?:hate|racist|stupid)\b/i
                ],
                severity: {
                    high: /\b(?:explicit words)\b/i,
                    medium: /\b(?:mild words)\b/i,
                    low: /\b(?:questionable words)\b/i
                }
            },
            // Qualité du contenu
            quality: {
                minLength: 10,
                maxLength: 2000,
                requiresPunctuation: true,
                requiresCapitalization: true
            }
        };
    },

    // Configure la modération en temps réel
    setupRealtimeModeration: function() {
        const editor = document.querySelector('.comment-editor .editor');
        if (!editor) return;

        let moderationTimeout;
        editor.addEventListener('input', () => {
            clearTimeout(moderationTimeout);
            moderationTimeout = setTimeout(() => {
                this.moderateContent(editor.textContent);
            }, 500);
        });
    },

    // Modère le contenu
    moderateContent: async function(content) {
        if (!content.trim()) return;

        const results = {
            spam: this.checkSpam(content),
            toxic: await this.checkToxicity(content),
            quality: this.checkQuality(content)
        };

        this.handleModerationResults(results);
    },

    // Vérifie le spam
    checkSpam: function(content) {
        const rules = this.moderationRules.spam;
        let spamScore = 0;

        // Vérifie les patterns
        rules.patterns.forEach(pattern => {
            if (pattern.test(content)) spamScore += 0.3;
        });

        // Compte les URLs
        const urls = content.match(/https?:\/\/[^\s]+/g) || [];
        if (urls.length > rules.urls.maxCount) {
            spamScore += 0.4;
        }

        // Vérifie les URLs autorisées
        urls.forEach(url => {
            if (!rules.urls.whitelist.some(domain => url.includes(domain))) {
                spamScore += 0.2;
            }
        });

        return spamScore;
    },

    // Vérifie la toxicité avec AI
    async checkToxicity(content) {
        if (this.moderationModel) {
            try {
                const prediction = await this.moderationModel.predict(
                    tf.tensor([this.preprocessText(content)])
                ).array();
                return prediction[0][0]; // Score de toxicité
            } catch (error) {
                console.error('Erreur de prédiction de toxicité:', error);
                return this.fallbackToxicityCheck(content);
            }
        } else {
            return this.fallbackToxicityCheck(content);
        }
    },

    // Vérification de toxicité de secours
    fallbackToxicityCheck: function(content) {
        const rules = this.moderationRules.toxic;
        let toxicScore = 0;

        // Vérifie les patterns de toxicité
        rules.patterns.forEach(pattern => {
            if (pattern.test(content)) toxicScore += 0.3;
        });

        // Vérifie la sévérité
        if (rules.severity.high.test(content)) toxicScore += 0.5;
        if (rules.severity.medium.test(content)) toxicScore += 0.3;
        if (rules.severity.low.test(content)) toxicScore += 0.1;

        return toxicScore;
    },

    // Vérifie la qualité du contenu
    checkQuality: function(content) {
        const rules = this.moderationRules.quality;
        let qualityScore = 1;

        // Vérifie la longueur
        if (content.length < rules.minLength) qualityScore -= 0.3;
        if (content.length > rules.maxLength) qualityScore -= 0.2;

        // Vérifie la ponctuation
        if (rules.requiresPunctuation && !/[.!?]/.test(content)) {
            qualityScore -= 0.2;
        }

        // Vérifie la capitalisation
        if (rules.requiresCapitalization && !/[A-Z]/.test(content)) {
            qualityScore -= 0.2;
        }

        return Math.max(0, qualityScore);
    },

    // Gère les résultats de la modération
    handleModerationResults: function(results) {
        const editor = document.querySelector('.comment-editor');
        const submitBtn = editor.querySelector('.btn-submit');

        // Calcule le score global
        const overallScore = (
            (1 - results.spam) * 0.4 +
            (1 - results.toxic) * 0.4 +
            results.quality * 0.2
        );

        // Met à jour l'interface
        if (overallScore < 0.6) {
            this.showModerationWarning(results);
            submitBtn.disabled = true;
        } else {
            this.hideModerationWarning();
            submitBtn.disabled = false;
        }
    },

    // Affiche un avertissement de modération
    showModerationWarning: function(results) {
        let warning = document.querySelector('.moderation-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.className = 'moderation-warning';
            document.querySelector('.editor-container').appendChild(warning);
        }

        let message = 'Votre commentaire ne peut pas être publié car :';
        if (results.spam > this.config.aiConfig.spamThreshold) {
            message += '<br>- Il contient du contenu promotionnel non autorisé';
        }
        if (results.toxic > this.config.aiConfig.toxicityThreshold) {
            message += '<br>- Il contient du contenu inapproprié';
        }
        if (results.quality < this.config.aiConfig.qualityThreshold) {
            message += '<br>- Il ne respecte pas nos critères de qualité';
        }

        warning.innerHTML = message;
    },

    // Cache l'avertissement de modération
    hideModerationWarning: function() {
        const warning = document.querySelector('.moderation-warning');
        if (warning) warning.remove();
    },

    // Configure les mises à jour en temps réel
    setupRealtimeUpdates: function() {
        // Utilise WebSocket pour les mises à jour en temps réel
        this.initializeWebSocket();
        
        // Configure les notifications
        this.setupNotifications();
    },

    // Initialise WebSocket
    initializeWebSocket: function() {
        this.ws = new WebSocket('wss://api.worldbreakingpress.com/comments');
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeUpdate(data);
        };

        this.ws.onclose = () => {
            // Reconnexion automatique
            setTimeout(() => this.initializeWebSocket(), 3000);
        };
    },

    // Gère les mises à jour en temps réel
    handleRealtimeUpdate: function(data) {
        switch (data.type) {
            case 'new_comment':
                this.addNewComment(data.comment);
                break;
            case 'edit_comment':
                this.updateComment(data.comment);
                break;
            case 'delete_comment':
                this.removeComment(data.commentId);
                break;
            case 'vote_update':
                this.updateVotes(data.commentId, data.votes);
                break;
        }
    },

    // Configure le système de récompenses
    setupRewards: function() {
        this.initializeReputationSystem();
        this.setupBadges();
        this.setupLevels();
    },

    // Initialise le système de réputation
    initializeReputationSystem: function() {
        this.reputationRules = {
            upvoteReceived: 10,
            downvoteReceived: -2,
            commentPosted: 5,
            commentDeleted: -5,
            qualityThreshold: 50
        };

        // Charge la réputation de l'utilisateur
        this.loadUserReputation();
    },

    // Configure les badges
    setupBadges: function() {
        this.badges = {
            newbie: {
                name: 'Nouveau',
                requirement: 0,
                icon: '🌱'
            },
            regular: {
                name: 'Régulier',
                requirement: 100,
                icon: '⭐'
            },
            expert: {
                name: 'Expert',
                requirement: 500,
                icon: '👑'
            },
            moderator: {
                name: 'Modérateur',
                requirement: 1000,
                icon: '🛡️'
            }
        };

        // Vérifie et attribue les badges
        this.checkUserBadges();
    },

    // Charge la réputation de l'utilisateur
    loadUserReputation: function() {
        const stored = localStorage.getItem('wbp_user_reputation');
        if (stored) {
            this.state.userReputation = parseInt(stored);
        }
    },

    // Met à jour la réputation
    updateReputation: function(points) {
        this.state.userReputation += points;
        localStorage.setItem('wbp_user_reputation', this.state.userReputation.toString());
        
        // Vérifie les nouveaux badges
        this.checkUserBadges();
        
        // Met à jour l'affichage
        this.updateReputationDisplay();
    },

    // Vérifie les badges de l'utilisateur
    checkUserBadges: function() {
        const reputation = this.state.userReputation;
        let newBadges = [];

        Object.entries(this.badges).forEach(([key, badge]) => {
            if (reputation >= badge.requirement) {
                newBadges.push(badge);
            }
        });

        // Attribue les nouveaux badges
        this.awardBadges(newBadges);
    },

    // Attribue des badges
    awardBadges: function(badges) {
        badges.forEach(badge => {
            if (!this.userHasBadge(badge.name)) {
                this.showBadgeNotification(badge);
                this.saveBadge(badge);
            }
        });
    },

    // Vérifie si l'utilisateur a un badge
    userHasBadge: function(badgeName) {
        const userBadges = JSON.parse(localStorage.getItem('wbp_user_badges') || '[]');
        return userBadges.includes(badgeName);
    },

    // Sauvegarde un badge
    saveBadge: function(badge) {
        const userBadges = JSON.parse(localStorage.getItem('wbp_user_badges') || '[]');
        userBadges.push(badge.name);
        localStorage.setItem('wbp_user_badges', JSON.stringify(userBadges));
    },

    // Affiche une notification de badge
    showBadgeNotification: function(badge) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-info">
                <h4>Nouveau badge débloqué !</h4>
                <p>Vous avez obtenu le badge "${badge.name}"</p>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    },

    // Met à jour l'affichage de la réputation
    updateReputationDisplay: function() {
        const repDisplay = document.querySelector('.user-reputation');
        if (repDisplay) {
            repDisplay.textContent = this.state.userReputation;
        }
    }
};

// Initialise le système de commentaires
document.addEventListener('DOMContentLoaded', () => {
    smartComments.init();
});
