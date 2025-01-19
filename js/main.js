// Breaking News Ticker
function initBreakingNewsTicker() {
    const breakingNews = [
        "Les marchés financiers en effervescence suite aux dernières décisions des banques centrales",
        "Bitcoin atteint un nouveau record historique",
        "La BCE maintient ses taux directeurs"
    ];

    let currentNewsIndex = 0;
    const tickerWrapper = document.querySelector('.ticker-wrapper');
    if (tickerWrapper) {
        setInterval(() => {
            currentNewsIndex = (currentNewsIndex + 1) % breakingNews.length;
            tickerWrapper.textContent = breakingNews[currentNewsIndex];
        }, 10000);
    }
}

// Market Data Updates
function updateMarketData() {
    // Simulated market data update
    const marketData = {
        'EUR/USD': { price: '1.0950', change: '+0.25%' },
        'Bitcoin': { price: '85,000', change: '+2.5%' },
        'S&P 500': { price: '5,200', change: '-0.1%' }
    };

    // Update DOM elements
    Object.entries(marketData).forEach(([instrument, data]) => {
        // Implementation will depend on your HTML structure
        console.log(`${instrument}: ${data.price} (${data.change})`);
    });
}

// Lazy Loading Images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// AdSense Optimization
function optimizeAdPlacement() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        // Add placeholder for AdSense
        container.innerHTML = '<div class="ad-placeholder">Advertisement</div>';
    });
}

// Search Functionality
function initSearch() {
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    // Implement search functionality
                    console.log('Searching for:', query);
                }
            }
        });
    }
}

// Newsletter Form
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // Add newsletter signup logic here
            alert('Merci de votre inscription ! Vous recevrez bientôt nos actualités.');
            this.reset();
        });
    }
});

// Share Buttons
document.querySelectorAll('.share-twitter').forEach(button => {
    button.addEventListener('click', function() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    });
});

document.querySelectorAll('.share-linkedin').forEach(button => {
    button.addEventListener('click', function() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    });
});

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    initBreakingNewsTicker();
    updateMarketData();
    setInterval(updateMarketData, 30000);
    lazyLoadImages();
    optimizeAdPlacement();
    initSearch();
});

// Mobile Menu
const mobileMenu = document.querySelector('.navbar-toggler');
if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        document.querySelector('.navbar-collapse').classList.toggle('show');
    });
}

// Scroll to Top
function createScrollTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-top';
    button.style.display = 'none';
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        button.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Analytics Tracking
function trackPageView() {
    // Implement your analytics tracking here
    const page = window.location.pathname;
    console.log('Page view:', page);
}

// Initialize Additional Features
createScrollTopButton();
trackPageView();

// Handle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}
