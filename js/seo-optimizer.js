// Configuration SEO optimisée pour maximiser la visibilité
const seoOptimizer = {
    // Paramètres de base SEO
    baseConfig: {
        siteName: 'World Breaking Press',
        defaultLanguage: 'fr',
        alternateLanguages: ['en', 'es', 'ar'],
        defaultImage: '/assets/images/logos/wbp-social.jpg',
        twitterHandle: '@WorldBreakPress',
        facebookPage: 'WorldBreakingPress',
        defaultDescription: 'Actualités internationales, analyses financières et technologiques - World Breaking Press',
    },

    // Structure des données schema.org
    schemas: {
        // Schema pour les articles
        article: {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "publisher": {
                "@type": "Organization",
                "name": "World Breaking Press",
                "logo": {
                    "@type": "ImageObject",
                    "url": "/assets/images/logos/wbp-logo.png"
                }
            }
        },
        // Schema pour l'organisation
        organization: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "World Breaking Press",
            "url": "https://worldbreakingpress.com",
            "logo": "/assets/images/logos/wbp-logo.png",
            "sameAs": [
                "https://facebook.com/WorldBreakingPress",
                "https://twitter.com/WorldBreakPress",
                "https://linkedin.com/company/world-breaking-press"
            ]
        }
    },

    // Optimisation des métadonnées
    metaOptimizer: {
        // Génère les méta-descriptions optimisées
        generateDescription: function(content, maxLength = 160) {
            // Extrait le contenu principal
            const mainContent = content.querySelector('.article-body');
            if (!mainContent) return this.baseConfig.defaultDescription;

            // Prend les premiers paragraphes
            const text = mainContent.textContent.trim();
            let description = text.substring(0, maxLength);
            
            // S'assure que la description ne coupe pas un mot
            const lastSpace = description.lastIndexOf(' ');
            description = description.substring(0, lastSpace) + '...';

            return description;
        },

        // Génère les mots-clés basés sur le contenu
        generateKeywords: function(content) {
            const text = content.textContent.toLowerCase();
            const words = text.split(/\W+/);
            const wordCount = {};
            
            // Compte la fréquence des mots
            words.forEach(word => {
                if (word.length > 3) { // Ignore les mots courts
                    wordCount[word] = (wordCount[word] || 0) + 1;
                }
            });

            // Trie par fréquence
            return Object.entries(wordCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([word]) => word)
                .join(', ');
        }
    },

    // Optimisation des images
    imageOptimizer: {
        generateAlt: function(img) {
            // Si pas d'alt text, génère à partir du contexte
            if (!img.alt) {
                const context = img.closest('figure')?.querySelector('figcaption')?.textContent;
                if (context) {
                    img.alt = context.trim();
                } else {
                    // Génère depuis le titre de l'article
                    const articleTitle = document.querySelector('h1')?.textContent;
                    img.alt = `Image illustrant ${articleTitle}`;
                }
            }
        },

        addLazyLoading: function() {
            // Ajoute le lazy loading à toutes les images
            document.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
        }
    },

    // Optimisation des liens
    linkOptimizer: {
        addNoopener: function() {
            // Ajoute rel="noopener" aux liens externes
            document.querySelectorAll('a[href^="http"]').forEach(link => {
                if (!link.hostname.includes(window.location.hostname)) {
                    link.rel = 'noopener noreferrer';
                }
            });
        },

        generateCanonical: function() {
            // Génère l'URL canonique
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }
            canonical.href = window.location.href.split('#')[0].split('?')[0];
        }
    },

    // Optimisation de la vitesse
    performanceOptimizer: {
        // Précharge les ressources importantes
        preloadResources: function() {
            const resources = [
                { type: 'font', url: '/fonts/inter-var.woff2' },
                { type: 'image', url: this.baseConfig.defaultImage }
            ];

            resources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource.url;
                link.as = resource.type;
                if (resource.type === 'font') {
                    link.crossOrigin = 'anonymous';
                }
                document.head.appendChild(link);
            });
        },

        // Optimise le chargement des scripts
        optimizeScripts: function() {
            document.querySelectorAll('script').forEach(script => {
                if (!script.async && !script.defer) {
                    script.defer = true;
                }
            });
        }
    },

    // Optimisation pour les réseaux sociaux
    socialOptimizer: {
        // Génère les méta tags Open Graph
        generateOpenGraph: function(data) {
            const meta = {
                'og:title': data.title || document.title,
                'og:description': data.description || this.metaOptimizer.generateDescription(document),
                'og:image': data.image || this.baseConfig.defaultImage,
                'og:url': window.location.href,
                'og:type': 'article',
                'og:site_name': this.baseConfig.siteName
            };

            Object.entries(meta).forEach(([property, content]) => {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            });
        },

        // Génère les méta tags Twitter
        generateTwitterCards: function(data) {
            const meta = {
                'twitter:card': 'summary_large_image',
                'twitter:site': this.baseConfig.twitterHandle,
                'twitter:title': data.title || document.title,
                'twitter:description': data.description || this.metaOptimizer.generateDescription(document),
                'twitter:image': data.image || this.baseConfig.defaultImage
            };

            Object.entries(meta).forEach(([name, content]) => {
                let tag = document.querySelector(`meta[name="${name}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('name', name);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            });
        }
    },

    // Initialisation
    init: function() {
        // Optimise les images
        this.imageOptimizer.addLazyLoading();
        document.querySelectorAll('img').forEach(img => {
            this.imageOptimizer.generateAlt(img);
        });

        // Optimise les liens
        this.linkOptimizer.addNoopener();
        this.linkOptimizer.generateCanonical();

        // Optimise la performance
        this.performanceOptimizer.preloadResources();
        this.performanceOptimizer.optimizeScripts();

        // Génère les métadonnées sociales
        const pageData = {
            title: document.title,
            description: this.metaOptimizer.generateDescription(document),
            image: document.querySelector('.article-image img')?.src || this.baseConfig.defaultImage
        };
        this.socialOptimizer.generateOpenGraph(pageData);
        this.socialOptimizer.generateTwitterCards(pageData);

        // Ajoute les schemas
        this.addSchemas();
    },

    // Ajoute les schemas structurés
    addSchemas: function() {
        const articleSchema = Object.assign({}, this.schemas.article, {
            "headline": document.title,
            "image": document.querySelector('.article-image img')?.src || this.baseConfig.defaultImage,
            "datePublished": document.querySelector('.article-meta .date')?.textContent,
            "dateModified": document.querySelector('.article-meta .date')?.textContent,
            "author": {
                "@type": "Person",
                "name": document.querySelector('.article-meta .author')?.textContent
            }
        });

        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.text = JSON.stringify(articleSchema);
        document.head.appendChild(schemaScript);
    }
};

// Initialise l'optimisation SEO au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    seoOptimizer.init();
});
