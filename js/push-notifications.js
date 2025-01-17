// Système de notifications push pour maximiser le réengagement
const pushNotifications = {
    config: {
        // Configuration générale
        enabled: true,
        vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY',
        serviceWorkerPath: '/service-worker.js',
        
        // Types de notifications
        notificationTypes: {
            breaking: true,    // Breaking news
            daily: true,       // Résumé quotidien
            personalized: true, // Recommandations personnalisées
            engagement: true,   // Rappels d'engagement
            promotional: true   // Offres spéciales
        },

        // Fréquence
        frequency: {
            maxPerDay: 5,
            minIntervalMinutes: 120,
            quietHoursStart: 22, // 22h
            quietHoursEnd: 8     // 8h
        },

        // Personnalisation
        customization: {
            userPreferences: true,
            locationBased: true,
            topicBased: true
        }
    },

    // État du système
    state: {
        isSubscribed: false,
        subscription: null,
        lastNotification: null,
        dailyCount: 0,
        topics: [],
        preferences: {}
    },

    // Initialisation
    init: async function() {
        if (!this.config.enabled) return;

        try {
            await this.checkPermission();
            await this.registerServiceWorker();
            await this.loadUserState();
            this.setupNotificationSystem();
            this.setupPreferences();
            this.initializeTopics();
        } catch (error) {
            console.error('Erreur d\'initialisation des notifications:', error);
        }
    },

    // Vérifie la permission
    checkPermission: async function() {
        if (!('Notification' in window)) {
            throw new Error('Les notifications ne sont pas supportées');
        }

        if (Notification.permission === 'denied') {
            throw new Error('Les notifications ont été bloquées');
        }

        if (Notification.permission === 'default') {
            await this.requestPermission();
        }
    },

    // Demande la permission
    requestPermission: async function() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showWelcomeNotification();
            }
        } catch (error) {
            console.error('Erreur de demande de permission:', error);
            throw error;
        }
    },

    // Enregistre le service worker
    registerServiceWorker: async function() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    this.config.serviceWorkerPath
                );
                this.setupSubscription(registration);
            } catch (error) {
                console.error('Erreur d\'enregistrement du service worker:', error);
                throw error;
            }
        } else {
            throw new Error('Service Worker non supporté');
        }
    },

    // Configure l'abonnement
    setupSubscription: async function(registration) {
        try {
            const subscription = await registration.pushManager.getSubscription();
            this.state.isSubscribed = !!subscription;
            this.state.subscription = subscription;

            if (!subscription) {
                await this.subscribe(registration);
            }
        } catch (error) {
            console.error('Erreur de configuration de l\'abonnement:', error);
            throw error;
        }
    },

    // S'abonne aux notifications
    subscribe: async function(registration) {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    this.config.vapidPublicKey
                )
            });

            this.state.isSubscribed = true;
            this.state.subscription = subscription;
            this.saveSubscription(subscription);
        } catch (error) {
            console.error('Erreur d\'abonnement:', error);
            throw error;
        }
    },

    // Convertit la clé VAPID
    urlBase64ToUint8Array: function(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    // Charge l'état utilisateur
    loadUserState: async function() {
        const stored = localStorage.getItem('wbp_push_state');
        if (stored) {
            this.state = {...this.state, ...JSON.parse(stored)};
        }
        await this.loadPreferences();
    },

    // Charge les préférences
    loadPreferences: async function() {
        const stored = localStorage.getItem('wbp_push_preferences');
        if (stored) {
            this.state.preferences = JSON.parse(stored);
        } else {
            this.state.preferences = this.getDefaultPreferences();
        }
    },

    // Obtient les préférences par défaut
    getDefaultPreferences: function() {
        return {
            breaking: true,
            daily: true,
            personalized: true,
            engagement: true,
            promotional: false,
            quiet_hours: true,
            quiet_hours_start: this.config.frequency.quietHoursStart,
            quiet_hours_end: this.config.frequency.quietHoursEnd
        };
    },

    // Configure le système de notifications
    setupNotificationSystem: function() {
        // Configure les différents types de notifications
        this.setupBreakingNews();
        this.setupDailyDigest();
        this.setupPersonalizedNotifications();
        this.setupEngagementReminders();
        this.setupPromotionalNotifications();
    },

    // Configure les breaking news
    setupBreakingNews: function() {
        if (!this.config.notificationTypes.breaking) return;

        // Écoute les événements WebSocket pour les breaking news
        this.setupBreakingNewsWebSocket();
    },

    // Configure le WebSocket des breaking news
    setupBreakingNewsWebSocket: function() {
        const ws = new WebSocket('wss://api.worldbreakingpress.com/breaking-news');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.shouldSendBreakingNews(data)) {
                this.sendBreakingNewsNotification(data);
            }
        };

        ws.onclose = () => {
            // Reconnexion automatique
            setTimeout(() => this.setupBreakingNewsWebSocket(), 3000);
        };
    },

    // Vérifie si on doit envoyer une breaking news
    shouldSendBreakingNews: function(data) {
        if (!this.state.preferences.breaking) return false;
        if (this.isInQuietHours()) return false;
        if (this.hasReachedDailyLimit()) return false;

        // Vérifie la pertinence selon les intérêts de l'utilisateur
        return this.isRelevantToUser(data);
    },

    // Configure le résumé quotidien
    setupDailyDigest: function() {
        if (!this.config.notificationTypes.daily) return;

        // Programme le résumé quotidien
        this.scheduleDailyDigest();
    },

    // Programme le résumé quotidien
    scheduleDailyDigest: function() {
        const now = new Date();
        const scheduledTime = new Date(now);
        scheduledTime.setHours(9, 0, 0, 0); // 9h du matin

        if (now > scheduledTime) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime - now;
        setTimeout(() => {
            this.sendDailyDigest();
            this.scheduleDailyDigest(); // Reprogramme pour le lendemain
        }, delay);
    },

    // Configure les notifications personnalisées
    setupPersonalizedNotifications: function() {
        if (!this.config.notificationTypes.personalized) return;

        // Analyse le comportement utilisateur
        this.trackUserBehavior();
        
        // Programme les recommandations personnalisées
        this.schedulePersonalizedRecommendations();
    },

    // Suit le comportement utilisateur
    trackUserBehavior: function() {
        // Suit les articles lus
        document.querySelectorAll('.article').forEach(article => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.logArticleRead(article.dataset.category);
                    }
                });
            }, {
                threshold: 0.5
            });

            observer.observe(article);
        });
    },

    // Programme les recommandations personnalisées
    schedulePersonalizedRecommendations: function() {
        setInterval(() => {
            if (this.shouldSendPersonalizedRecommendation()) {
                this.sendPersonalizedRecommendation();
            }
        }, this.config.frequency.minIntervalMinutes * 60 * 1000);
    },

    // Configure les rappels d'engagement
    setupEngagementReminders: function() {
        if (!this.config.notificationTypes.engagement) return;

        // Suit l'engagement utilisateur
        this.trackEngagement();
        
        // Programme les rappels
        this.scheduleEngagementReminders();
    },

    // Suit l'engagement
    trackEngagement: function() {
        let lastActivity = Date.now();

        // Met à jour la dernière activité
        const updateLastActivity = () => {
            lastActivity = Date.now();
        };

        // Événements à suivre
        const events = ['click', 'scroll', 'mousemove', 'keypress'];
        events.forEach(event => {
            document.addEventListener(event, updateLastActivity);
        });

        // Vérifie l'inactivité
        setInterval(() => {
            const inactiveTime = (Date.now() - lastActivity) / 1000 / 60; // en minutes
            if (inactiveTime > 60 && this.shouldSendEngagementReminder()) {
                this.sendEngagementReminder();
            }
        }, 5 * 60 * 1000); // Vérifie toutes les 5 minutes
    },

    // Configure les notifications promotionnelles
    setupPromotionalNotifications: function() {
        if (!this.config.notificationTypes.promotional) return;

        // Programme les notifications promotionnelles
        this.schedulePromotionalNotifications();
    },

    // Programme les notifications promotionnelles
    schedulePromotionalNotifications: function() {
        // Maximum une notification promotionnelle par jour
        const now = new Date();
        const scheduledTime = new Date(now);
        scheduledTime.setHours(14, 0, 0, 0); // 14h

        if (now > scheduledTime) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime - now;
        setTimeout(() => {
            if (this.shouldSendPromotionalNotification()) {
                this.sendPromotionalNotification();
            }
            this.schedulePromotionalNotifications(); // Reprogramme pour le lendemain
        }, delay);
    },

    // Configure les préférences
    setupPreferences: function() {
        if (!this.config.customization.userPreferences) return;

        this.createPreferencesUI();
    },

    // Crée l'interface des préférences
    createPreferencesUI: function() {
        const container = document.createElement('div');
        container.className = 'notification-preferences';
        container.innerHTML = `
            <h3>Préférences de notifications</h3>
            <div class="preferences-list">
                <label>
                    <input type="checkbox" name="breaking" 
                        ${this.state.preferences.breaking ? 'checked' : ''}>
                    Breaking News
                </label>
                <label>
                    <input type="checkbox" name="daily" 
                        ${this.state.preferences.daily ? 'checked' : ''}>
                    Résumé Quotidien
                </label>
                <label>
                    <input type="checkbox" name="personalized" 
                        ${this.state.preferences.personalized ? 'checked' : ''}>
                    Recommandations Personnalisées
                </label>
                <label>
                    <input type="checkbox" name="engagement" 
                        ${this.state.preferences.engagement ? 'checked' : ''}>
                    Rappels d'Engagement
                </label>
                <label>
                    <input type="checkbox" name="promotional" 
                        ${this.state.preferences.promotional ? 'checked' : ''}>
                    Offres Spéciales
                </label>
                <label>
                    <input type="checkbox" name="quiet_hours" 
                        ${this.state.preferences.quiet_hours ? 'checked' : ''}>
                    Mode Ne Pas Déranger
                </label>
                <div class="quiet-hours-settings">
                    <label>
                        De
                        <input type="time" name="quiet_hours_start" 
                            value="${this.formatTime(this.state.preferences.quiet_hours_start)}">
                    </label>
                    <label>
                        à
                        <input type="time" name="quiet_hours_end" 
                            value="${this.formatTime(this.state.preferences.quiet_hours_end)}">
                    </label>
                </div>
            </div>
        `;

        // Ajoute les gestionnaires d'événements
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                this.updatePreference(input.name, input.type === 'checkbox' ? input.checked : input.value);
            });
        });

        // Ajoute au DOM
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.appendChild(container);
        }
    },

    // Met à jour une préférence
    updatePreference: function(name, value) {
        this.state.preferences[name] = value;
        this.savePreferences();
    },

    // Sauvegarde les préférences
    savePreferences: function() {
        localStorage.setItem('wbp_push_preferences', 
            JSON.stringify(this.state.preferences)
        );
    },

    // Initialise les topics
    initializeTopics: function() {
        if (!this.config.customization.topicBased) return;

        // Charge les topics disponibles
        this.loadAvailableTopics();
        
        // Charge les abonnements de l'utilisateur
        this.loadUserTopics();
        
        // Crée l'interface de gestion des topics
        this.createTopicsUI();
    },

    // Charge les topics disponibles
    loadAvailableTopics: function() {
        this.availableTopics = [
            {
                id: 'tech',
                name: 'Technologie',
                description: 'Actualités tech et innovations'
            },
            {
                id: 'business',
                name: 'Business',
                description: 'Actualités économiques et business'
            },
            {
                id: 'politics',
                name: 'Politique',
                description: 'Actualités politiques'
            }
        ];
    },

    // Charge les topics de l'utilisateur
    loadUserTopics: function() {
        const stored = localStorage.getItem('wbp_user_topics');
        if (stored) {
            this.state.topics = JSON.parse(stored);
        }
    },

    // Crée l'interface des topics
    createTopicsUI: function() {
        const container = document.createElement('div');
        container.className = 'notification-topics';
        container.innerHTML = `
            <h3>Centres d'intérêt</h3>
            <div class="topics-list">
                ${this.availableTopics.map(topic => `
                    <label class="topic-item">
                        <input type="checkbox" name="${topic.id}" 
                            ${this.state.topics.includes(topic.id) ? 'checked' : ''}>
                        <div class="topic-info">
                            <span class="topic-name">${topic.name}</span>
                            <span class="topic-description">${topic.description}</span>
                        </div>
                    </label>
                `).join('')}
            </div>
        `;

        // Ajoute les gestionnaires d'événements
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                this.updateTopicSubscription(input.name, input.checked);
            });
        });

        // Ajoute au DOM
        const preferencesPanel = document.querySelector('.notification-preferences');
        if (preferencesPanel) {
            preferencesPanel.after(container);
        }
    },

    // Met à jour l'abonnement à un topic
    updateTopicSubscription: function(topicId, subscribed) {
        if (subscribed) {
            this.state.topics.push(topicId);
        } else {
            this.state.topics = this.state.topics.filter(id => id !== topicId);
        }
        this.saveTopics();
    },

    // Sauvegarde les topics
    saveTopics: function() {
        localStorage.setItem('wbp_user_topics', 
            JSON.stringify(this.state.topics)
        );
    },

    // Vérifie si on est en heures calmes
    isInQuietHours: function() {
        if (!this.state.preferences.quiet_hours) return false;

        const now = new Date();
        const hour = now.getHours();
        const start = this.state.preferences.quiet_hours_start;
        const end = this.state.preferences.quiet_hours_end;

        if (start < end) {
            return hour >= start && hour < end;
        } else {
            return hour >= start || hour < end;
        }
    },

    // Vérifie si on a atteint la limite quotidienne
    hasReachedDailyLimit: function() {
        return this.state.dailyCount >= this.config.frequency.maxPerDay;
    },

    // Vérifie si le contenu est pertinent pour l'utilisateur
    isRelevantToUser: function(data) {
        // Vérifie les topics
        if (data.category && this.state.topics.length > 0) {
            return this.state.topics.includes(data.category);
        }
        return true;
    },

    // Envoie une notification
    sendNotification: async function(title, options) {
        if (this.isInQuietHours()) return;
        if (this.hasReachedDailyLimit()) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                ...options,
                icon: '/images/logo.png',
                badge: '/images/badge.png'
            });

            this.state.lastNotification = Date.now();
            this.state.dailyCount++;
            this.saveState();
        } catch (error) {
            console.error('Erreur d\'envoi de notification:', error);
        }
    },

    // Formate l'heure
    formatTime: function(hours) {
        return `${hours.toString().padStart(2, '0')}:00`;
    },

    // Sauvegarde l'état
    saveState: function() {
        localStorage.setItem('wbp_push_state', JSON.stringify(this.state));
    },

    // Sauvegarde l'abonnement
    saveSubscription: async function(subscription) {
        try {
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription)
            });
        } catch (error) {
            console.error('Erreur de sauvegarde de l\'abonnement:', error);
        }
    }
};

// Initialise le système de notifications
document.addEventListener('DOMContentLoaded', () => {
    pushNotifications.init();
});
