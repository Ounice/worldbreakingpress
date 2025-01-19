// Cookie Consent Manager
class CookieConsent {
    constructor() {
        this.cookieConsent = localStorage.getItem('cookieConsent');
        this.initializeBanner();
    }

    initializeBanner() {
        if (!this.cookieConsent) {
            this.createBanner();
        }
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. </p>
                <div class="cookie-buttons">
                    <button id="cookie-customize" class="btn btn-outline-primary">Customize</button>
                    <button id="cookie-accept-all" class="btn btn-primary">Accept All</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #fff;
                padding: 1rem;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .cookie-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cookie-buttons {
                display: flex;
                gap: 1rem;
            }
            @media (max-width: 768px) {
                .cookie-content {
                    flex-direction: column;
                    text-align: center;
                }
                .cookie-buttons {
                    margin-top: 1rem;
                }
            }
        `;
        document.head.appendChild(styles);

        // Add event listeners
        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            this.acceptAll();
        });

        document.getElementById('cookie-customize').addEventListener('click', () => {
            this.showCustomizeModal();
        });
    }

    showCustomizeModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-modal';
        modal.innerHTML = `
            <div class="cookie-modal-content">
                <h2>Cookie Preferences</h2>
                <div class="cookie-options">
                    <div class="cookie-option">
                        <input type="checkbox" id="essential" checked disabled>
                        <label for="essential">Essential Cookies</label>
                        <p>Required for the website to function properly</p>
                    </div>
                    <div class="cookie-option">
                        <input type="checkbox" id="analytics">
                        <label for="analytics">Analytics Cookies</label>
                        <p>Help us understand how visitors interact with our website</p>
                    </div>
                    <div class="cookie-option">
                        <input type="checkbox" id="advertising">
                        <label for="advertising">Advertising Cookies</label>
                        <p>Used to deliver relevant advertisements</p>
                    </div>
                </div>
                <div class="cookie-modal-buttons">
                    <button id="save-preferences" class="btn btn-primary">Save Preferences</button>
                </div>
            </div>
        `;

        // Add modal styles
        const styles = document.createElement('style');
        styles.textContent = `
            .cookie-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1001;
            }
            .cookie-modal-content {
                background: #fff;
                padding: 2rem;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
            }
            .cookie-options {
                margin: 1.5rem 0;
            }
            .cookie-option {
                margin-bottom: 1rem;
            }
            .cookie-option p {
                margin: 0.5rem 0;
                font-size: 0.9rem;
                color: #666;
            }
            .cookie-modal-buttons {
                text-align: right;
            }
        `;
        document.head.appendChild(styles);

        document.body.appendChild(modal);

        document.getElementById('save-preferences').addEventListener('click', () => {
            this.savePreferences();
            modal.remove();
        });
    }

    savePreferences() {
        const preferences = {
            essential: true,
            analytics: document.getElementById('analytics').checked,
            advertising: document.getElementById('advertising').checked
        };

        localStorage.setItem('cookieConsent', JSON.stringify(preferences));
        this.removeBanner();
        this.applyPreferences(preferences);
    }

    acceptAll() {
        const preferences = {
            essential: true,
            analytics: true,
            advertising: true
        };

        localStorage.setItem('cookieConsent', JSON.stringify(preferences));
        this.removeBanner();
        this.applyPreferences(preferences);
    }

    removeBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.remove();
        }
    }

    applyPreferences(preferences) {
        // Apply analytics cookies
        if (preferences.analytics) {
            // Initialize analytics
            this.initializeAnalytics();
        }

        // Apply advertising cookies
        if (preferences.advertising) {
            // Initialize advertising
            this.initializeAdvertising();
        }
    }

    initializeAnalytics() {
        // Initialize Google Analytics or other analytics services
        console.log('Analytics initialized');
    }

    initializeAdvertising() {
        // Initialize Google AdSense or other advertising services
        console.log('Advertising initialized');
    }
}

// Initialize cookie consent manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
});
