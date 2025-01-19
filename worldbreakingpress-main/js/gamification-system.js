// Système de gamification pour maximiser l'engagement
const gamificationSystem = {
    // Configuration du système
    config: {
        // Niveaux et points
        levels: {
            maxLevel: 50,
            pointsPerLevel: 100,
            bonusPerLevel: 10
        },

        // Récompenses
        rewards: {
            dailyBonus: true,
            streakBonus: true,
            achievementBonus: true,
            referralBonus: true
        },

        // Challenges
        challenges: {
            daily: true,
            weekly: true,
            monthly: true,
            special: true
        },

        // Achievements
        achievements: {
            enabled: true,
            categories: ['lecture', 'social', 'contribution', 'fidélité']
        },

        // Quêtes
        quests: {
            enabled: true,
            maxActive: 3,
            refreshRate: 24 // heures
        }
    },

    // État du système
    state: {
        userLevel: 1,
        userPoints: 0,
        currentStreak: 0,
        lastVisit: null,
        completedAchievements: [],
        activeQuests: [],
        dailyTasks: []
    },

    // Initialisation
    init: function() {
        this.loadUserState();
        this.setupRewardSystem();
        this.initializeAchievements();
        this.setupChallenges();
        this.initializeQuests();
        this.setupUI();
    },

    // Charge l'état de l'utilisateur
    loadUserState: function() {
        const stored = localStorage.getItem('wbp_gamification_state');
        if (stored) {
            this.state = {...this.state, ...JSON.parse(stored)};
        }
        this.checkDailyReset();
        this.saveState();
    },

    // Vérifie et réinitialise les tâches quotidiennes
    checkDailyReset: function() {
        const now = new Date();
        const lastVisit = this.state.lastVisit ? new Date(this.state.lastVisit) : null;

        if (!lastVisit || !this.isSameDay(now, lastVisit)) {
            this.resetDailyTasks();
            this.checkStreak(now, lastVisit);
        }

        this.state.lastVisit = now.toISOString();
    },

    // Vérifie si deux dates sont le même jour
    isSameDay: function(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    // Réinitialise les tâches quotidiennes
    resetDailyTasks: function() {
        this.state.dailyTasks = this.generateDailyTasks();
    },

    // Génère les tâches quotidiennes
    generateDailyTasks: function() {
        return [
            {
                id: 'daily_read',
                title: 'Lire 3 articles',
                progress: 0,
                target: 3,
                reward: 50
            },
            {
                id: 'daily_comment',
                title: 'Laisser 2 commentaires',
                progress: 0,
                target: 2,
                reward: 30
            },
            {
                id: 'daily_share',
                title: 'Partager un article',
                progress: 0,
                target: 1,
                reward: 20
            }
        ];
    },

    // Vérifie et met à jour la série
    checkStreak: function(now, lastVisit) {
        if (!lastVisit) {
            this.state.currentStreak = 1;
        } else {
            const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                this.state.currentStreak++;
                this.awardStreakBonus();
            } else if (daysDiff > 1) {
                this.state.currentStreak = 1;
            }
        }
    },

    // Attribue un bonus de série
    awardStreakBonus: function() {
        const bonus = Math.min(this.state.currentStreak * 10, 100);
        this.addPoints(bonus, 'Bonus de série');
        this.showStreakNotification(bonus);
    },

    // Configure le système de récompenses
    setupRewardSystem: function() {
        if (this.config.rewards.dailyBonus) {
            this.setupDailyBonus();
        }
        if (this.config.rewards.streakBonus) {
            this.setupStreakBonus();
        }
        if (this.config.rewards.achievementBonus) {
            this.setupAchievementBonus();
        }
        if (this.config.rewards.referralBonus) {
            this.setupReferralBonus();
        }
    },

    // Configure le bonus quotidien
    setupDailyBonus: function() {
        const now = new Date();
        const lastBonus = localStorage.getItem('wbp_last_daily_bonus');
        
        if (!lastBonus || !this.isSameDay(now, new Date(lastBonus))) {
            this.showDailyBonusPopup();
        }
    },

    // Affiche le popup de bonus quotidien
    showDailyBonusPopup: function() {
        const popup = document.createElement('div');
        popup.className = 'daily-bonus-popup';
        popup.innerHTML = `
            <div class="bonus-content">
                <h3>🎁 Bonus Quotidien</h3>
                <div class="bonus-animation">
                    <div class="bonus-box"></div>
                </div>
                <button class="claim-bonus">Récupérer</button>
            </div>
        `;

        document.body.appendChild(popup);

        popup.querySelector('.claim-bonus').addEventListener('click', () => {
            this.claimDailyBonus();
            popup.remove();
        });
    },

    // Réclame le bonus quotidien
    claimDailyBonus: function() {
        const bonus = 50 + (this.state.currentStreak * 5);
        this.addPoints(bonus, 'Bonus quotidien');
        localStorage.setItem('wbp_last_daily_bonus', new Date().toISOString());
        this.showRewardNotification('Bonus Quotidien', bonus);
    },

    // Configure le bonus de série
    setupStreakBonus: function() {
        // Affiche la série actuelle
        this.updateStreakDisplay();

        // Configure les bonus de série
        this.streakBonuses = {
            7: { points: 100, title: 'Série hebdomadaire' },
            30: { points: 500, title: 'Série mensuelle' },
            365: { points: 10000, title: 'Série annuelle' }
        };
    },

    // Met à jour l'affichage de la série
    updateStreakDisplay: function() {
        const streakDisplay = document.querySelector('.streak-display');
        if (streakDisplay) {
            streakDisplay.innerHTML = `
                <div class="streak-count">
                    <span class="streak-number">${this.state.currentStreak}</span>
                    <span class="streak-label">jours</span>
                </div>
                <div class="streak-progress">
                    <div class="streak-bar" style="width: ${this.getNextStreakProgress()}%"></div>
                </div>
                <div class="streak-next">
                    ${this.getNextStreakBonus()}
                </div>
            `;
        }
    },

    // Calcule la progression vers le prochain bonus de série
    getNextStreakProgress: function() {
        const streak = this.state.currentStreak;
        const nextMilestone = Object.keys(this.streakBonuses)
            .find(days => days > streak) || streak;
        const prevMilestone = Object.keys(this.streakBonuses)
            .filter(days => days <= streak)
            .pop() || 0;
        
        return ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
    },

    // Obtient le prochain bonus de série
    getNextStreakBonus: function() {
        const streak = this.state.currentStreak;
        const nextMilestone = Object.keys(this.streakBonuses)
            .find(days => days > streak);
        
        if (nextMilestone) {
            const bonus = this.streakBonuses[nextMilestone];
            return `Prochain bonus dans ${nextMilestone - streak} jours : ${bonus.points} points`;
        }
        return 'Série maximale atteinte !';
    },

    // Initialise les achievements
    initializeAchievements: function() {
        this.achievements = {
            lecture: [
                {
                    id: 'read_10',
                    title: 'Lecteur Débutant',
                    description: 'Lire 10 articles',
                    target: 10,
                    reward: 100,
                    icon: '📚'
                },
                {
                    id: 'read_100',
                    title: 'Lecteur Assidu',
                    description: 'Lire 100 articles',
                    target: 100,
                    reward: 1000,
                    icon: '🎓'
                }
            ],
            social: [
                {
                    id: 'comment_10',
                    title: 'Commentateur',
                    description: 'Poster 10 commentaires',
                    target: 10,
                    reward: 100,
                    icon: '💭'
                },
                {
                    id: 'share_10',
                    title: 'Influenceur',
                    description: 'Partager 10 articles',
                    target: 10,
                    reward: 100,
                    icon: '🔄'
                }
            ]
        };

        this.checkAchievements();
    },

    // Vérifie les achievements
    checkAchievements: function() {
        Object.values(this.achievements).flat().forEach(achievement => {
            if (!this.state.completedAchievements.includes(achievement.id)) {
                this.checkAchievementProgress(achievement);
            }
        });
    },

    // Vérifie la progression d'un achievement
    checkAchievementProgress: function(achievement) {
        const progress = this.getAchievementProgress(achievement);
        if (progress >= achievement.target) {
            this.unlockAchievement(achievement);
        }
    },

    // Débloque un achievement
    unlockAchievement: function(achievement) {
        this.state.completedAchievements.push(achievement.id);
        this.addPoints(achievement.reward, `Achievement : ${achievement.title}`);
        this.showAchievementNotification(achievement);
        this.saveState();
    },

    // Configure les challenges
    setupChallenges: function() {
        if (this.config.challenges.daily) {
            this.setupDailyChallenges();
        }
        if (this.config.challenges.weekly) {
            this.setupWeeklyChallenges();
        }
        if (this.config.challenges.monthly) {
            this.setupMonthlyChallenges();
        }
        if (this.config.challenges.special) {
            this.setupSpecialChallenges();
        }
    },

    // Configure les challenges quotidiens
    setupDailyChallenges: function() {
        const challenges = [
            {
                id: 'daily_reader',
                title: 'Lecteur du Jour',
                description: 'Lire 5 articles aujourd\'hui',
                reward: 50,
                progress: 0,
                target: 5
            },
            {
                id: 'daily_engager',
                title: 'Engagé du Jour',
                description: 'Laisser 3 commentaires constructifs',
                reward: 30,
                progress: 0,
                target: 3
            }
        ];

        this.state.dailyChallenges = challenges;
        this.updateChallengesUI();
    },

    // Initialise les quêtes
    initializeQuests: function() {
        if (!this.config.quests.enabled) return;

        // Charge ou génère de nouvelles quêtes
        this.state.activeQuests = this.state.activeQuests.length > 0 ?
            this.state.activeQuests :
            this.generateNewQuests();

        this.updateQuestsUI();
    },

    // Génère de nouvelles quêtes
    generateNewQuests: function() {
        const questPool = [
            {
                id: 'quest_reader',
                title: 'Expert en Tech',
                description: 'Lire 10 articles de la catégorie Tech',
                reward: 200,
                category: 'tech',
                progress: 0,
                target: 10
            },
            {
                id: 'quest_commenter',
                title: 'Analyste Finance',
                description: 'Commenter sur 5 articles Business',
                reward: 150,
                category: 'business',
                progress: 0,
                target: 5
            }
        ];

        return this.shuffleArray(questPool)
            .slice(0, this.config.quests.maxActive);
    },

    // Mélange un tableau
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // Configure l'interface utilisateur
    setupUI: function() {
        this.createGamificationPanel();
        this.updateUI();
    },

    // Crée le panneau de gamification
    createGamificationPanel: function() {
        const panel = document.createElement('div');
        panel.className = 'gamification-panel';
        panel.innerHTML = `
            <div class="user-progress">
                <div class="level-info">
                    <span class="level">Niveau ${this.state.userLevel}</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${this.getLevelProgress()}%"></div>
                    </div>
                </div>
                <div class="points-info">
                    <span class="points">${this.state.userPoints} points</span>
                </div>
            </div>
            <div class="daily-challenges"></div>
            <div class="active-quests"></div>
            <div class="achievements-showcase"></div>
        `;

        document.body.appendChild(panel);
    },

    // Met à jour l'interface utilisateur
    updateUI: function() {
        this.updateLevelInfo();
        this.updateChallengesUI();
        this.updateQuestsUI();
        this.updateAchievementsUI();
    },

    // Ajoute des points
    addPoints: function(points, reason) {
        this.state.userPoints += points;
        this.checkLevelUp();
        this.showPointsNotification(points, reason);
        this.saveState();
        this.updateUI();
    },

    // Vérifie le passage de niveau
    checkLevelUp: function() {
        const newLevel = Math.floor(this.state.userPoints / this.config.levels.pointsPerLevel) + 1;
        if (newLevel > this.state.userLevel) {
            this.levelUp(newLevel);
        }
    },

    // Passage de niveau
    levelUp: function(newLevel) {
        const levelsGained = newLevel - this.state.userLevel;
        this.state.userLevel = newLevel;
        
        // Bonus de niveau
        const bonus = levelsGained * this.config.levels.bonusPerLevel;
        this.state.userPoints += bonus;
        
        this.showLevelUpNotification(newLevel, bonus);
        this.saveState();
    },

    // Sauvegarde l'état
    saveState: function() {
        localStorage.setItem('wbp_gamification_state', JSON.stringify(this.state));
    },

    // Notifications
    showPointsNotification: function(points, reason) {
        const notification = document.createElement('div');
        notification.className = 'points-notification';
        notification.innerHTML = `
            <div class="points-popup">
                <span class="points">+${points}</span>
                <span class="reason">${reason}</span>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    showLevelUpNotification: function(level, bonus) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-popup">
                <h3>Niveau ${level} atteint !</h3>
                <p>Bonus : +${bonus} points</p>
                <div class="rewards-list">
                    <div class="reward">🎁 Nouveau contenu débloqué</div>
                    <div class="reward">💫 Multiplicateur de points augmenté</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    },

    showAchievementNotification: function(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-popup">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <span class="reward">+${achievement.reward} points</span>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
};

// Initialise le système de gamification
document.addEventListener('DOMContentLoaded', () => {
    gamificationSystem.init();
});
