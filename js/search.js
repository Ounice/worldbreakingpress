// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('form[role="search"]');
    const searchInput = searchForm.querySelector('input[type="search"]');
    
    // Articles data
    const articles = [
        { title: 'AI Ethics and Society', url: '/articles/tech/ai-ethics.html', category: 'Technology' },
        { title: 'Cybersecurity in 2025', url: '/articles/tech/cybersecurity.html', category: 'Technology' },
        { title: 'Quantum Computing Breakthrough', url: '/articles/tech/quantum-computing.html', category: 'Technology' },
        { title: 'AI in Medicine', url: '/articles/tech/ai-medicine.html', category: 'Technology' },
        { title: 'Smart Cities', url: '/articles/tech/smart-cities.html', category: 'Technology' },
        { title: '5G Revolution', url: '/articles/tech/5g-revolution.html', category: 'Technology' },
        // Business articles
        { title: 'Cryptocurrency Evolution', url: '/articles/business/cryptocurrency.html', category: 'Business' },
        { title: 'Sustainable Investing', url: '/articles/business/sustainable-investing.html', category: 'Business' },
        { title: 'Digital Transformation', url: '/articles/business/digital-transformation.html', category: 'Business' },
        // Add more articles here
    ];

    // Search function
    function performSearch(query) {
        query = query.toLowerCase();
        return articles.filter(article => {
            return article.title.toLowerCase().includes(query) ||
                   article.category.toLowerCase().includes(query);
        });
    }

    // Create and show results
    function showResults(results) {
        let resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'search-results';
            resultsContainer.className = 'position-absolute bg-white shadow-lg p-3 rounded';
            searchForm.appendChild(resultsContainer);
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-muted">No results found</p>';
            return;
        }

        const resultsList = results.map(result => `
            <div class="search-result-item">
                <a href="${result.url}" class="text-decoration-none">
                    <h6 class="mb-1">${result.title}</h6>
                    <small class="text-muted">${result.category}</small>
                </a>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsList;
    }

    // Event listeners
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        if (query.length >= 2) {
            const results = performSearch(query);
            showResults(results);
        } else {
            const resultsContainer = document.getElementById('search-results');
            if (resultsContainer) {
                resultsContainer.remove();
            }
        }
    });

    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target)) {
            const resultsContainer = document.getElementById('search-results');
            if (resultsContainer) {
                resultsContainer.remove();
            }
        }
    });

    // Handle form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value;
        if (query.length >= 2) {
            const results = performSearch(query);
            showResults(results);
        }
    });
});
