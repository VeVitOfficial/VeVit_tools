// ==========================================
// 0. URL ROUTING (History API)
// ==========================================

// URL MAP: tool ID → URL slug
const URL_MAP = {
    // PDF Tools
    'merge-pdf':        '/pdf-tools/merge-pdf',
    'split-pdf':        '/pdf-tools/split-pdf',
    'remove-pages':     '/pdf-tools/remove-pages',
    'extract-pages':    '/pdf-tools/extract-pages',
    'organize-pdf':     '/pdf-tools/organize-pdf',
    'scan-to-pdf':      '/pdf-tools/scan-to-pdf',
    'compress-pdf':     '/pdf-tools/compress-pdf',
    'repair-pdf':       '/pdf-tools/repair-pdf',
    'ocr-pdf':          '/pdf-tools/ocr-pdf',
    'pdf-converter':    '/pdf-tools/pdf-converter',
    'rotate-pdf':       '/pdf-tools/rotate-pdf',
    'page-numbers':     '/pdf-tools/page-numbers',
    'watermark-pdf':    '/pdf-tools/watermark-pdf',
    'crop-pdf':         '/pdf-tools/crop-pdf',
    'redact-pdf':       '/pdf-tools/redact-pdf',
    'unlock-pdf':       '/pdf-tools/unlock-pdf',
    'protect-pdf':      '/pdf-tools/protect-pdf',
    'compare-pdf':      '/pdf-tools/compare-pdf',
    'ai-summarize':     '/pdf-tools/ai-summarize',
    'ai-translate-pdf': '/pdf-tools/ai-translate-pdf',
    // Other Tools
    'video-conv':       '/video-converter',
    'audio-conv':       '/audio-converter',
    'img-conv':         '/image-converter',
    'resize-img':       '/resize-image',
    'ai-vision':        '/ai-vision',
    'ai-search':        '/ai-search',
    'tts':              '/text-to-speech',
    // Categories
    'pdf-tools':        '/pdf-tools'
};

// Reverse map: URL slug → tool ID
const SLUG_MAP = {};
Object.entries(URL_MAP).forEach(([id, slug]) => {
    SLUG_MAP[slug] = id;
});

function navigate(path, pushState = true) {
    try {
        if (pushState && window.history && window.history.pushState) {
            window.history.pushState({ path }, '', path);
        }
    } catch (e) {
        // History API may not work on file:// protocol
    }
    handleRoute(path);
    updateCanonical(path);
    window.scrollTo(0, 0);
}

function handleRoute(path) {
    path = path || '/';
    if (!path.startsWith('/')) path = '/' + path;

    // Home
    if (path === '/') {
        _showHome();
        return;
    }

    // PDF kategorie
    if (path === '/pdf-tools') {
        _showCategory('pdf-tools');
        return;
    }

    // PDF nástroj
    if (path.startsWith('/pdf-tools/')) {
        const toolId = path.replace('/pdf-tools/', '');
        if (toolId) {
            _openTool(toolId);
            return;
        }
    }

    // Ostatní nástroje (přímý slug)
    const toolId = SLUG_MAP[path];
    if (toolId) {
        _openTool(toolId);
        return;
    }

    // 404 fallback → home
    _showHome();
}

function updateCanonical(path) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
    }
    link.href = 'https://services.vevit.fun' + path;
}

// ==========================================
// BREADCRUMB NAVIGACE
// ==========================================
function renderBreadcrumb(parts) {
    // parts = pole objektů: [{label, path}]
    // Poslední část = aktuální stránka (neklikatelná)

    const bar = document.getElementById('breadcrumb-bar');
    const nav = document.getElementById('breadcrumb-nav');

    if (!parts || parts.length === 0) {
        bar.classList.add('hidden');
        return;
    }

    bar.classList.remove('hidden');

    nav.innerHTML = parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        const isFirst = index === 0;

        if (isLast) {
            // Aktuální stránka — neklikatelná, zvýrazněná
            return `<span class="font-semibold" style="color: #e2e8f0;">${escapeHTML(part.label)}</span>`;
        }

        // Klikatelná část
        return `
            <button onclick="navigate('${part.path}')"
                    class="transition-colors hover:text-white flex items-center gap-1"
                    style="color: #64748b;">
                ${isFirst ? `<i data-lucide="home" class="w-3.5 h-3.5"></i>` : ''}
                ${escapeHTML(part.label)}
            </button>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5 flex-shrink-0" style="color: #334155;"></i>
        `;
    }).join('');

    lucide.createIcons();
}

function hideBreadcrumb() {
    const bar = document.getElementById('breadcrumb-bar');
    if (bar) {
        bar.classList.add('hidden');
    }
}

function copyToolLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Odkaz zkopírován do schránky!', 'success');
    }).catch(() => {
        showToast('Kopírování selhalo', 'error');
    });
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check' : type === 'error' ? 'x' : 'info'}" class="w-4 h-4"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => toast.remove(), 3000);
}

// ==========================================
// 0. BEZPEČNOSTNÍ FUNKCE (XSS OCHRANA)
// ==========================================
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return charsToReplace[tag] || tag;
    });
}

// ==========================================
// 1. AUTENTIZACE A COOKIES
// ==========================================
function getVevitUser() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; vevit_auth=`);
    if (parts.length === 2) {
        const cookieVal = parts.pop().split(';').shift();
        try {
            return JSON.parse(decodeURIComponent(cookieVal));
        } catch (e) {
            return null;
        }
    }
    return null;
}

function checkAuth() {
    const user = getVevitUser();
    const authContainer = document.getElementById('auth-container');
    
    if (user) {
        const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.nickname || 'User')}&background=random`;
        authContainer.innerHTML = `
            <a href="https://account.vevit.fun" target="_blank" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="${avatarUrl}" alt="Avatar" class="w-8 h-8 rounded-full border border-slate-700 object-cover">
            </a>
        `;
    } else {
        authContainer.innerHTML = `
            <div class="flex items-center gap-2">
                <a href="https://account.vevit.fun/login" class="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Přihlásit se</a>
                <a href="https://account.vevit.fun/register" class="bg-blue-600 hover:bg-blue-500 text-white keep-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Zaregistrovat se</a>
            </div>
        `;
    }
}

// Language selector
const translations = {
    'CS': {
        'title': 'Nástroje pro <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">Kreativce</span><br/>& Vývojáře.',
        'subtitle': 'Výkonná sada nástrojů pro vaše soubory. Bezpečně zpracujte PDF, Video, Obrázky a Audio přímo ve svém prohlížeči.',
        'popular': 'Nejoblíbenější nástroje',
        'all_tools': 'Všechny nástroje',
        'login': 'Přihlásit se',
        'register': 'Zaregistrovat se'
    },
    'EN': {
        'title': 'Tools for <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">Creators</span><br/>& Developers.',
        'subtitle': 'Powerful toolset for your files. Safely process PDF, Video, Images and Audio right in your browser.',
        'popular': 'Most Popular Tools',
        'all_tools': 'All Tools',
        'login': 'Log in',
        'register': 'Register'
    },
    'ES': {
        'title': 'Herramientas para <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">Creadores</span><br/>& Desarrolladores.',
        'subtitle': 'Potente conjunto de herramientas para tus archivos. Procesa de forma segura PDF, Video, Imágenes y Audio directamente en tu navegador.',
        'popular': 'Herramientas Populares',
        'all_tools': 'Todas las herramientas',
        'login': 'Iniciar sesión',
        'register': 'Registrarse'
    },
    'DE': {
        'title': 'Werkzeuge für <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">Kreative</span><br/>& Entwickler.',
        'subtitle': 'Leistungsstarkes Toolset für Ihre Dateien. Verarbeiten Sie PDF, Video, Bilder und Audio sicher direkt in Ihrem Browser.',
        'popular': 'Beliebteste Werkzeuge',
        'all_tools': 'Alle Werkzeuge',
        'login': 'Anmelden',
        'register': 'Registrieren'
    },
    'UK': {
        'title': 'Інструменти для <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">Творців</span><br/>& Розробників.',
        'subtitle': 'Потужний набір інструментів для ваших файлів. Безпечно обробляйте PDF, відео, зображення та аудіо прямо у вашому браузері.',
        'popular': 'Популярні інструменти',
        'all_tools': 'Всі інструменти',
        'login': 'Увійти',
        'register': 'Зареєструватися'
    }
};

function setLang(lang) {
    document.getElementById('current-lang').innerText = lang;
    
    const t = translations[lang];
    if (t) {
        const titleEl = document.querySelector('#home-view h1');
        if (titleEl) titleEl.innerHTML = t.title;
        
        const subtitleEl = document.querySelector('#home-view p.max-w-2xl');
        if (subtitleEl) subtitleEl.innerText = t.subtitle;
        
        const popularTitleEl = document.querySelector('#home-view h2:nth-of-type(1)');
        if (popularTitleEl) popularTitleEl.innerHTML = `<i data-lucide="star" class="w-5 h-5 text-yellow-500 fill-yellow-500"></i> ${t.popular}`;
        
        const allToolsTitleEl = document.querySelector('#home-view h2:nth-of-type(2)');
        if (allToolsTitleEl) allToolsTitleEl.innerHTML = `<i data-lucide="grid" class="w-5 h-5 text-blue-500"></i> ${t.all_tools}`;
        
        const loginBtn = document.querySelector('a[href="https://account.vevit.fun/login"]');
        if (loginBtn) loginBtn.innerText = t.login;
        
        const registerBtn = document.querySelector('a[href="https://account.vevit.fun/register"]');
        if (registerBtn) registerBtn.innerText = t.register;
        
        lucide.createIcons();
    }
}

// ==========================================
// 2. DEFINICE DAT
// ==========================================
const mainItems = [
    // Popular
    { id: 'pdf-tools', type: 'category', name: 'PDF Nástroje',
      icon: 'file-text', desc: '20+ nástrojů pro práci s PDF.',
      color: 'bg-blue-500', popular: true,
      keywords: ['pdf', 'merge', 'split', 'compress', 'rotate', 'watermark', 'convert', 'organize'] },
    { id: 'pdf-converter', type: 'tool', name: 'PDF Converter',
      icon: 'arrow-right-left', desc: 'Konverze PDF ↔ Word, Excel, JPG...',
      color: 'bg-violet-500', popular: true,
      keywords: ['convert', 'word', 'excel', 'jpg', 'ppt', 'konverze', 'pdf'] },
    { id: 'ai-vision', type: 'tool', name: 'AI Vision',
      icon: 'sparkles', desc: 'AI analýza obrázků',
      color: 'bg-yellow-500', popular: true, tag: 'AI',
      keywords: ['ai', 'image', 'analyze', 'vision', 'gemini', 'obrázek'] },
    // Ostatní nástroje
    { id: 'resize-img', type: 'tool', name: 'Změna Velikosti',
      icon: 'maximize', color: 'bg-green-500', tag: 'OBRÁZEK',
      keywords: ['resize', 'image', 'obrázek', 'velikost', 'px', 'změnit'] },
    { id: 'img-conv', type: 'tool', name: 'Obrázkový Konvertor',
      icon: 'image', color: 'bg-purple-500', tag: 'OBRÁZEK',
      keywords: ['jpg', 'png', 'webp', 'gif', 'convert', 'image', 'obrázek'] },
    { id: 'video-conv', type: 'tool', name: 'Video Konvertor',
      icon: 'video', color: 'bg-orange-500', tag: 'VIDEO',
      keywords: ['mp4', 'mkv', 'avi', 'video', 'convert', 'převod'] },
    { id: 'audio-conv', type: 'tool', name: 'Audio Konvertor',
      icon: 'music', color: 'bg-pink-500', tag: 'AUDIO',
      keywords: ['mp3', 'wav', 'flac', 'audio', 'convert', 'hudba'] },
    { id: 'tts', type: 'tool', name: 'Text na řeč',
      icon: 'mic', color: 'bg-cyan-500', tag: 'AI AUDIO',
      keywords: ['tts', 'text', 'speech', 'řeč', 'hlas', 'voice', 'číst'] },
    { id: 'ai-search', type: 'tool', name: 'AI Vyhledávač',
      icon: 'search', color: 'bg-teal-500', tag: 'AI',
      keywords: ['search', 'vyhledávač', 'ai', 'gemini', 'web', 'hledat'] },
];

const pdfTools = [
    // ORGANIZACE
    { id: 'merge-pdf', name: 'Merge PDF', icon: 'combine',
      desc: 'Sloučit více PDF do jednoho souboru.', color: 'bg-blue-500',
      category: 'Organizace', frontend: true,
      keywords: ['merge', 'sloučit', 'combine', 'spojit'] },
    { id: 'split-pdf', name: 'Split PDF', icon: 'scissors',
      desc: 'Rozdělit PDF na části nebo jednotlivé stránky.', color: 'bg-purple-500',
      category: 'Organizace', frontend: true,
      keywords: ['split', 'rozdělit', 'separate', 'stránky'] },
    { id: 'remove-pages', name: 'Remove Pages', icon: 'trash-2',
      desc: 'Odstranit vybrané stránky z PDF.', color: 'bg-red-500',
      category: 'Organizace', frontend: true,
      keywords: ['remove', 'delete', 'odstranit', 'smazat', 'stránky'] },
    { id: 'extract-pages', name: 'Extract Pages', icon: 'file-output',
      desc: 'Extrahovat vybrané stránky do nového PDF.', color: 'bg-cyan-500',
      category: 'Organizace', frontend: true,
      keywords: ['extract', 'vybrat', 'extrahovat', 'stránky'] },
    { id: 'organize-pdf', name: 'Organize PDF', icon: 'layout-grid',
      desc: 'Přeuspořádat stránky vizuálně drag & drop.', color: 'bg-indigo-500',
      category: 'Organizace', frontend: true,
      keywords: ['organize', 'reorder', 'uspořádat', 'pořadí'] },
    { id: 'scan-to-pdf', name: 'Scan to PDF', icon: 'scan',
      desc: 'Naskenovat dokument kamerou do PDF.', color: 'bg-teal-500',
      category: 'Organizace', frontend: true,
      keywords: ['scan', 'kamera', 'sken', 'foto', 'pdf'] },

    // OPTIMALIZACE
    { id: 'compress-pdf', name: 'Compress PDF', icon: 'archive',
      desc: 'Zmenšit velikost PDF souboru.', color: 'bg-green-500',
      category: 'Optimalizace', frontend: true,
      keywords: ['compress', 'zmensit', 'komprese', 'velikost'] },
    { id: 'repair-pdf', name: 'Repair PDF', icon: 'wrench',
      desc: 'Opravit poškozený PDF soubor.', color: 'bg-yellow-500',
      category: 'Optimalizace', frontend: true,
      keywords: ['repair', 'opravit', 'fix', 'poškozený'] },
    { id: 'ocr-pdf', name: 'OCR PDF', icon: 'text-cursor',
      desc: 'Převést skenovaný PDF na prohledávatelný text.', color: 'bg-orange-500',
      category: 'Optimalizace', frontend: true, apiNote: 'Tesseract.js',
      keywords: ['ocr', 'text', 'rozpoznat', 'sken', 'číst'] },

    // KONVERZE
    { id: 'pdf-converter', name: 'PDF Converter', icon: 'arrow-right-left',
      desc: 'Konverze PDF ↔ Word, Excel, PPT, JPG, HTML.', color: 'bg-violet-500',
      category: 'Konverze', frontend: 'partial',
      keywords: ['convert', 'word', 'excel', 'ppt', 'jpg', 'html', 'konverze'] },

    // EDITACE
    { id: 'rotate-pdf', name: 'Rotate PDF', icon: 'rotate-cw',
      desc: 'Otočit stránky PDF o 90° nebo 180°.', color: 'bg-sky-500',
      category: 'Editace', frontend: true,
      keywords: ['rotate', 'otočit', 'rotation', ' stránky'] },
    { id: 'page-numbers', name: 'Page Numbers', icon: 'hash',
      desc: 'Přidat čísla stránek do PDF.', color: 'bg-lime-500',
      category: 'Editace', frontend: true,
      keywords: ['numbers', 'čísla', 'stránky', 'číslování'] },
    { id: 'watermark-pdf', name: 'Watermark PDF', icon: 'droplets',
      desc: 'Přidat vodoznak (text nebo obrázek) do PDF.', color: 'bg-blue-400',
      category: 'Editace', frontend: true,
      keywords: ['watermark', 'vodoznak', 'text', 'obrázek'] },
    { id: 'crop-pdf', name: 'Crop PDF', icon: 'crop',
      desc: 'Oříznout okraje stránek PDF.', color: 'bg-emerald-500',
      category: 'Editace', frontend: true,
      keywords: ['crop', 'oříznout', 'okraj', 'margin'] },
    { id: 'redact-pdf', name: 'Redact PDF', icon: 'eraser',
      desc: 'Permanentně skrýt citlivé informace.', color: 'bg-slate-500',
      category: 'Editace', frontend: true,
      keywords: ['redact', 'skrýt', 'citlivé', 'černit'] },

    // ZABEZPEČENÍ
    { id: 'unlock-pdf', name: 'Unlock PDF', icon: 'lock-open',
      desc: 'Odstranit heslo a ochranu z PDF.', color: 'bg-amber-500',
      category: 'Zabezpečení', frontend: true,
      keywords: ['unlock', 'odemknout', 'heslo', 'password'] },
    { id: 'protect-pdf', name: 'Protect PDF', icon: 'lock',
      desc: 'Chránit PDF heslem a šifrováním.', color: 'bg-rose-500',
      category: 'Zabezpečení', frontend: true,
      keywords: ['protect', 'heslo', 'šifrování', 'zabezpečit'] },
    { id: 'compare-pdf', name: 'Compare PDF', icon: 'diff',
      desc: 'Porovnat dvě verze PDF dokumentu.', color: 'bg-fuchsia-500',
      category: 'Zabezpečení', frontend: true,
      keywords: ['compare', 'porovnat', 'rozdíl', 'diff'] },

    // AI
    { id: 'ai-summarize', name: 'AI Summarizer', icon: 'sparkles',
      desc: 'AI shrnutí obsahu PDF dokumentu.', color: 'bg-yellow-500',
      category: 'AI', frontend: false, apiNote: 'Gemini API',
      keywords: ['ai', 'summarize', 'shrnout', 'gemini', 'souhrn'] },
    { id: 'ai-translate-pdf', name: 'Translate PDF', icon: 'languages',
      desc: 'AI překlad PDF do libovolného jazyka.', color: 'bg-pink-500',
      category: 'AI', frontend: false, apiNote: 'Gemini API',
      keywords: ['translate', 'přeložit', 'jazyk', 'překlad'] }
];

// ==========================================
// 3. UI GENERÁTORY A HELPERY
// ==========================================
function renderHome() {
    const popularGrid = document.getElementById('popular-tools-grid');
    const categoriesGrid = document.getElementById('categories-grid');

    const popularItems = mainItems.filter(t => t.popular);

    // Popular tools cards - redesigned
    popularGrid.innerHTML = popularItems.map(item => `
        <div onclick="handleItemClick('${item.id}', '${item.type}')"
             class="relative flex flex-col h-full rounded-2xl p-6 cursor-pointer transition-all duration-300 group overflow-hidden tool-card bg-card-base border border-card">

            <!-- Ambient glow při hoveru -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                 style="background: radial-gradient(ellipse at top left, rgba(99,102,241,0.06) 0%, transparent 60%);"></div>

            <!-- Ikona -->
            <div class="relative w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <i data-lucide="${item.icon}" class="w-7 h-7 text-white keep-white"></i>
            </div>

            <!-- Obsah -->
            <h3 class="text-xl font-bold text-white mb-2">${item.name}</h3>
            <p class="text-slate-400 text-sm flex-grow mb-6 leading-relaxed">${item.desc || ''}</p>

            <!-- CTA -->
            <div class="flex items-center gap-2 text-sm font-semibold" style="color: #818cf8;">
                ${item.type === 'category' ? 'Otevřít kategorii' : 'Otevřít nástroj'}
                <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
            </div>
        </div>
    `).join('');

    // Category grid - redesigned
    categoriesGrid.innerHTML = mainItems.map(item => `
        <div ${item.disabled ? '' : `onclick="handleItemClick('${item.id}', '${item.type}')"`}
             class="relative rounded-xl p-4 transition-all duration-200 flex items-center gap-3 group bg-card-base border border-card ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}">
            <div class="w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 shadow-md transition-transform duration-200 ${item.disabled ? '' : 'group-hover:scale-105'}">
                <i data-lucide="${item.icon}" class="w-5 h-5 text-white keep-white"></i>
            </div>
            <div class="flex flex-col min-w-0">
                <span class="font-bold text-slate-200 group-hover:text-white text-sm truncate transition-colors">${item.name}</span>
                ${item.disabled
                    ? `<span class="text-[10px] font-bold text-slate-500 tracking-wider">PŘIPRAVUJE SE</span>`
                    : (item.tag
                        ? `<span class="text-[10px] font-bold tracking-wider" style="color:#6366f1;">${item.tag}</span>`
                        : '')}
            </div>
            ${item.id === 'pdf-tools'
                ? `<span class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style="background:rgba(99,102,241,0.15); color:#818cf8;">20+</span>`
                : ''}
        </div>
    `).join('');

    lucide.createIcons();
    initSearch();
}

// Vyhledávač nástrojů
function initSearch() {
    const searchInput = document.getElementById('tool-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Klik mimo skryje výsledky
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            return;
        }

        // Hledat v mainItems i pdfTools
        const allTools = [
            ...mainItems.filter(t => t.type === 'tool'),
            ...pdfTools.map(t => ({ ...t, type: 'tool' }))
        ];

        const results = allTools.filter(tool => {
            const name = (tool.name || '').toLowerCase();
            const desc = (tool.desc || '').toLowerCase();
            const keywords = (tool.keywords || []).join(' ').toLowerCase();
            return name.includes(query) || desc.includes(query) || keywords.includes(query);
        });

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="p-4 text-center text-slate-400 text-sm">
                    Žádné nástroje nenalezeny
                </div>
            `;
        } else {
            searchResults.innerHTML = results.slice(0, 8).map(tool => `
                <div onclick="handleItemClick('${tool.id}', 'tool'); document.getElementById('tool-search').value = ''; document.getElementById('search-results').classList.add('hidden');" class="flex items-center gap-4 p-4 hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700 last:border-b-0">
                    <div class="w-10 h-10 rounded-lg ${tool.color} flex items-center justify-center shrink-0">
                        <i data-lucide="${tool.icon}" class="w-5 h-5 text-white keep-white"></i>
                    </div>
                    <div class="flex-grow min-w-0">
                        <h4 class="font-bold text-white text-sm">${tool.name}</h4>
                        <p class="text-slate-400 text-xs truncate">${tool.desc}</p>
                    </div>
                    ${tool.category ? `<span class="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-700/50 rounded">${tool.category}</span>` : ''}
                    ${tool.tag ? `<span class="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-700/50 rounded">${tool.tag}</span>` : ''}
                </div>
            `).join('');
        }

        searchResults.classList.remove('hidden');
        lucide.createIcons();
    });
}

function handleItemClick(id, type) {
    if (type === 'category') {
        showCategory(id);
    } else {
        openTool(id);
    }
}

function showHome() {
    navigate('/');
}

function showCategory(categoryId) {
    const slug = URL_MAP[categoryId] || '/' + categoryId;
    navigate(slug);
}

function openTool(toolId) {
    const slug = URL_MAP[toolId] || '/' + toolId;
    navigate(slug);
}

// Interní funkce
function _showHome() {
    document.getElementById('home-view').classList.remove('hidden-section');
    document.getElementById('category-view').classList.add('hidden-section');
    document.getElementById('tool-view').classList.add('hidden-section');
    document.title = 'VeVit Tools';
    hideBreadcrumb();
}

function _showCategory(categoryId) {
    document.getElementById('home-view').classList.add('hidden-section');
    document.getElementById('category-view').classList.remove('hidden-section');
    document.getElementById('tool-view').classList.add('hidden-section');
    document.title = 'PDF Nástroje — VeVit Tools';

    // Breadcrumb navigace
    if (categoryId === 'pdf-tools') {
        renderBreadcrumb([
            { label: 'Dashboard', path: '/' },
            { label: 'PDF Nástroje', path: '/pdf-tools' }
        ]);
    }

    const grid = document.getElementById('category-tools-grid');

    if (categoryId === 'pdf' || categoryId === 'pdf-tools') {
        document.getElementById('category-title').innerText = 'PDF Nástroje';
        document.getElementById('category-desc').innerText = 'Kompletní sada nástrojů pro práci s PDF soubory.';

        // Seskupit nástroje podle kategorie
        const categories = {
            'Organizace': { order: 1, tools: [] },
            'Optimalizace': { order: 2, tools: [] },
            'Konverze': { order: 3, tools: [] },
            'Editace': { order: 4, tools: [] },
            'Zabezpečení': { order: 5, tools: [] },
            'AI': { order: 6, tools: [] }
        };

        pdfTools.forEach(tool => {
            if (categories[tool.category]) {
                categories[tool.category].tools.push(tool);
            }
        });

        // Seřadit kategorie podle order
        const sortedCategories = Object.entries(categories).sort((a, b) => a[1].order - b[1].order);

        let html = '';
        sortedCategories.forEach(([catName, catData]) => {
            if (catData.tools.length > 0) {
                html += `
                    <div class="mb-8">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-2 h-2 rounded-full" style="background:#6366f1;"></div>
                            <h3 class="text-sm font-bold tracking-wider uppercase" style="color:#6366f1;">${catName}</h3>
                            <div class="flex-grow h-px" style="background:rgba(99,102,241,0.15);"></div>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            ${catData.tools.map(tool => `
                                <div onclick="openTool('${tool.id}')"
                                     class="rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col items-center text-center group bg-card-base border border-card hover:border-card-hover hover:bg-card-hover-base">
                                    <div class="w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200">
                                        <i data-lucide="${tool.icon}" class="w-6 h-6 text-white keep-white"></i>
                                    </div>
                                    <h4 class="font-bold text-white text-sm mb-1">${tool.name}</h4>
                                    <p class="text-xs text-slate-500 leading-relaxed">${tool.desc}</p>
                                    ${tool.frontend === false
                                        ? `<span class="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:rgba(234,179,8,0.15); color:#eab308;">${tool.apiNote?.includes('Gemini') ? 'AI' : 'SERVER'}</span>`
                                        : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        grid.innerHTML = html;
    }
    lucide.createIcons();
}

function _openTool(toolId) {
    document.getElementById('home-view').classList.add('hidden-section');
    document.getElementById('category-view').classList.add('hidden-section');
    document.getElementById('tool-view').classList.remove('hidden-section');

    const container = document.getElementById('tool-container');
    container.innerHTML = '';

    // Najdi tool info
    const tool = [...mainItems, ...pdfTools].find(t => t.id === toolId);
    const toolName = tool?.name || toolId;
    const isPdfTool = pdfTools.some(t => t.id === toolId);

    // Breadcrumb navigace
    if (isPdfTool) {
        renderBreadcrumb([
            { label: 'Dashboard', path: '/' },
            { label: 'PDF Nástroje', path: '/pdf-tools' },
            { label: toolName, path: URL_MAP[toolId] || '/' + toolId }
        ]);
    } else {
        renderBreadcrumb([
            { label: 'Dashboard', path: '/' },
            { label: toolName, path: URL_MAP[toolId] || '/' + toolId }
        ]);
    }

    initToolUI(toolId, container);
    lucide.createIcons();

    // Nastav page title
    if (tool) {
        document.title = tool.name + ' — VeVit Tools';
    }
}

// Custom Dropdown Komponenta
function createCustomSelect(id, options, placeholder = "Vyberte možnost") {
    const optionsHtml = options.map(opt => `<span class="custom-option" data-value="${opt.value}">${opt.label}</span>`).join('');
    return `
        <div class="custom-select-wrapper" id="${id}-wrapper">
            <div class="custom-select" id="${id}">
                <div class="custom-select__trigger">
                    <span class="selected-text truncate">${placeholder}</span>
                    <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 shrink-0 ml-2"></i>
                </div>
                <div class="custom-options">
                    ${optionsHtml}
                </div>
            </div>
            <input type="hidden" id="${id}-input" value="${options[0]?.value || ''}">
        </div>
    `;
}

function initCustomSelects() {
    document.querySelectorAll('.custom-select-wrapper:not(.initialized)').forEach(wrapper => {
        wrapper.classList.add('initialized');
        const select = wrapper.querySelector('.custom-select');
        const trigger = select.querySelector('.custom-select__trigger');
        const options = select.querySelectorAll('.custom-option');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const selectedText = trigger.querySelector('.selected-text');

        // Set initial value if not set
        if(options.length > 0 && !hiddenInput.value) {
            hiddenInput.value = options[0].getAttribute('data-value');
            selectedText.textContent = options[0].textContent;
            options[0].classList.add('selected');
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select').forEach(s => {
                if(s !== select) s.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedText.textContent = this.textContent;
                hiddenInput.value = this.getAttribute('data-value');
                select.classList.remove('open');
                hiddenInput.dispatchEvent(new Event('change'));
            });
        });
    });

    if (!window.customSelectsInitialized) {
        window.customSelectsInitialized = true;
        window.addEventListener('click', function() {
            document.querySelectorAll('.custom-select').forEach(select => select.classList.remove('open'));
        });
    }
}

function createDropzone(id, accept, label, icon = 'upload', single = false) {
    return `
        <div id="${id}" class="border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center hover:border-indigo-500 hover:bg-slate-800/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 bg-card-base h-full min-h-[300px]">
            <div class="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 shadow-inner">
                <i data-lucide="${icon}" class="w-8 h-8"></i>
            </div>
            <div>
                <p class="text-lg font-bold text-white">Přetáhněte soubor sem</p>
                <p class="text-sm text-slate-500 mt-1">${label}</p>
            </div>
            <input type="file" id="${id}-input" class="hidden" accept="${accept}"${single ? '' : ' multiple'}>
        </div>
    `;
}

function initDropzone(id, onFiles) {
    const dropzone = document.getElementById(id);
    const input = document.getElementById(`${id}-input`);
    if(!dropzone || !input) return;
    
    dropzone.addEventListener('click', () => input.click());
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dz-active');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dz-active');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dz-active');
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
    });
    
    input.addEventListener('change', (e) => {
        if (e.target.files.length) onFiles(e.target.files);
    });
}

function showLoading(btnId, text = "Processing...") {
    const btn = document.getElementById(btnId);
    if(!btn) return;
    btn.dataset.originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin inline-block mr-2"></i> ${text}`;
    lucide.createIcons();
}

function hideLoading(btnId) {
    const btn = document.getElementById(btnId);
    if(!btn) return;
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText;
    lucide.createIcons();
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================
// 4. IMPLEMENTACE NÁSTROJŮ (UI & Logika)
// ==========================================
function initToolUI(toolId, container) {
    
    // --- MERGE PDF ---
    if (toolId === 'merge-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Merge PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Merge PDF</h2>
                <p class="text-slate-400">Combine multiple PDFs into one unified document.</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Column -->
                <div class="flex flex-col gap-4">
                    ${createDropzone('merge-dz', 'application/pdf', 'Maximum file size: 10MB')}
                    <div class="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <i data-lucide="info" class="w-5 h-5 shrink-0 text-blue-400"></i>
                        <p>Files are processed entirely in your browser. No data is sent to any server.</p>
                    </div>
                </div>
                
                <!-- Right Column -->
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <div id="merge-list" class="flex-grow space-y-3 mb-6 overflow-y-auto max-h-[300px]">
                        <p class="text-slate-500 text-center py-8 text-sm">No files uploaded yet.</p>
                    </div>
                    <button id="btn-merge" class="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white keep-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Merge PDFs <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `;
        
        let pdfFiles = [];
        
        initDropzone('merge-dz', (files) => {
            for(let f of files) { if(f.type === 'application/pdf') pdfFiles.push(f); }
            renderMergeList();
        });
        
        function renderMergeList() {
            const list = document.getElementById('merge-list');
            const btn = document.getElementById('btn-merge');
            
            if (pdfFiles.length === 0) {
                list.innerHTML = `<p class="text-slate-500 text-center py-8 text-sm">No files uploaded yet.</p>`;
                btn.disabled = true;
                return;
            }
            
            list.innerHTML = pdfFiles.map((f, i) => `
                <div class="flex justify-between items-center bg-[#1E293B] border border-slate-700 p-3 rounded-xl">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="bg-slate-700 text-xs font-bold px-2 py-1 rounded text-slate-300">PDF</div>
                        <span class="truncate text-slate-200 text-sm font-medium">${escapeHTML(f.name)}</span>
                    </div>
                    <button onclick="removePdf(${i})" class="text-slate-400 hover:text-white p-1"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
            `).join('');
            lucide.createIcons();
            btn.disabled = pdfFiles.length < 2;
        }
        
        window.removePdf = (index) => { pdfFiles.splice(index, 1); renderMergeList(); };
        
        document.getElementById('btn-merge').addEventListener('click', async () => {
            showLoading('btn-merge');
            try {
                const mergedPdf = await PDFLib.PDFDocument.create();
                for (let file of pdfFiles) {
                    const bytes = await file.arrayBuffer();
                    const pdf = await PDFLib.PDFDocument.load(bytes);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
                const mergedPdfFile = await mergedPdf.save();
                downloadBlob(new Blob([mergedPdfFile], { type: 'application/pdf' }), 'merged.pdf');
            } catch (e) { alert("Error: " + e.message); }
            hideLoading('btn-merge');
        });
    }
    
    // --- SPLIT PDF ---
    else if (toolId === 'split-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-purple-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Split PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Split PDF</h2>
                <p class="text-slate-400">Rozdělit PDF na části nebo jednotlivé stránky.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div id="split-upload-area" class="h-full min-h-[300px]">
                        ${createDropzone('split-dz', 'application/pdf', 'Nahrajte PDF soubor', 'upload', true)}
                    </div>
                    <div id="split-info-area" class="hidden border border-purple-500/30 bg-purple-900/10 rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-white">Soubor načten</h3>
                                <p id="split-filename" class="text-slate-400 text-sm truncate max-w-[200px]"></p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span id="split-pages-badge" class="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full"></span>
                                <button onclick="resetSplit()" class="text-sm text-purple-400 hover:text-purple-300 underline">Změnit</button>
                            </div>
                        </div>

                        <!-- Náhledy stránek s dělicími čarami -->
                        <div class="mb-4">
                            <p class="text-slate-300 text-sm mb-3">
                                <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
                                Klikněte na šedou čáru <strong>za stránkou</strong>, na které chcete dokument rozdělit.
                            </p>
                            <div id="split-thumbnails" class="max-h-[350px] overflow-y-auto p-2 bg-[#0B0F19] rounded-lg">
                            </div>
                        </div>
                    </div>

                    <div class="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <i data-lucide="info" class="w-5 h-5 shrink-0 text-blue-400"></i>
                        <p>Soubory se zpracovávají lokálně ve vašem prohlížeči.</p>
                    </div>
                </div>

                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-1">Body rozdělení</h3>
                    <p class="text-slate-400 text-sm mb-4">Zadejte číslo stránky, <strong>za kterou</strong> se má dokument rozdělit.</p>

                    <div id="split-points-list" class="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                        <p class="text-slate-500 text-center py-4 text-sm">Zatím žádné body rozdělení</p>
                    </div>

                    <div class="flex gap-2 mb-4">
                        <input type="number" id="split-new-point" placeholder="Číslo stránky (např. 3)" min="1" class="flex-grow bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none">
                        <button id="btn-add-split-point" class="bg-purple-500/20 text-purple-400 px-4 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors disabled:opacity-50">
                            <i data-lucide="plus" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <div class="bg-[#1E293B] rounded-xl p-4 mb-4">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="split-independent-copy" class="w-4 h-4 rounded border-slate-600 text-purple-500 focus:ring-purple-500 bg-[#0B0F19]">
                            <span class="text-slate-300">Vytvořit nezávislou kopii (2 PDF ve složce)</span>
                        </label>
                        <p class="text-slate-500 text-xs mt-1 ml-6">Pokud zaškrtnuto, vytvoří se složka s oběma částmi.</p>
                    </div>

                    <div class="mt-auto space-y-3">
                        <button id="btn-split-custom" class="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50" disabled>
                            Rozdělit podle bodů
                        </button>
                        <button id="btn-split-burst" class="w-full bg-transparent border border-slate-700 hover:border-purple-500 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                            Rozdělit na jednotlivé stránky (Burst)
                        </button>
                    </div>
                </div>
            </div>
        `;

        let currentPdfBytes = null;
        let totalPages = 0;
        let splitPoints = [];

        window.resetSplit = () => {
            currentPdfBytes = null;
            totalPages = 0;
            splitPoints = [];
            document.getElementById('split-upload-area').classList.remove('hidden');
            document.getElementById('split-info-area').classList.add('hidden');
            document.getElementById('split-points-list').innerHTML = '<p class="text-slate-500 text-center py-4 text-sm">Zatím žádné body rozdělení</p>';
            document.getElementById('split-thumbnails').innerHTML = '';
            document.getElementById('btn-split-custom').disabled = true;
            document.getElementById('btn-split-burst').disabled = true;
        };

        function renderSplitPoints() {
            const list = document.getElementById('split-points-list');
            if (splitPoints.length === 0) {
                list.innerHTML = '<p class="text-slate-500 text-center py-4 text-sm">Zatím žádné body rozdělení</p>';
            } else {
                list.innerHTML = splitPoints.map((point, idx) => `
                    <div class="flex items-center gap-3 bg-[#1E293B] border border-slate-700 rounded-lg p-3">
                        <span class="text-purple-400 font-bold">${point.page}</span>
                        <span class="text-slate-400 text-sm">strana</span>
                        ${point.independentCopy ? '<span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Kopie</span>' : ''}
                        <button onclick="removeSplitPoint(${idx})" class="ml-auto text-slate-400 hover:text-red-400">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                `).join('');
            }
            lucide.createIcons();
            document.getElementById('btn-split-custom').disabled = splitPoints.length === 0;

            // Aktualizovat zvýraznění dělicích čar
            updateDividerHighlights();
        }

        function updateDividerHighlights() {
            const dividers = document.querySelectorAll('.split-divider');
            dividers.forEach(divider => {
                const afterPage = parseInt(divider.dataset.afterPage);
                const isSplitPoint = splitPoints.some(p => p.page === afterPage);
                if (isSplitPoint) {
                    divider.style.background = '#A855F7';
                    divider.style.boxShadow = '0 0 8px rgba(168, 85, 247, 0.5)';
                    divider.innerHTML = '<i data-lucide="scissors" class="w-3 h-3 text-white"></i>';
                    divider.classList.add('flex', 'items-center', 'justify-center');
                } else {
                    divider.style.background = 'rgba(51, 65, 85, 0.3)';
                    divider.style.boxShadow = 'none';
                    divider.innerHTML = '';
                }
            });
            lucide.createIcons();
        }

        async function renderSplitThumbnails() {
            const container = document.getElementById('split-thumbnails');
            container.innerHTML = '';

            try {
                const pdf = await pdfjsLib.getDocument({data: currentPdfBytes}).promise;

                // Flex wrap container pro náhledy s čarami
                const wrapper = document.createElement('div');
                wrapper.className = 'flex flex-wrap items-stretch gap-0';

                for (let i = 0; i < totalPages; i++) {
                    const page = await pdf.getPage(i + 1);
                    const viewport = page.getViewport({scale: 0.25});
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({canvasContext: ctx, viewport: viewport}).promise;

                    // Thumbnail item (náhled + volitelně dělicí čára vpravo)
                    const item = document.createElement('div');
                    item.className = 'flex items-stretch';
                    item.style.width = 'calc(20% - 2px)'; // 5 položek na řádek s malou mezerou
                    item.style.minWidth = '80px';

                    // Thumbnail
                    const thumb = document.createElement('div');
                    thumb.className = 'split-thumb border border-slate-600 rounded overflow-hidden bg-white relative flex-shrink-0';
                    thumb.style.width = 'calc(100% - 8px)'; // Místo pro dělicí čáru
                    thumb.innerHTML = `
                        <img src="${canvas.toDataURL()}" class="w-full h-auto block">
                        <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-bold py-0.5 text-center">
                            ${i + 1}
                        </div>
                    `;
                    item.appendChild(thumb);

                    // Dělicí čára vpravo (vertikální) - ne za poslední stránkou
                    if (i < totalPages - 1) {
                        const divider = document.createElement('div');
                        divider.className = 'split-divider w-2 cursor-pointer transition-all flex items-center justify-center self-stretch';
                        divider.style.width = '8px';
                        divider.style.background = 'rgba(51, 65, 85, 0.3)';
                        divider.dataset.afterPage = i + 1;
                        divider.title = `Rozdělit za stránkou ${i + 1}`;

                        // Hover efekt
                        divider.addEventListener('mouseenter', () => {
                            if (!splitPoints.some(p => p.page === parseInt(divider.dataset.afterPage))) {
                                divider.style.background = 'rgba(168, 85, 247, 0.5)';
                            }
                        });
                        divider.addEventListener('mouseleave', () => {
                            if (!splitPoints.some(p => p.page === parseInt(divider.dataset.afterPage))) {
                                divider.style.background = 'rgba(51, 65, 85, 0.3)';
                            }
                        });

                        divider.addEventListener('click', () => {
                            const pageNum = parseInt(divider.dataset.afterPage);
                            const existingIdx = splitPoints.findIndex(p => p.page === pageNum);

                            if (existingIdx >= 0) {
                                splitPoints.splice(existingIdx, 1);
                            } else {
                                splitPoints.push({ page: pageNum, independentCopy: false });
                                splitPoints.sort((a, b) => a.page - b.page);
                            }
                            renderSplitPoints();
                        });

                        item.appendChild(divider);
                    }

                    wrapper.appendChild(item);
                }

                container.appendChild(wrapper);
                renderSplitPoints();
            } catch (err) {
                container.innerHTML = `<div class="text-center text-red-400 py-4">Chyba při načítání: ${err.message}</div>`;
            }
        }

        window.removeSplitPoint = (idx) => {
            splitPoints.splice(idx, 1);
            renderSplitPoints();
        };

        initDropzone('split-dz', async (files) => {
            const file = files[0];
            if(!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');

            document.getElementById('split-filename').innerText = file.name;

            currentPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(currentPdfBytes);
            totalPages = pdfDoc.getPageCount();

            document.getElementById('split-pages-badge').innerText = `${totalPages} stránek`;

            document.getElementById('split-upload-area').classList.add('hidden');
            document.getElementById('split-info-area').classList.remove('hidden');
            document.getElementById('btn-split-burst').disabled = false;

            // Render náhledů stránek
            await renderSplitThumbnails();
            lucide.createIcons();
        });

        document.getElementById('btn-add-split-point').addEventListener('click', () => {
            const input = document.getElementById('split-new-point');
            const pageNum = parseInt(input.value);
            const independentCopy = document.getElementById('split-independent-copy').checked;

            if (isNaN(pageNum) || pageNum < 1 || pageNum >= totalPages) {
                alert(`Zadejte číslo stránky mezi 1 a ${totalPages - 1}`);
                return;
            }

            if (splitPoints.some(p => p.page === pageNum)) {
                alert('Tento bod rozdělení již existuje.');
                return;
            }

            splitPoints.push({ page: pageNum, independentCopy });
            splitPoints.sort((a, b) => a.page - b.page);
            input.value = '';
            renderSplitPoints();
        });

        document.getElementById('btn-split-custom').addEventListener('click', async () => {
            if(!currentPdfBytes || splitPoints.length === 0) return;
            showLoading('btn-split-custom', 'Rozděluji...');

            try {
                const pdfDoc = await PDFLib.PDFDocument.load(currentPdfBytes);
                const zip = new JSZip();

                // Fáze 1: Lineární rozdělení pro body bez nezávislé kopie
                const linearPoints = splitPoints.filter(p => !p.independentCopy).map(p => p.page);
                if (linearPoints.length > 0) {
                    linearPoints.sort((a, b) => a - b);
                    let startPage = 0;

                    for (let i = 0; i <= linearPoints.length; i++) {
                        const endPage = i < linearPoints.length ? linearPoints[i] : totalPages;
                        if (startPage >= endPage) continue;

                        const newDoc = await PDFLib.PDFDocument.create();
                        const pages = await newDoc.copyPages(pdfDoc, Array.from({length: endPage - startPage}, (_, j) => startPage + j));
                        pages.forEach(p => newDoc.addPage(p));

                        const filename = i === linearPoints.length
                            ? `pages_${startPage + 1}-${endPage}.pdf`
                            : `part_${i + 1}_pages_${startPage + 1}-${endPage}.pdf`;

                        zip.file(filename, await newDoc.save());
                        startPage = endPage;
                    }
                }

                // Fáze 2: Nezávislé kopie
                const copyPoints = splitPoints.filter(p => p.independentCopy);
                for (const point of copyPoints) {
                    const folder = zip.folder(`split_at_page_${point.page}`);

                    // První část (od začátku po bod rozdělení)
                    const doc1 = await PDFLib.PDFDocument.create();
                    const pages1 = await doc1.copyPages(pdfDoc, Array.from({length: point.page}, (_, i) => i));
                    pages1.forEach(p => doc1.addPage(p));
                    folder.file('part_1.pdf', await doc1.save());

                    // Druhá část (od bodu rozdělení do konce)
                    const doc2 = await PDFLib.PDFDocument.create();
                    const pages2 = await doc2.copyPages(pdfDoc, Array.from({length: totalPages - point.page}, (_, i) => point.page + i));
                    pages2.forEach(p => doc2.addPage(p));
                    folder.file('part_2.pdf', await doc2.save());
                }

                // Pokud nejsou žádné lineární body ani kopie, rozdělíme podle všech bodů
                if (linearPoints.length === 0 && copyPoints.length === 0) {
                    const allPoints = splitPoints.map(p => p.page).sort((a, b) => a - b);
                    let startPage = 0;

                    for (let i = 0; i <= allPoints.length; i++) {
                        const endPage = i < allPoints.length ? allPoints[i] : totalPages;
                        const newDoc = await PDFLib.PDFDocument.create();
                        const pages = await newDoc.copyPages(pdfDoc, Array.from({length: endPage - startPage}, (_, j) => startPage + j));
                        pages.forEach(p => newDoc.addPage(p));
                        zip.file(`part_${i + 1}.pdf`, await newDoc.save());
                        startPage = endPage;
                    }
                }

                const zipBlob = await zip.generateAsync({type: "blob"});
                downloadBlob(zipBlob, "split_pages.zip");
            } catch (e) {
                alert("Chyba: " + e.message);
            }
            hideLoading('btn-split-custom');
        });

        document.getElementById('btn-split-burst').addEventListener('click', async () => {
            if(!currentPdfBytes) return;
            showLoading('btn-split-burst', 'Rozděluji...');
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(currentPdfBytes);
                const zip = new JSZip();
                for(let i = 0; i < totalPages; i++) {
                    const newDoc = await PDFLib.PDFDocument.create();
                    const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
                    newDoc.addPage(copiedPage);
                    zip.file(`page_${i+1}.pdf`, await newDoc.save());
                }
                const zipBlob = await zip.generateAsync({type: "blob"});
                downloadBlob(zipBlob, "burst_pages.zip");
            } catch (e) { alert("Chyba: " + e.message); }
            hideLoading('btn-split-burst');
        });
    }

    // --- RESIZE IMAGE ---
    else if (toolId === 'resize-img') {
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <!-- Left Column -->
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold tracking-wide mb-6">
                        <i data-lucide="maximize" class="w-3 h-3"></i> ZMĚNA VELIKOSTI
                    </div>
                    <h2 class="text-5xl font-extrabold text-white mb-4 leading-tight">
                        Změna velikosti<br/>
                        <span class="text-green-500">Bez ztráty kvality.</span>
                    </h2>
                    <p class="text-slate-400 text-lg">Nastavte přesné rozměry v pixelech nebo procentech. Vše se zpracovává lokálně ve vašem prohlížeči.</p>
                </div>
                
                <!-- Right Column -->
                <div class="bg-card border border-border rounded-3xl p-6 shadow-2xl">
                    <div id="resize-upload" class="mb-6">
                        ${createDropzone('resize-dz', 'image/*', 'Nahrát obrázek', 'image')}
                    </div>
                    
                    <div id="resize-config" class="hidden">
                        <div class="bg-[#1E293B] rounded-xl p-4 flex items-center justify-between mb-6">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                    <img id="resize-preview" class="max-w-full max-h-full object-contain">
                                </div>
                                <div>
                                    <p id="resize-filename" class="text-white font-bold text-sm truncate max-w-[200px]"></p>
                                    <p id="resize-orig-dim" class="text-slate-400 text-xs"></p>
                                </div>
                            </div>
                            <button onclick="resetResize()" class="text-slate-400 hover:text-white"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                        </div>
                        
                        <div class="bg-[#1E293B] rounded-xl p-5 mb-6">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="text-white font-bold flex items-center gap-2"><i data-lucide="check-square" class="w-4 h-4 text-green-500"></i> Nastavení rozměrů</h4>
                                <button class="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> Poměr</button>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-2 uppercase">Šířka (px)</label>
                                    <input type="number" id="resize-w" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-green-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-400 mb-2 uppercase">Výška (px)</label>
                                    <input type="number" id="resize-h" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white font-bold outline-none focus:border-green-500">
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                    <span>Změna v procentech</span>
                                    <span id="resize-pct-val" class="text-green-500">100%</span>
                                </div>
                                <input type="range" id="resize-pct" min="10" max="200" value="100">
                            </div>
                        </div>
                        
                        <button id="btn-resize" class="w-full bg-[#10B981] hover:bg-[#059669] text-white keep-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-green-500/20 text-lg">
                            Změnit velikost
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        let origImg = null;
        
        window.resetResize = () => {
            document.getElementById('resize-upload').classList.remove('hidden');
            document.getElementById('resize-config').classList.add('hidden');
            origImg = null;
        };
        
        initDropzone('resize-dz', (files) => {
            const file = files[0];
            if(!file || !file.type.startsWith('image/')) return alert('Vyberte obrázek.');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                origImg = new Image();
                origImg.onload = () => {
                    document.getElementById('resize-preview').src = e.target.result;
                    document.getElementById('resize-filename').innerText = file.name;
                    document.getElementById('resize-orig-dim').innerText = `Původní: ${origImg.width} × ${origImg.height} px`;
                    
                    document.getElementById('resize-w').value = origImg.width;
                    document.getElementById('resize-h').value = origImg.height;
                    
                    document.getElementById('resize-upload').classList.add('hidden');
                    document.getElementById('resize-config').classList.remove('hidden');
                };
                origImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        
        // Simple logic for slider
        document.getElementById('resize-pct').addEventListener('input', (e) => {
            if(!origImg) return;
            const pct = e.target.value;
            document.getElementById('resize-pct-val').innerText = `${pct}%`;
            document.getElementById('resize-w').value = Math.round(origImg.width * (pct / 100));
            document.getElementById('resize-h').value = Math.round(origImg.height * (pct / 100));
        });
        
        document.getElementById('btn-resize').addEventListener('click', () => {
            if(!origImg) return;
            showLoading('btn-resize');
            
            const w = parseInt(document.getElementById('resize-w').value);
            const h = parseInt(document.getElementById('resize-h').value);
            
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(origImg, 0, 0, w, h);
            
            canvas.toBlob((blob) => {
                downloadBlob(blob, 'resized_image.png');
                hideLoading('btn-resize');
            }, 'image/png');
        });
    }

    // --- VIDEO CONVERTER (API Mock) ---
    else if (toolId === 'video-conv' || toolId === 'audio-conv' || toolId === 'img-conv') {
        
        let title, desc, icon, colorClass, formats, quickSelects, config;
        
        const videoFormats = ['mp4', 'mkv', 'mov', 'avi', 'webm', 'wmv', 'm4v'];
        const audioFormats = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'];
        const imageFormats = ['jpg', 'png', 'gif', 'webp', 'svg', 'heic', 'tiff'];
        
        if (toolId === 'video-conv') {
            title = 'Konverze videa';
            desc = 'Jakýkoliv formát.';
            icon = 'video';
            colorClass = { text: 'text-orange-500', bgLight: 'bg-orange-500/10', borderLight: 'border-orange-500/20', btnBg: 'bg-[#F97316]', btnHover: 'bg-[#EA580C]' };
            formats = videoFormats;
            quickSelects = [
                { label: 'MKV do MP4', from: 'mkv', to: 'mp4' },
                { label: 'MOV do MP4', from: 'mov', to: 'mp4' },
                { label: 'Pro Web (WEBM)', from: 'auto', to: 'webm' }
            ];
            config = { tag: 'VIDEO LAB' };
        } else if (toolId === 'audio-conv') {
            title = 'Konverze audia';
            desc = 'Křišťálově čistý zvuk.';
            icon = 'music';
            colorClass = { text: 'text-pink-500', bgLight: 'bg-pink-500/10', borderLight: 'border-pink-500/20', btnBg: 'bg-[#EC4899]', btnHover: 'bg-[#DB2777]' };
            formats = audioFormats;
            quickSelects = [
                { label: 'WAV do MP3', from: 'wav', to: 'mp3' },
                { label: 'M4A do MP3', from: 'm4a', to: 'mp3' },
                { label: 'FLAC do ALAC', from: 'flac', to: 'm4a' }
            ];
            config = { tag: 'AUDIO LAB' };
        } else if (toolId === 'img-conv') {
            title = 'Konverze obrázků';
            desc = 'Rychle & Soukromě.';
            icon = 'image';
            colorClass = { text: 'text-purple-500', bgLight: 'bg-purple-500/10', borderLight: 'border-purple-500/20', btnBg: 'bg-[#A855F7]', btnHover: 'bg-[#9333EA]' };
            formats = imageFormats;
            quickSelects = [
                { label: 'PNG do JPG', from: 'png', to: 'jpg' },
                { label: 'JPG do PNG', from: 'jpg', to: 'png' },
                { label: 'WebP do JPG', from: 'webp', to: 'jpg' }
            ];
            config = { 
                tag: 'OBRÁZKOVÉ NÁSTROJE',
                subDesc: 'Převeďte své fotografie do libovolného formátu bez ztráty kvality.',
                btnText: 'Vybrat obrázek'
            };
        }

        const fromOptions = [{value: 'auto', label: 'AUTO'}, ...formats.map(f => ({value: f, label: f.toUpperCase()}))];
        const toOptions = formats.map(f => ({value: f, label: f.toUpperCase()}));

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full ${colorClass.bgLight} border ${colorClass.borderLight} ${colorClass.text} text-xs font-bold tracking-wide mb-6">
                        <i data-lucide="${icon}" class="w-3 h-3"></i> ${config.tag}
                    </div>
                    <h2 class="text-5xl font-extrabold text-white mb-4 leading-tight">
                        ${title}<br/>
                        <span class="${colorClass.text}">${desc}</span>
                    </h2>
                    ${config.subDesc ? `<p class="text-slate-400 text-lg mb-8">${config.subDesc}</p>` : ''}
                    
                    <p class="text-slate-500 text-xs font-bold tracking-widest uppercase mb-3 mt-8">Rychlá konverze</p>
                    <div class="flex flex-wrap gap-2" id="${toolId}-quick-selects">
                        ${quickSelects.map(qs => `
                            <span class="bg-card border border-border px-4 py-2 rounded-lg text-sm text-slate-300 cursor-pointer hover:border-slate-500 transition-colors" data-from="${qs.from}" data-to="${qs.to}">${qs.label}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-card border border-border rounded-3xl p-6 shadow-2xl">
                    <div class="bg-[#1E293B] rounded-2xl p-4 mb-6">
                        <div class="flex items-center gap-4">
                            <div class="flex-1">
                                <label class="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Z formátu</label>
                                ${createCustomSelect(`${toolId}-from`, fromOptions, 'AUTO')}
                            </div>
                            <div class="mt-5 text-slate-500 cursor-pointer hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-700" id="${toolId}-swap">
                                <i data-lucide="arrow-right-left" class="w-4 h-4"></i>
                            </div>
                            <div class="flex-1">
                                <label class="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Do formátu</label>
                                ${createCustomSelect(`${toolId}-to`, toOptions, toOptions[0].label)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center flex flex-col items-center justify-center hover:border-slate-500 hover:bg-slate-800/30 transition-all cursor-pointer min-h-[300px]" id="${toolId}-upload-area">
                        <div class="w-16 h-16 rounded-full ${colorClass.bgLight} flex items-center justify-center ${colorClass.text} mb-4">
                            <i data-lucide="file-up" class="w-8 h-8"></i>
                        </div>
                        <button id="btn-${toolId}-upload" class="${colorClass.btnBg} hover:${colorClass.btnHover} text-white keep-white font-bold py-3 px-8 rounded-xl transition-colors mb-3">
                            ${config.btnText || 'Vybrat soubor'}
                        </button>
                        <p class="text-slate-500 text-sm">nebo ho přetáhněte sem</p>
                        <input type="file" id="${toolId}-file-input" class="hidden">
                    </div>
                </div>
            </div>
        `;
        initCustomSelects();
        
        const fromInput = document.getElementById(`${toolId}-from-input`);
        const toInput = document.getElementById(`${toolId}-to-input`);
        const swapBtn = document.getElementById(`${toolId}-swap`);
        const uploadArea = document.getElementById(`${toolId}-upload-area`);
        const fileInput = document.getElementById(`${toolId}-file-input`);
        
        // Helper to update custom select UI
        const updateSelectUI = (id, value) => {
            const wrapper = document.getElementById(`${id}-wrapper`);
            const input = document.getElementById(`${id}-input`);
            const textSpan = wrapper.querySelector('.selected-text');
            const options = wrapper.querySelectorAll('.custom-option');
            
            input.value = value;
            options.forEach(opt => {
                if(opt.getAttribute('data-value') === value) {
                    opt.classList.add('selected');
                    textSpan.textContent = opt.textContent;
                } else {
                    opt.classList.remove('selected');
                }
            });
        };

        // Swap logic
        swapBtn.addEventListener('click', () => {
            const currentFrom = fromInput.value;
            const currentTo = toInput.value;
            
            if (currentFrom === 'auto') {
                // If from is auto, new to is the first format, new from is current to
                updateSelectUI(`${toolId}-from`, currentTo);
                updateSelectUI(`${toolId}-to`, formats[0]);
            } else {
                // Normal swap
                updateSelectUI(`${toolId}-from`, currentTo);
                
                // If new to (old from) is already the selected to, pick the next available
                if (currentFrom === currentTo) {
                    const nextFormat = formats.find(f => f !== currentFrom) || formats[0];
                    updateSelectUI(`${toolId}-to`, nextFormat);
                } else {
                    updateSelectUI(`${toolId}-to`, currentFrom);
                }
            }
        });

        // Quick selects logic
        document.getElementById(`${toolId}-quick-selects`).addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                const from = e.target.getAttribute('data-from');
                const to = e.target.getAttribute('data-to');
                updateSelectUI(`${toolId}-from`, from);
                updateSelectUI(`${toolId}-to`, to);
            }
        });

        // Upload logic (Mock)
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if(e.target.files.length > 0) {
                alert(`API Mock: Soubor ${e.target.files[0].name} by byl odeslán k převodu z ${fromInput.value.toUpperCase()} do ${toInput.value.toUpperCase()}.`);
            }
        });
        
        // Drag and drop visual feedback
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-slate-500', 'bg-slate-800/30');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-slate-500', 'bg-slate-800/30');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-slate-500', 'bg-slate-800/30');
            if(e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    }

    // --- ORGANIZE PDF ---
    else if (toolId === 'organize-pdf') {

      // === STAVOVÉ PROMĚNNÉ ===
      let orgDocuments = [];
      let orgSourceCounter = 0;
      let orgDraggedData = null;
      let orgDragOverTarget = null;

      const SOURCE_COLORS = [
        { bg: 'rgba(234,179,8,0.15)',  border: '#eab308', badge: 'bg-yellow-500',  text: 'text-yellow-300'  },
        { bg: 'rgba(168,85,247,0.15)', border: '#a855f7', badge: 'bg-purple-500',  text: 'text-purple-300'  },
        { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', badge: 'bg-red-500',     text: 'text-red-300'     },
        { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', badge: 'bg-blue-500',    text: 'text-blue-300'    },
        { bg: 'rgba(34,197,94,0.15)',  border: '#22c563', badge: 'bg-green-500',   text: 'text-green-300'   },
      ];

      // === HTML ===
      container.innerHTML = `
        <div class="text-center mb-8">
          <p class="text-indigo-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Organize PDF</p>
          <h2 class="text-4xl font-extrabold text-white mb-3">Organize PDF</h2>
          <p class="text-slate-400">Přeuspořádejte stránky drag & drop. Přetahujte i mezi různými dokumenty.</p>
        </div>

        <!-- Legenda barev -->
        <div id="org-legend" class="hidden flex-wrap gap-2 mb-4 items-center">
          <span class="text-slate-500 text-xs font-bold uppercase tracking-wider mr-2">Zdroje:</span>
        </div>

        <!-- Toolbar -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-2 text-slate-400 text-sm">
            <i data-lucide="info" class="w-4 h-4"></i>
            <span>Přetáhněte stránky pro změnu pořadí nebo přesun mezi dokumenty</span>
          </div>
          <button id="org-add-btn"
            class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white transition-colors"
            style="background: #6366f1;">
            <i data-lucide="plus" class="w-4 h-4"></i> Přidat dokument
          </button>
          <input type="file" id="org-file-input" class="hidden" accept="application/pdf" multiple>
        </div>

        <!-- Dokumenty grid -->
        <div id="org-docs-grid"
          class="grid gap-6 mb-6"
          style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); max-width: 100%;">
          <div id="org-placeholder"
            class="col-span-full border-2 border-dashed border-slate-700 rounded-2xl p-16
                   flex flex-col items-center justify-center text-slate-500 min-h-[200px]">
            <i data-lucide="file-plus" class="w-12 h-12 mb-3 opacity-40"></i>
            <p class="font-medium">Klikněte na "Přidat dokument"</p>
          </div>
        </div>

        <!-- Akce -->
        <div class="flex gap-4">
          <button id="org-merge-btn"
            class="flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-xl
                   text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style="background: #6366f1;" disabled>
            <i data-lucide="combine" class="w-5 h-5"></i> Sloučit vše & Stáhnout
          </button>
          <button id="org-sep-btn"
            class="flex items-center justify-center gap-2 px-6 font-bold py-4 rounded-xl
                   border border-slate-700 hover:border-indigo-500 text-white transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
            disabled>
            <i data-lucide="download" class="w-5 h-5"></i> Stáhnout zvlášť
          </button>
        </div>
      `;

      lucide.createIcons();

      // === POMOCNÉ FUNKCE ===

      function getColor(sourceIdx) {
        return SOURCE_COLORS[sourceIdx % SOURCE_COLORS.length];
      }

      function updateLegend() {
        const legend = document.getElementById('org-legend');
        if (orgDocuments.length === 0) { legend.classList.add('hidden'); return; }
        legend.classList.remove('hidden');
        legend.style.display = 'flex';
        legend.innerHTML = '<span class="text-slate-500 text-xs font-bold uppercase tracking-wider mr-2">Zdroje:</span>' +
          orgDocuments.map(doc => {
            const c = getColor(doc.sourceIdx);
            return `<span class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                          style="background:${c.bg}; border:1px solid ${c.border};">
                      <span class="w-2 h-2 rounded-full" style="background:${c.border};"></span>
                      ${escapeHTML(doc.name.replace('.pdf',''))}
                    </span>`;
          }).join('');
      }

      function updateButtons() {
        const has = orgDocuments.length > 0;
        document.getElementById('org-merge-btn').disabled = !has;
        document.getElementById('org-sep-btn').disabled = !has;
      }

      // === RENDER DOKUMENTU ===

      async function renderDocument(doc) {
        const grid = document.getElementById('org-docs-grid');
        const placeholder = document.getElementById('org-placeholder');
        if (placeholder) placeholder.remove();

        const c = getColor(doc.sourceIdx);

        const colDiv = document.createElement('div');
        colDiv.id = doc.id;
        colDiv.className = 'rounded-2xl overflow-hidden';
        colDiv.style.cssText = `border: 1.5px solid ${c.border}; background: #131826;`;
        colDiv.innerHTML = `
          <div class="flex items-center gap-3 px-4 py-3"
               style="background: ${c.bg}; border-bottom: 1px solid ${c.border};">
            <span class="w-3 h-3 rounded-full flex-shrink-0" style="background:${c.border};"></span>
            <span class="text-white font-bold text-sm truncate flex-grow">${escapeHTML(doc.name)}</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full text-white" style="background:${c.border};">
              <span class="page-count">${doc.pages.length}</span> stran
            </span>
            <button onclick="orgRemoveDoc('${doc.id}')"
              class="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
          <div id="${doc.id}-pages"
               class="pages-container p-3 flex flex-wrap gap-2 min-h-[120px]"
               data-doc-id="${doc.id}">
          </div>
        `;
        grid.appendChild(colDiv);
        lucide.createIcons();

        // Render stránek
        await renderPages(doc);
        updateLegend();
        updateButtons();
      }

      async function renderPages(doc) {
        const container = document.getElementById(`${doc.id}-pages`);
        if (!container) return;
        container.innerHTML = '';

        try {
          // VŽDY vytvoř novou kopii pro pdfjsLib
          const pdfData = new Uint8Array(doc.bytes);
          const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;

          for (let i = 0; i < doc.pages.length; i++) {
            const pageData = doc.pages[i];

            // Pokud už máme imgSrc, neregeneruj
            if (!pageData.imgSrc) {
              const page = await pdf.getPage(pageData.pageIndex + 1);
              const viewport = page.getViewport({scale: 0.35});
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport
              }).promise;
              pageData.imgSrc = canvas.toDataURL('image/jpeg', 0.7);
            }

            container.appendChild(createPageThumb(doc, i, pageData));
          }

          container.appendChild(createEndDropZone(doc.id));

          // Aktualizuj počítadlo
          const countEl = document.querySelector(`#${doc.id} .page-count`);
          if (countEl) countEl.textContent = doc.pages.length;

        } catch (err) {
          container.innerHTML = `
            <div class="text-red-400 text-xs p-4 col-span-full">
                Chyba: ${escapeHTML(err.message)}
            </div>`;
        }
      }

      // === VYTVOŘENÍ STRÁNKY (THUMB) ===

      function createPageThumb(doc, localIdx, pageData) {
        const c = getColor(doc.sourceIdx);
        const imgSrc = pageData.imgSrc;
        const div = document.createElement('div');
        div.className = 'page-thumb relative rounded-lg overflow-hidden cursor-grab select-none transition-all duration-150';
        div.style.cssText = `width: 72px; border: 2px solid ${c.border}; background: ${c.bg};`;
        div.draggable = true;
        div.dataset.docId = doc.id;
        div.dataset.localIdx = localIdx;
        div.dataset.sourceIdx = doc.sourceIdx;
        div.dataset.pageIndex = pageData.pageIndex;
        div.dataset.imgSrc = imgSrc;

        div.innerHTML = `
          <img src="${imgSrc}" class="w-full h-auto block bg-white">
          <div class="absolute top-0 left-0 right-0 flex justify-between items-start p-0.5">
            <span class="text-[9px] font-bold px-1 py-0.5 rounded text-white"
                  style="background: ${c.border};">
              ${pageData.pageIndex + 1}
            </span>
            <button class="del-btn opacity-0 bg-red-500 hover:bg-red-600 text-white rounded w-4 h-4 text-[10px] font-bold flex items-center justify-center leading-none transition-opacity">
              ×
            </button>
          </div>
        `;

        // Hover → ukáž delete button
        div.addEventListener('mouseenter', () => div.querySelector('.del-btn').style.opacity = '1');
        div.addEventListener('mouseleave', () => div.querySelector('.del-btn').style.opacity = '0');

        // Delete
        div.querySelector('.del-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          orgDeletePage(doc.id, localIdx);
        });

        // === DRAG EVENTS ===
        div.addEventListener('dragstart', (e) => {
          orgDraggedData = {
            docId: doc.id,
            localIdx: localIdx,
            sourceIdx: doc.sourceIdx,
            pageIndex: pageData.pageIndex,
            imgSrc: imgSrc
          };
          div.style.opacity = '0.3';
          div.style.transform = 'scale(0.95)';
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', JSON.stringify(orgDraggedData));
        });

        div.addEventListener('dragend', () => {
          div.style.opacity = '1';
          div.style.transform = '';
          orgDraggedData = null;
          orgDragOverTarget = null;
          // Odstranit všechny ghost placeholdery
          document.querySelectorAll('.org-ghost').forEach(g => g.remove());
          document.querySelectorAll('.page-thumb').forEach(t => {
            t.style.outline = '';
          });
        });

        div.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!orgDraggedData) return;
          if (orgDraggedData.docId === div.dataset.docId &&
              orgDraggedData.localIdx === parseInt(div.dataset.localIdx)) return;

          // Odstraň staré ghosts
          document.querySelectorAll('.org-ghost').forEach(g => g.remove());

          const rect = div.getBoundingClientRect();
          const insertBefore = e.clientX < rect.left + rect.width / 2;

          // Vytvoř ghost placeholder
          const ghost = createGhostPlaceholder(orgDraggedData.imgSrc, orgDraggedData.sourceIdx);
          if (insertBefore) {
            div.parentNode.insertBefore(ghost, div);
          } else {
            div.parentNode.insertBefore(ghost, div.nextSibling);
          }

          orgDragOverTarget = {
            docId: div.dataset.docId,
            localIdx: parseInt(div.dataset.localIdx),
            insertBefore
          };
        });

        div.addEventListener('dragleave', (e) => {
          // Necháme ghost - odstraní se v dragend nebo drop
        });

        div.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!orgDraggedData || !orgDragOverTarget) return;
          performDrop(orgDragOverTarget);
        });

        return div;
      }

      // === GHOST PLACEHOLDER ===

      function createGhostPlaceholder(imgSrc, sourceIdx) {
        const c = getColor(sourceIdx);
        const ghost = document.createElement('div');
        ghost.className = 'org-ghost rounded-lg overflow-hidden pointer-events-none';
        ghost.style.cssText = `
          width: 72px;
          border: 2px dashed ${c.border};
          background: ${c.bg};
          opacity: 0.6;
          flex-shrink: 0;
        `;
        ghost.innerHTML = `<img src="${imgSrc}" class="w-full h-auto block opacity-50">`;
        return ghost;
      }

      // === DROP ZONE NA KONCI ===

      function createEndDropZone(docId) {
        const zone = document.createElement('div');
        zone.className = 'org-end-zone flex-shrink-0 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs transition-all cursor-default';
        zone.style.cssText = 'width: 60px; min-height: 80px;';
        zone.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i>';
        lucide.createIcons();

        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!orgDraggedData) return;
          document.querySelectorAll('.org-ghost').forEach(g => g.remove());
          zone.style.borderColor = getColor(orgDraggedData.sourceIdx).border;
          zone.style.background = getColor(orgDraggedData.sourceIdx).bg;
          const ghost = createGhostPlaceholder(orgDraggedData.imgSrc, orgDraggedData.sourceIdx);
          zone.parentNode.insertBefore(ghost, zone);
          orgDragOverTarget = { docId, localIdx: -1, insertBefore: false };
        });

        zone.addEventListener('dragleave', () => {
          zone.style.borderColor = '';
          zone.style.background = '';
        });

        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          zone.style.borderColor = '';
          zone.style.background = '';
          if (!orgDraggedData || !orgDragOverTarget) return;
          performDrop(orgDragOverTarget);
        });

        return zone;
      }

      // === PERFORM DROP ===

      function performDrop(target) {
          if (!orgDraggedData || !target) return;

          // Ulož vše lokálně hned
          const fromDocId    = orgDraggedData.docId;
          const fromLocalIdx = orgDraggedData.localIdx;
          const toDocId      = target.docId;
          const toLocalIdx   = target.localIdx;   // -1 = append to end
          const insertBefore = target.insertBefore;

          // Reset okamžitě aby dragend neinterferoval
          orgDraggedData = null;
          orgDragOverTarget = null;
          document.querySelectorAll('.org-ghost').forEach(g => g.remove());

          const fromDoc = orgDocuments.find(d => d.id === fromDocId);
          const toDoc   = orgDocuments.find(d => d.id === toDocId);
          if (!fromDoc || !toDoc) return;

          // Vyjmi stránku
          const [movedPage] = fromDoc.pages.splice(fromLocalIdx, 1);
          // Aktualizuj fileIndex přesunuté stránky
          movedPage.fileIndex = orgDocuments.indexOf(toDoc);

          if (toLocalIdx === -1) {
              // Append to end
              toDoc.pages.push(movedPage);
          } else {
              let insertAt;
              if (fromDocId === toDocId) {
                  // Stejný dokument — fromLocalIdx byl odebrán, indexy se posunuly
                  if (insertBefore) {
                      insertAt = fromLocalIdx < toLocalIdx
                          ? toLocalIdx - 1
                          : toLocalIdx;
                  } else {
                      insertAt = fromLocalIdx < toLocalIdx
                          ? toLocalIdx      // -1 byl odebrán před tím
                          : toLocalIdx + 1;
                  }
              } else {
                  // Jiný dokument
                  insertAt = insertBefore ? toLocalIdx : toLocalIdx + 1;
              }
              insertAt = Math.max(0, Math.min(insertAt, toDoc.pages.length));
              toDoc.pages.splice(insertAt, 0, movedPage);
          }

          // Odstraň prázdné dokumenty (pouze pokud se přesouváme mezi různými)
          if (fromDocId !== toDocId && fromDoc.pages.length === 0) {
              orgDocuments = orgDocuments.filter(d => d.id !== fromDocId);
              const col = document.getElementById(fromDocId);
              if (col) col.remove();
          }

          // Re-render
          const toRender = fromDocId === toDocId
              ? [toDoc]
              : [fromDoc, toDoc].filter(d => d.pages.length > 0);

          toRender.forEach(d => renderPages(d));

          if (orgDocuments.length === 0) {
              const grid = document.getElementById('org-docs-grid');
              if (grid) {
                  grid.innerHTML = `
                      <div id="org-placeholder"
                           class="col-span-full border-2 border-dashed border-slate-700
                                  rounded-2xl p-16 flex flex-col items-center justify-center
                                  text-slate-500 min-h-[200px]">
                          <i data-lucide="file-plus" class="w-12 h-12 mb-3 opacity-40"></i>
                          <p class="font-medium">Klikněte na "Přidat dokument"</p>
                      </div>
                  `;
                  lucide.createIcons();
              }
          }

          updateButtons();
          updateLegend();
      }

      // === DELETE PAGE ===

      function orgDeletePage(docId, localIdx) {
        const doc = orgDocuments.find(d => d.id === docId);
        if (!doc) return;
        doc.pages.splice(localIdx, 1);
        if (doc.pages.length === 0) {
          orgRemoveDoc(docId);
        } else {
          renderPages(doc);
        }
      }

      window.orgRemoveDoc = (docId) => {
        orgDocuments = orgDocuments.filter(d => d.id !== docId);
        const col = document.getElementById(docId);
        if (col) col.remove();
        if (orgDocuments.length === 0) {
          const grid = document.getElementById('org-docs-grid');
          grid.innerHTML = `
            <div id="org-placeholder" class="col-span-full border-2 border-dashed border-slate-700
                 rounded-2xl p-16 flex flex-col items-center justify-center text-slate-500 min-h-[200px]">
              <i data-lucide="file-plus" class="w-12 h-12 mb-3 opacity-40"></i>
              <p>Klikněte na "Přidat dokument"</p>
            </div>
          `;
          lucide.createIcons();
        }
        updateButtons();
        updateLegend();
      };

      // === PŘIDÁNÍ DOKUMENTU ===

      document.getElementById('org-add-btn').addEventListener('click', () => {
        document.getElementById('org-file-input').click();
      });

      document.getElementById('org-file-input').addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        e.target.value = '';

        for (const file of files) {
          if (file.type !== 'application/pdf') continue;

          const sourceIdx = orgSourceCounter++;
          const docId = 'org_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

          // VŽDY ukládej jako Uint8Array
          const arrayBuffer = await file.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);

          // Načti PDF pro zjištění počtu stránek (použij kopii bufferu)
          const tmpBuf = uint8.buffer.slice(0);
          const pdfDoc = await PDFLib.PDFDocument.load(tmpBuf);
          const pageCount = pdfDoc.getPageCount();

          const doc = {
            id: docId,
            name: file.name,
            bytes: uint8,           // Uint8Array
            sourceIdx: sourceIdx,
            pages: Array.from({length: pageCount}, (_, i) => ({
              id: `${docId}-p${i}`,
              fileIndex: orgDocuments.length,
              sourceFileIndex: sourceIdx,
              pageIndex: i,          // 0-based
              imgSrc: null
            }))
          };

          orgDocuments.push(doc);
          await renderDocument(doc);
        }
      });

      // === MERGE & DOWNLOAD ===

      document.getElementById('org-merge-btn').addEventListener('click', async () => {
        if (!orgDocuments.length) return;
        showLoading('org-merge-btn', 'Slučuji...');
        try {
          const mergedDoc = await PDFLib.PDFDocument.create();

          // Načti každý zdrojový soubor jednou (jako v assemblePdfFromPages)
          const sourceMap = new Map();
          for (const doc of orgDocuments) {
            if (!sourceMap.has(doc.sourceIdx)) {
              const buf = doc.bytes.buffer.slice(0);
              const loaded = await PDFLib.PDFDocument.load(buf);
              sourceMap.set(doc.sourceIdx, loaded);
            }
          }

          // Iteruj přes všechny dokumenty a jejich stránky v pořadí
          for (const doc of orgDocuments) {
            const sourcePdf = sourceMap.get(doc.sourceIdx);
            if (!sourcePdf) continue;
            for (const pageData of doc.pages) {
              const [copied] = await mergedDoc.copyPages(
                sourcePdf,
                [pageData.pageIndex]
              );
              mergedDoc.addPage(copied);
            }
          }

          const mergedBytes = await mergedDoc.save();
          downloadBlob(
            new Blob([mergedBytes], {type: 'application/pdf'}),
            'merged.pdf'
          );
        } catch (e) { alert('Chyba: ' + e.message); }
        hideLoading('org-merge-btn');
      });

      document.getElementById('org-sep-btn').addEventListener('click', async () => {
        if (!orgDocuments.length) return;
        showLoading('org-sep-btn', 'Generuji...');
        try {
          const zip = new JSZip();

          for (const doc of orgDocuments) {
            const newDoc = await PDFLib.PDFDocument.create();

            // Načti source jednou pro tento dokument
            const buf = doc.bytes.buffer.slice(0);
            const sourcePdf = await PDFLib.PDFDocument.load(buf);

            for (const pageData of doc.pages) {
              const [copied] = await newDoc.copyPages(
                sourcePdf,
                [pageData.pageIndex]
              );
              newDoc.addPage(copied);
            }

            const docBytes = await newDoc.save();
            zip.file(
              doc.name.replace('.pdf', '') + '_organized.pdf',
              docBytes
            );
          }

          const zipBlob = await zip.generateAsync({type: 'blob'});
          downloadBlob(zipBlob, 'organized.zip');
        } catch (e) { alert('Chyba: ' + e.message); }
        hideLoading('org-sep-btn');
      });

    } // konec organize-pdf bloku

    // --- AI VISION (Smart Image Analyzer) ---
    else if (toolId === 'ai-vision') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="scan-eye" class="w-3 h-3"></i> AI VISION
                </div>
                <h2 class="text-4xl font-extrabold text-white mb-2">Analyzátor obrázků<br/><span class="text-yellow-500">AI Vision Pro</span></h2>
                <p class="text-slate-400">Detekce objektů a textu.</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left Column -->
                <div class="h-full min-h-[400px] flex flex-col gap-4">
                    <div id="vision-dz" class="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-yellow-500 transition-colors bg-card/50 h-full relative overflow-hidden">
                        <div id="vision-dz-content" class="flex flex-col items-center justify-center w-full h-full">
                            <div class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-6">
                                <i data-lucide="file-up" class="w-8 h-8"></i>
                            </div>
                            <button class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-xl transition-colors mb-3">
                                Nahrát obrázek
                            </button>
                            <p class="text-slate-500 text-sm font-medium">PNG, JPG, WEBP, HEIC</p>
                        </div>
                        <img id="vision-preview" class="absolute inset-0 w-full h-full object-contain hidden bg-black/50 backdrop-blur-sm p-4" />
                        <input type="file" id="vision-dz-input" class="hidden" accept="image/png, image/jpeg, image/webp, image/heic">
                    </div>
                    <button id="btn-analyze" class="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed hidden">
                        Analyzovat obrázek <i data-lucide="sparkles" class="w-5 h-5"></i>
                    </button>
                </div>
                
                <!-- Right Column -->
                <div id="vision-result-container" class="bg-card border border-border rounded-2xl p-8 flex flex-col h-full min-h-[400px] overflow-y-auto">
                    <div id="vision-empty-state" class="flex flex-col items-center justify-center text-center h-full m-auto">
                        <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
                            <i data-lucide="scan" class="w-8 h-8"></i>
                        </div>
                        <p class="text-slate-500 font-medium">Výsledek analýzy se zobrazí zde</p>
                    </div>
                    <div id="vision-loading" class="hidden flex-col items-center justify-center text-center h-full m-auto text-yellow-500">
                        <i data-lucide="loader-2" class="w-10 h-10 animate-spin mb-4"></i>
                        <p class="font-medium animate-pulse">Analyzuji obrázek...</p>
                    </div>
                    <div id="vision-result" class="hidden text-slate-300 whitespace-pre-wrap leading-relaxed"></div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const dz = document.getElementById('vision-dz');
            const input = document.getElementById('vision-dz-input');
            const preview = document.getElementById('vision-preview');
            const content = document.getElementById('vision-dz-content');
            const btnAnalyze = document.getElementById('btn-analyze');
            const resultContainer = document.getElementById('vision-result');
            const emptyState = document.getElementById('vision-empty-state');
            const loadingState = document.getElementById('vision-loading');
            
            let currentFile = null;
            let currentBase64 = null;

            dz.addEventListener('click', () => input.click());
            
            dz.addEventListener('dragover', (e) => {
                e.preventDefault();
                dz.classList.add('border-yellow-500', 'bg-yellow-500/5');
            });
            
            dz.addEventListener('dragleave', () => {
                dz.classList.remove('border-yellow-500', 'bg-yellow-500/5');
            });
            
            dz.addEventListener('drop', (e) => {
                e.preventDefault();
                dz.classList.remove('border-yellow-500', 'bg-yellow-500/5');
                if (e.dataTransfer.files.length > 0) {
                    handleFile(e.dataTransfer.files[0]);
                }
            });

            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                }
            });

            function handleFile(file) {
                if (!file.type.startsWith('image/')) {
                    alert('Prosím nahrajte platný obrázek.');
                    return;
                }
                currentFile = file;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                    content.classList.add('hidden');
                    btnAnalyze.classList.remove('hidden');
                    
                    // Extract base64 part
                    currentBase64 = e.target.result.split(',')[1];
                };
                reader.readAsDataURL(file);
            }

            btnAnalyze.addEventListener('click', async () => {
                if (!currentBase64) return;
                
                btnAnalyze.disabled = true;
                emptyState.classList.add('hidden');
                resultContainer.classList.add('hidden');
                loadingState.classList.remove('hidden');
                loadingState.classList.add('flex');
                
                try {
                    const lang = document.getElementById('current-lang').innerText || 'CS';
                    
                    const response = await fetch('./api/analyze-image.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            imageBase64: currentBase64,
                            mimeType: currentFile.type,
                            lang: lang
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to analyze image');
                    }
                    
                    const data = await response.json();
                    
                    loadingState.classList.add('hidden');
                    loadingState.classList.remove('flex');
                    
                    let escapedResponse = escapeHTML(data.text);
                    let formattedResponse = escapedResponse
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>');
                    
                    resultContainer.innerHTML = formattedResponse;
                    resultContainer.classList.remove('hidden');
                } catch (error) {
                    loadingState.classList.add('hidden');
                    loadingState.classList.remove('flex');
                    emptyState.classList.remove('hidden');
                    alert('Chyba při analýze: ' + error.message);
                } finally {
                    btnAnalyze.disabled = false;
                }
            });
            
            lucide.createIcons();
        }, 0);
    }

    // --- AI SEARCH ---
    else if (toolId === 'ai-search') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="search" class="w-3 h-3"></i> AI SEARCH
                </div>
                <h2 class="text-4xl font-extrabold text-white mb-2">AI Vyhledávač<br/><span class="text-teal-500">Smart Search</span></h2>
                <p class="text-slate-400">Chytrý asistent s přístupem k aktuálním informacím na internetu.</p>
            </div>
            
            <div class="max-w-4xl mx-auto flex flex-col gap-6">
                <!-- Search Input -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-6 h-6 text-slate-400"></i>
                    </div>
                    <input type="text" id="search-input" class="w-full bg-card border-2 border-border rounded-2xl py-4 pl-12 pr-16 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-lg shadow-lg" placeholder="Zeptejte se na cokoliv (např. Jaké bylo včera skóre Sparty?)..." autocomplete="off">
                    <button id="btn-search" class="absolute inset-y-2 right-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <i data-lucide="arrow-right" class="w-5 h-5"></i>
                    </button>
                </div>
                
                <!-- Results Area -->
                <div id="search-result-container" class="bg-card border border-border rounded-2xl p-8 flex flex-col min-h-[300px] hidden">
                    <div id="search-loading" class="hidden flex-col items-center justify-center text-center h-full m-auto text-teal-500 py-12">
                        <i data-lucide="loader-2" class="w-10 h-10 animate-spin mb-4"></i>
                        <p class="font-medium animate-pulse">Vyhledávám informace...</p>
                    </div>
                    
                    <div id="search-content" class="hidden flex-col gap-6">
                        <div id="search-text" class="text-slate-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none"></div>
                        
                        <div id="search-sources-container" class="hidden flex-col gap-3 mt-4 pt-6 border-t border-border">
                            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i data-lucide="link" class="w-4 h-4"></i> Použité zdroje
                            </h3>
                            <div id="search-sources" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <!-- Sources will be injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const input = document.getElementById('search-input');
            const btnSearch = document.getElementById('btn-search');
            const resultContainer = document.getElementById('search-result-container');
            const loadingState = document.getElementById('search-loading');
            const contentState = document.getElementById('search-content');
            const textResult = document.getElementById('search-text');
            const sourcesContainer = document.getElementById('search-sources-container');
            const sourcesList = document.getElementById('search-sources');
            
            async function performSearch() {
                const query = input.value.trim();
                if (!query) return;
                
                input.disabled = true;
                btnSearch.disabled = true;
                
                resultContainer.classList.remove('hidden');
                contentState.classList.add('hidden');
                loadingState.classList.remove('hidden');
                loadingState.classList.add('flex');
                
                try {
                    const lang = document.getElementById('current-lang').innerText || 'CS';
                    
                    const response = await fetch('./api/ai-search.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: query,
                            lang: lang
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to perform search');
                    }
                    
                    const data = await response.json();
                    
                    loadingState.classList.add('hidden');
                    loadingState.classList.remove('flex');
                    
                    // Render text (simple markdown to HTML conversion for bold text)
                    let escapedText = escapeHTML(data.text);
                    let formattedText = escapedText
                        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                        .replace(/\\*(.*?)\\*/g, '<em>$1</em>');
                    
                    textResult.innerHTML = formattedText;
                    
                    // Render sources
                    const sources = data.sources || [];
                    
                    if (sources && sources.length > 0) {
                        sourcesList.innerHTML = sources.map(source => `
                            <a href="${escapeHTML(source.uri)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-border hover:border-teal-500/50 transition-colors group">
                                <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-colors">
                                    <i data-lucide="globe" class="w-4 h-4"></i>
                                </div>
                                <div class="flex-col overflow-hidden">
                                    <p class="text-sm font-medium text-slate-200 truncate">${escapeHTML(source.title || source.uri)}</p>
                                    <p class="text-xs text-slate-500 truncate">${escapeHTML(source.uri)}</p>
                                </div>
                            </a>
                        `).join('');
                        sourcesContainer.classList.remove('hidden');
                        sourcesContainer.classList.add('flex');
                    } else {
                        sourcesContainer.classList.add('hidden');
                        sourcesContainer.classList.remove('flex');
                    }
                    
                    contentState.classList.remove('hidden');
                    contentState.classList.add('flex');
                    lucide.createIcons();
                } catch (error) {
                    loadingState.classList.add('hidden');
                    loadingState.classList.remove('flex');
                    textResult.innerHTML = `<p class="text-red-400">Chyba při vyhledávání: ${escapeHTML(error.message)}</p>`;
                    contentState.classList.remove('hidden');
                    contentState.classList.add('flex');
                    sourcesContainer.classList.add('hidden');
                    sourcesContainer.classList.remove('flex');
                } finally {
                    input.disabled = false;
                    btnSearch.disabled = false;
                    input.focus();
                }
            }
            
            btnSearch.addEventListener('click', performSearch);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
            
            lucide.createIcons();
            input.focus();
        }, 0);
    }

    // --- TEXT TO SPEECH ---
    else if (toolId === 'tts') {
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <!-- Left Column -->
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide mb-6">
                        <i data-lucide="mic" class="w-3 h-3"></i> NATIVNÍ HLASOVÉ API
                    </div>
                    <h2 class="text-5xl font-extrabold text-white mb-4 leading-tight">
                        Text na řeč<br/>
                        <span class="text-cyan-400">Bez čekání.</span>
                    </h2>
                    <p class="text-slate-400 text-lg mb-10">Převod textu na lidský hlas.</p>
                    
                    <div class="bg-card border border-border rounded-2xl p-6">
                        <h4 class="text-white font-bold flex items-center gap-2 mb-6"><i data-lucide="settings" class="w-4 h-4 text-cyan-400"></i> Nastavení hlasu</h4>
                        
                        <div class="space-y-6">
                            <div>
                                <div class="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                    <span>Rychlost řeči: <span id="tts-speed-val" class="text-white">1x</span></span>
                                    <span id="tts-speed-reset" class="text-cyan-400 cursor-pointer hover:underline">Reset</span>
                                </div>
                                <input type="range" id="tts-speed" min="0.5" max="2" step="0.1" value="1" class="w-full accent-cyan-400">
                            </div>
                            <div>
                                <div class="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                    <span>Výška (Pitch): <span id="tts-pitch-val" class="text-white">1</span></span>
                                    <span id="tts-pitch-reset" class="text-cyan-400 cursor-pointer hover:underline">Reset</span>
                                </div>
                                <input type="range" id="tts-pitch" min="0" max="2" step="0.1" value="1" class="w-full accent-cyan-400">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column -->
                <div class="bg-card border border-border rounded-3xl p-6 shadow-2xl">
                    <div class="flex justify-between items-center mb-3">
                        <label class="block text-xs font-bold text-slate-400 uppercase">Váš text k přečtení</label>
                        <button id="tts-clear" class="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"><i data-lucide="rotate-ccw" class="w-3 h-3"></i> Vymazat</button>
                    </div>
                    <textarea id="tts-text" class="w-full h-48 bg-[#0B0F19] border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-cyan-500 resize-none mb-6" placeholder="Zadejte text..."></textarea>
                    
                    <label class="block text-xs font-bold text-slate-400 mb-3 uppercase">Vybrat hlas systému</label>
                    <div class="mb-6" id="tts-voice-container">
                        ${createCustomSelect('tts-voice', [{value: '', label: 'Načítání hlasů...'}], 'Načítání hlasů...')}
                    </div>
                    
                    <button id="tts-play" class="w-full bg-[#1E293B] hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-6 border border-slate-700">
                        <i data-lucide="play" class="w-5 h-5"></i> Přečíst text
                    </button>
                    
                    <div class="bg-[#0B0F19] rounded-xl p-6 flex flex-col items-center justify-center border border-slate-800">
                        <div class="flex gap-1 mb-4" id="tts-visualizer">
                            ${Array(12).fill(0).map(() => `<div class="w-1.5 h-1.5 rounded-full bg-slate-700"></div>`).join('')}
                        </div>
                        <span id="tts-status" class="text-xs font-bold text-slate-600 tracking-widest uppercase">Připraven</span>
                    </div>
                </div>
            </div>
        `;
        
        // Logic for TTS
        const speedSlider = document.getElementById('tts-speed');
        const pitchSlider = document.getElementById('tts-pitch');
        const speedVal = document.getElementById('tts-speed-val');
        const pitchVal = document.getElementById('tts-pitch-val');
        const speedReset = document.getElementById('tts-speed-reset');
        const pitchReset = document.getElementById('tts-pitch-reset');
        const textInput = document.getElementById('tts-text');
        const clearBtn = document.getElementById('tts-clear');
        const playBtn = document.getElementById('tts-play');
        const voiceContainer = document.getElementById('tts-voice-container');
        const statusText = document.getElementById('tts-status');
        const visualizerDivs = document.querySelectorAll('#tts-visualizer div');
        
        let voices = [];
        let synth = window.speechSynthesis;
        let visualizerInterval;
        
        const populateVoices = () => {
            voices = synth.getVoices();
            if (voices.length === 0) return;
            
            const options = voices.map((v, i) => ({ value: i.toString(), label: `${v.name} (${v.lang})` }));
            const defaultVoiceIndex = voices.findIndex(v => v.lang.includes('cs')) !== -1 ? voices.findIndex(v => v.lang.includes('cs')) : 0;
            
            voiceContainer.innerHTML = createCustomSelect('tts-voice', options, options[defaultVoiceIndex].label);
            initCustomSelects();
            document.getElementById('tts-voice-input').value = defaultVoiceIndex.toString();
        };
        
        populateVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoices;
        } else {
            initCustomSelects();
        }

        speedSlider.addEventListener('input', (e) => speedVal.innerText = `${e.target.value}x`);
        pitchSlider.addEventListener('input', (e) => pitchVal.innerText = e.target.value);
        
        speedReset.addEventListener('click', () => { speedSlider.value = 1; speedVal.innerText = '1x'; });
        pitchReset.addEventListener('click', () => { pitchSlider.value = 1; pitchVal.innerText = '1'; });
        
        clearBtn.addEventListener('click', () => textInput.value = '');
        
        const startVisualizer = () => {
            statusText.innerText = 'Přehrávám...';
            statusText.classList.replace('text-slate-600', 'text-cyan-400');
            visualizerInterval = setInterval(() => {
                visualizerDivs.forEach(div => {
                    const height = Math.random() * 20 + 4;
                    div.style.height = `${height}px`;
                    div.style.backgroundColor = '#22d3ee';
                });
            }, 100);
        };
        
        const stopVisualizer = () => {
            clearInterval(visualizerInterval);
            statusText.innerText = 'Připraven';
            statusText.classList.replace('text-cyan-400', 'text-slate-600');
            visualizerDivs.forEach(div => {
                div.style.height = '6px';
                div.style.backgroundColor = '#334155';
            });
        };
        
        playBtn.addEventListener('click', () => {
            if (synth.speaking) {
                synth.cancel();
                stopVisualizer();
                playBtn.innerHTML = `<i data-lucide="play" class="w-5 h-5"></i> Přečíst text`;
                lucide.createIcons();
                return;
            }
            
            if (textInput.value.trim() === '') return;
            
            const utterThis = new SpeechSynthesisUtterance(textInput.value);
            const selectedVoiceIndex = document.getElementById('tts-voice-input').value;
            
            if (voices[selectedVoiceIndex]) {
                utterThis.voice = voices[selectedVoiceIndex];
            }
            
            utterThis.pitch = parseFloat(pitchSlider.value);
            utterThis.rate = parseFloat(speedSlider.value);
            
            utterThis.onstart = () => {
                startVisualizer();
                playBtn.innerHTML = `<i data-lucide="square" class="w-5 h-5"></i> Zastavit`;
                lucide.createIcons();
            };
            
            utterThis.onend = () => {
                stopVisualizer();
                playBtn.innerHTML = `<i data-lucide="play" class="w-5 h-5"></i> Přečíst text`;
                lucide.createIcons();
            };
            
            utterThis.onerror = () => {
                stopVisualizer();
                playBtn.innerHTML = `<i data-lucide="play" class="w-5 h-5"></i> Přečíst text`;
                lucide.createIcons();
            };
            
            synth.speak(utterThis);
        });
        
        // Custom styling for range inputs in TTS
        setTimeout(() => {
            const style = document.createElement('style');
            style.innerHTML = `
                #tts-speed::-webkit-slider-thumb, #tts-pitch::-webkit-slider-thumb { background: #22d3ee; }
            `;
            document.head.appendChild(style);
        }, 0);
    }

    // --- REMOVE PAGES ---
    else if (toolId === 'remove-pages') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-red-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Remove Pages</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Remove Pages</h2>
                <p class="text-slate-400">Odstranit vybrané stránky z PDF dokumentu.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('remove-pages-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    <div class="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <i data-lucide="info" class="w-5 h-5 shrink-0 text-blue-400"></i>
                        <p>Zpracováno lokálně ve vašem prohlížeči. Žádná data nejsou odesílána na server.</p>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Vyberte stránky k odstranění</h3>
                    <div id="remove-pages-list" class="flex-grow space-y-2 mb-6 overflow-y-auto max-h-[400px]">
                        <p class="text-slate-500 text-center py-8 text-sm">Nejprve nahrajte PDF soubor.</p>
                    </div>
                    <button id="btn-remove-pages" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Odstranit vybrané stránky
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;
        let pageCount = 0;
        let selectedPages = new Set();

        initDropzone('remove-pages-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            pageCount = pdfDoc.getPageCount();
            selectedPages.clear();
            renderPagesList();
            document.getElementById('btn-remove-pages').disabled = false;
        });

        function renderPagesList() {
            const list = document.getElementById('remove-pages-list');
            list.innerHTML = Array.from({length: pageCount}, (_, i) => `
                <label class="flex items-center gap-3 p-3 bg-[#1E293B] border border-slate-700 rounded-lg cursor-pointer hover:border-red-500 transition-colors ${selectedPages.has(i) ? 'border-red-500 bg-red-500/10' : ''}">
                    <input type="checkbox" class="w-5 h-5 rounded border-slate-600 text-red-500 focus:ring-red-500 bg-[#0B0F19]" ${selectedPages.has(i) ? 'checked' : ''} onchange="toggleRemovePage(${i})">
                    <span class="text-slate-200 font-medium">Stránka ${i + 1}</span>
                </label>
            `).join('');
            lucide.createIcons();
        }

        window.toggleRemovePage = (idx) => {
            if (selectedPages.has(idx)) selectedPages.delete(idx);
            else selectedPages.add(idx);
            renderPagesList();
        };

        document.getElementById('btn-remove-pages').addEventListener('click', async () => {
            if (!pdfBytes || selectedPages.size === 0) return;
            showLoading('btn-remove-pages', 'Odstraňuji...');
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const newDoc = await PDFLib.PDFDocument.create();
                for (let i = 0; i < pageCount; i++) {
                    if (!selectedPages.has(i)) {
                        const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
                        newDoc.addPage(copiedPage);
                    }
                }
                const newPdf = await newDoc.save();
                downloadBlob(new Blob([newPdf], {type: 'application/pdf'}), 'removed_pages.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-remove-pages');
        });
    }

    // --- EXTRACT PAGES ---
    else if (toolId === 'extract-pages') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Extract Pages</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Extract Pages</h2>
                <p class="text-slate-400">Extrahovat vybrané stránky do nového PDF.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('extract-pages-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    <div class="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <i data-lucide="info" class="w-5 h-5 shrink-0 text-blue-400"></i>
                        <p>Zpracováno lokálně ve vašem prohlížeči.</p>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Vyberte stránky k extrakci</h3>
                    <div id="extract-pages-list" class="flex-grow space-y-2 mb-6 overflow-y-auto max-h-[400px]">
                        <p class="text-slate-500 text-center py-8 text-sm">Nejprve nahrajte PDF soubor.</p>
                    </div>
                    <button id="btn-extract-pages" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Extrahovat vybrané stránky
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;
        let pageCount = 0;
        let selectedPages = new Set();

        initDropzone('extract-pages-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            pageCount = pdfDoc.getPageCount();
            selectedPages.clear();
            renderExtractList();
            document.getElementById('btn-extract-pages').disabled = false;
        });

        function renderExtractList() {
            const list = document.getElementById('extract-pages-list');
            list.innerHTML = Array.from({length: pageCount}, (_, i) => `
                <label class="flex items-center gap-3 p-3 bg-[#1E293B] border border-slate-700 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors ${selectedPages.has(i) ? 'border-cyan-500 bg-cyan-500/10' : ''}">
                    <input type="checkbox" class="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-[#0B0F19]" ${selectedPages.has(i) ? 'checked' : ''} onchange="toggleExtractPage(${i})">
                    <span class="text-slate-200 font-medium">Stránka ${i + 1}</span>
                </label>
            `).join('');
        }

        window.toggleExtractPage = (idx) => {
            if (selectedPages.has(idx)) selectedPages.delete(idx);
            else selectedPages.add(idx);
            renderExtractList();
        };

        document.getElementById('btn-extract-pages').addEventListener('click', async () => {
            if (!pdfBytes || selectedPages.size === 0) return;
            showLoading('btn-extract-pages', 'Extrahuji...');
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const newDoc = await PDFLib.PDFDocument.create();
                const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
                for (const i of sortedPages) {
                    const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
                    newDoc.addPage(copiedPage);
                }
                const newPdf = await newDoc.save();
                downloadBlob(new Blob([newPdf], {type: 'application/pdf'}), 'extracted_pages.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-extract-pages');
        });
    }

    // --- COMPRESS PDF ---
    else if (toolId === 'compress-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-green-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Compress PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Compress PDF</h2>
                <p class="text-slate-400">Zmenšit velikost PDF souboru.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('compress-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    <div id="compress-info" class="hidden bg-card border border-border rounded-2xl p-6">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                                <i data-lucide="file-text" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <p id="compress-filename" class="text-white font-bold truncate"></p>
                                <p id="compress-size" class="text-slate-400 text-sm"></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Úroveň komprese</h3>
                    <div class="space-y-3 mb-6">
                        <label class="flex items-center gap-3 p-4 bg-[#1E293B] border border-slate-700 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="compress-level" value="low" class="w-5 h-5 text-green-500 focus:ring-green-500 bg-[#0B0F19]">
                            <div>
                                <span class="text-white font-medium">Nízká</span>
                                <p class="text-slate-400 text-xs">Zachová kvalitu, menší zmenšení</p>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 p-4 bg-[#1E293B] border border-slate-700 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="compress-level" value="medium" checked class="w-5 h-5 text-green-500 focus:ring-green-500 bg-[#0B0F19]">
                            <div>
                                <span class="text-white font-medium">Střední</span>
                                <p class="text-slate-400 text-xs">Vyvážená komprese</p>
                            </div>
                        </label>
                        <label class="flex items-center gap-3 p-4 bg-[#1E293B] border border-slate-700 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                            <input type="radio" name="compress-level" value="high" class="w-5 h-5 text-green-500 focus:ring-green-500 bg-[#0B0F19]">
                            <div>
                                <span class="text-white font-medium">Vysoká</span>
                                <p class="text-slate-400 text-xs">Maximální komprese, nižší kvalita</p>
                            </div>
                        </label>
                    </div>
                    <p id="compress-result" class="text-slate-400 text-sm mb-4 hidden"></p>
                    <button id="btn-compress" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Komprimovat PDF
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;
        let originalSize = 0;

        initDropzone('compress-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            originalSize = file.size;
            document.getElementById('compress-filename').innerText = file.name;
            document.getElementById('compress-size').innerText = `Původní velikost: ${(originalSize / 1024).toFixed(1)} KB`;
            document.getElementById('compress-dz').parentElement.classList.add('hidden');
            document.getElementById('compress-info').classList.remove('hidden');
            document.getElementById('btn-compress').disabled = false;
        });

        document.getElementById('btn-compress').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-compress', 'Komprimuji...');
            try {
                const level = document.querySelector('input[name="compress-level"]:checked').value;
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                let options = { useObjectStreams: true };
                if (level === 'high') {
                    options.objectStreams = true;
                    options.addDefaultPage = false;
                }
                const compressedPdf = await pdfDoc.save(options);
                const newSize = compressedPdf.length;
                const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
                document.getElementById('compress-result').innerText = `Nová velikost: ${(newSize / 1024).toFixed(1)} KB (úspora ${savings}%)`;
                document.getElementById('compress-result').classList.remove('hidden');
                downloadBlob(new Blob([compressedPdf], {type: 'application/pdf'}), 'compressed.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-compress');
        });
    }

    // --- ROTATE PDF ---
    else if (toolId === 'rotate-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-sky-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Rotate PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Rotate PDF</h2>
                <p class="text-slate-400">Otočit stránky PDF o 90° nebo 180°.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('rotate-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    <div class="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <i data-lucide="info" class="w-5 h-5 shrink-0 text-blue-400"></i>
                        <p>Zpracováno lokálně ve vašem prohlížeči.</p>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Náhledy stránek</h3>
                    <div id="rotate-pages" class="grid grid-cols-2 gap-3 mb-6 overflow-y-auto max-h-[400px]">
                        <p class="col-span-2 text-slate-500 text-center py-8 text-sm">Nejprve nahrajte PDF soubor.</p>
                    </div>
                    <div class="flex gap-3">
                        <button id="btn-rotate-all-left" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled>
                            ↺ Vše -90°
                        </button>
                        <button id="btn-rotate-all-right" class="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled>
                            ↻ Vše +90°
                        </button>
                    </div>
                    <button id="btn-save-rotate" class="w-full mt-3 bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Uložit otočené PDF
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;
        let pageRotations = [];

        initDropzone('rotate-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            const pageCount = pdfDoc.getPageCount();
            pageRotations = new Array(pageCount).fill(0);
            document.getElementById('btn-rotate-all-left').disabled = false;
            document.getElementById('btn-rotate-all-right').disabled = false;
            document.getElementById('btn-save-rotate').disabled = false;
            await renderRotatePages(pdfBytes);
        });

        async function renderRotatePages(bytes) {
            const pdfDoc = await PDFLib.PDFDocument.load(bytes);
            const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
            const container = document.getElementById('rotate-pages');
            container.innerHTML = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({scale: 0.3});
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({canvasContext: ctx, viewport: viewport}).promise;
                const div = document.createElement('div');
                div.className = 'relative bg-[#1E293B] border border-slate-700 rounded-lg overflow-hidden';
                div.innerHTML = `
                    <div class="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">${i}</div>
                    <img src="${canvas.toDataURL()}" class="w-full h-auto">
                    <div class="absolute bottom-1 right-1 flex gap-1">
                        <button onclick="rotatePage(${i-1}, -90)" class="bg-slate-700 hover:bg-slate-600 text-white text-[10px] px-2 py-1 rounded">↺</button>
                        <button onclick="rotatePage(${i-1}, 90)" class="bg-sky-500 hover:bg-sky-600 text-white text-[10px] px-2 py-1 rounded">↻</button>
                    </div>
                `;
                container.appendChild(div);
            }
        }

        window.rotatePage = (idx, deg) => {
            pageRotations[idx] = (pageRotations[idx] + deg + 360) % 360;
        };

        document.getElementById('btn-rotate-all-left').addEventListener('click', () => {
            pageRotations = pageRotations.map(r => (r - 90 + 360) % 360);
        });

        document.getElementById('btn-rotate-all-right').addEventListener('click', () => {
            pageRotations = pageRotations.map(r => (r + 90) % 360);
        });

        document.getElementById('btn-save-rotate').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-save-rotate', 'Ukládám...');
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const pages = pdfDoc.getPages();
                for (let i = 0; i < pages.length; i++) {
                    if (pageRotations[i] !== 0) {
                        const currentRotation = pages[i].getRotation().angle;
                        pages[i].setRotation(PDFLib.degrees(currentRotation + pageRotations[i]));
                    }
                }
                const rotatedPdf = await pdfDoc.save();
                downloadBlob(new Blob([rotatedPdf], {type: 'application/pdf'}), 'rotated.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-save-rotate');
        });
    }

    // --- PAGE NUMBERS ---
    else if (toolId === 'page-numbers') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-lime-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Page Numbers</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Page Numbers</h2>
                <p class="text-slate-400">Přidat čísla stránek do PDF.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('page-numbers-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Nastavení</h3>
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Pozice</label>
                            ${createCustomSelect('page-num-pos', [
                                {value: 'bottom-center', label: 'Dole uprostřed'},
                                {value: 'bottom-right', label: 'Dole vpravo'},
                                {value: 'bottom-left', label: 'Dole vlevo'},
                                {value: 'top-center', label: 'Nahoře uprostřed'},
                                {value: 'top-right', label: 'Nahoře vpravo'},
                                {value: 'top-left', label: 'Nahoře vlevo'}
                            ], 'Dole uprostřed')}
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Formát</label>
                            ${createCustomSelect('page-num-format', [
                                {value: '1', label: '1'},
                                {value: 'Strana 1', label: 'Strana 1'},
                                {value: '1/10', label: '1/10'},
                                {value: '- 1 -', label: '- 1 -'}
                            ], '1')}
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Velikost fontu</label>
                            <input type="range" id="page-num-size" min="8" max="24" value="12" class="w-full">
                            <span id="page-num-size-val" class="text-white text-sm">12px</span>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Začít od stránky</label>
                            <input type="number" id="page-num-start" value="1" min="1" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                        </div>
                    </div>
                    <button id="btn-page-numbers" class="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Přidat čísla stránek
                    </button>
                </div>
            </div>
        `;

        initCustomSelects();
        let pdfBytes = null;

        document.getElementById('page-num-size').addEventListener('input', (e) => {
            document.getElementById('page-num-size-val').innerText = e.target.value + 'px';
        });

        initDropzone('page-numbers-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-page-numbers').disabled = false;
        });

        document.getElementById('btn-page-numbers').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-page-numbers', 'Přidávám...');
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const pages = pdfDoc.getPages();
                const pos = document.getElementById('page-num-pos-input').value;
                const format = document.getElementById('page-num-format-input').value;
                const fontSize = parseInt(document.getElementById('page-num-size').value);
                const startPage = parseInt(document.getElementById('page-num-start').value) || 1;
                const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
                const total = pages.length;

                for (let i = startPage - 1; i < pages.length; i++) {
                    const page = pages[i];
                    const {width, height} = page.getSize();
                    const pageNum = i - startPage + 2;
                    const text = format.replace('1', pageNum).replace('10', total);
                    let x, y;
                    if (pos.includes('bottom')) y = 30;
                    else y = height - 30;
                    if (pos.includes('left')) x = 30;
                    else if (pos.includes('right')) x = width - 50;
                    else x = width / 2 - 20;
                    page.drawText(text, {x, y, size: fontSize, font, color: PDFLib.rgb(0.5, 0.5, 0.5)});
                }
                const newPdf = await pdfDoc.save();
                downloadBlob(new Blob([newPdf], {type: 'application/pdf'}), 'with_page_numbers.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-page-numbers');
        });
    }

    // --- WATERMARK PDF ---
    else if (toolId === 'watermark-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-blue-400 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Watermark PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Watermark PDF</h2>
                <p class="text-slate-400">Přidat vodoznak do PDF.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('watermark-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    <div class="bg-[#1E293B] rounded-xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-2">Typ vodotisku</label>
                        <div class="flex gap-3">
                            <button id="watermark-type-text" class="flex-1 bg-blue-500 text-white font-bold py-2 rounded-lg">Text</button>
                            <button id="watermark-type-image" class="flex-1 bg-slate-700 text-white font-bold py-2 rounded-lg">Obrázek</button>
                        </div>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <div id="watermark-text-config">
                        <div class="mb-4">
                            <label class="block text-sm font-bold text-slate-400 mb-2">Text vodotisku</label>
                            <input type="text" id="watermark-text" value="VODOZNÁK" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white">
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Velikost</label>
                                <input type="number" id="watermark-size" value="48" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Průhlednost</label>
                                <input type="range" id="watermark-opacity" min="10" max="100" value="30" class="w-full">
                            </div>
                        </div>
                    </div>
                    <input type="file" id="watermark-image-input" class="hidden" accept="image/*">
                    <button id="btn-watermark" class="w-full mt-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Přidat vodoznak
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;
        let watermarkType = 'text';
        let watermarkImage = null;

        document.getElementById('watermark-type-text').addEventListener('click', () => {
            watermarkType = 'text';
            document.getElementById('watermark-type-text').className = 'flex-1 bg-blue-500 text-white font-bold py-2 rounded-lg';
            document.getElementById('watermark-type-image').className = 'flex-1 bg-slate-700 text-white font-bold py-2 rounded-lg';
            document.getElementById('watermark-text-config').classList.remove('hidden');
        });

        document.getElementById('watermark-type-image').addEventListener('click', () => {
            watermarkType = 'image';
            document.getElementById('watermark-type-image').className = 'flex-1 bg-blue-500 text-white font-bold py-2 rounded-lg';
            document.getElementById('watermark-type-text').className = 'flex-1 bg-slate-700 text-white font-bold py-2 rounded-lg';
            document.getElementById('watermark-text-config').classList.add('hidden');
            document.getElementById('watermark-image-input').click();
        });

        document.getElementById('watermark-image-input').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (ev) => { watermarkImage = ev.target.result; };
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        initDropzone('watermark-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-watermark').disabled = false;
        });

        document.getElementById('btn-watermark').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-watermark', 'Přidávám...');
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const pages = pdfDoc.getPages();
                const opacity = parseInt(document.getElementById('watermark-opacity').value) / 100;

                if (watermarkType === 'text') {
                    const text = document.getElementById('watermark-text').value || 'WATERMARK';
                    const size = parseInt(document.getElementById('watermark-size').value) || 48;
                    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

                    for (const page of pages) {
                        const {width, height} = page.getSize();
                        page.drawText(text, {
                            x: width / 2 - (text.length * size / 4),
                            y: height / 2,
                            size: size,
                            font,
                            opacity,
                            rotate: PDFLib.degrees(-45)
                        });
                    }
                } else if (watermarkType === 'image' && watermarkImage) {
                    const imageBytes = await fetch(watermarkImage).then(r => r.arrayBuffer());
                    const image = await pdfDoc.embedPng(imageBytes);

                    for (const page of pages) {
                        const {width, height} = page.getSize();
                        page.drawImage(image, {
                            x: width / 4,
                            y: height / 4,
                            width: width / 2,
                            height: height / 2,
                            opacity
                        });
                    }
                }

                const newPdf = await pdfDoc.save();
                downloadBlob(new Blob([newPdf], {type: 'application/pdf'}), 'watermarked.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-watermark');
        });
    }

    // --- CROP PDF ---
    else if (toolId === 'crop-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-emerald-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Crop PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Crop PDF</h2>
                <p class="text-slate-400">Oříznout okraje stránek PDF.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('crop-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Okraje (body)</h3>
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Horní</label>
                            <input type="number" id="crop-top" value="0" min="0" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Dolní</label>
                            <input type="number" id="crop-bottom" value="0" min="0" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Vlevo</label>
                            <input type="number" id="crop-left" value="0" min="0" class="w-full bg-[#0BF19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Vpravo</label>
                            <input type="number" id="crop-right" value="0" min="0" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                        </div>
                    </div>
                    <label class="flex items-center gap-2 mb-6">
                        <input type="checkbox" id="crop-all-pages" checked class="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-[#0B0F19]">
                        <span class="text-slate-300 text-sm">Aplikovat na všechny stránky</span>
                    </label>
                    <button id="btn-crop" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Oříznout PDF
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;

        initDropzone('crop-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-crop').disabled = false;
        });

        document.getElementById('btn-crop').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-crop', 'Ořezávám...');
            try {
                const top = parseInt(document.getElementById('crop-top').value) || 0;
                const bottom = parseInt(document.getElementById('crop-bottom').value) || 0;
                const left = parseInt(document.getElementById('crop-left').value) || 0;
                const right = parseInt(document.getElementById('crop-right').value) || 0;
                const allPages = document.getElementById('crop-all-pages').checked;

                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const pages = pdfDoc.getPages();
                const pagesToCrop = allPages ? pages : [pages[0]];

                for (const page of pagesToCrop) {
                    const {width, height} = page.getSize();
                    page.setCropBox(left, bottom, width - left - right, height - top - bottom);
                }

                const croppedPdf = await pdfDoc.save();
                downloadBlob(new Blob([croppedPdf], {type: 'application/pdf'}), 'cropped.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-crop');
        });
    }

    // --- UNLOCK PDF ---
    else if (toolId === 'unlock-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Unlock PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Unlock PDF</h2>
                <p class="text-slate-400">Odstranit heslo a ochranu z PDF.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('unlock-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Heslo (pokud je vyžadováno)</h3>
                    <input type="password" id="unlock-password" placeholder="Zadejte heslo PDF" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white mb-6">
                    <button id="btn-unlock" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Odstranit ochranu
                    </button>
                    <p class="text-slate-400 text-sm mt-4">Funguje pouze pro PDF s heslem pro otevření. PDF s vlastnickým heslem nelze odemknout.</p>
                </div>
            </div>
        `;

        let pdfBytes = null;

        initDropzone('unlock-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-unlock').disabled = false;
        });

        document.getElementById('btn-unlock').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-unlock', 'Odemykám...');
            try {
                const password = document.getElementById('unlock-password').value;
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, {password: password || undefined, ignoreEncryption: true});
                const unlockedPdf = await pdfDoc.save();
                downloadBlob(new Blob([unlockedPdf], {type: 'application/pdf'}), 'unlocked.pdf');
                alert('PDF úspěšně odemčeno!');
            } catch (e) {
                alert('Chyba při odemykání: ' + e.message + '\nZkuste zadat správné heslo.');
            }
            hideLoading('btn-unlock');
        });
    }

    // --- PROTECT PDF ---
    else if (toolId === 'protect-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-rose-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Protect PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Protect PDF</h2>
                <p class="text-slate-400">Chránit PDF heslem a šifrováním.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('protect-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Nastavení ochrany</h3>
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Uživatelské heslo (pro otevření)</label>
                            <input type="password" id="protect-user-pass" placeholder="Heslo pro otevření" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-400 mb-2">Vlastnické heslo (pro editaci)</label>
                            <input type="password" id="protect-owner-pass" placeholder="Heslo pro editaci" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white">
                        </div>
                    </div>
                    <button id="btn-protect" class="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Chránit PDF
                    </button>
                    <p class="text-slate-500 text-xs mt-4">Poznámka: Plné šifrování vyžaduje server-side zpracování.</p>
                </div>
            </div>
        `;

        let pdfBytes = null;

        initDropzone('protect-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-protect').disabled = false;
        });

        document.getElementById('btn-protect').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-protect', 'Chráním...');
            try {
                const userPass = document.getElementById('protect-user-pass').value;
                const ownerPass = document.getElementById('protect-owner-pass').value;
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                // Poznámka: pdf-lib nepodporuje plné šifrování - toto je omezená verze
                // Pro plné šifrování by byl potřeba backend
                const protectedPdf = await pdfDoc.save();
                downloadBlob(new Blob([protectedPdf], {type: 'application/pdf'}), 'protected.pdf');
                alert('PDF uloženo. Pro plné šifrování s heslem použijte server-side řešení.');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-protect');
        });
    }

    // --- COMPARE PDF ---
    else if (toolId === 'compare-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-fuchsia-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Compare PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Compare PDF</h2>
                <p class="text-slate-400">Porovnat dvě verze PDF dokumentu.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-bold text-white mb-4">Dokument A</h3>
                    ${createDropzone('compare-dz-a', 'application/pdf', 'První PDF')}
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white mb-4">Dokument B</h3>
                    ${createDropzone('compare-dz-b', 'application/pdf', 'Druhé PDF')}
                </div>
            </div>
            <div id="compare-results" class="mt-8 hidden">
                <h3 class="text-lg font-bold text-white mb-4">Náhledy stránek</h3>
                <div class="grid grid-cols-2 gap-4" id="compare-pages"></div>
            </div>
            <button id="btn-compare" class="w-full mt-6 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                Porovnat dokumenty
            </button>
        `;

        let pdfBytesA = null;
        let pdfBytesB = null;

        initDropzone('compare-dz-a', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytesA = await file.arrayBuffer();
            if (pdfBytesB) document.getElementById('btn-compare').disabled = false;
        });

        initDropzone('compare-dz-b', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytesB = await file.arrayBuffer();
            if (pdfBytesA) document.getElementById('btn-compare').disabled = false;
        });

        document.getElementById('btn-compare').addEventListener('click', async () => {
            if (!pdfBytesA || !pdfBytesB) return;
            showLoading('btn-compare', 'Porovnávám...');
            try {
                const pdfA = await pdfjsLib.getDocument({data: pdfBytesA}).promise;
                const pdfB = await pdfjsLib.getDocument({data: pdfBytesB}).promise;
                const maxPages = Math.max(pdfA.numPages, pdfB.numPages);
                const container = document.getElementById('compare-pages');
                container.innerHTML = '';

                for (let i = 1; i <= maxPages; i++) {
                    const div = document.createElement('div');
                    div.className = 'bg-card border border-border rounded-xl p-3';
                    div.innerHTML = `<h4 class="text-white font-bold text-sm mb-2">Stránka ${i}</h4><div class="grid grid-cols-2 gap-2"></div>`;

                    for (const [pdf, data, label] of [[pdfA, pdfBytesA, 'A'], [pdfB, pdfBytesB, 'B']]) {
                        if (i <= pdf.numPages) {
                            const pageDiv = document.createElement('div');
                            pageDiv.className = 'relative';
                            const canvas = document.createElement('canvas');
                            canvas.className = 'w-full h-auto rounded border border-border';
                            const ctx = canvas.getContext('2d');
                            const page = await pdf.getPage(i);
                            const viewport = page.getViewport({scale: 0.5});
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            await page.render({canvasContext: ctx, viewport}).promise;
                            pageDiv.innerHTML = `<span class="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">${label}</span>`;
                            pageDiv.appendChild(canvas);
                            div.querySelector('.grid').appendChild(pageDiv);
                        } else {
                            const emptyDiv = document.createElement('div');
                            emptyDiv.className = 'bg-slate-800 rounded h-32 flex items-center justify-center text-slate-500 text-xs';
                            emptyDiv.innerText = `${label}: Chybí`;
                            div.querySelector('.grid').appendChild(emptyDiv);
                        }
                    }
                    container.appendChild(div);
                }

                document.getElementById('compare-results').classList.remove('hidden');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-compare');
        });
    }

    // --- SCAN TO PDF ---
    else if (toolId === 'scan-to-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-teal-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Scan to PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Scan to PDF</h2>
                <p class="text-slate-400">Naskenovat dokument kamerou do PDF.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div class="bg-card border border-border rounded-2xl p-6">
                        <video id="scan-video" class="w-full h-64 bg-black rounded-lg object-cover mb-4" autoplay playsinline></video>
                        <div class="flex gap-3">
                            <button id="btn-start-camera" class="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors">
                                <i data-lucide="camera" class="w-5 h-5 inline mr-2"></i>Spustit kameru
                            </button>
                            <button id="btn-capture" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled>
                                <i data-lucide="shutter" class="w-5 h-5 inline mr-2"></i>Vyfotit
                            </button>
                        </div>
                    </div>
                    <div class="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <i data-lucide="info" class="w-5 h-5 shrink-0 text-blue-400"></i>
                        <p>Fotky se ukládají lokálně. Po skončení klikněte na "Vytvořit PDF".</p>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Naskenované stránky</h3>
                    <div id="scan-pages" class="grid grid-cols-2 gap-3 mb-6 overflow-y-auto max-h-[300px]">
                        <p class="col-span-2 text-slate-500 text-center py-8 text-sm">Žádné stránky. Vyfoťte první.</p>
                    </div>
                    <button id="btn-create-pdf" class="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Vytvořit PDF
                    </button>
                </div>
            </div>
        `;

        let stream = null;
        const capturedImages = [];

        document.getElementById('btn-start-camera').addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}});
                document.getElementById('scan-video').srcObject = stream;
                document.getElementById('btn-capture').disabled = false;
                document.getElementById('btn-start-camera').innerText = 'Kamera běží...';
            } catch (e) { alert('Nelze přistoupit k kameře: ' + e.message); }
        });

        document.getElementById('btn-capture').addEventListener('click', () => {
            const video = document.getElementById('scan-video');
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            capturedImages.push(canvas.toDataURL('image/jpeg', 0.8));
            renderScanPages();
            document.getElementById('btn-create-pdf').disabled = false;
        });

        function renderScanPages() {
            const container = document.getElementById('scan-pages');
            container.innerHTML = capturedImages.map((img, i) => `
                <div class="relative">
                    <img src="${img}" class="w-full h-auto rounded border border-border">
                    <button onclick="removeScanPage(${i})" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                    <span class="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">${i + 1}</span>
                </div>
            `).join('');
        }

        window.removeScanPage = (idx) => {
            capturedImages.splice(idx, 1);
            renderScanPages();
            if (capturedImages.length === 0) document.getElementById('btn-create-pdf').disabled = true;
        };

        document.getElementById('btn-create-pdf').addEventListener('click', async () => {
            if (capturedImages.length === 0) return;
            showLoading('btn-create-pdf', 'Vytvářím...');
            try {
                const pdfDoc = await PDFLib.PDFDocument.create();
                for (const imgData of capturedImages) {
                    const image = await pdfDoc.embedJpg(imgData.split(',')[1] || imgData);
                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, {x: 0, y: 0, width: image.width, height: image.height});
                }
                const pdfBytes = await pdfDoc.save();
                downloadBlob(new Blob([pdfBytes], {type: 'application/pdf'}), 'scanned.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-create-pdf');
        });
    }

    // --- PDF CONVERTER ---
    else if (toolId === 'pdf-converter') {
        const convFormats = [
            {id: 'pdf-jpg', label: 'PDF → JPG', from: 'pdf', to: 'jpg', frontend: true},
            {id: 'jpg-pdf', label: 'JPG/PNG → PDF', from: 'img', to: 'pdf', frontend: true},
            {id: 'pdf-word', label: 'PDF → Word', from: 'pdf', to: 'docx', frontend: false},
            {id: 'word-pdf', label: 'Word → PDF', from: 'docx', to: 'pdf', frontend: false},
        ];

        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-violet-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / PDF Converter</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">PDF Converter</h2>
                <p class="text-slate-400">Konverze PDF do různých formátů a zpět.</p>
            </div>
            <div class="max-w-2xl mx-auto">
                <div class="bg-card border border-border rounded-2xl p-6 mb-6">
                    <label class="block text-sm font-bold text-slate-400 mb-3">Vyberte typ konverze</label>
                    <div class="grid grid-cols-2 gap-3">
                        ${convFormats.map(f => `
                            <label class="flex items-center gap-3 p-4 bg-[#1E293B] border border-slate-700 rounded-xl cursor-pointer hover:border-violet-500 transition-colors">
                                <input type="radio" name="conv-type" value="${f.id}" ${f.id === 'pdf-jpg' ? 'checked' : ''} class="w-5 h-5 text-violet-500 focus:ring-violet-500 bg-[#0B0F19]">
                                <span class="text-white font-medium">${f.label}</span>
                                ${f.frontend ? '' : '<span class="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">SERVER</span>'}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div id="conv-upload-area">
                    ${createDropzone('conv-dz', '.pdf,image/*', 'Nahrajte soubor')}
                </div>
                <button id="btn-convert" class="w-full mt-6 bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                    Konvertovat
                </button>
            </div>
        `;

        let uploadedFile = null;
        let uploadedType = null;

        initDropzone('conv-dz', (files) => {
            uploadedFile = files[0];
            document.getElementById('btn-convert').disabled = false;
        });

        document.getElementById('btn-convert').addEventListener('click', async () => {
            if (!uploadedFile) return;
            const convType = document.querySelector('input[name="conv-type"]:checked').value;
            const conv = convFormats.find(f => f.id === convType);

            showLoading('btn-convert', 'Konvertuji...');

            try {
                if (convType === 'pdf-jpg') {
                    const pdfBytes = await uploadedFile.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({data: pdfBytes}).promise;
                    const zip = new JSZip();

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({scale: 2});
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
                        const jpgData = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
                        zip.file(`page_${i}.jpg`, jpgData, {base64: true});
                    }

                    const zipBlob = await zip.generateAsync({type: 'blob'});
                    downloadBlob(zipBlob, 'pdf_pages.zip');
                } else if (convType === 'jpg-pdf') {
                    const imageBytes = await uploadedFile.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.create();
                    let image;
                    if (uploadedFile.type === 'image/png') {
                        image = await pdfDoc.embedPng(imageBytes);
                    } else {
                        image = await pdfDoc.embedJpg(imageBytes);
                    }
                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, {x: 0, y: 0, width: image.width, height: image.height});
                    const pdfBytes = await pdfDoc.save();
                    downloadBlob(new Blob([pdfBytes], {type: 'application/pdf'}), 'converted.pdf');
                } else {
                    alert('Tato konverze vyžaduje server-side zpracování.\nPro plnou funkčnost je potřeba backend konverze.');
                }
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-convert');
        });
    }

    // --- OCR PDF ---
    else if (toolId === 'ocr-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / OCR PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">OCR PDF</h2>
                <p class="text-slate-400">Převést skenovaný PDF na prohledávatelný text.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('ocr-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    <div class="bg-[#1E293B] rounded-xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-2">Jazyk</label>
                        ${createCustomSelect('ocr-lang', [
                            {value: 'ces', label: 'Čeština'},
                            {value: 'eng', label: 'English'},
                            {value: 'deu', label: 'Deutsch'},
                            {value: 'spa', label: 'Español'},
                            {value: 'fra', label: 'Français'}
                        ], 'Čeština')}
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Extrahovaný text</h3>
                    <div id="ocr-progress" class="hidden mb-4">
                        <div class="flex items-center gap-3 text-orange-400">
                            <i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>
                            <span id="ocr-status">Zpracovávám...</span>
                        </div>
                        <div class="w-full bg-slate-700 rounded-full h-2 mt-2">
                            <div id="ocr-progress-bar" class="bg-orange-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                        </div>
                    </div>
                    <textarea id="ocr-result" class="w-full flex-grow min-h-[200px] bg-[#0B0F19] border border-slate-700 rounded-lg p-4 text-white resize-none mb-4" placeholder="Extrahovaný text se zobrazí zde..." readonly></textarea>
                    <div class="flex gap-3">
                        <button id="btn-ocr-copy" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled>
                            <i data-lucide="copy" class="w-5 h-5 inline mr-2"></i>Kopírovat
                        </button>
                        <button id="btn-ocr-download" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled>
                            <i data-lucide="download" class="w-5 h-5 inline mr-2"></i>Stáhnout TXT
                        </button>
                    </div>
                </div>
            </div>
        `;

        initCustomSelects();
        let extractedText = '';

        initDropzone('ocr-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');

            const lang = document.getElementById('ocr-lang-input').value || 'ces';
            const pdfBytes = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data: pdfBytes}).promise;
            const progressBar = document.getElementById('ocr-progress-bar');
            const progressDiv = document.getElementById('ocr-progress');
            const statusText = document.getElementById('ocr-status');
            const resultArea = document.getElementById('ocr-result');

            progressDiv.classList.remove('hidden');
            resultArea.value = '';
            extractedText = '';

            try {
                for (let i = 1; i <= pdf.numPages; i++) {
                    statusText.innerText = `Zpracovávám stránku ${i}/${pdf.numPages}...`;
                    progressBar.style.width = `${(i / pdf.numPages) * 100}%`;

                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({scale: 2});
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;

                    const result = await Tesseract.recognize(canvas, lang);
                    extractedText += result.data.text + '\n\n';
                }

                resultArea.value = extractedText;
                document.getElementById('btn-ocr-copy').disabled = false;
                document.getElementById('btn-ocr-download').disabled = false;
                statusText.innerText = 'Hotovo!';
            } catch (e) {
                alert('Chyba při OCR: ' + e.message);
            }

            setTimeout(() => progressDiv.classList.add('hidden'), 1000);
        });

        document.getElementById('btn-ocr-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(extractedText);
            alert('Text zkopírován do schránky!');
        });

        document.getElementById('btn-ocr-download').addEventListener('click', () => {
            downloadBlob(new Blob([extractedText], {type: 'text/plain'}), 'extracted_text.txt');
        });
    }

    // --- AI SUMMARIZE ---
    else if (toolId === 'ai-summarize') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="sparkles" class="w-3 h-3"></i> AI POWERED
                </div>
                <h2 class="text-4xl font-extrabold text-white mb-2">AI Summarizer</h2>
                <p class="text-slate-400">AI shrnutí obsahu PDF dokumentu.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('ai-sum-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Shrnutí</h3>
                    <div id="ai-sum-loading" class="hidden flex-col items-center justify-center py-8">
                        <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-yellow-500 mb-4"></i>
                        <p class="text-slate-400">Analyzuji dokument...</p>
                    </div>
                    <div id="ai-sum-result" class="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap hidden"></div>
                    <button id="btn-ai-sum" class="w-full mt-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        <i data-lucide="sparkles" class="w-5 h-5 inline mr-2"></i>Vytvořit shrnutí
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;

        initDropzone('ai-sum-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-ai-sum').disabled = false;
        });

        document.getElementById('btn-ai-sum').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-ai-sum', 'Analyzuji...');
            document.getElementById('ai-sum-loading').classList.remove('hidden');
            document.getElementById('ai-sum-result').classList.add('hidden');
            try {
                const pdf = await pdfjsLib.getDocument({data: pdfBytes}).promise;
                let fullText = '';
                for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                const lang = document.getElementById('current-lang').innerText || 'CS';
                const response = await fetch('./api/ai-summarize.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({text: fullText, lang})
                });
                const data = await response.json();
                let formatted = escapeHTML(data.text || 'Shrnutí selhalo.');
                formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                document.getElementById('ai-sum-result').innerHTML = formatted;
                document.getElementById('ai-sum-result').classList.remove('hidden');
            } catch (e) { alert('Chyba: ' + e.message); }
            document.getElementById('ai-sum-loading').classList.add('hidden');
            hideLoading('btn-ai-sum');
        });
    }

    // --- AI TRANSLATE PDF ---
    else if (toolId === 'ai-translate-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="languages" class="w-3 h-3"></i> AI POWERED
                </div>
                <h2 class="text-4xl font-extrabold text-white mb-2">Translate PDF</h2>
                <p class="text-slate-400">AI překlad PDF do libovolného jazyka.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('ai-trans-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    <div class="bg-[#1E293B] rounded-xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-2">Cílový jazyk</label>
                        ${createCustomSelect('trans-lang', [
                            {value: 'English', label: 'English'},
                            {value: 'Čeština', label: 'Čeština'},
                            {value: 'Deutsch', label: 'Deutsch'},
                            {value: 'Español', label: 'Español'},
                            {value: 'Français', label: 'Français'},
                            {value: 'Italiano', label: 'Italiano'},
                            {value: 'Polski', label: 'Polski'},
                            {value: 'Українська', label: 'Українська'}
                        ], 'English')}
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Přeložený text</h3>
                    <div id="ai-trans-loading" class="hidden flex-col items-center justify-center py-8">
                        <i data-lucide="loader-2" class="w-8 h-8 animate-spin text-pink-500 mb-4"></i>
                        <p class="text-slate-400">Překládám...</p>
                    </div>
                    <textarea id="ai-trans-result" class="w-full flex-grow min-h-[200px] bg-[#0B0F19] border border-slate-700 rounded-lg p-4 text-white resize-none mb-4" placeholder="Přeložený text se zobrazí zde..." readonly></textarea>
                    <button id="btn-ai-trans" class="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        <i data-lucide="languages" class="w-5 h-5 inline mr-2"></i>Přeložit
                    </button>
                </div>
            </div>
        `;

        initCustomSelects();
        let pdfBytes = null;

        initDropzone('ai-trans-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-ai-trans').disabled = false;
        });

        document.getElementById('btn-ai-trans').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-ai-trans', 'Překládám...');
            document.getElementById('ai-trans-loading').classList.remove('hidden');
            try {
                const pdf = await pdfjsLib.getDocument({data: pdfBytes}).promise;
                let fullText = '';
                for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                const targetLang = document.getElementById('trans-lang-input').value || 'English';
                const lang = document.getElementById('current-lang').innerText || 'CS';
                const response = await fetch('./api/ai-translate.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({text: fullText, targetLang, lang})
                });
                const data = await response.json();
                document.getElementById('ai-trans-result').value = data.text || 'Překlad selhal.';
            } catch (e) { alert('Chyba: ' + e.message); }
            document.getElementById('ai-trans-loading').classList.add('hidden');
            hideLoading('btn-ai-trans');
        });
    }

    // --- REPAIR PDF ---
    else if (toolId === 'repair-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-yellow-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Repair PDF</p>
                <h2 class="text-4xl font-extrabold text-white mb-3">Repair PDF</h2>
                <p class="text-slate-400">Opravit poškozený PDF soubor.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('repair-dz', 'application/pdf', 'Nahrajte poškozené PDF')}
                    <div class="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <i data-lucide="info" class="w-5 h-5 shrink-0 text-blue-400"></i>
                        <p>Tento nástroj se pokusí obnovit PDF přečtením a uložením dokumentu.</p>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Výsledek</h3>
                    <div id="repair-status" class="flex-grow flex items-center justify-center text-slate-400 py-8">
                        <p>Nahrajte PDF soubor pro opravu.</p>
                    </div>
                    <button id="btn-repair" class="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Opravit PDF
                    </button>
                </div>
            </div>
        `;

        let pdfBytes = null;

        initDropzone('repair-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            document.getElementById('btn-repair').disabled = false;
        });

        document.getElementById('btn-repair').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-repair', 'Opravuji...');
            document.getElementById('repair-status').innerHTML = '<i data-lucide="loader-2" class="w-8 h-8 animate-spin text-yellow-500"></i>';
            lucide.createIcons();
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, {ignoreEncryption: true, updateMetadata: false});
                const repairedPdf = await pdfDoc.save();
                document.getElementById('repair-status').innerHTML = '<div class="text-center"><i data-lucide="check-circle" class="w-12 h-12 text-green-500 mb-4"></i><p class="text-green-400 font-bold">PDF úspěšně opraveno!</p></div>';
                lucide.createIcons();
                downloadBlob(new Blob([repairedPdf], {type: 'application/pdf'}), 'repaired.pdf');
            } catch (e) {
                document.getElementById('repair-status').innerHTML = `<div class="text-center"><i data-lucide="x-circle" class="w-12 h-12 text-red-500 mb-4"></i><p class="text-red-400 font-bold">Oprava selhala</p><p class="text-slate-400 text-sm mt-2">${escapeHTML(e.message)}</p></div>`;
                lucide.createIcons();
            }
            hideLoading('btn-repair');
        });
    }

    // --- GENERIC FALLBACK ---
    else {
        container.innerHTML = `
            <div class="text-center py-20">
                <div class="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="wrench" class="w-10 h-10 text-slate-400"></i>
                </div>
                <h2 class="text-3xl font-bold text-white mb-4">Nástroj ve vývoji</h2>
                <p class="text-slate-400">Tento nástroj zatím není plně implementován v tomto demu.<br/>Zkuste Merge PDF, Split PDF, Změna Velikosti nebo Video Konvertor.</p>
            </div>
        `;
    }
}

// ==========================================
// 5. INICIALIZACE APLIKACE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderHome();
    initCustomSelects();

    // Inicializuj router z aktuální URL
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/') {
        handleRoute(currentPath);
    }
    // else: home je už zobrazeno přes renderHome()

    // Poslouchej browser back/forward
    window.addEventListener('popstate', (e) => {
        const path = e.state?.path || window.location.pathname;
        handleRoute(path);
    });

    // Theme Switcher Logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        let isDark = !document.documentElement.classList.contains('light-mode');
        themeToggle.addEventListener('click', () => {
            isDark = !isDark;
            if (isDark) {
                themeToggle.innerHTML = '<i data-lucide="sun" class="w-5 h-5"></i>';
                document.documentElement.classList.remove('light-mode');
            } else {
                themeToggle.innerHTML = '<i data-lucide="moon" class="w-5 h-5"></i>';
                document.documentElement.classList.add('light-mode');
            }
            lucide.createIcons();
        });
    }
});
