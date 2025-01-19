// Service Worker pour la gestion des notifications push
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/images/logo.png',
            badge: data.badge || '/images/badge.png',
            image: data.image,
            data: data.data || {},
            actions: data.actions || [],
            tag: data.tag,
            renotify: data.renotify || false,
            requireInteraction: data.requireInteraction || false,
            silent: data.silent || false,
            timestamp: data.timestamp || Date.now()
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    // Gère les actions personnalisées
    if (event.action) {
        handleNotificationAction(event.action, event.notification.data);
        return;
    }

    // Comportement par défaut : ouvre l'URL
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Gère les actions personnalisées
function handleNotificationAction(action, data) {
    switch (action) {
        case 'readNow':
            // Ouvre l'article immédiatement
            clients.openWindow(data.url);
            break;
        case 'readLater':
            // Sauvegarde pour plus tard
            saveForLater(data);
            break;
        case 'share':
            // Partage l'article
            shareArticle(data);
            break;
    }
}

// Sauvegarde un article pour plus tard
async function saveForLater(data) {
    try {
        const response = await fetch('/api/readinglist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            self.registration.showNotification(
                'Article sauvegardé',
                {
                    body: 'L\'article a été ajouté à votre liste de lecture',
                    icon: '/images/saved.png',
                    tag: 'save-confirmation'
                }
            );
        }
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
    }
}

// Partage un article
async function shareArticle(data) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: data.title,
                text: data.description,
                url: data.url
            });
        } catch (error) {
            console.error('Erreur de partage:', error);
        }
    }
}

// Synchronisation en arrière-plan
self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-readinglist') {
        event.waitUntil(syncReadingList());
    }
});

// Synchronise la liste de lecture
async function syncReadingList() {
    try {
        const cache = await caches.open('reading-list');
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await fetch(request);
            if (response.ok) {
                await cache.put(request, response);
            }
        }
    } catch (error) {
        console.error('Erreur de synchronisation:', error);
    }
}

// Mise en cache des ressources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('wbp-static-v1').then(function(cache) {
            return cache.addAll([
                '/',
                '/css/styles.css',
                '/js/app.js',
                '/images/logo.png',
                '/images/badge.png'
            ]);
        })
    );
});

// Stratégie de mise en cache
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
