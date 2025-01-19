// AdSense Configuration and Optimization
(adsbygoogle = window.adsbygoogle || []).push({});

// Optimized Ad Placements
const adPlacements = {
    inContent: [
        {
            id: 'article-start-ad',
            format: 'auto',
            style: 'display:block; text-align:center;',
            position: 'after-summary'
        },
        {
            id: 'article-middle-ad',
            format: 'auto',
            style: 'display:block; text-align:center;',
            position: 'middle-content'
        },
        {
            id: 'article-end-ad',
            format: 'auto',
            style: 'display:block; text-align:center;',
            position: 'before-related'
        }
    ],
    sidebar: [
        {
            id: 'sidebar-top-ad',
            format: '300x600',
            style: 'display:block;',
            position: 'sidebar-top'
        },
        {
            id: 'sidebar-sticky-ad',
            format: '300x250',
            style: 'display:block; position:sticky; top:20px;',
            position: 'sidebar-bottom'
        }
    ]
};

// Lazy Load Ads
function lazyLoadAds() {
    const adObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const adElement = entry.target;
                if (!adElement.getAttribute('data-ad-loaded')) {
                    loadAd(adElement);
                    adElement.setAttribute('data-ad-loaded', 'true');
                }
                observer.unobserve(adElement);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });

    document.querySelectorAll('.adsbygoogle').forEach(ad => {
        adObserver.observe(ad);
    });
}

// Load Ad Unit
function loadAd(adElement) {
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
        console.log('Ad loaded successfully:', adElement.id);
    } catch (error) {
        console.error('Error loading ad:', error);
    }
}

// Optimize Ad Refresh
function setupAdRefresh() {
    const refreshInterval = 30000; // 30 seconds
    setInterval(() => {
        document.querySelectorAll('.adsbygoogle[data-ad-loaded="true"]').forEach(ad => {
            if (isElementInViewport(ad)) {
                loadAd(ad);
            }
        });
    }, refreshInterval);
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Initialize AdSense Optimizations
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadAds();
    setupAdRefresh();
});
