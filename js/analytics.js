// Google Analytics 4 Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Remplacez G-XXXXXXXXXX par votre ID de mesure GA4
gtag('config', 'G-XXXXXXXXXX', {
  'page_title': document.title,
  'page_path': window.location.pathname,
  'cookie_domain': 'worldbreakingpress.com',
  'cookie_flags': 'SameSite=None;Secure'
});

// Événements personnalisés
function trackEvent(category, action, label) {
  gtag('event', action, {
    'event_category': category,
    'event_label': label
  });
}

// Suivi des clics sur les articles
document.addEventListener('DOMContentLoaded', function() {
  const articles = document.querySelectorAll('article a');
  articles.forEach(article => {
    article.addEventListener('click', function() {
      trackEvent('Article', 'Click', this.getAttribute('href'));
    });
  });
});

// Performance Monitoring
let performanceData = {
    timeToFirstByte: 0,
    firstContentfulPaint: 0,
    domInteractive: 0
};

// Track Core Web Vitals
function trackWebVitals() {
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            if (entry.name === 'LCP') {
                gtag('event', 'web_vitals', {
                    event_category: 'Web Vitals',
                    event_label: 'LCP',
                    value: Math.round(entry.startTime)
                });
            }
        }
    }).observe({entryTypes: ['largest-contentful-paint']});

    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            if (entry.hadRecentInput) return;
            gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'CLS',
                value: entry.value
            });
        }
    }).observe({entryTypes: ['layout-shift']});
}

// Track User Engagement
function trackEngagement() {
    // Scroll Depth
    let scrollDepths = [25, 50, 75, 100];
    let sentDepths = new Set();
    
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
        
        scrollDepths.forEach(depth => {
            if (scrollPercent >= depth && !sentDepths.has(depth)) {
                gtag('event', 'scroll_depth', {
                    'depth': depth,
                    'page': window.location.pathname
                });
                sentDepths.add(depth);
            }
        });
    });

    // Time on Page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        let timeSpent = Math.round((Date.now() - startTime) / 1000);
        gtag('event', 'time_on_page', {
            'duration': timeSpent,
            'page': window.location.pathname
        });
    });
}

// Track Ad Performance
function trackAdPerformance() {
    if (typeof window.google_ad_modifications === 'undefined') {
        window.google_ad_modifications = {};
    }

    window.google_ad_modifications.onAdLoaded = (adUnit) => {
        gtag('event', 'ad_loaded', {
            'ad_unit': adUnit,
            'page': window.location.pathname
        });
    };

    window.google_ad_modifications.onAdClicked = (adUnit) => {
        gtag('event', 'ad_clicked', {
            'ad_unit': adUnit,
            'page': window.location.pathname
        });
    };
}

// Initialize All Tracking
document.addEventListener('DOMContentLoaded', () => {
    trackWebVitals();
    trackEngagement();
    trackAdPerformance();
});
