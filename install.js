// Script d'installation automatisé
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const config = {
    // Chemins des fichiers
    paths: {
        js: path.join(__dirname, 'js'),
        css: path.join(__dirname, 'css'),
        html: path.join(__dirname, 'index.html')
    },

    // Fichiers à vérifier
    requiredFiles: [
        'js/premium-monetization.js',
        'js/ad-optimization.js',
        'js/advanced-analytics.js',
        'css/premium.css'
    ],

    // Scripts externes nécessaires
    externalScripts: [
        'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
        'https://js.stripe.com/v3/'
    ],

    // Emplacements publicitaires à ajouter
    adSlots: [
        {
            id: 'div-gpt-ad-top',
            class: 'ad-container ad-top',
            position: 'header'
        },
        {
            id: 'div-gpt-ad-sidebar',
            class: 'ad-container ad-sidebar',
            position: 'aside'
        },
        {
            id: 'div-gpt-ad-in-article',
            class: 'ad-container ad-in-article',
            position: 'article'
        },
        {
            id: 'div-gpt-ad-footer',
            class: 'ad-container ad-footer',
            position: 'footer'
        },
        {
            id: 'div-gpt-ad-mobile',
            class: 'ad-container ad-mobile',
            position: 'mobile'
        }
    ]
};

// Vérifie et crée les dossiers nécessaires
function createDirectories() {
    console.log('📁 Création des dossiers...');
    
    Object.values(config.paths).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Dossier créé : ${dir}`);
        }
    });
}

// Vérifie la présence des fichiers requis
function checkRequiredFiles() {
    console.log('📝 Vérification des fichiers...');
    
    const missing = config.requiredFiles.filter(file => {
        const filePath = path.join(__dirname, file);
        return !fs.existsSync(filePath);
    });

    if (missing.length > 0) {
        console.error('❌ Fichiers manquants :', missing);
        process.exit(1);
    }

    console.log('✅ Tous les fichiers sont présents');
}

// Met à jour le fichier HTML
function updateHTML() {
    console.log('🔄 Mise à jour du fichier HTML...');
    
    let html = fs.readFileSync(config.paths.html, 'utf8');

    // Ajoute les styles
    if (!html.includes('premium.css')) {
        const styleLink = '<link rel="stylesheet" href="css/premium.css">';
        html = html.replace('</head>', `    ${styleLink}\n</head>`);
    }

    // Ajoute les scripts externes
    const scripts = config.externalScripts.map(src => 
        `<script async src="${src}"></script>`
    ).join('\n    ');

    // Ajoute les scripts locaux
    const localScripts = config.requiredFiles
        .filter(file => file.endsWith('.js'))
        .map(file => `<script src="${file}"></script>`)
        .join('\n    ');

    // Ajoute tous les scripts avant la fermeture du body
    if (!html.includes('premium-monetization.js')) {
        html = html.replace('</body>', `    ${scripts}\n    ${localScripts}\n</body>`);
    }

    // Ajoute les emplacements publicitaires
    config.adSlots.forEach(slot => {
        const adDiv = `<div id="${slot.id}" class="${slot.class}"></div>`;
        
        // Ajoute selon la position
        switch (slot.position) {
            case 'header':
                if (!html.includes(slot.id)) {
                    html = html.replace('<main', `${adDiv}\n    <main`);
                }
                break;
            case 'footer':
                if (!html.includes(slot.id)) {
                    html = html.replace('</main>', `</main>\n    ${adDiv}`);
                }
                break;
            // Ajoutez d'autres cas selon vos besoins
        }
    });

    fs.writeFileSync(config.paths.html, html);
    console.log('✅ Fichier HTML mis à jour');
}

// Vérifie les dépendances
function checkDependencies() {
    console.log('🔍 Vérification des dépendances...');
    
    const dependencies = {
        'stripe': '^12.0.0',
        'express': '^4.18.0',
        'dotenv': '^16.0.0'
    };

    // Vérifie package.json
    let packageJson = {};
    const packagePath = path.join(__dirname, 'package.json');
    
    if (fs.existsSync(packagePath)) {
        packageJson = JSON.parse(fs.readFileSync(packagePath));
    } else {
        packageJson = {
            name: 'world-breaking-press',
            version: '1.0.0',
            dependencies: {}
        };
    }

    // Ajoute les dépendances manquantes
    let needsInstall = false;
    Object.entries(dependencies).forEach(([dep, version]) => {
        if (!packageJson.dependencies?.[dep]) {
            packageJson.dependencies = packageJson.dependencies || {};
            packageJson.dependencies[dep] = version;
            needsInstall = true;
        }
    });

    if (needsInstall) {
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log('📦 Installation des dépendances...');
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erreur lors de l\'installation :', error);
                return;
            }
            console.log('✅ Dépendances installées');
        });
    } else {
        console.log('✅ Toutes les dépendances sont installées');
    }
}

// Fonction principale d'installation
async function install() {
    console.log('🚀 Démarrage de l\'installation...');

    try {
        createDirectories();
        checkRequiredFiles();
        updateHTML();
        checkDependencies();

        console.log('✨ Installation terminée avec succès !');
        console.log(`
📝 Prochaines étapes :
1. Configurez vos clés API dans .env
2. Lancez le serveur avec 'npm start'
3. Testez les nouvelles fonctionnalités
4. Consultez deployment-plan.md pour plus de détails
        `);
    } catch (error) {
        console.error('❌ Erreur lors de l\'installation :', error);
        process.exit(1);
    }
}

// Lance l'installation
install();
