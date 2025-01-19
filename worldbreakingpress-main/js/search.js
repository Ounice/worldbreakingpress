// Search functionality for World Breaking Press
document.addEventListener('DOMContentLoaded', function() {
    // Search configuration
    const searchConfig = {
        articlesIndex: [], // Will be populated with article metadata
        searchEndpoint: '/api/search', // Replace with actual endpoint if using backend search
        resultsContainer: document.getElementById('searchResults'),
        searchInput: document.querySelector('.search-input'),
        maxResults: 10
    };

    // Initialize search functionality
    initializeSearch();

    // Event listener for search input
    if (searchConfig.searchInput) {
        searchConfig.searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            } else {
                clearResults();
            }
        }, 300));
    }

    // Initialize search
    async function initializeSearch() {
        try {
            // In a real implementation, this would load from a backend API
            // For now, we'll use a static array of articles
            searchConfig.articlesIndex = [
                {
                    title: "AI Ethics: Navigating the Moral Challenges",
                    url: "/articles/tech/ai-ethics.html",
                    category: "Technology",
                    description: "Exploring ethical implications of AI development"
                },
                {
                    title: "Sustainable Business: The New Normal",
                    url: "/articles/business/sustainable-business.html",
                    category: "Business",
                    description: "How companies are adapting to environmental challenges"
                },
                {
                    title: "Remote Work Culture Evolution",
                    url: "/articles/lifestyle/remote-work.html",
                    category: "Lifestyle",
                    description: "The transformation of workplace culture"
                }
                // Add more articles as they are created
            ];
        } catch (error) {
            console.error('Failed to initialize search:', error);
        }
    }

    // Perform search
    async function performSearch(query) {
        try {
            // Client-side search implementation
            const results = searchConfig.articlesIndex.filter(article => {
                const searchString = `${article.title} ${article.category} ${article.description}`.toLowerCase();
                return searchString.includes(query.toLowerCase());
            }).slice(0, searchConfig.maxResults);

            displayResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            displayError('Search is temporarily unavailable');
        }
    }

    // Display search results
    function displayResults(results) {
        if (!searchConfig.resultsContainer) return;

        clearResults();

        if (results.length === 0) {
            searchConfig.resultsContainer.innerHTML = '<p class="text-muted">No results found</p>';
            return;
        }

        const resultsHtml = results.map(result => `
            <div class="search-result">
                <h3><a href="${result.url}">${result.title}</a></h3>
                <span class="badge bg-secondary">${result.category}</span>
                <p>${result.description}</p>
            </div>
        `).join('');

        searchConfig.resultsContainer.innerHTML = resultsHtml;
    }

    // Clear search results
    function clearResults() {
        if (searchConfig.resultsContainer) {
            searchConfig.resultsContainer.innerHTML = '';
        }
    }

    // Display error message
    function displayError(message) {
        if (searchConfig.resultsContainer) {
            searchConfig.resultsContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    ${message}
                </div>
            `;
        }
    }

    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
