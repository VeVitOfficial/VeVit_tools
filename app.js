// ==========================================
// 0. URL ROUTING (History API)
// ==========================================

// URL MAP: tool ID → URL slug
const URL_MAP = {
    // PDF Tools
    'merge-pdf':        '/pdf/merge',
    'split-pdf':        '/pdf/split',
    'remove-pages':     '/pdf/remove-pages',
    'extract-pages':    '/pdf/extract-pages',
    'organize-pdf':     '/pdf/organize',
    'scan-to-pdf':      '/pdf/scan',
    'compress-pdf':     '/pdf/compress',
    'repair-pdf':       '/pdf/repair',
    'ocr-pdf':          '/pdf/ocr',
    'pdf-converter':    '/pdf/converter',
    'rotate-pdf':       '/pdf/rotate',
    'page-numbers':     '/pdf/page-numbers',
    'watermark-pdf':    '/pdf/watermark',
    'crop-pdf':         '/pdf/crop',
    'redact-pdf':       '/pdf/redact',
    'unlock-pdf':       '/pdf/unlock',
    'protect-pdf':      '/pdf/protect',
    'compare-pdf':      '/pdf/compare',
    'ai-summarize':     '/pdf/ai-summarize',
    'ai-translate-pdf': '/pdf/ai-translate',
    'html-to-pdf':      '/pdf/html-to-pdf',
    'pdf-to-html':      '/pdf/pdf-to-html',
    // Image Tools
    'img-compress':     '/image/compress',
    'bg-remover':       '/image/background-remover',
    'img-upscaler':     '/image/upscaler',
    'color-extractor':  '/image/color-palette',
    'palette-generator': '/image/palette-generator',
    'img-crop':         '/image/crop',
    'exif-remover':     '/image/exif-remover',
    'img-ocr':          '/image/ocr',
    'screenshot-to-code':'/image/screenshot-to-code',
    'collage-maker':    '/image/collage',
    'img-conv':         '/image/converter',
    'resize-img':       '/image/resize',
    'ai-vision':        '/image/ai-vision',
    // Text Tools
    'markdown-editor':  '/text/markdown',
    'text-diff':        '/text/diff',
    'word-counter':     '/text/word-counter',
    'case-converter':   '/text/case-converter',
    'lorem-generator': '/text/lorem-ipsum',
    'text-to-handwriting':'/text/handwriting',
    'csv-json':         '/text/csv-json',
    'json-formatter':   '/text/json',
    'xml-formatter':    '/text/xml',
    'text-summarizer':  '/text/ai-summarizer',
    'grammar-checker':  '/text/grammar',
    'paraphraser':      '/text/paraphraser',
    // Security Tools
    'password-gen':     '/security/password-generator',
    'password-check':   '/security/password-strength',
    'hash-gen':         '/security/hash',
    'text-encrypt':     '/security/encrypt',
    'qr-generator':     '/security/qr-generator',
    'qr-reader':        '/security/qr-reader',
    'uuid-gen':         '/security/uuid',
    'jwt-decoder':      '/security/jwt',
    // Calculator Tools
    'unit-converter':   '/calc/units',
    'currency-converter':'/calc/currency',
    'percentage-calc':  '/calc/percentage',
    'tip-calculator':   '/calc/tip',
    'loan-calculator':  '/calc/loan',
    'bmi-calculator':   '/calc/bmi',
    'color-converter':  '/calc/color',
    'base-converter':   '/calc/base',
    'roman-converter':  '/calc/roman',
    'timestamp-converter':'/calc/timestamp',
    // Dev Tools
    'css-tools':       '/dev/css',
    'js-tools':         '/dev/javascript',
    'html-tools':       '/dev/html',
    'regex-tester':     '/dev/regex',
    'cron-builder':     '/dev/cron',
    'meta-generator':   '/dev/meta-tags',
    'favicon-gen':      '/dev/favicon',
    'base64-tool':      '/dev/base64',
    'url-tool':         '/dev/url-encoder',
    'html-entities':    '/dev/html-entities',
    // AI Tools
    'ai-search':        '/ai/search',
    'tts':              '/ai/text-to-speech',
    // Media Tools
    'video-conv':       '/media/video-converter',
    'audio-conv':       '/media/audio-converter',
    // Categories
    'pdf':              '/pdf',
    'image':            '/image',
    'text':             '/text',
    'security':         '/security',
    'calc':             '/calc',
    'dev':              '/dev',
    'ai':               '/ai',
    'media':            '/media'
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

    // Category routes (e.g., /pdf, /image)
    const categoryIds = ['pdf', 'image', 'text', 'security', 'calc', 'dev', 'ai', 'media'];
    for (const catId of categoryIds) {
        if (path === '/' + catId) {
            _showCategory(catId);
            return;
        }
    }

    // Tool routes - use SLUG_MAP for correct toolId lookup
    const toolId = SLUG_MAP[path];
    if (toolId) {
        _openTool(toolId);
        return;
    }

    // Legacy PDF tools routing
    if (path === '/pdf-tools') {
        _showCategory('pdf');
        return;
    }
    if (path.startsWith('/pdf-tools/')) {
        const legacyToolId = path.replace('/pdf-tools/', '');
        if (legacyToolId) {
            _openTool(legacyToolId);
            return;
        }
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

// Helper pro API volání s chybovým zpracováním
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Server vrátil chybu: ${response.status}`);
        }
        const text = await response.text();
        if (!text.trim()) {
            throw new Error('API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)');
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)');
        }
    } catch (e) {
        if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
            throw new Error('API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)');
        }
        throw e;
    }
}

// ==========================================
// TOOL USAGE TRACKING (COOKIES)
// ==========================================
function getToolUsage() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; tool_usage=`);
    if (parts.length === 2) {
        try {
            return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
        } catch (e) {
            return {};
        }
    }
    return {};
}

function saveToolUsage(usage) {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `tool_usage=${encodeURIComponent(JSON.stringify(usage))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function trackToolUsage(toolId) {
    const usage = getToolUsage();
    usage[toolId] = {
        count: (usage[toolId]?.count || 0) + 1,
        lastUsed: Date.now()
    };
    saveToolUsage(usage);
}

function getRecentTools(limit = 3) {
    const usage = getToolUsage();
    return Object.entries(usage)
        .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
        .slice(0, limit)
        .map(([id]) => id);
}

function getMostUsedTools(limit = 3) {
    const usage = getToolUsage();
    return Object.entries(usage)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, limit)
        .map(([id]) => id);
}

function getToolById(toolId) {
    const lang = document.getElementById('current-lang')?.innerText || 'CS';
    for (const cat of CATEGORIES) {
        const tool = cat.tools.find(t => t.id === toolId);
        if (tool) return {
            ...tool,
            categoryId: cat.id,
            categoryColor: cat.color,
            categoryName: categoryNames[cat.id]?.[lang] || cat.name
        };
    }
    return null;
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
        'title': 'Nástroje pro <span class="text-emerald-400">Kreativce</span><br/>& <span class="text-sky-400">Vývojáře</span>.',
        'subtitle': 'Výkonná sada nástrojů pro vaše soubory. Bezpečně zpracujte PDF, Video, Obrázky a Audio přímo ve svém prohlížeči.',
        'popular': 'Nejoblíbenější nástroje',
        'all_tools': 'Všechny kategorie',
        'stats_tools': '60+ nástrojů',
        'stats_free': '100%',
        'stats_private': 'Soukromé & bezpečné',
        'search_placeholder': "Hledat nástroj... (např. 'compress', 'rotate', 'watermark')",
        'footer_back': 'Zpět na VeVit.fun',
        'footer_privacy': 'Vše zpracováno lokálně v prohlížeči',
        'login': 'Přihlásit se',
        'register': 'Zaregistrovat se',
        'upload': 'Nahrát soubor',
        'download': 'Stáhnout',
        'download_all': 'Stáhnout vše',
        'copy': 'Kopírovat',
        'copy_link': 'Kopírovat odkaz',
        'process': 'Zpracovat',
        'loading': 'Načítání...',
        'error': 'Chyba',
        'success': 'Úspěch',
        'cancel': 'Zrušit',
        'clear': 'Vymazat',
        'reset': 'Resetovat'
    },
    'EN': {
        'title': 'Tools for <span class="text-emerald-400">Creators</span><br/>& <span class="text-sky-400">Developers</span>.',
        'subtitle': 'Powerful toolset for your files. Safely process PDF, Video, Images and Audio right in your browser.',
        'popular': 'Most Popular Tools',
        'all_tools': 'All Categories',
        'stats_tools': '60+ tools',
        'stats_free': '100%',
        'stats_private': 'Private & secure',
        'search_placeholder': "Search tool... (e.g. 'compress', 'rotate', 'watermark')",
        'footer_back': 'Back to VeVit.fun',
        'footer_privacy': 'All processed locally in browser',
        'login': 'Log in',
        'register': 'Register',
        'upload': 'Upload file',
        'download': 'Download',
        'download_all': 'Download all',
        'copy': 'Copy',
        'copy_link': 'Copy link',
        'process': 'Process',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'cancel': 'Cancel',
        'clear': 'Clear',
        'reset': 'Reset'
    },
    'ES': {
        'title': 'Herramientas para <span class="text-emerald-400">Creadores</span><br/>& <span class="text-sky-400">Desarrolladores</span>.',
        'subtitle': 'Potente conjunto de herramientas para tus archivos. Procesa de forma segura PDF, Video, Imágenes y Audio directamente en tu navegador.',
        'popular': 'Herramientas Populares',
        'all_tools': 'Todas las Categorías',
        'stats_tools': '60+ herramientas',
        'stats_free': '100%',
        'stats_private': 'Privado y seguro',
        'search_placeholder': "Buscar herramienta... (ej. 'compress', 'rotate', 'watermark')",
        'footer_back': 'Volver a VeVit.fun',
        'footer_privacy': 'Todo procesado localmente',
        'login': 'Iniciar sesión',
        'register': 'Registrarse',
        'upload': 'Subir archivo',
        'download': 'Descargar',
        'download_all': 'Descargar todo',
        'copy': 'Copiar',
        'copy_link': 'Copiar enlace',
        'process': 'Procesar',
        'loading': 'Cargando...',
        'error': 'Error',
        'success': 'Éxito',
        'cancel': 'Cancelar',
        'clear': 'Limpiar',
        'reset': 'Restablecer'
    },
    'DE': {
        'title': 'Werkzeuge für <span class="text-emerald-400">Kreative</span><br/>& <span class="text-sky-400">Entwickler</span>.',
        'subtitle': 'Leistungsstarkes Toolset für Ihre Dateien. Verarbeiten Sie PDF, Video, Bilder und Audio sicher direkt in Ihrem Browser.',
        'popular': 'Beliebteste Werkzeuge',
        'all_tools': 'Alle Kategorien',
        'stats_tools': '60+ Werkzeuge',
        'stats_free': '100%',
        'stats_private': 'Privat & sicher',
        'search_placeholder': "Werkzeug suchen... (z.B. 'compress', 'rotate', 'watermark')",
        'footer_back': 'Zurück zu VeVit.fun',
        'footer_privacy': 'Alles lokal im Browser verarbeitet',
        'login': 'Anmelden',
        'register': 'Registrieren',
        'upload': 'Datei hochladen',
        'download': 'Herunterladen',
        'download_all': 'Alle herunterladen',
        'copy': 'Kopieren',
        'copy_link': 'Link kopieren',
        'process': 'Verarbeiten',
        'loading': 'Laden...',
        'error': 'Fehler',
        'success': 'Erfolg',
        'cancel': 'Abbrechen',
        'clear': 'Löschen',
        'reset': 'Zurücksetzen'
    },
    'UK': {
        'title': 'Інструменти для <span class="text-emerald-400">Творців</span><br/>& <span class="text-sky-400">Розробників</span>.',
        'subtitle': 'Потужний набір інструментів для ваших файлів. Безпечно обробляйте PDF, відео, зображення та аудіо прямо у вашому браузері.',
        'popular': 'Популярні інструменти',
        'all_tools': 'Всі категорії',
        'stats_tools': '60+ інструментів',
        'stats_free': '100%',
        'stats_private': 'Приватно & безпечно',
        'search_placeholder': "Пошук інструменту... (напр. 'compress', 'rotate', 'watermark')",
        'footer_back': 'Назад до VeVit.fun',
        'footer_privacy': 'Все обробляється локально',
        'login': 'Увійти',
        'register': 'Зареєструватися',
        'upload': 'Завантажити файл',
        'download': 'Завантажити',
        'download_all': 'Завантажити все',
        'copy': 'Копіювати',
        'copy_link': 'Копіювати посилання',
        'process': 'Обробити',
        'loading': 'Завантаження...',
        'error': 'Помилка',
        'success': 'Успіх',
        'cancel': 'Скасувати',
        'clear': 'Очистити',
        'reset': 'Скинути'
    }
};

// Category translations
const categoryNames = {
    'pdf': { 'CS': 'PDF Nástroje', 'EN': 'PDF Tools', 'ES': 'Herramientas PDF', 'DE': 'PDF-Werkzeuge', 'UK': 'PDF Інструменти' },
    'image': { 'CS': 'Obrázky', 'EN': 'Images', 'ES': 'Imágenes', 'DE': 'Bilder', 'UK': 'Зображення' },
    'text': { 'CS': 'Text', 'EN': 'Text', 'ES': 'Texto', 'DE': 'Text', 'UK': 'Текст' },
    'security': { 'CS': 'Bezpečnost', 'EN': 'Security', 'ES': 'Seguridad', 'DE': 'Sicherheit', 'UK': 'Безпека' },
    'calc': { 'CS': 'Kalkulačky', 'EN': 'Calculators', 'ES': 'Calculadoras', 'DE': 'Rechner', 'UK': 'Калькулятори' },
    'dev': { 'CS': 'Vývoj', 'EN': 'Development', 'ES': 'Desarrollo', 'DE': 'Entwicklung', 'UK': 'Розробка' },
    'ai': { 'CS': 'AI Nástroje', 'EN': 'AI Tools', 'ES': 'Herramientas IA', 'DE': 'KI-Werkzeuge', 'UK': 'AI Інструменти' },
    'media': { 'CS': 'Média', 'EN': 'Media', 'ES': 'Medios', 'DE': 'Medien', 'UK': 'Медіа' }
};

// Store original Czech content from HTML (saved on first language switch)
let czechContentSaved = false;
const originalCzechContent = {
    title: null,
    subtitle: null,
    statsTools: null,
    statsFree: null,
    statsPrivate: null,
    searchPlaceholder: null,
    popularTitle: null,
    allToolsTitle: null,
    footerBack: null,
    footerPrivacy: null
};

function getStatsPills() {
    // More specific selector for stats pills - select direct children of the stats container
    const statsContainer = document.querySelector('#home-view .flex.items-center.gap-3.flex-wrap.justify-center');
    if (statsContainer) {
        return statsContainer.querySelectorAll(':scope > .rounded-full');
    }
    return [];
}

function saveOriginalCzechContent() {
    if (czechContentSaved) return; // Only save once

    const titleEl = document.querySelector('#home-view h1');
    if (titleEl) {
        originalCzechContent.title = titleEl.innerHTML;
    }

    const subtitleEl = document.querySelector('#home-view p.max-w-xl');
    if (subtitleEl) {
        originalCzechContent.subtitle = subtitleEl.textContent;
    }

    const statsPills = getStatsPills();
    if (statsPills.length >= 3) {
        originalCzechContent.statsTools = statsPills[0].innerHTML;
        originalCzechContent.statsFree = statsPills[1].innerHTML;
        originalCzechContent.statsPrivate = statsPills[2].innerHTML;
    }

    const searchInput = document.getElementById('tool-search');
    if (searchInput) {
        originalCzechContent.searchPlaceholder = searchInput.placeholder;
    }

    const popularTitleEl = document.querySelector('#home-view > div:nth-child(2) > h2');
    if (popularTitleEl) {
        originalCzechContent.popularTitle = popularTitleEl.innerHTML;
    }

    const allToolsTitleEl = document.querySelector('#home-view > div:nth-child(3) > h2');
    if (allToolsTitleEl) {
        originalCzechContent.allToolsTitle = allToolsTitleEl.textContent;
    }

    const footerBack = document.querySelector('footer a');
    if (footerBack) {
        originalCzechContent.footerBack = footerBack.innerHTML;
    }

    const footerPrivacy = document.querySelector('footer .flex.items-center.gap-2.text-slate-500 span');
    if (footerPrivacy) {
        originalCzechContent.footerPrivacy = footerPrivacy.textContent;
    }

    czechContentSaved = true;
}

function setLang(lang) {
    document.getElementById('current-lang').innerText = lang;

    // For Czech on first load, just save content and don't modify anything
    if (lang === 'CS' && !czechContentSaved) {
        // First time loading Czech - save original content and do nothing else
        saveOriginalCzechContent();
        lucide.createIcons();
    } else if (lang === 'CS') {
        // Switching back to Czech - restore original content
        const titleEl = document.querySelector('#home-view h1');
        if (titleEl && originalCzechContent.title) {
            titleEl.innerHTML = originalCzechContent.title;
        }

        const subtitleEl = document.querySelector('#home-view p.max-w-xl');
        if (subtitleEl && originalCzechContent.subtitle) {
            subtitleEl.textContent = originalCzechContent.subtitle;
        }

        const statsPills = getStatsPills();
        if (statsPills.length >= 3 && originalCzechContent.statsTools) {
            statsPills[0].innerHTML = originalCzechContent.statsTools;
            statsPills[1].innerHTML = originalCzechContent.statsFree;
            statsPills[2].innerHTML = originalCzechContent.statsPrivate;
        }

        const searchInput = document.getElementById('tool-search');
        if (searchInput && originalCzechContent.searchPlaceholder) {
            searchInput.placeholder = originalCzechContent.searchPlaceholder;
        }

        const popularTitleEl = document.querySelector('#home-view > div:nth-child(2) > h2');
        if (popularTitleEl && originalCzechContent.popularTitle) {
            popularTitleEl.innerHTML = originalCzechContent.popularTitle;
        }

        const allToolsTitleEl = document.querySelector('#home-view > div:nth-child(3) > h2');
        if (allToolsTitleEl && originalCzechContent.allToolsTitle) {
            allToolsTitleEl.textContent = originalCzechContent.allToolsTitle;
        }

        const footerBack = document.querySelector('footer a');
        if (footerBack && originalCzechContent.footerBack) {
            footerBack.innerHTML = originalCzechContent.footerBack;
        }

        const footerPrivacy = document.querySelector('footer .flex.items-center.gap-2.text-slate-500 span');
        if (footerPrivacy && originalCzechContent.footerPrivacy) {
            footerPrivacy.textContent = originalCzechContent.footerPrivacy;
        }

        lucide.createIcons();
    } else {
        // For other languages, save original Czech content first (if not saved), then apply translations
        saveOriginalCzechContent();

        const t = translations[lang];
        if (t) {
            // Hero section
            const titleEl = document.querySelector('#home-view h1');
            if (titleEl) titleEl.innerHTML = t.title;

            const subtitleEl = document.querySelector('#home-view p.max-w-xl');
            if (subtitleEl) subtitleEl.innerText = t.subtitle;

            // Stats pills
            const statsPills = getStatsPills();
            if (statsPills.length >= 3) {
                statsPills[0].innerHTML = `<div class="w-2 h-2 rounded-full bg-green-400"></div> ${t.stats_tools}`;
                statsPills[1].innerHTML = `<div class="w-2 h-2 rounded-full bg-blue-400"></div> ${t.stats_free}`;
                statsPills[2].innerHTML = `<div class="w-2 h-2 rounded-full bg-slate-400"></div> ${t.stats_private}`;
            }

            // Search placeholder
            const searchInput = document.getElementById('tool-search');
            if (searchInput) searchInput.placeholder = t.search_placeholder;

            // Section titles
            const popularTitleEl = document.querySelector('#home-view > div:nth-child(2) > h2');
            if (popularTitleEl) popularTitleEl.innerHTML = `<i data-lucide="star" class="w-5 h-5 text-yellow-500 fill-yellow-500"></i> ${t.popular}`;

            const allToolsTitleEl = document.querySelector('#home-view > div:nth-child(3) > h2');
            if (allToolsTitleEl) allToolsTitleEl.textContent = t.all_tools;

            // Footer
            const footerBack = document.querySelector('footer a');
            if (footerBack) footerBack.innerHTML = `<i data-lucide="arrow-left" class="w-4 h-4"></i> ${t.footer_back}`;

            const footerPrivacy = document.querySelector('footer .flex.items-center.gap-2.text-slate-500 span');
            if (footerPrivacy) footerPrivacy.textContent = t.footer_privacy;

            // Auth buttons
            const loginBtn = document.querySelector('a[href="https://account.vevit.fun/login"]');
            if (loginBtn) loginBtn.textContent = t.login;

            const registerBtn = document.querySelector('a[href="https://account.vevit.fun/register"]');
            if (registerBtn) registerBtn.textContent = t.register;

            lucide.createIcons();
        }
    }

    // Re-render home to update category names
    if (document.getElementById('home-view') && !document.getElementById('home-view').classList.contains('hidden-section')) {
        renderHome();
    }
}

// ==========================================
// 2. DEFINICE KATEGORIÍ A NÁSTROJŮ
// ==========================================
const CATEGORIES = [
  {
    id: 'pdf',
    name: 'PDF Nástroje',
    nameEn: 'PDF Tools',
    icon: 'file-text',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-500',
    desc: '20+ nástrojů pro vše kolem PDF',
    tools: [
      // ORGANIZACE
      { id: 'merge-pdf', name: 'Merge PDF', icon: 'combine',
        desc: 'Sloučit více PDF do jednoho souboru.', color: 'bg-indigo-500',
        keywords: ['merge', 'sloučit', 'combine', 'spojit'], frontend: true },
      { id: 'split-pdf', name: 'Split PDF', icon: 'scissors',
        desc: 'Rozdělit PDF na části nebo stránky.', color: 'bg-violet-500',
        keywords: ['split', 'rozdělit', 'separate'], frontend: true },
      { id: 'remove-pages', name: 'Remove Pages', icon: 'trash-2',
        desc: 'Odstranit vybrané stránky z PDF.', color: 'bg-red-500',
        keywords: ['remove', 'delete', 'odstranit'], frontend: true },
      { id: 'extract-pages', name: 'Extract Pages', icon: 'file-output',
        desc: 'Extrahovat stránky do nového PDF.', color: 'bg-cyan-500',
        keywords: ['extract', 'vybrat', 'extrahovat'], frontend: true },
      { id: 'organize-pdf', name: 'Organize PDF', icon: 'layout-grid',
        desc: 'Přeuspořádat stránky drag & drop.', color: 'bg-indigo-500', popular: true,
        keywords: ['organize', 'reorder', 'uspořádat'], frontend: true },
      { id: 'scan-to-pdf', name: 'Scan to PDF', icon: 'scan',
        desc: 'Naskenovat dokument kamerou.', color: 'bg-teal-500',
        keywords: ['scan', 'kamera', 'sken'], frontend: true },
      // OPTIMALIZACE
      { id: 'compress-pdf', name: 'Compress PDF', icon: 'archive',
        desc: 'Zmenšit velikost PDF.', color: 'bg-green-500', popular: true,
        keywords: ['compress', 'zmenšit', 'komprese'], frontend: true },
      { id: 'repair-pdf', name: 'Repair PDF', icon: 'wrench',
        desc: 'Opravit poškozený PDF.', color: 'bg-yellow-500',
        keywords: ['repair', 'opravit', 'fix'], frontend: true },
      { id: 'ocr-pdf', name: 'OCR PDF', icon: 'text-cursor',
        desc: 'Převést sken na prohledávatelný text.', color: 'bg-orange-500',
        keywords: ['ocr', 'text', 'rozpoznat'], frontend: true },
      // KONVERZE
      { id: 'pdf-converter', name: 'PDF Converter', icon: 'arrow-right-left',
        desc: 'Konverze PDF ↔ Word, Excel, JPG.', color: 'bg-violet-500', popular: true,
        keywords: ['convert', 'word', 'excel', 'jpg'], frontend: true },
      // EDITACE
      { id: 'rotate-pdf', name: 'Rotate PDF', icon: 'rotate-cw',
        desc: 'Otočit stránky PDF.', color: 'bg-indigo-400',
        keywords: ['rotate', 'otočit'], frontend: true },
      { id: 'page-numbers', name: 'Page Numbers', icon: 'hash',
        desc: 'Přidat čísla stránek.', color: 'bg-lime-500',
        keywords: ['numbers', 'čísla', 'číslování'], frontend: true },
      { id: 'watermark-pdf', name: 'Watermark PDF', icon: 'droplets',
        desc: 'Přidat vodoznak do PDF.', color: 'bg-blue-400',
        keywords: ['watermark', 'vodoznak'], frontend: true },
      { id: 'crop-pdf', name: 'Crop PDF', icon: 'crop',
        desc: 'Oříznout okraje stránek.', color: 'bg-emerald-500',
        keywords: ['crop', 'oříznout'], frontend: true },
      { id: 'redact-pdf', name: 'Redact PDF', icon: 'eraser',
        desc: 'Skrýt citlivé informace.', color: 'bg-slate-500',
        keywords: ['redact', 'skrýt', 'černit'], frontend: true },
      // ZABEZPEČENÍ
      { id: 'unlock-pdf', name: 'Unlock PDF', icon: 'lock-open',
        desc: 'Odstranit heslo z PDF.', color: 'bg-amber-500',
        keywords: ['unlock', 'odemknout', 'heslo'], frontend: true, unavailable: true },
      { id: 'protect-pdf', name: 'Protect PDF', icon: 'lock',
        desc: 'Chránit PDF heslem.', color: 'bg-rose-500',
        keywords: ['protect', 'heslo', 'šifrování'], frontend: true, unavailable: true },
      { id: 'compare-pdf', name: 'Compare PDF', icon: 'diff',
        desc: 'Porovnat dvě verze PDF.', color: 'bg-fuchsia-500',
        keywords: ['compare', 'porovnat', 'diff'], frontend: true },
      // KONVERZE HTML
      { id: 'html-to-pdf', name: 'HTML to PDF', icon: 'file-code',
        desc: 'Převést HTML kód nebo URL na PDF.', color: 'bg-orange-500',
        keywords: ['html', 'pdf', 'convert', 'převést', 'web'], frontend: true, popular: true },
      { id: 'pdf-to-html', name: 'PDF to HTML', icon: 'code',
        desc: 'Extrahovat HTML obsah z PDF.', color: 'bg-teal-500',
        keywords: ['pdf', 'html', 'extract', 'extrahovat'], frontend: true },
      // AI
      { id: 'ai-summarize', name: 'AI Summarizer', icon: 'sparkles',
        desc: 'AI shrnutí obsahu PDF.', color: 'bg-yellow-500',
        keywords: ['ai', 'summarize', 'shrnout'], frontend: false },
      { id: 'ai-translate-pdf', name: 'Translate PDF', icon: 'languages',
        desc: 'AI překlad PDF do jiného jazyka.', color: 'bg-pink-500',
        keywords: ['translate', 'přeložit', 'překlad'], frontend: false }
    ]
  },
  {
    id: 'image',
    name: 'Obrázky',
    nameEn: 'Images',
    icon: 'image',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    desc: 'Úpravy, konverze a AI nástroje pro obrázky',
    tools: [
      { id: 'img-compress', name: 'Image Compressor', icon: 'minimize-2',
        desc: 'Zmenší velikost obrázku bez ztráty kvality.', color: 'bg-violet-500',
        keywords: ['compress', 'zmenšit', 'tinypng', 'jpg', 'png'], frontend: true, isNew: true, popular: true },
      { id: 'bg-remover', name: 'Background Remover', icon: 'eraser',
        desc: 'AI odstranění pozadí z fotky.', color: 'bg-purple-500',
        keywords: ['background', 'pozadí', 'remove', 'ai'], frontend: false, isNew: true, popular: true },
      { id: 'img-upscaler', name: 'Image Upscaler', icon: 'zoom-in',
        desc: 'AI zvětšení obrázku 2x/4x.', color: 'bg-violet-600',
        keywords: ['upscale', 'zvětšit', 'ai', '4k'], frontend: false, isNew: true },
      { id: 'color-extractor', name: 'Color Palette', icon: 'palette',
        desc: 'Extrahuje dominantní barvy z obrázku.', color: 'bg-purple-400',
        keywords: ['barvy', 'paleta', 'colors', 'extract'], frontend: true, isNew: true },
      { id: 'palette-generator', name: 'Palette Generator', icon: 'paintbrush',
        desc: 'Generování a správa barevných palet.', color: 'bg-pink-500',
        keywords: ['barvy', 'paleta', 'colors', 'generator', 'coolors'], frontend: true, isNew: true },
      { id: 'img-crop', name: 'Image Crop', icon: 'crop',
        desc: 'Ořez s předdefinovanými poměry.', color: 'bg-violet-400',
        keywords: ['crop', 'oříznout', 'resize', 'aspect'], frontend: true, isNew: true },
      { id: 'exif-remover', name: 'EXIF Remover', icon: 'shield-off',
        desc: 'Smaže GPS a metadata z fotek.', color: 'bg-purple-600',
        keywords: ['exif', 'metadata', 'gps', 'privacy'], frontend: true, isNew: true },
      { id: 'img-ocr', name: 'Image to Text', icon: 'scan-text',
        desc: 'Extrakce textu z obrázku (OCR).', color: 'bg-violet-500',
        keywords: ['ocr', 'text', 'obrázek', 'rozpoznat'], frontend: true, isNew: true },
      { id: 'screenshot-to-code', name: 'Screenshot to Code', icon: 'code-2',
        desc: 'AI převede screenshot UI na HTML/CSS.', color: 'bg-purple-500',
        keywords: ['screenshot', 'html', 'css', 'ai', 'convert'], frontend: false, isNew: true },
      { id: 'collage-maker', name: 'Collage Maker', icon: 'layout-grid',
        desc: 'Složí více fotek do jednoho obrázku.', color: 'bg-violet-400',
        keywords: ['collage', 'fotky', 'grid', 'kombinovat'], frontend: true, isNew: true },
      { id: 'resize-img', name: 'Změna Velikosti', icon: 'maximize',
        desc: 'Změna rozměrů obrázku.', color: 'bg-green-500',
        keywords: ['resize', 'image', 'obrázek', 'velikost'], frontend: true },
      { id: 'img-conv', name: 'Obrázkový Konvertor', icon: 'image',
        desc: 'Konverze mezi JPG, PNG, WebP, GIF.', color: 'bg-emerald-500',
        keywords: ['jpg', 'png', 'webp', 'gif', 'convert'], frontend: true },
      { id: 'ai-vision', name: 'AI Vision', icon: 'sparkles',
        desc: 'AI analýza obrázků.', color: 'bg-yellow-500',
        keywords: ['ai', 'image', 'analyze', 'vision'], frontend: false, popular: true }
    ]
  },
  {
    id: 'text',
    name: 'Text & Dokumenty',
    nameEn: 'Text & Documents',
    icon: 'file-type',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    desc: 'Editory, konvertory a AI textové nástroje',
    tools: [
      { id: 'markdown-editor', name: 'Markdown Editor', icon: 'file-code',
        desc: 'Live preview editor s exportem.', color: 'bg-amber-500',
        keywords: ['markdown', 'md', 'editor', 'html'], frontend: true, isNew: true, popular: true },
      { id: 'text-diff', name: 'Text Diff', icon: 'git-diff',
        desc: 'Porovná dva texty a zvýrazní rozdíly.', color: 'bg-orange-500',
        keywords: ['diff', 'porovnat', 'rozdíl', 'compare'], frontend: true, isNew: true },
      { id: 'word-counter', name: 'Word Counter', icon: 'hash',
        desc: 'Počet slov, znaků a doba čtení.', color: 'bg-amber-400',
        keywords: ['slova', 'znaky', 'počítat'], frontend: true, isNew: true },
      { id: 'case-converter', name: 'Case Converter', icon: 'type',
        desc: 'UPPER / lower / Title / camelCase.', color: 'bg-orange-400',
        keywords: ['case', 'uppercase', 'lowercase', 'camel'], frontend: true, isNew: true },
      { id: 'lorem-generator', name: 'Lorem Ipsum', icon: 'align-left',
        desc: 'Generátor placeholder textu.', color: 'bg-amber-500',
        keywords: ['lorem', 'ipsum', 'placeholder'], frontend: true, isNew: true },
      { id: 'text-to-handwriting', name: 'Text to Handwriting', icon: 'pen-line',
        desc: 'Převede text na rukopis.', color: 'bg-orange-500',
        keywords: ['handwriting', 'rukopis', 'psaní'], frontend: true, isNew: true },
      { id: 'csv-json', name: 'CSV ↔ JSON', icon: 'arrow-right-left',
        desc: 'Konverze mezi CSV a JSON.', color: 'bg-amber-600',
        keywords: ['csv', 'json', 'convert', 'data'], frontend: true, isNew: true, popular: true },
      { id: 'json-formatter', name: 'JSON Formatter', icon: 'braces',
        desc: 'Formátování a validace JSON.', color: 'bg-orange-600',
        keywords: ['json', 'format', 'validate', 'minify'], frontend: true, isNew: true, popular: true },
      { id: 'xml-formatter', name: 'XML Formatter', icon: 'file-xml',
        desc: 'Formátování a validace XML.', color: 'bg-amber-500',
        keywords: ['xml', 'format', 'validate'], frontend: true, isNew: true },
      { id: 'text-summarizer', name: 'AI Summarizer', icon: 'sparkles',
        desc: 'AI shrnutí libovolného textu.', color: 'bg-orange-500',
        keywords: ['ai', 'shrnutí', 'summarize'], frontend: false, isNew: true },
      { id: 'grammar-checker', name: 'Grammar Checker', icon: 'spell-check',
        desc: 'AI kontrola gramatiky a stylu.', color: 'bg-amber-400',
        keywords: ['gramatika', 'pravopis', 'ai', 'check'], frontend: false, isNew: true },
      { id: 'paraphraser', name: 'Paraphraser', icon: 'repeat-2',
        desc: 'AI přeformulování textu.', color: 'bg-orange-400',
        keywords: ['paraphrase', 'přeformulovat', 'ai'], frontend: false, isNew: true }
    ]
  },
  {
    id: 'security',
    name: 'Bezpečnost',
    nameEn: 'Security',
    icon: 'shield',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    desc: 'Šifrování, hesla, QR kódy a hashování',
    tools: [
      { id: 'password-gen', name: 'Password Generator', icon: 'key',
        desc: 'Generátor silných hesel.', color: 'bg-emerald-500',
        keywords: ['heslo', 'password', 'generator', 'secure'], frontend: true, isNew: true, popular: true },
      { id: 'password-check', name: 'Password Strength', icon: 'shield-check',
        desc: 'Analýza síly hesla.', color: 'bg-teal-500',
        keywords: ['heslo', 'síla', 'strength', 'check'], frontend: true, isNew: true },
      { id: 'hash-gen', name: 'Hash Generator', icon: 'fingerprint',
        desc: 'MD5, SHA1, SHA256, SHA512 hashování.', color: 'bg-emerald-600',
        keywords: ['hash', 'md5', 'sha', '256', 'encrypt'], frontend: true, isNew: true, popular: true },
      { id: 'text-encrypt', name: 'Text Encryptor', icon: 'lock',
        desc: 'AES šifrování textu heslem.', color: 'bg-teal-600',
        keywords: ['encrypt', 'šifrovat', 'aes', 'decrypt'], frontend: true, isNew: true },
      { id: 'qr-generator', name: 'QR Generator', icon: 'qr-code',
        desc: 'QR kód z textu nebo URL.', color: 'bg-emerald-500',
        keywords: ['qr', 'kód', 'generator', 'url'], frontend: true, isNew: true, popular: true },
      { id: 'qr-reader', name: 'QR Reader', icon: 'scan',
        desc: 'Přečte QR kód z obrázku.', color: 'bg-teal-500',
        keywords: ['qr', 'čtečka', 'reader', 'scan'], frontend: true, isNew: true },
      { id: 'uuid-gen', name: 'UUID Generator', icon: 'shuffle',
        desc: 'Generátor UUID v1/v4/v5.', color: 'bg-emerald-400',
        keywords: ['uuid', 'guid', 'generator', 'unique'], frontend: true, isNew: true },
      { id: 'jwt-decoder', name: 'JWT Decoder', icon: 'key-round',
        desc: 'Dekóduje JWT token.', color: 'bg-teal-400',
        keywords: ['jwt', 'token', 'decode', 'auth'], frontend: true, isNew: true }
    ]
  },
  {
    id: 'calc',
    name: 'Kalkulačky',
    nameEn: 'Calculators',
    icon: 'calculator',
    color: '#f97316',
    gradient: 'from-orange-400 to-rose-500',
    desc: 'Převody jednotek, měny, finance a čísla',
    tools: [
      { id: 'unit-converter', name: 'Unit Converter', icon: 'ruler',
        desc: 'Délka, váha, teplota, plocha, objem.', color: 'bg-orange-500',
        keywords: ['jednotky', 'převod', 'délka', 'váha'], frontend: true, isNew: true, popular: true },
      { id: 'currency-converter', name: 'Currency Converter', icon: 'coins',
        desc: 'Live kurzy měn pro 170+ zemí.', color: 'bg-amber-500',
        keywords: ['měna', 'kurz', 'currency', 'euro', 'usd'], frontend: true, isNew: true, popular: true },
      { id: 'percentage-calc', name: 'Percentage Calc', icon: 'percent',
        desc: 'X% z Y, rozdíl v %, zpětný výpočet.', color: 'bg-orange-400',
        keywords: ['procento', 'kalkulačka', 'percent'], frontend: true, isNew: true },
      { id: 'tip-calculator', name: 'Tip Calculator', icon: 'receipt',
        desc: 'Kalkulačka spropitného.', color: 'bg-amber-400',
        keywords: ['spropitné', 'tip', 'účet'], frontend: true, isNew: true },
      { id: 'loan-calculator', name: 'Loan Calculator', icon: 'landmark',
        desc: 'Splátky úvěru a amortizace.', color: 'bg-orange-500',
        keywords: ['úvěr', 'půjčka', 'splátky', 'hypotéka'], frontend: true, isNew: true },
      { id: 'bmi-calculator', name: 'BMI Calculator', icon: 'activity',
        desc: 'Index tělesné hmotnosti.', color: 'bg-amber-500',
        keywords: ['bmi', 'váha', 'výška', 'zdraví'], frontend: true, isNew: true },
      { id: 'color-converter', name: 'Color Converter', icon: 'pipette',
        desc: 'HEX ↔ RGB ↔ HSL ↔ CMYK.', color: 'bg-orange-400',
        keywords: ['barva', 'hex', 'rgb', 'hsl', 'cmyk'], frontend: true, isNew: true, popular: true },
      { id: 'base-converter', name: 'Number Base', icon: 'binary',
        desc: 'Binární / Hex / Oktal / Decimální.', color: 'bg-amber-600',
        keywords: ['binární', 'hex', 'oktal', 'číslo'], frontend: true, isNew: true },
      { id: 'roman-converter', name: 'Roman Numerals', icon: 'columns',
        desc: 'Arabské ↔ římské číslice.', color: 'bg-orange-600',
        keywords: ['římské', 'čísla', 'roman', 'arabic'], frontend: true, isNew: true },
      { id: 'timestamp-converter', name: 'Timestamp', icon: 'clock',
        desc: 'Unix timestamp ↔ datum a čas.', color: 'bg-amber-500',
        keywords: ['timestamp', 'unix', 'datum', 'čas'], frontend: true, isNew: true }
    ]
  },
  {
    id: 'dev',
    name: 'Pro vývojáře',
    nameEn: 'For Developers',
    icon: 'code-2',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-500',
    desc: 'Formátory, minifikátory, regex a web nástroje',
    tools: [
      { id: 'css-tools', name: 'CSS Minifier', icon: 'code',
        desc: 'Minifikace a formátování CSS.', color: 'bg-cyan-500',
        keywords: ['css', 'minify', 'beautify', 'format'], frontend: true, isNew: true, popular: true },
      { id: 'js-tools', name: 'JS Minifier', icon: 'braces',
        desc: 'Minifikace a formátování JavaScript.', color: 'bg-blue-500',
        keywords: ['js', 'javascript', 'minify', 'beautify'], frontend: true, isNew: true, popular: true },
      { id: 'html-tools', name: 'HTML Minifier', icon: 'code-2',
        desc: 'Minifikace a formátování HTML.', color: 'bg-cyan-600',
        keywords: ['html', 'minify', 'beautify', 'format'], frontend: true, isNew: true },
      { id: 'regex-tester', name: 'Regex Tester', icon: 'regex',
        desc: 'Testování regulárních výrazů.', color: 'bg-blue-600',
        keywords: ['regex', 'regexp', 'test', 'pattern'], frontend: true, isNew: true, popular: true },
      { id: 'cron-builder', name: 'Cron Builder', icon: 'timer',
        desc: 'Vizuální stavitel cron výrazů.', color: 'bg-cyan-500',
        keywords: ['cron', 'schedule', 'unix', 'job'], frontend: true, isNew: true },
      { id: 'meta-generator', name: 'Meta Tags', icon: 'tag',
        desc: 'Generátor SEO meta tagů.', color: 'bg-blue-500',
        keywords: ['meta', 'seo', 'og', 'open graph'], frontend: true, isNew: true },
      { id: 'favicon-gen', name: 'Favicon Generator', icon: 'globe',
        desc: 'Favicon ve všech velikostech.', color: 'bg-cyan-400',
        keywords: ['favicon', 'ico', 'icon', 'web'], frontend: true, isNew: true },
      { id: 'base64-tool', name: 'Base64', icon: 'file-code-2',
        desc: 'Enkódování a dekódování Base64.', color: 'bg-blue-400',
        keywords: ['base64', 'encode', 'decode', 'string'], frontend: true, isNew: true },
      { id: 'url-tool', name: 'URL Encoder', icon: 'link',
        desc: 'Enkódování a dekódování URL.', color: 'bg-cyan-600',
        keywords: ['url', 'encode', 'decode', 'percent'], frontend: true, isNew: true },
      { id: 'html-entities', name: 'HTML Entities', icon: 'ampersand',
        desc: 'Konverze HTML speciálních znaků.', color: 'bg-blue-600',
        keywords: ['html', 'entity', 'escape', 'encode'], frontend: true, isNew: true }
    ]
  },
  {
    id: 'ai',
    name: 'AI Nástroje',
    nameEn: 'AI Tools',
    icon: 'sparkles',
    color: '#eab308',
    gradient: 'from-yellow-400 to-amber-500',
    desc: 'Analýza obrázků, vyhledávač a AI asistenti',
    tools: [
      { id: 'ai-vision', name: 'AI Vision', icon: 'sparkles',
        desc: 'AI analýza obrázků.', color: 'bg-yellow-500',
        keywords: ['ai', 'image', 'analyze', 'vision'], frontend: false, popular: true },
      { id: 'ai-search', name: 'AI Vyhledávač', icon: 'search',
        desc: 'AI vyhledávání na webu.', color: 'bg-amber-500',
        keywords: ['search', 'vyhledávač', 'ai', 'web'], frontend: false, popular: true },
      { id: 'tts', name: 'Text na řeč', icon: 'mic',
        desc: 'Převod textu na mluvené slovo.', color: 'bg-yellow-400',
        keywords: ['tts', 'text', 'speech', 'hlas'], frontend: false },
      { id: 'bg-remover', name: 'Background Remover', icon: 'eraser',
        desc: 'AI odstranění pozadí.', color: 'bg-amber-400',
        keywords: ['background', 'pozadí', 'remove', 'ai'], frontend: false, isNew: true },
      { id: 'img-upscaler', name: 'Image Upscaler', icon: 'zoom-in',
        desc: 'AI zvětšení obrázku.', color: 'bg-yellow-600',
        keywords: ['upscale', 'zvětšit', 'ai', '4k'], frontend: false, isNew: true },
      { id: 'screenshot-to-code', name: 'Screenshot to Code', icon: 'code-2',
        desc: 'AI převod screenshot na HTML.', color: 'bg-amber-500',
        keywords: ['screenshot', 'html', 'css', 'ai'], frontend: false, isNew: true },
      { id: 'text-summarizer', name: 'AI Summarizer', icon: 'sparkles',
        desc: 'AI shrnutí textu.', color: 'bg-yellow-500',
        keywords: ['ai', 'shrnutí', 'summarize'], frontend: false, isNew: true },
      { id: 'grammar-checker', name: 'Grammar Checker', icon: 'spell-check',
        desc: 'AI kontrola gramatiky.', color: 'bg-amber-400',
        keywords: ['gramatika', 'pravopis', 'ai'], frontend: false, isNew: true },
      { id: 'paraphraser', name: 'Paraphraser', icon: 'repeat-2',
        desc: 'AI přeformulování textu.', color: 'bg-yellow-400',
        keywords: ['paraphrase', 'přeformulovat', 'ai'], frontend: false, isNew: true }
    ]
  },
  {
    id: 'media',
    name: 'Video & Audio',
    nameEn: 'Video & Audio',
    icon: 'play-circle',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
    desc: 'Konverze a zpracování médií',
    tools: [
      { id: 'video-conv', name: 'Video Konvertor', icon: 'video',
        desc: 'Konverze video formátů.', color: 'bg-pink-500',
        keywords: ['mp4', 'mkv', 'avi', 'video', 'convert'], frontend: true },
      { id: 'audio-conv', name: 'Audio Konvertor', icon: 'music',
        desc: 'Konverze audio formátů.', color: 'bg-rose-500',
        keywords: ['mp3', 'wav', 'flac', 'audio', 'convert'], frontend: true }
    ]
  }
];

// Helper: získat všechny nástroje jako plochý seznam
function getAllTools() {
  const tools = [];
  CATEGORIES.forEach(cat => {
    cat.tools.forEach(tool => {
      tools.push({ ...tool, categoryId: cat.id, categoryName: cat.name });
    });
  });
  return tools;
}

// Helper: získat nástroj podle ID
function getToolById(id) {
  for (const cat of CATEGORIES) {
    const tool = cat.tools.find(t => t.id === id);
    if (tool) return { ...tool, categoryId: cat.id, categoryName: cat.name };
  }
  return null;
}

// Helper: získat kategorii podle ID
function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || null;
}

// Legacy compatibility
const mainItems = CATEGORIES.map(cat => ({
  id: cat.id,
  type: 'category',
  name: cat.name,
  icon: cat.icon,
  desc: cat.desc,
  color: `bg-gradient-to-r ${cat.gradient}`,
  popular: cat.tools.some(t => t.popular),
  keywords: [cat.id, cat.name.toLowerCase()]
}));

const pdfTools = CATEGORIES.find(c => c.id === 'pdf')?.tools || [];

// ==========================================
// 3. UI GENERÁTORY A HELPERY
// ==========================================
function renderHome() {
    const popularGrid = document.getElementById('popular-tools-grid');
    const categoriesGrid = document.getElementById('categories-grid');
    const lang = document.getElementById('current-lang').innerText || 'CS';
    const t = translations[lang] || translations['CS'];

    // Get all popular tools from all categories (fallback)
    const allPopularTools = [];
    CATEGORIES.forEach(cat => {
        cat.tools.filter(t => t.popular).forEach(tool => {
            allPopularTools.push({ ...tool, categoryId: cat.id, categoryName: categoryNames[cat.id]?.[lang] || cat.name, categoryColor: cat.color });
        });
    });

    // Get user's usage data
    const mostUsedIds = getMostUsedTools(6); // Get more than needed for deduplication
    const recentIds = getRecentTools(6);

    // Build most used tools (bottom row - priority)
    const mostUsedTools = [];
    for (const id of mostUsedIds) {
        if (mostUsedTools.length >= 3) break;
        const tool = getToolById(id);
        if (tool) mostUsedTools.push(tool);
    }

    // Build recent tools (top row) - exclude tools already in most used
    const mostUsedSet = new Set(mostUsedTools.map(t => t.id));
    const recentTools = [];
    for (const id of recentIds) {
        if (recentTools.length >= 3) break;
        const tool = getToolById(id);
        if (tool && !mostUsedSet.has(tool.id)) {
            recentTools.push(tool);
        }
    }

    // Fill missing slots from popular tools
    const shownIds = new Set([...mostUsedTools.map(t => t.id), ...recentTools.map(t => t.id)]);

    // Fill most used if needed
    for (const tool of allPopularTools) {
        if (mostUsedTools.length >= 3) break;
        if (!shownIds.has(tool.id)) {
            mostUsedTools.push(tool);
            shownIds.add(tool.id);
        }
    }

    // Fill recent if needed
    for (const tool of allPopularTools) {
        if (recentTools.length >= 3) break;
        if (!shownIds.has(tool.id)) {
            recentTools.push(tool);
            shownIds.add(tool.id);
        }
    }

    // Helper to render tool card
    const renderToolCard = (tool) => `
        <div onclick="${tool.unavailable ? '' : `openTool('${tool.id}')`}"
             class="relative flex flex-col h-full rounded-2xl p-6 ${tool.unavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} transition-all duration-300 group overflow-hidden tool-card bg-card-base border border-card ${tool.unavailable ? '' : 'hover:border-card-hover'}">

            ${tool.unavailable ? `<span class="absolute top-3 left-3 text-[9px] font-bold bg-red-500/80 text-white px-1.5 py-0.5 rounded-full">NEDOSTUPNÉ</span>` : ''}
            ${tool.isNew ? `<span class="absolute top-3 right-3 text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>` : ''}

            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                 style="background: radial-gradient(ellipse at top left, rgba(99,102,241,0.08) 0%, transparent 60%);"></div>

            <div class="relative w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center mb-5 shadow-lg ${tool.unavailable ? '' : 'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'}">
                <i data-lucide="${tool.icon}" class="w-7 h-7 text-white keep-white"></i>
            </div>

            <h3 class="text-xl font-semibold text-white mb-2">${tool.name}</h3>
            <p class="text-slate-400 text-sm flex-grow mb-6 leading-relaxed">${tool.desc || ''}</p>

            <div class="flex items-center gap-2 text-sm font-semibold" style="color: #818cf8;">
                ${tool.unavailable ? 'Není k dispozici' : (t.open_tool || 'Otevřít nástroj')}
                ${tool.unavailable ? '' : '<i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>'}
            </div>
        </div>
    `;

    // First 3 cards = recent tools (top row)
    // Last 3 cards = most used tools (bottom row)
    const toolsToShow = [...recentTools.slice(0, 3), ...mostUsedTools.slice(0, 3)];

    popularGrid.innerHTML = toolsToShow.slice(0, 6).map(tool => renderToolCard(tool)).join('');

    // Category cards with gradient backgrounds
    categoriesGrid.innerHTML = CATEGORIES.map(cat => {
        const catName = categoryNames[cat.id]?.[lang] || cat.name;
        const toolsCount = cat.tools.length;
        const toolsLabel = lang === 'CS' ? `${toolsCount} nástrojů` :
                          lang === 'EN' ? `${toolsCount} tools` :
                          lang === 'ES' ? `${toolsCount} herramientas` :
                          lang === 'DE' ? `${toolsCount} Werkzeuge` :
                          `${toolsCount} інструментів`;
        return `
        <div onclick="showCategory('${cat.id}')"
             class="relative rounded-2xl p-5 cursor-pointer transition-all duration-300 group overflow-hidden hover:scale-[1.02]"
             style="background: linear-gradient(135deg, ${cat.color}dd, ${cat.color}88);">
            <i data-lucide="${cat.icon}" class="w-8 h-8 text-white mb-3"></i>
            <h3 class="text-white font-semibold text-lg">${catName}</h3>
            <p class="text-white/70 text-xs mt-1">${toolsLabel}</p>
            <p class="text-white/60 text-xs mt-1">${cat.desc}</p>
        </div>
    `}).join('');

    lucide.createIcons();
    initSearch();
}

// Vyhledávač nástrojů
function initSearch() {
    const searchInput = document.getElementById('tool-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

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

        const allTools = getAllTools();

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
            searchResults.innerHTML = results.slice(0, 10).map(tool => `
                <div onclick="${tool.unavailable ? '' : `openTool('${tool.id}'); document.getElementById('tool-search').value = ''; document.getElementById('search-results').classList.add('hidden');`}"
                     class="flex items-center gap-4 p-4 ${tool.unavailable ? 'opacity-50' : 'hover:bg-slate-700/50 cursor-pointer'} transition-colors border-b border-slate-700 last:border-b-0">
                    <div class="w-10 h-10 rounded-lg ${tool.color} flex items-center justify-center shrink-0">
                        <i data-lucide="${tool.icon}" class="w-5 h-5 text-white keep-white"></i>
                    </div>
                    <div class="flex-grow min-w-0">
                        <h4 class="font-semibold text-white text-sm flex items-center gap-2">
                            ${tool.name}
                            ${tool.unavailable ? '<span class="text-[9px] font-bold bg-red-500/80 text-white px-1.5 py-0.5 rounded-full">NEDOSTUPNÉ</span>' : ''}
                        </h4>
                        <p class="text-slate-400 text-xs truncate">${tool.desc}</p>
                    </div>
                    <span class="text-[10px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-700/50 rounded">${tool.categoryName}</span>
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
    trackToolUsage(toolId);
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

    const cat = getCategoryById(categoryId);
    if (!cat) {
        _showHome();
        return;
    }

    document.title = `${cat.name} — VeVit Tools`;

    renderBreadcrumb([
        { label: 'Domů', path: '/' },
        { label: cat.name, path: URL_MAP[cat.id] }
    ]);

    const categoryTitle = document.getElementById('category-title');
    const categoryDesc = document.getElementById('category-desc');
    const grid = document.getElementById('category-tools-grid');

    if (categoryTitle) categoryTitle.innerText = cat.name;
    if (categoryDesc) categoryDesc.innerText = cat.desc;

    // Render tools in grid
    grid.innerHTML = `
        <div class="mb-6 p-6 rounded-2xl text-white"
             style="background: linear-gradient(135deg, ${cat.color}dd, ${cat.color}88);">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    <i data-lucide="${cat.icon}" class="w-7 h-7"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-semibold">${cat.name}</h2>
                    <p class="text-white/80 text-sm">${cat.tools.length} nástrojů k dispozici</p>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            ${cat.tools.map(tool => `
                <div onclick="${tool.unavailable ? '' : `openTool('${tool.id}')`}"
                     class="relative rounded-xl p-5 transition-all duration-200 flex flex-col items-center text-center group bg-card-base border border-card ${tool.unavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-card-hover hover:bg-card-hover-base'}">
                    ${tool.isNew ? `<span class="absolute top-2 right-2 text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>` : ''}
                    ${tool.unavailable ? `<span class="absolute top-2 left-2 text-[9px] font-bold bg-red-500/80 text-white px-1.5 py-0.5 rounded-full">NEDOSTUPNÉ</span>` : ''}
                    <div class="w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center mb-3 shadow-lg ${tool.unavailable ? '' : 'group-hover:scale-110 transition-transform duration-200'}">
                        <i data-lucide="${tool.icon}" class="w-6 h-6 text-white keep-white"></i>
                    </div>
                    <h4 class="font-semibold text-white text-sm mb-1">${tool.name}</h4>
                    <p class="text-xs text-slate-500 leading-relaxed">${tool.desc}</p>
                    ${tool.frontend === false
                        ? `<span class="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:rgba(234,179,8,0.15); color:#eab308;">SERVER</span>`
                        : ''}
                </div>
            `).join('')}
        </div>
    `;

    lucide.createIcons();
}

function _openTool(toolId) {
    document.getElementById('home-view').classList.add('hidden-section');
    document.getElementById('category-view').classList.add('hidden-section');
    document.getElementById('tool-view').classList.remove('hidden-section');

    const container = document.getElementById('tool-container');
    container.innerHTML = '';

    const tool = getToolById(toolId);
    const toolName = tool?.name || toolId;

    // Check if tool is unavailable
    if (tool?.unavailable) {
        renderBreadcrumb([
            { label: 'Domů', path: '/' },
            { label: toolName, path: URL_MAP[toolId] }
        ]);
        container.innerHTML = `
            <div class="text-center py-20">
                <div class="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="x-circle" class="w-10 h-10 text-red-500"></i>
                </div>
                <h2 class="text-3xl font-semibold text-white mb-4">Nástroj není dostupný</h2>
                <p class="text-slate-400 mb-8">Tento nástroj je momentálně nedostupný. Zkuste to prosím později.</p>
                <button onclick="showHome()" class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
                    Zpět na hlavní stránku
                </button>
            </div>
        `;
        lucide.createIcons();
        document.title = `${toolName} — VeVit Tools`;
        return;
    }

    if (tool) {
        renderBreadcrumb([
            { label: 'Domů', path: '/' },
            { label: tool.categoryName, path: URL_MAP[tool.categoryId] },
            { label: toolName, path: URL_MAP[toolId] }
        ]);
    } else {
        renderBreadcrumb([
            { label: 'Domů', path: '/' },
            { label: toolName, path: URL_MAP[toolId] }
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
        <div id="${id}" class="border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center hover:border-emerald-500 hover:bg-slate-800/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 bg-card-base h-full min-h-[300px]">
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

// Image dropzone with preview support
function createImageDropzone(id, label = 'JPG, PNG, WebP až 10MB') {
    return `
        <div id="${id}" class="relative border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden hover:border-emerald-500 hover:bg-slate-800/30 transition-all cursor-pointer bg-card-base min-h-[300px] flex items-center justify-center">
            <div id="${id}-placeholder" class="flex flex-col items-center justify-center gap-4 p-10">
                <div class="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 shadow-inner">
                    <i data-lucide="image" class="w-8 h-8"></i>
                </div>
                <div>
                    <p class="text-lg font-bold text-white">Přetáhněte obrázek sem</p>
                    <p class="text-sm text-slate-500 mt-1">${label}</p>
                </div>
            </div>
            <div id="${id}-preview" class="absolute inset-0 hidden">
                <img id="${id}-img" class="w-full h-full object-contain" src="" alt="Preview">
                <button id="${id}-remove" type="button" class="absolute top-3 right-3 bg-slate-800/80 hover:bg-red-500 text-white rounded-full p-2 backdrop-blur transition-all z-10">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
                <div id="${id}-filename" class="absolute bottom-3 left-3 right-3 bg-slate-800/80 backdrop-blur rounded-lg px-3 py-1.5 text-white text-sm truncate"></div>
            </div>
            <input type="file" id="${id}-input" class="hidden" accept="image/*">
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

// Image dropzone with preview
function initImageDropzone(id, onFiles) {
    const dropzone = document.getElementById(id);
    const input = document.getElementById(`${id}-input`);
    const placeholder = document.getElementById(`${id}-placeholder`);
    const preview = document.getElementById(`${id}-preview`);
    const img = document.getElementById(`${id}-img`);
    const removeBtn = document.getElementById(`${id}-remove`);
    const filename = document.getElementById(`${id}-filename`);

    if (!dropzone || !input) return;

    // Click to upload
    dropzone.addEventListener('click', (e) => {
        if (!e.target.closest(`#${id}-remove`)) {
            input.click();
        }
    });

    // Drag events
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-emerald-500', 'bg-slate-800/30');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-emerald-500', 'bg-slate-800/30');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-emerald-500', 'bg-slate-800/30');
        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    input.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageFile(e.target.files[0]);
        }
    });

    // Remove button
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetDropzone();
        });
    }

    function handleImageFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            showToast('Vyberte obrázek', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            filename.textContent = file.name;
            placeholder.classList.add('hidden');
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        onFiles([file]);
    }

    function resetDropzone() {
        input.value = '';
        img.src = '';
        placeholder.classList.remove('hidden');
        preview.classList.add('hidden');
    }

    return { reset: resetDropzone };
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
// IMAGE CROP TOOL - Premium Redesign
// ==========================================
function initImageCropTool(container) {
    container.innerHTML = `
        <!-- Header -->
        <div class="text-center mb-8">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                <i data-lucide="crop" class="w-4 h-4 text-violet-400"></i>
                <span class="text-xs font-medium text-violet-300 tracking-wide">Image / Crop</span>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Image Crop</h1>
            <p class="text-slate-400 max-w-md mx-auto">Profesionální ořez obrázků s přednastavenými poměry stran. Přesné a intuitivní.</p>
        </div>

        <!-- Main Editor Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <!-- Left: Editor Panel (3/5) -->
            <div class="lg:col-span-3 flex flex-col gap-4">
                <!-- Editor Card -->
                <div class="relative rounded-2xl overflow-hidden" style="background: linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8)); border: 1px solid rgba(255,255,255,0.05);">
                    <!-- Editor Header -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span class="text-sm text-slate-300 font-medium">Editor</span>
                        </div>
                        <button id="crop-reset" type="button" class="hidden items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Odstranit obrázek">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            <span>Odstranit</span>
                        </button>
                    </div>

                    <!-- Canvas Area -->
                    <div id="crop-dropzone" class="relative cursor-pointer" style="min-height: 380px;">
                        <!-- Empty State -->
                        <div id="crop-placeholder" class="absolute inset-0 flex flex-col items-center justify-center p-8">
                            <div class="w-20 h-20 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center mb-4">
                                <i data-lucide="image-plus" class="w-8 h-8 text-slate-500"></i>
                            </div>
                            <p class="text-white font-medium mb-1">Přetáhněte obrázek sem</p>
                            <p class="text-slate-500 text-sm mb-4">nebo klikněte pro výběr ze zařízení</p>
                            <div class="flex items-center gap-2 text-xs text-slate-600">
                                <span class="px-2 py-1 rounded bg-slate-800/50">JPG</span>
                                <span class="px-2 py-1 rounded bg-slate-800/50">PNG</span>
                                <span class="px-2 py-1 rounded bg-slate-800/50">WebP</span>
                                <span class="text-slate-700">•</span>
                                <span>Max 20MB</span>
                            </div>
                        </div>

                        <!-- Workspace -->
                        <div id="crop-workspace" class="absolute inset-0 hidden" style="background: repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 16px 16px;">
                            <div class="absolute inset-0 flex items-center justify-center p-4">
                                <canvas id="crop-canvas" class="max-w-full max-h-full shadow-2xl rounded-lg"></canvas>
                            </div>
                        </div>

                        <input type="file" id="crop-input" class="hidden" accept="image/jpeg,image/png,image/webp">
                    </div>
                </div>

                <!-- Toolbar -->
                <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl" style="background: rgba(30,41,59,0.3); border: 1px solid rgba(255,255,255,0.05);">
                    <!-- Aspect Ratio Pills -->
                    <div class="flex flex-col gap-2">
                        <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">Poměr stran</span>
                        <div class="flex flex-wrap gap-1.5">
                            <button data-ratio="free" class="crop-ratio-btn active px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Free</button>
                            <button data-ratio="1" class="crop-ratio-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-all">1:1</button>
                            <button data-ratio="1.7778" class="crop-ratio-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-all">16:9</button>
                            <button data-ratio="1.3333" class="crop-ratio-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-all">4:3</button>
                            <button data-ratio="0.5625" class="crop-ratio-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-all">9:16</button>
                        </div>
                    </div>

                    <!-- Export Format Pills -->
                    <div class="flex flex-col gap-2">
                        <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">Export formát</span>
                        <div class="flex gap-1.5" id="format-toggle">
                            <button data-format="jpeg" class="format-btn active px-3 py-1.5 rounded-lg text-sm font-medium transition-all">JPG</button>
                            <button data-format="png" class="format-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-all">PNG</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Preview Panel (2/5) -->
            <div class="lg:col-span-2 flex flex-col">
                <div class="rounded-2xl overflow-hidden flex-grow flex flex-col" style="background: linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8)); border: 1px solid rgba(255,255,255,0.05);">
                    <!-- Preview Header -->
                    <div class="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <div class="w-2 h-2 rounded-full bg-violet-500"></div>
                        <span class="text-sm text-slate-300 font-medium">Náhled výsledku</span>
                    </div>

                    <!-- Preview Canvas -->
                    <div id="preview-container" class="flex-grow flex items-center justify-center p-6 relative" style="min-height: 280px;">
                        <div id="preview-placeholder" class="text-center">
                            <div class="w-14 h-14 rounded-xl bg-slate-800/30 border border-white/5 flex items-center justify-center mx-auto mb-3">
                                <i data-lucide="image" class="w-6 h-6 text-slate-600"></i>
                            </div>
                            <p class="text-slate-500 text-sm">Náhled se zobrazí<br/>po nahrání obrázku</p>
                        </div>
                        <canvas id="preview-canvas" class="hidden rounded-lg shadow-xl" style="max-width: 100%; max-height: 320px;"></canvas>
                    </div>

                    <!-- Info Bar -->
                    <div id="crop-info" class="hidden px-4 py-3 border-t border-white/5 bg-slate-900/30">
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center gap-4">
                                <div>
                                    <span class="text-slate-500 text-xs">Rozměry</span>
                                    <p id="crop-dimensions" class="text-white font-medium">— × —</p>
                                </div>
                                <div>
                                    <span class="text-slate-500 text-xs">Poměr</span>
                                    <p id="crop-ratio-display" class="text-white font-medium">Free</p>
                                </div>
                            </div>
                            <div>
                                <span class="text-slate-500 text-xs">Formát</span>
                                <p id="crop-format-display" class="text-white font-medium">JPG</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Download Button -->
                <button id="btn-crop" disabled class="mt-4 w-full py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                    <i data-lucide="download" class="w-5 h-5"></i>
                    <span>Stáhnout ořezaný obrázek</span>
                </button>
            </div>
        </div>

        <!-- Responsive Styles -->
        <style>
            .crop-ratio-btn {
                background: rgba(51, 65, 85, 0.5);
                color: #94a3b8;
                border: 1px solid transparent;
            }
            .crop-ratio-btn:hover {
                background: rgba(71, 85, 105, 0.6);
                color: #e2e8f0;
            }
            .crop-ratio-btn.active {
                background: rgba(139, 92, 246, 0.2);
                color: #a78bfa;
                border-color: rgba(139, 92, 246, 0.4);
            }
            .format-btn {
                background: rgba(51, 65, 85, 0.5);
                color: #94a3b8;
                border: 1px solid transparent;
            }
            .format-btn:hover {
                background: rgba(71, 85, 105, 0.6);
                color: #e2e8f0;
            }
            .format-btn.active {
                background: rgba(139, 92, 246, 0.2);
                color: #a78bfa;
                border-color: rgba(139, 92, 246, 0.4);
            }
            #btn-crop:not(:disabled):hover {
                transform: translateY(-1px);
                box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.4);
            }
            #crop-dropzone.dragover {
                border-color: #10b981 !important;
                background: rgba(16, 185, 129, 0.05) !important;
            }
            @media (max-width: 1024px) {
                #crop-dropzone {
                    min-height: 280px !important;
                }
                #preview-container {
                    min-height: 200px !important;
                }
            }
        </style>
    `;

    lucide.createIcons();

    // State
    const cropState = {
        image: null,
        fileName: '',
        mimeType: 'image/jpeg',
        naturalWidth: 0,
        naturalHeight: 0,
        displayWidth: 0,
        displayHeight: 0,
        offsetX: 0,
        offsetY: 0,
        aspectRatio: null,
        crop: { x: 0, y: 0, width: 0, height: 0 },
        dragMode: null,
        dragStart: null,
        resizeHandle: null,
        scale: 1,
        format: 'jpeg'
    };

    // DOM Elements
    const dropzone = document.getElementById('crop-dropzone');
    const input = document.getElementById('crop-input');
    const placeholder = document.getElementById('crop-placeholder');
    const workspace = document.getElementById('crop-workspace');
    const canvas = document.getElementById('crop-canvas');
    const ctx = canvas.getContext('2d');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    const previewPlaceholder = document.getElementById('preview-placeholder');
    const cropInfo = document.getElementById('crop-info');
    const cropDimensions = document.getElementById('crop-dimensions');
    const btnCrop = document.getElementById('btn-crop');
    const btnReset = document.getElementById('crop-reset');
    const ratioBtns = document.querySelectorAll('.crop-ratio-btn');

    const MIN_CROP_SIZE = 60;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    // Setup dropzone
    dropzone.addEventListener('click', (e) => {
        if (e.target.closest('#crop-reset')) return;
        if (!cropState.image) input.click();
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-emerald-500', 'bg-slate-800/30');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-emerald-500', 'bg-slate-800/30');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-emerald-500', 'bg-slate-800/30');
        if (e.dataTransfer.files.length) loadImage(e.dataTransfer.files[0]);
    });

    input.addEventListener('change', (e) => {
        if (e.target.files.length) loadImage(e.target.files[0]);
    });

    btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        resetCropTool();
    });

    // Ratio buttons
    ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioBtns.forEach(b => {
                b.classList.remove('active', 'bg-violet-500');
                b.classList.add('bg-slate-700');
            });
            btn.classList.add('active', 'bg-violet-500');
            btn.classList.remove('bg-slate-700');

            const ratio = btn.dataset.ratio;
            cropState.aspectRatio = ratio === 'free' ? null : parseFloat(ratio);
            if (cropState.image) {
                applyAspectRatio();
                renderCropUI();
                updateCropPreview();
            }
        });
    });

    // Format buttons
    const formatBtns = document.querySelectorAll('.format-btn');
    const formatDisplay = document.getElementById('crop-format-display');
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            cropState.format = btn.dataset.format;
            if (formatDisplay) {
                formatDisplay.textContent = btn.dataset.format === 'png' ? 'PNG' : 'JPG';
            }
        });
    });

    // Load image
    async function loadImage(file) {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
            showToast('Podporované formáty: JPG, PNG, WebP', 'error');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            showToast('Maximální velikost souboru je 20MB', 'error');
            return;
        }

        cropState.fileName = file.name;
        cropState.mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

        const img = new Image();
        img.onload = () => {
            cropState.image = img;
            cropState.naturalWidth = img.naturalWidth;
            cropState.naturalHeight = img.naturalHeight;

            placeholder.classList.add('hidden');
            workspace.classList.remove('hidden');
            btnCrop.disabled = false;

            setupCanvas();
            initCropRect();
            renderCropUI();
            updateCropPreview();
        };
        img.src = URL.createObjectURL(file);
    }

    // Setup canvas dimensions
    function setupCanvas() {
        const container = workspace;
        const maxW = container.clientWidth || 400;
        const maxH = 400;

        const imgRatio = cropState.naturalWidth / cropState.naturalHeight;
        let dispW, dispH;

        if (imgRatio > maxW / maxH) {
            dispW = maxW;
            dispH = maxW / imgRatio;
        } else {
            dispH = maxH;
            dispW = maxH * imgRatio;
        }

        canvas.width = dispW;
        canvas.height = dispH;
        canvas.style.width = dispW + 'px';
        canvas.style.height = dispH + 'px';

        cropState.displayWidth = dispW;
        cropState.displayHeight = dispH;
        cropState.scale = cropState.naturalWidth / dispW;
    }

    // Initialize crop rectangle
    function initCropRect() {
        const imgRatio = cropState.displayWidth / cropState.displayHeight;
        let initW = cropState.displayWidth * 0.8;
        let initH = cropState.displayHeight * 0.8;

        if (cropState.aspectRatio) {
            if (imgRatio > cropState.aspectRatio) {
                initW = initH * cropState.aspectRatio;
            } else {
                initH = initW / cropState.aspectRatio;
            }
        }

        initW = Math.max(MIN_CROP_SIZE, initW);
        initH = Math.max(MIN_CROP_SIZE, initH);

        cropState.crop = {
            x: (cropState.displayWidth - initW) / 2,
            y: (cropState.displayHeight - initH) / 2,
            width: initW,
            height: initH
        };
    }

    // Apply aspect ratio while preserving position
    function applyAspectRatio() {
        if (!cropState.aspectRatio) return;

        const { x, y, width, height } = cropState.crop;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        let newW, newH;
        const currentRatio = width / height;

        if (currentRatio > cropState.aspectRatio) {
            newW = width;
            newH = width / cropState.aspectRatio;
        } else {
            newH = height;
            newW = height * cropState.aspectRatio;
        }

        // Ensure minimum size
        if (newW < MIN_CROP_SIZE) {
            newW = MIN_CROP_SIZE;
            newH = newW / cropState.aspectRatio;
        }
        if (newH < MIN_CROP_SIZE) {
            newH = MIN_CROP_SIZE;
            newW = newH * cropState.aspectRatio;
        }

        // Center and clamp
        let newX = centerX - newW / 2;
        let newY = centerY - newH / 2;

        cropState.crop = clampCropRect({ x: newX, y: newY, width: newW, height: newH });
    }

    // Clamp crop rect within image bounds
    function clampCropRect(rect) {
        let { x, y, width, height } = rect;

        // Ensure minimum size
        width = Math.max(MIN_CROP_SIZE, width);
        height = Math.max(MIN_CROP_SIZE, height);

        // Apply aspect ratio if set
        if (cropState.aspectRatio) {
            const ratio = cropState.aspectRatio;
            if (width / height > ratio) {
                width = height * ratio;
            } else {
                height = width / ratio;
            }
            width = Math.max(MIN_CROP_SIZE, width);
            height = Math.max(MIN_CROP_SIZE, height);
        }

        // Clamp to canvas bounds
        x = Math.max(0, Math.min(x, cropState.displayWidth - width));
        y = Math.max(0, Math.min(y, cropState.displayHeight - height));

        return { x, y, width, height };
    }

    // Render crop UI
    function renderCropUI() {
        if (!cropState.image) return;

        const { x, y, width, height } = cropState.crop;

        // Clear and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(cropState.image, 0, 0, cropState.displayWidth, cropState.displayHeight);

        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, cropState.displayWidth, cropState.displayHeight);

        // Clear crop area
        ctx.clearRect(x, y, width, height);
        ctx.drawImage(cropState.image,
            x * cropState.scale, y * cropState.scale,
            width * cropState.scale, height * cropState.scale,
            x, y, width, height
        );

        // Draw crop border
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw corner handles
        const handleSize = 12;
        ctx.fillStyle = '#8b5cf6';

        // Top-left
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        // Top-right
        ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
        // Bottom-left
        ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
        // Bottom-right
        ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);

        // Draw grid lines (rule of thirds)
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 1;

        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(x + width/3, y);
        ctx.lineTo(x + width/3, y + height);
        ctx.moveTo(x + 2*width/3, y);
        ctx.lineTo(x + 2*width/3, y + height);
        // Horizontal lines
        ctx.moveTo(x, y + height/3);
        ctx.lineTo(x + width, y + height/3);
        ctx.moveTo(x, y + 2*height/3);
        ctx.lineTo(x + width, y + 2*height/3);
        ctx.stroke();
    }

    // Update crop preview
    function updateCropPreview() {
        if (!cropState.image) return;

        const { x, y, width, height } = cropState.crop;
        const scale = cropState.scale;

        // Calculate actual crop dimensions in original image pixels
        const actualX = Math.round(x * scale);
        const actualY = Math.round(y * scale);
        const actualW = Math.round(width * scale);
        const actualH = Math.round(height * scale);

        // Set preview canvas size
        const maxPreviewSize = 300;
        const previewRatio = actualW / actualH;
        let previewW, previewH;

        if (previewRatio > 1) {
            previewW = Math.min(maxPreviewSize, actualW);
            previewH = previewW / previewRatio;
        } else {
            previewH = Math.min(maxPreviewSize, actualH);
            previewW = previewH * previewRatio;
        }

        previewCanvas.width = previewW;
        previewCanvas.height = previewH;

        // Draw cropped area to preview
        previewCtx.drawImage(
            cropState.image,
            actualX, actualY, actualW, actualH,
            0, 0, previewW, previewH
        );

        previewPlaceholder.classList.add('hidden');
        previewCanvas.classList.remove('hidden');
        cropInfo.classList.remove('hidden');
        cropDimensions.textContent = `${actualW} × ${actualH} px`;
    }

    // Mouse/Touch event handlers
    function getEventPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function getResizeHandle(pos) {
        const { x, y, width, height } = cropState.crop;
        const handleSize = 16;
        const handles = {
            'nw': { x: x, y: y },
            'ne': { x: x + width, y: y },
            'sw': { x: x, y: y + height },
            'se': { x: x + width, y: y + height }
        };

        for (const [name, handle] of Object.entries(handles)) {
            if (Math.abs(pos.x - handle.x) < handleSize && Math.abs(pos.y - handle.y) < handleSize) {
                return name;
            }
        }
        return null;
    }

    function isInsideCrop(pos) {
        const { x, y, width, height } = cropState.crop;
        return pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height;
    }

    function updateCursor(pos) {
        const handle = getResizeHandle(pos);
        if (handle === 'nw' || handle === 'se') {
            canvas.style.cursor = 'nwse-resize';
        } else if (handle === 'ne' || handle === 'sw') {
            canvas.style.cursor = 'nesw-resize';
        } else if (isInsideCrop(pos)) {
            canvas.style.cursor = 'move';
        } else {
            canvas.style.cursor = 'default';
        }
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        if (!cropState.image) return;
        e.preventDefault();

        const pos = getEventPos(e);
        const handle = getResizeHandle(pos);

        if (handle) {
            cropState.dragMode = 'resize';
            cropState.resizeHandle = handle;
        } else if (isInsideCrop(pos)) {
            cropState.dragMode = 'move';
        }

        cropState.dragStart = { ...pos, crop: { ...cropState.crop } };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!cropState.image) return;

        const pos = getEventPos(e);

        if (cropState.dragMode) {
            const dx = pos.x - cropState.dragStart.x;
            const dy = pos.y - cropState.dragStart.y;
            const original = cropState.dragStart.crop;

            if (cropState.dragMode === 'move') {
                cropState.crop = clampCropRect({
                    x: original.x + dx,
                    y: original.y + dy,
                    width: original.width,
                    height: original.height
                });
            } else if (cropState.dragMode === 'resize') {
                let newX = original.x;
                let newY = original.y;
                let newW = original.width;
                let newH = original.height;

                switch (cropState.resizeHandle) {
                    case 'nw':
                        newX = original.x + dx;
                        newY = original.y + dy;
                        newW = original.width - dx;
                        newH = original.height - dy;
                        break;
                    case 'ne':
                        newY = original.y + dy;
                        newW = original.width + dx;
                        newH = original.height - dy;
                        break;
                    case 'sw':
                        newX = original.x + dx;
                        newW = original.width - dx;
                        newH = original.height + dy;
                        break;
                    case 'se':
                        newW = original.width + dx;
                        newH = original.height + dy;
                        break;
                }

                // Apply aspect ratio constraint during resize
                if (cropState.aspectRatio) {
                    const ratio = cropState.aspectRatio;
                    if (cropState.resizeHandle === 'nw' || cropState.resizeHandle === 'se') {
                        newH = newW / ratio;
                    } else {
                        newW = newH * ratio;
                    }
                }

                // Only apply if new dimensions are valid
                if (newW >= MIN_CROP_SIZE && newH >= MIN_CROP_SIZE) {
                    cropState.crop = clampCropRect({ x: newX, y: newY, width: newW, height: newH });
                }
            }

            renderCropUI();
            updateCropPreview();
        } else {
            updateCursor(pos);
        }
    });

    canvas.addEventListener('mouseup', () => {
        cropState.dragMode = null;
        cropState.resizeHandle = null;
    });

    canvas.addEventListener('mouseleave', () => {
        if (!cropState.dragMode) {
            canvas.style.cursor = 'default';
        }
    });

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        if (!cropState.image) return;
        e.preventDefault();

        const pos = getEventPos(e);
        const handle = getResizeHandle(pos);

        if (handle) {
            cropState.dragMode = 'resize';
            cropState.resizeHandle = handle;
        } else if (isInsideCrop(pos)) {
            cropState.dragMode = 'move';
        }

        cropState.dragStart = { ...pos, crop: { ...cropState.crop } };
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!cropState.image || !cropState.dragMode) return;
        e.preventDefault();

        const pos = getEventPos(e);
        const dx = pos.x - cropState.dragStart.x;
        const dy = pos.y - cropState.dragStart.y;
        const original = cropState.dragStart.crop;

        if (cropState.dragMode === 'move') {
            cropState.crop = clampCropRect({
                x: original.x + dx,
                y: original.y + dy,
                width: original.width,
                height: original.height
            });
        } else if (cropState.dragMode === 'resize') {
            let newX = original.x;
            let newY = original.y;
            let newW = original.width;
            let newH = original.height;

            switch (cropState.resizeHandle) {
                case 'nw':
                    newX = original.x + dx;
                    newY = original.y + dy;
                    newW = original.width - dx;
                    newH = original.height - dy;
                    break;
                case 'ne':
                    newY = original.y + dy;
                    newW = original.width + dx;
                    newH = original.height - dy;
                    break;
                case 'sw':
                    newX = original.x + dx;
                    newW = original.width - dx;
                    newH = original.height + dy;
                    break;
                case 'se':
                    newW = original.width + dx;
                    newH = original.height + dy;
                    break;
            }

            if (cropState.aspectRatio) {
                const ratio = cropState.aspectRatio;
                if (cropState.resizeHandle === 'nw' || cropState.resizeHandle === 'se') {
                    newH = newW / ratio;
                } else {
                    newW = newH * ratio;
                }
            }

            if (newW >= MIN_CROP_SIZE && newH >= MIN_CROP_SIZE) {
                cropState.crop = clampCropRect({ x: newX, y: newY, width: newW, height: newH });
            }
        }

        renderCropUI();
        updateCropPreview();
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        cropState.dragMode = null;
        cropState.resizeHandle = null;
    });

    // Export cropped image
    btnCrop.addEventListener('click', () => {
        if (!cropState.image) return;

        const { x, y, width, height } = cropState.crop;
        const scale = cropState.scale;

        const actualX = Math.round(x * scale);
        const actualY = Math.round(y * scale);
        const actualW = Math.round(width * scale);
        const actualH = Math.round(height * scale);

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = actualW;
        exportCanvas.height = actualH;
        const exportCtx = exportCanvas.getContext('2d');

        exportCtx.drawImage(
            cropState.image,
            actualX, actualY, actualW, actualH,
            0, 0, actualW, actualH
        );

        const format = cropState.format;
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const extension = format === 'png' ? 'png' : 'jpg';

        exportCanvas.toBlob((blob) => {
            const baseName = cropState.fileName.replace(/\.[^/.]+$/, '');
            downloadBlob(blob, `cropped-${baseName}.${extension}`);
            showToast('Obrázek byl stažen', 'success');
        }, mimeType, 0.95);
    });

    // Reset function
    function resetCropTool() {
        cropState.image = null;
        cropState.fileName = '';
        cropState.naturalWidth = 0;
        cropState.naturalHeight = 0;
        cropState.displayWidth = 0;
        cropState.displayHeight = 0;
        cropState.crop = { x: 0, y: 0, width: 0, height: 0 };
        cropState.dragMode = null;
        cropState.aspectRatio = null;
        cropState.format = 'jpeg';

        placeholder.classList.remove('hidden');
        workspace.classList.add('hidden');
        previewPlaceholder.classList.remove('hidden');
        previewCanvas.classList.add('hidden');
        cropInfo.classList.add('hidden');
        btnCrop.disabled = true;
        input.value = '';

        // Reset ratio buttons
        ratioBtns.forEach(btn => {
            btn.classList.remove('active', 'bg-violet-500');
            btn.classList.add('bg-slate-700');
        });
        ratioBtns[0].classList.add('active', 'bg-violet-500');
        ratioBtns[0].classList.remove('bg-slate-700');

        // Reset format buttons
        formatBtns.forEach(btn => btn.classList.remove('active'));
        formatBtns[0].classList.add('active');
        if (formatDisplay) formatDisplay.textContent = 'JPG';
    }
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
                <h2 class="text-4xl font-semibold text-white mb-3">Merge PDF</h2>
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
                    <button id="btn-merge" class="w-full bg-[#10b981] hover:bg-[#059669] text-white keep-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
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
                <p class="text-sky-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Split PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Split PDF</h2>
                <p class="text-slate-400">Rozdělit PDF na části nebo jednotlivé stránky.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div id="split-upload-area" class="h-full min-h-[300px]">
                        ${createDropzone('split-dz', 'application/pdf', 'Nahrajte PDF soubor', 'upload', true)}
                    </div>
                    <div id="split-info-area" class="hidden border border-sky-500/30 bg-sky-900/10 rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-white">Soubor načten</h3>
                                <p id="split-filename" class="text-slate-400 text-sm truncate max-w-[200px]"></p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span id="split-pages-badge" class="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full"></span>
                                <button onclick="resetSplit()" class="text-sm text-sky-400 hover:text-sky-300 underline">Změnit</button>
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
                        <input type="number" id="split-new-point" placeholder="Číslo stránky (např. 3)" min="1" class="flex-grow bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-sky-500 outline-none">
                        <button id="btn-add-split-point" class="bg-sky-500/20 text-sky-400 px-4 rounded-lg border border-sky-500/30 hover:bg-sky-500/30 transition-colors disabled:opacity-50">
                            <i data-lucide="plus" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <div class="bg-[#1E293B] rounded-xl p-4 mb-4">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="split-independent-copy" class="w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-500 bg-[#0B0F19]">
                            <span class="text-slate-300">Vytvořit nezávislou kopii (2 PDF ve složce)</span>
                        </label>
                        <p class="text-slate-500 text-xs mt-1 ml-6">Pokud zaškrtnuto, vytvoří se složka s oběma částmi.</p>
                    </div>

                    <div class="mt-auto space-y-3">
                        <button id="btn-split-custom" class="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50" disabled>
                            Rozdělit podle bodů
                        </button>
                        <button id="btn-split-burst" class="w-full bg-transparent border border-slate-700 hover:border-sky-500 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
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
                        <span class="text-sky-400 font-bold">${point.page}</span>
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
            const independentCopy = document.getElementById('split-independent-copy')?.checked || false;
            dividers.forEach(divider => {
                const afterPage = parseInt(divider.dataset.afterPage);
                const splitPoint = splitPoints.find(p => p.page === afterPage);
                if (splitPoint) {
                    // Žlutá pro nezávislou kopii, zelená pro normální rozdělení
                    if (splitPoint.independentCopy) {
                        divider.style.background = '#eab308';
                        divider.style.boxShadow = '0 0 8px rgba(234, 179, 8, 0.5)';
                    } else {
                        divider.style.background = '#10b981';
                        divider.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.5)';
                    }
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
                    thumb.className = 'split-thumb border border-slate-600 rounded overflow-hidden bg-white relative flex-shrink-0 cursor-pointer';
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

                        // Hover efekt - barva podle checkbox stavu
                        divider.addEventListener('mouseenter', () => {
                            const independentCopy = document.getElementById('split-independent-copy')?.checked || false;
                            if (!splitPoints.some(p => p.page === parseInt(divider.dataset.afterPage))) {
                                divider.style.background = independentCopy ? 'rgba(234, 179, 8, 0.5)' : 'rgba(168, 85, 247, 0.5)';
                            }
                        });
                        divider.addEventListener('mouseleave', () => {
                            if (!splitPoints.some(p => p.page === parseInt(divider.dataset.afterPage))) {
                                divider.style.background = 'rgba(51, 65, 85, 0.3)';
                            }
                        });

                        divider.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const pageNum = parseInt(divider.dataset.afterPage);
                            const independentCopy = document.getElementById('split-independent-copy')?.checked || false;
                            const existingIdx = splitPoints.findIndex(p => p.page === pageNum);

                            if (existingIdx >= 0) {
                                splitPoints.splice(existingIdx, 1);
                            } else {
                                splitPoints.push({ page: pageNum, independentCopy });
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
                    <h2 class="text-5xl font-semibold text-white mb-4 leading-tight">
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
            colorClass = { text: 'text-emerald-500', bgLight: 'bg-emerald-500/10', borderLight: 'border-emerald-500/20', btnBg: 'bg-emerald-500', btnHover: 'bg-emerald-600' };
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
                    <h2 class="text-5xl font-semibold text-white mb-4 leading-tight">
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
      let orgGridHandler = null;

      const SOURCE_COLORS = [
        { bg: 'rgba(234,179,8,0.15)',  border: '#eab308', badge: 'bg-yellow-500',  text: 'text-yellow-300'  },
        { bg: 'rgba(14,165,233,0.15)', border: '#10b981', badge: 'bg-sky-500',  text: 'text-sky-300'  },
        { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', badge: 'bg-red-500',     text: 'text-red-300'     },
        { bg: 'rgba(59,130,246,0.15)', border: '#3b82f6', badge: 'bg-blue-500',    text: 'text-blue-300'    },
        { bg: 'rgba(34,197,94,0.15)',  border: '#22c563', badge: 'bg-green-500',   text: 'text-green-300'   },
      ];

      // === HTML ===
      container.innerHTML = `
        <div class="text-center mb-8">
          <p class="text-emerald-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Organize PDF</p>
          <h2 class="text-4xl font-semibold text-white mb-3">Organize PDF</h2>
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
            style="background: #10b981;">
            <i data-lucide="plus" class="w-4 h-4"></i> Přidat dokument
          </button>
          <input type="file" id="org-file-input" class="hidden" accept="application/pdf" multiple>
        </div>

        <!-- Dokumenty grid -->
        <div id="org-docs-grid"
          class="grid gap-4 mb-6"
          style="grid-template-columns: repeat(1, 1fr);">
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
            style="background: #10b981;" disabled>
            <i data-lucide="combine" class="w-5 h-5"></i> Sloučit vše & Stáhnout
          </button>
          <button id="org-sep-btn"
            class="flex items-center justify-center gap-2 px-6 font-bold py-4 rounded-xl
                   border border-slate-700 hover:border-emerald-500 text-white transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
            disabled>
            <i data-lucide="download" class="w-5 h-5"></i> Stáhnout zvlášť
          </button>
        </div>
      `;

      lucide.createIcons();
      setupGlobalDragHandler();

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

      function updateGridLayout() {
        const grid = document.getElementById('org-docs-grid');
        const docCount = orgDocuments.length;

        // Max 3 sloupce, min 1
        let columns;
        if (docCount <= 1) columns = 1;
        else if (docCount === 2) columns = 2;
        else columns = 3;

        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      }

      // Spočítá velikost náhledu podle počtu dokumentů a stránek
      function getThumbSize() {
        const grid = document.getElementById('org-docs-grid');
        const gridWidth = grid.clientWidth;
        const docCount = Math.max(1, orgDocuments.length);

        // Kolik sloupců
        let columns;
        if (docCount <= 1) columns = 1;
        else if (docCount === 2) columns = 2;
        else columns = 3;

        // Dostupná šířka na jeden dokument (s paddingem)
        const gap = 16; // gap-4 = 1rem = 16px
        const containerPadding = 12; // p-3
        const thumbGap = 8; // gap-2
        const availableWidth = (gridWidth - (columns - 1) * gap) / columns;
        const innerWidth = availableWidth - containerPadding * 2;

        // Počet stránek na řádek v kontejneru
        // Cílíme na cca 4-6 stránek na řádek podle dostupné šířky
        const pagesPerRow = Math.max(3, Math.min(8, Math.floor(innerWidth / 80)));

        // Velikost náhledu
        const thumbWidth = Math.floor((innerWidth - (pagesPerRow - 1) * thumbGap) / pagesPerRow);
        const thumbHeight = Math.floor(thumbWidth * 1.4); // A4 poměr

        return {
          width: Math.max(60, Math.min(150, thumbWidth)),
          height: Math.max(85, Math.min(210, thumbHeight)),
          scale: Math.min(0.8, thumbWidth / 200)
        };
      }

      async function renderDocument(doc) {
        const grid = document.getElementById('org-docs-grid');
        const placeholder = document.getElementById('org-placeholder');
        if (placeholder) placeholder.remove();

        // Odstraň existující element pokud tam je
        const existing = document.getElementById(doc.id);
        if (existing) existing.remove();

        updateGridLayout();

        const c = getColor(doc.sourceIdx);
        const thumbSize = getThumbSize();

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
               class="pages-container p-3 flex flex-wrap justify-start gap-2 min-h-[100px]"
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

        const thumbSize = getThumbSize();

        try {
          // VŽDY vytvoř novou kopii pro pdfjsLib
          const pdfData = new Uint8Array(doc.bytes);
          const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;

          for (let i = 0; i < doc.pages.length; i++) {
            const pageData = doc.pages[i];

            // Pokud už máme imgSrc, neregeneruj
            if (!pageData.imgSrc) {
              const page = await pdf.getPage(pageData.pageIndex + 1);
              const viewport = page.getViewport({scale: thumbSize.scale || 0.5});
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport
              }).promise;
              pageData.imgSrc = canvas.toDataURL('image/jpeg', 0.8);
              pageData.thumbWidth = viewport.width;
              pageData.thumbHeight = viewport.height;
            }

            container.appendChild(createPageThumb(doc, i, pageData, thumbSize));
          }

          container.appendChild(createEndDropZone(doc.id, thumbSize));

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

      function createPageThumb(doc, localIdx, pageData, thumbSize) {
        const c = getColor(doc.sourceIdx);
        const imgSrc = pageData.imgSrc;
        const width = thumbSize?.width || 72;
        const height = thumbSize?.height || 100;

        const div = document.createElement('div');
        div.className = 'page-thumb relative rounded-lg overflow-hidden cursor-grab select-none transition-all duration-150';
        div.style.cssText = `width: ${width}px; height: ${height}px; border: 2px solid ${c.border}; background: ${c.bg};`;
        div.draggable = true;
        div.dataset.docId = doc.id;
        div.dataset.localIdx = localIdx;
        div.dataset.sourceIdx = doc.sourceIdx;
        div.dataset.pageIndex = pageData.pageIndex;
        div.dataset.imgSrc = imgSrc;

        div.innerHTML = `
          <img src="${imgSrc}" class="w-full h-full object-contain bg-white">
          <div class="absolute top-0 left-0 right-0 flex justify-between items-start p-0.5">
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                  style="background: ${c.border};">
              ${pageData.pageIndex + 1}
            </span>
            <button class="del-btn opacity-0 bg-red-500 hover:bg-red-600 text-white rounded w-5 h-5 text-xs font-bold flex items-center justify-center leading-none transition-opacity">
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
          div.style.opacity = '0.4';
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', 'page');
        });

        div.addEventListener('dragend', () => {
          div.style.opacity = '1';
          cleanupDrag();
        });

        return div;
      }

      // Cleanup po drag
      function cleanupDrag() {
        orgDraggedData = null;
        orgDragOverTarget = null;
        document.querySelectorAll('.org-ghost').forEach(g => g.remove());
        document.querySelectorAll('.page-thumb').forEach(t => {
          t.style.outline = '';
          t.style.opacity = '1';
        });
        document.querySelectorAll('.org-end-zone').forEach(z => {
          z.style.borderColor = '';
          z.style.background = '';
        });
      }

      // === GHOST PLACEHOLDER ===

      function createGhostPlaceholder(imgSrc, sourceIdx) {
        const c = getColor(sourceIdx);
        const thumbSize = getThumbSize();
        const width = thumbSize?.width || 72;
        const height = thumbSize?.height || 100;

        const ghost = document.createElement('div');
        ghost.className = 'org-ghost rounded-lg overflow-hidden';
        ghost.style.cssText = `
          width: ${width}px;
          height: ${height}px;
          border: 2px dashed ${c.border};
          background: ${c.bg};
          opacity: 0.8;
          flex-shrink: 0;
          pointer-events: none;
        `;
        ghost.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-contain opacity-70">`;
        return ghost;
      }

      // === DROP ZONE NA KONCI ===

      function createEndDropZone(docId, thumbSize) {
        const width = thumbSize?.width || 72;
        const height = thumbSize?.height || 100;

        const zone = document.createElement('div');
        zone.className = 'org-end-zone flex-shrink-0 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs transition-all';
        zone.style.cssText = `width: ${width}px; height: ${height}px;`;
        zone.dataset.docId = docId;
        zone.innerHTML = '<i data-lucide="plus" class="w-5 h-5"></i>';
        lucide.createIcons();

        return zone;
      }

      // === GLOBÁLNÍ DRAG HANDLER NA DOKUMENTY ===

      function setupGlobalDragHandler() {
        const grid = document.getElementById('org-docs-grid');

        // Odstraň starý handler pokud existuje
        if (orgGridHandler) {
          grid.removeEventListener('dragover', orgGridHandler.dragover);
          grid.removeEventListener('drop', orgGridHandler.drop);
          grid.removeEventListener('dragleave', orgGridHandler.dragleave);
        }

        const handlers = {
          dragover: (e) => {
            e.preventDefault();
            if (!orgDraggedData) return;

            // Najdi nejbližší element pod myší
            const thumbs = Array.from(grid.querySelectorAll('.page-thumb'));
            const zones = Array.from(grid.querySelectorAll('.org-end-zone'));

            // Odstraň staré ghosty
            grid.querySelectorAll('.org-ghost').forEach(g => g.remove());
            grid.querySelectorAll('.page-thumb').forEach(t => t.style.outline = '');

            let targetDoc = null;
            let targetIdx = -1;
            let insertBefore = true;

            // Zjisti, jestli jsme nad nějakou stránkou
            for (const thumb of thumbs) {
              const rect = thumb.getBoundingClientRect();
              if (e.clientX >= rect.left && e.clientX <= rect.right &&
                  e.clientY >= rect.top && e.clientY <= rect.bottom) {
                targetDoc = thumb.dataset.docId;
                targetIdx = parseInt(thumb.dataset.localIdx);
                insertBefore = e.clientX < rect.left + rect.width / 2;

                // Zobraz ghost
                const ghost = createGhostPlaceholder(orgDraggedData.imgSrc, orgDraggedData.sourceIdx);
                if (insertBefore) {
                  thumb.parentNode.insertBefore(ghost, thumb);
                } else {
                  thumb.parentNode.insertBefore(ghost, thumb.nextSibling);
                }
                thumb.style.outline = '3px solid #10b981';
                break;
              }
            }

            // Pokud nejsme nad stránkou, zkus end zone
            if (targetIdx === -1) {
              for (const zone of zones) {
                const rect = zone.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                  targetDoc = zone.dataset.docId;
                  targetIdx = -1;
                  zone.style.borderColor = getColor(orgDraggedData.sourceIdx).border;
                  zone.style.background = getColor(orgDraggedData.sourceIdx).bg;
                  break;
                }
              }
            } else {
              zones.forEach(z => { z.style.borderColor = ''; z.style.background = ''; });
            }

            orgDragOverTarget = targetIdx >= -1 && targetDoc ? {
              docId: targetDoc,
              localIdx: targetIdx,
              insertBefore: insertBefore
            } : null;
          },

          drop: (e) => {
            e.preventDefault();
            if (!orgDraggedData || !orgDragOverTarget) {
              cleanupDrag();
              return;
            }
            performDrop(orgDragOverTarget);
          },

          dragleave: (e) => {
            if (!grid.contains(e.relatedTarget)) {
              cleanupDrag();
            }
          }
        };

        grid.addEventListener('dragover', handlers.dragover);
        grid.addEventListener('drop', handlers.drop);
        grid.addEventListener('dragleave', handlers.dragleave);

        orgGridHandler = handlers;
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
              // Aktualizuj grid a překresli zbývající
              updateGridLayout();
              orgDocuments.forEach(d => renderPages(d));
          } else {
              // Re-render jen dotčené dokumenty
              const toRender = fromDocId === toDocId
                  ? [toDoc]
                  : [fromDoc, toDoc].filter(d => d.pages.length > 0);
              toRender.forEach(d => renderPages(d));
          }

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
        } else {
          // Aktualizuj grid a překresli všechny dokumenty
          updateGridLayout();
          orgDocuments.forEach(doc => renderPages(doc));
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

        const newDocs = [];

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
          newDocs.push(doc);
        }

        // Aktualizuj grid layout
        updateGridLayout();

        // Překresli všechny dokumenty s novou velikostí
        for (const doc of orgDocuments) {
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
                <h2 class="text-4xl font-semibold text-white mb-2">Analyzátor obrázků<br/><span class="text-yellow-500">AI Vision Pro</span></h2>
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
                <h2 class="text-4xl font-semibold text-white mb-2">AI Vyhledávač<br/><span class="text-teal-500">Smart Search</span></h2>
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
                    <h2 class="text-5xl font-semibold text-white mb-4 leading-tight">
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
                <h2 class="text-4xl font-semibold text-white mb-3">Remove Pages</h2>
                <p class="text-slate-400">Klikněte na stránky, které chcete odstranit. Vybrané stránky se zvýrazní červeně.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div id="remove-upload-area">
                        ${createDropzone('remove-pages-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    </div>
                    <div id="remove-info" class="hidden bg-card border border-border rounded-2xl p-5">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-white font-semibold">Soubor načten</h3>
                                <p id="remove-filename" class="text-slate-400 text-sm truncate max-w-[200px]"></p>
                            </div>
                            <span id="remove-page-count" class="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded-full"></span>
                        </div>
                        <div class="flex items-center gap-2 text-sm">
                            <span class="text-slate-400">Vybráno k odstranění:</span>
                            <span id="remove-selected-count" class="text-red-400 font-bold">0 stránek</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button id="btn-undo-remove" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2" disabled>
                            <i data-lucide="undo-2" class="w-5 h-5"></i> Zpět
                        </button>
                        <button id="btn-clear-remove" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled>
                            Vymazat výběr
                        </button>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Náhled stránek</h3>
                    <p class="text-slate-400 text-sm mb-4">Klikněte na stránku pro výběr k odstranění. Vybrané stránky budou červeně ohraničené.</p>
                    <div id="remove-thumbnails" class="grid grid-cols-3 gap-3 flex-grow overflow-y-auto max-h-[500px] p-2 bg-[#0B0F19] rounded-xl">
                        <div class="col-span-3 text-center text-slate-500 py-8">Nejprve nahrajte PDF soubor</div>
                    </div>
                    <button id="btn-remove-pages" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 mt-4" disabled>
                        <i data-lucide="trash-2" class="w-5 h-5 inline mr-2"></i>Odstranit vybrané stránky
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();

        let pdfBytes = null;
        let pageCount = 0;
        let selectedPages = new Set();
        let removedHistory = []; // For undo

        initDropzone('remove-pages-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return showToast('Vyberte PDF soubor', 'error');
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            pageCount = pdfDoc.getPageCount();
            selectedPages.clear();
            removedHistory = [];

            document.getElementById('remove-filename').innerText = file.name;
            document.getElementById('remove-page-count').innerText = `${pageCount} stránek`;
            document.getElementById('remove-upload-area').classList.add('hidden');
            document.getElementById('remove-info').classList.remove('hidden');
            document.getElementById('btn-clear-remove').disabled = false;

            await renderRemoveThumbnails();
        });

        async function renderRemoveThumbnails() {
            const container = document.getElementById('remove-thumbnails');
            container.innerHTML = '';

            try {
                const pdf = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;

                for (let i = 0; i < pageCount; i++) {
                    const page = await pdf.getPage(i + 1);
                    const viewport = page.getViewport({scale: 0.3});
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({canvasContext: ctx, viewport}).promise;

                    const thumb = document.createElement('div');
                    thumb.className = `relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                        selectedPages.has(i) ? 'border-red-500 shadow-lg shadow-red-500/30' : 'border-slate-700 hover:border-red-400'
                    }`;
                    thumb.dataset.page = i;
                    thumb.innerHTML = `
                        <img src="${canvas.toDataURL()}" class="w-full h-auto block">
                        <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs font-bold py-1 text-center">
                            ${i + 1}
                        </div>
                        <div class="absolute inset-0 bg-red-500/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <i data-lucide="trash-2" class="w-8 h-8 text-white drop-shadow-lg"></i>
                        </div>
                    `;

                    thumb.addEventListener('click', () => {
                        if (selectedPages.has(i)) {
                            selectedPages.delete(i);
                        } else {
                            selectedPages.add(i);
                        }
                        updateRemoveUI();
                    });

                    container.appendChild(thumb);
                }
                lucide.createIcons();
                updateRemoveUI();
            } catch (err) {
                container.innerHTML = `<div class="col-span-3 text-center text-red-400 py-8">Chyba: ${err.message}</div>`;
            }
        }

        function updateRemoveUI() {
            // Update thumbnails
            const thumbs = document.querySelectorAll('#remove-thumbnails > div');
            thumbs.forEach((thumb, i) => {
                if (selectedPages.has(i)) {
                    thumb.className = thumb.className.replace('border-slate-700 hover:border-red-400', 'border-red-500 shadow-lg shadow-red-500/30');
                } else {
                    thumb.className = thumb.className.replace('border-red-500 shadow-lg shadow-red-500/30', 'border-slate-700 hover:border-red-400');
                }
            });

            // Update counter
            document.getElementById('remove-selected-count').innerText = `${selectedPages.size} stránek`;
            document.getElementById('btn-remove-pages').disabled = selectedPages.size === 0;
            document.getElementById('btn-undo-remove').disabled = removedHistory.length === 0;
            document.getElementById('btn-clear-remove').disabled = selectedPages.size === 0;
        }

        document.getElementById('btn-clear-remove').addEventListener('click', () => {
            selectedPages.clear();
            updateRemoveUI();
        });

        document.getElementById('btn-undo-remove').addEventListener('click', () => {
            if (removedHistory.length > 0) {
                selectedPages = removedHistory.pop();
                updateRemoveUI();
            }
        });

        document.getElementById('btn-remove-pages').addEventListener('click', async () => {
            if (!pdfBytes || selectedPages.size === 0) return;
            showLoading('btn-remove-pages', 'Odstraňuji...');
            removedHistory.push(new Set(selectedPages));
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
                pdfBytes = new Uint8Array(newPdf);
                pageCount = newDoc.getPageCount();
                selectedPages.clear();

                document.getElementById('remove-page-count').innerText = `${pageCount} stránek`;
                await renderRemoveThumbnails();
                showToast(`Odstraněno. Zbývá ${pageCount} stránek.`, 'success');
            } catch (e) { showToast('Chyba: ' + e.message, 'error'); }
            hideLoading('btn-remove-pages');
        });
    }

    // --- EXTRACT PAGES ---
    else if (toolId === 'extract-pages') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Extract Pages</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Extract Pages</h2>
                <p class="text-slate-400">Klikněte na stránky, které chcete extrahovat. Vybrané stránky se zvýrazní cyan barvou.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div id="extract-upload-area">
                        ${createDropzone('extract-pages-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                    </div>
                    <div id="extract-info" class="hidden bg-card border border-border rounded-2xl p-5">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-white font-semibold">Soubor načten</h3>
                                <p id="extract-filename" class="text-slate-400 text-sm truncate max-w-[200px]"></p>
                            </div>
                            <span id="extract-page-count" class="bg-slate-800 text-slate-300 text-sm px-3 py-1 rounded-full"></span>
                        </div>
                        <div class="flex items-center gap-2 text-sm">
                            <span class="text-slate-400">Vybráno k extrakci:</span>
                            <span id="extract-selected-count" class="text-cyan-400 font-bold">0 stránek</span>
                        </div>
                    </div>
                    <button id="btn-clear-extract" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50" disabled>
                        Vymazat výběr
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Náhled stránek</h3>
                    <p class="text-slate-400 text-sm mb-4">Klikněte na stránku pro výběr k extrakci.</p>
                    <div id="extract-thumbnails" class="grid grid-cols-3 gap-3 flex-grow overflow-y-auto max-h-[500px] p-2 bg-[#0B0F19] rounded-xl">
                        <div class="col-span-3 text-center text-slate-500 py-8">Nejprve nahrajte PDF soubor</div>
                    </div>
                    <button id="btn-extract-pages" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 mt-4" disabled>
                        <i data-lucide="file-output" class="w-5 h-5 inline mr-2"></i>Extrahovat vybrané stránky
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();

        let pdfBytes = null;
        let pageCount = 0;
        let selectedPages = new Set();

        initDropzone('extract-pages-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return showToast('Vyberte PDF soubor', 'error');
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            pageCount = pdfDoc.getPageCount();
            selectedPages.clear();

            document.getElementById('extract-filename').innerText = file.name;
            document.getElementById('extract-page-count').innerText = `${pageCount} stránek`;
            document.getElementById('extract-upload-area').classList.add('hidden');
            document.getElementById('extract-info').classList.remove('hidden');

            await renderExtractThumbnails();
        });

        async function renderExtractThumbnails() {
            const container = document.getElementById('extract-thumbnails');
            container.innerHTML = '';

            try {
                const pdf = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;

                for (let i = 0; i < pageCount; i++) {
                    const page = await pdf.getPage(i + 1);
                    const viewport = page.getViewport({scale: 0.3});
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({canvasContext: ctx, viewport}).promise;

                    const thumb = document.createElement('div');
                    thumb.className = `relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                        selectedPages.has(i) ? 'border-cyan-500 shadow-lg shadow-cyan-500/30' : 'border-slate-700 hover:border-cyan-400'
                    }`;
                    thumb.dataset.page = i;
                    thumb.innerHTML = `
                        <img src="${canvas.toDataURL()}" class="w-full h-auto block">
                        <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs font-bold py-1 text-center">
                            ${i + 1}
                        </div>
                        <div class="absolute inset-0 bg-cyan-500/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <i data-lucide="file-output" class="w-8 h-8 text-white drop-shadow-lg"></i>
                        </div>
                    `;

                    thumb.addEventListener('click', () => {
                        if (selectedPages.has(i)) {
                            selectedPages.delete(i);
                        } else {
                            selectedPages.add(i);
                        }
                        updateExtractUI();
                    });

                    container.appendChild(thumb);
                }
                lucide.createIcons();
                updateExtractUI();
            } catch (err) {
                container.innerHTML = `<div class="col-span-3 text-center text-red-400 py-8">Chyba: ${err.message}</div>`;
            }
        }

        function updateExtractUI() {
            const thumbs = document.querySelectorAll('#extract-thumbnails > div');
            thumbs.forEach((thumb, i) => {
                if (selectedPages.has(i)) {
                    thumb.className = thumb.className.replace('border-slate-700 hover:border-cyan-400', 'border-cyan-500 shadow-lg shadow-cyan-500/30');
                } else {
                    thumb.className = thumb.className.replace('border-cyan-500 shadow-lg shadow-cyan-500/30', 'border-slate-700 hover:border-cyan-400');
                }
            });

            document.getElementById('extract-selected-count').innerText = `${selectedPages.size} stránek`;
            document.getElementById('btn-extract-pages').disabled = selectedPages.size === 0;
            document.getElementById('btn-clear-extract').disabled = selectedPages.size === 0;
        }

        document.getElementById('btn-clear-extract').addEventListener('click', () => {
            selectedPages.clear();
            updateExtractUI();
        });

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
                showToast(`Extrahováno ${selectedPages.size} stránek`, 'success');
            } catch (e) { showToast('Chyba: ' + e.message, 'error'); }
            hideLoading('btn-extract-pages');
        });
    }

    // --- COMPRESS PDF ---
    else if (toolId === 'compress-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-green-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Compress PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Compress PDF</h2>
                <p class="text-slate-400">Zmenšit velikost PDF souboru.</p>
            </div>
            <div id="compress-upload-area" class="max-w-xl mx-auto">
                ${createDropzone('compress-dz', 'application/pdf', 'Nahrajte PDF soubor')}
            </div>
            <div id="compress-work-area" class="hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-card border border-border rounded-2xl p-6">
                        <h3 class="text-lg font-bold text-white mb-4">Nahraný dokument</h3>
                        <div class="flex items-center gap-4 p-4 bg-[#1E293B] rounded-xl">
                            <div class="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                                <i data-lucide="file-text" class="w-7 h-7"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p id="compress-filename" class="text-white font-bold truncate"></p>
                                <p id="compress-pages" class="text-slate-400 text-sm"></p>
                            </div>
                            <div class="text-right">
                                <p id="compress-original-size" class="text-2xl font-bold text-white"></p>
                                <p class="text-slate-500 text-xs">Původní velikost</p>
                            </div>
                        </div>
                        <button id="btn-compress-change" class="w-full mt-4 py-2 text-green-400 hover:text-green-300 text-sm">
                            <i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i> Nahrát jiný soubor
                        </button>
                    </div>
                    <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                        <h3 class="text-lg font-bold text-white mb-4">Vyberte úroveň komprese</h3>
                        <div class="space-y-3 mb-6 flex-1">
                            <label class="compress-level-btn flex items-center gap-4 p-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl cursor-pointer hover:border-green-500 transition-all group">
                                <input type="radio" name="compress-level" value="low" class="hidden">
                                <div class="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-green-500 flex items-center justify-center">
                                    <div class="w-3 h-3 rounded-full bg-green-500 hidden group-hover:block"></div>
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-white font-medium">Nízká komprese</span>
                                        <span id="size-low" class="text-green-400 font-bold">--</span>
                                    </div>
                                    <p class="text-slate-400 text-xs">Nejlepší kvalita, ~20% zmenšení</p>
                                    <div class="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div class="h-full bg-green-500 w-[20%]"></div>
                                    </div>
                                </div>
                            </label>
                            <label class="compress-level-btn flex items-center gap-4 p-4 bg-[#1E293B] border-2 border-green-500 rounded-xl cursor-pointer hover:border-green-400 transition-all group">
                                <input type="radio" name="compress-level" value="medium" checked class="hidden">
                                <div class="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-white font-medium">Střední komprese</span>
                                        <span id="size-medium" class="text-green-400 font-bold">--</span>
                                    </div>
                                    <p class="text-slate-400 text-xs">Vyvážená kvalita, ~40% zmenšení</p>
                                    <div class="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div class="h-full bg-green-500 w-[40%]"></div>
                                    </div>
                                </div>
                            </label>
                            <label class="compress-level-btn flex items-center gap-4 p-4 bg-[#1E293B] border-2 border-slate-700 rounded-xl cursor-pointer hover:border-green-500 transition-all group">
                                <input type="radio" name="compress-level" value="high" class="hidden">
                                <div class="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-green-500 flex items-center justify-center">
                                    <div class="w-3 h-3 rounded-full bg-green-500 hidden group-hover:block"></div>
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-white font-medium">Vysoká komprese</span>
                                        <span id="size-high" class="text-green-400 font-bold">--</span>
                                    </div>
                                    <p class="text-slate-400 text-xs">Nejmenší velikost, ~60% zmenšení</p>
                                    <div class="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div class="h-full bg-green-500 w-[60%]"></div>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div id="compress-savings" class="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 hidden">
                            <div class="flex items-center justify-between">
                                <span class="text-slate-300">Ušetříte:</span>
                                <span id="compress-savings-value" class="text-green-400 font-bold text-lg">--</span>
                            </div>
                        </div>
                        <button id="btn-compress" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors">
                            Komprimovat PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        let pdfBytes = null;
        let originalSize = 0;
        let pageCount = 0;

        function formatSize(bytes) {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

        function updateEstimatedSizes() {
            // Estimate compression ratios
            const ratios = { low: 0.8, medium: 0.6, high: 0.4 };
            const estimatedLow = Math.round(originalSize * ratios.low);
            const estimatedMedium = Math.round(originalSize * ratios.medium);
            const estimatedHigh = Math.round(originalSize * ratios.high);

            document.getElementById('size-low').textContent = formatSize(estimatedLow);
            document.getElementById('size-medium').textContent = formatSize(estimatedMedium);
            document.getElementById('size-high').textContent = formatSize(estimatedHigh);

            // Show savings for selected level
            updateSavings();
        }

        function updateSavings() {
            const level = document.querySelector('input[name="compress-level"]:checked').value;
            const ratios = { low: 0.8, medium: 0.6, high: 0.4 };
            const newSize = Math.round(originalSize * ratios[level]);
            const savings = originalSize - newSize;

            document.getElementById('compress-savings').classList.remove('hidden');
            document.getElementById('compress-savings-value').textContent = formatSize(savings) + ' (' + Math.round((1 - ratios[level]) * 100) + '%)';
        }

        document.querySelectorAll('.compress-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.compress-level-btn').forEach(b => {
                    b.classList.remove('border-green-500');
                    b.classList.add('border-slate-700');
                    b.querySelector('.w-3')?.classList.add('hidden');
                    b.querySelector('.w-5')?.classList.remove('border-green-500');
                    b.querySelector('.w-5')?.classList.add('border-slate-600');
                });
                btn.classList.remove('border-slate-700');
                btn.classList.add('border-green-500');
                btn.querySelector('.w-3')?.classList.remove('hidden');
                btn.querySelector('.w-5')?.classList.remove('border-slate-600');
                btn.querySelector('.w-5')?.classList.add('border-green-500');
                updateSavings();
            });
        });

        initDropzone('compress-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = await file.arrayBuffer();
            originalSize = file.size;

            // Get page count
            try {
                const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
                pageCount = pdfDoc.getPageCount();
            } catch (e) {
                pageCount = 1;
            }

            document.getElementById('compress-filename').textContent = file.name;
            document.getElementById('compress-pages').textContent = pageCount + ' stránek';
            document.getElementById('compress-original-size').textContent = formatSize(originalSize);

            document.getElementById('compress-upload-area').classList.add('hidden');
            document.getElementById('compress-work-area').classList.remove('hidden');

            updateEstimatedSizes();
        });

        document.getElementById('btn-compress-change').addEventListener('click', () => {
            pdfBytes = null;
            originalSize = 0;
            document.getElementById('compress-upload-area').classList.remove('hidden');
            document.getElementById('compress-work-area').classList.add('hidden');
            document.getElementById('compress-savings').classList.add('hidden');
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
                downloadBlob(new Blob([compressedPdf], {type: 'application/pdf'}), 'compressed.pdf');
            } catch (e) { alert('Chyba: ' + e.message); }
            hideLoading('btn-compress');
        });
    }

    // --- ROTATE PDF ---
    else if (toolId === 'rotate-pdf') {
        container.innerHTML = `
            <div class="max-w-7xl mx-auto w-full">
                <!-- Header -->
                <div class="text-center mb-8">
                    <p class="text-sky-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Rotate PDF</p>
                    <h2 class="text-4xl font-semibold text-white mb-3">Rotate PDF</h2>
                    <p class="text-slate-400">Otočit stránky PDF o 90° nebo 180°.</p>
                </div>

                <!-- Upload Area -->
                <div id="rotate-upload-area" class="max-w-xl mx-auto mb-8">
                    ${createDropzone('rotate-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                </div>

                <!-- Pages Grid -->
                <div id="rotate-work-area" class="hidden">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <span id="rotate-page-count" class="text-white font-bold text-lg"></span>
                            <span class="text-slate-400">stránek</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-slate-400">
                            <i data-lucide="info" class="w-4 h-4"></i>
                            <span>Klikněte na tlačítka u každé stránky pro individuální otáčení</span>
                        </div>
                    </div>

                    <div id="rotate-pages" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-24">
                    </div>
                </div>

                <!-- Floating Control Panel -->
                <div id="rotate-controls" class="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 p-4 z-50 hidden">
                    <div class="max-w-7xl mx-auto flex items-center justify-center gap-4">
                        <button id="btn-rotate-all-left" class="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50" disabled>
                            <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
                            <span>Vše -90°</span>
                        </button>
                        <button id="btn-rotate-all-right" class="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50" disabled>
                            <i data-lucide="rotate-cw" class="w-5 h-5"></i>
                            <span>Vše +90°</span>
                        </button>
                        <div class="w-px h-8 bg-slate-600"></div>
                        <button id="btn-save-rotate" class="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50" disabled>
                            <i data-lucide="download" class="w-5 h-5"></i>
                            <span>Stáhnout PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        let pdfBytes = null;
        let pageRotations = [];

        initDropzone('rotate-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return showToast('Vyberte PDF soubor', 'error');
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            const pageCount = pdfDoc.getPageCount();
            pageRotations = new Array(pageCount).fill(0);

            document.getElementById('rotate-upload-area').classList.add('hidden');
            document.getElementById('rotate-work-area').classList.remove('hidden');
            document.getElementById('rotate-controls').classList.remove('hidden');
            document.getElementById('rotate-page-count').textContent = pageCount;

            document.getElementById('btn-rotate-all-left').disabled = false;
            document.getElementById('btn-rotate-all-right').disabled = false;
            document.getElementById('btn-save-rotate').disabled = false;

            showToast(`Nahráno ${pageCount} stránek`, 'success');
            await renderRotatePages();
        });

        async function renderRotatePages() {
            const pdf = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
            const container = document.getElementById('rotate-pages');
            container.innerHTML = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({scale: 0.4});
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({canvasContext: ctx, viewport: viewport}).promise;

                const imgSrc = canvas.toDataURL();

                const div = document.createElement('div');
                div.className = 'rotate-page-item group';
                div.dataset.pageIdx = i - 1;
                div.innerHTML = `
                    <div class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-sky-500 transition-colors">
                        <!-- Square container for thumbnail - prevents overflow when rotated -->
                        <div class="aspect-square flex items-center justify-center bg-slate-900/50 p-2 relative">
                            <div class="page-img-wrapper w-full h-full flex items-center justify-center">
                                <img src="${imgSrc}" class="max-w-full max-h-full object-contain bg-white rounded shadow-lg transition-transform duration-200">
                            </div>
                            <!-- Page number badge -->
                            <div class="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                                ${i}
                            </div>
                            <!-- Rotation indicator -->
                            <div class="rotate-indicator absolute inset-0 bg-sky-500/10 pointer-events-none hidden rounded-xl"></div>
                        </div>
                        <!-- Rotation controls -->
                        <div class="p-2 flex gap-2 bg-slate-800/50">
                            <button onclick="rotatePageLeft(${i - 1})" class="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors group-hover:bg-slate-600">
                                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                                <span>-90°</span>
                            </button>
                            <button onclick="rotatePageRight(${i - 1})" class="flex-1 flex items-center justify-center gap-1 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 hover:text-sky-300 text-sm font-medium rounded-lg transition-colors">
                                <i data-lucide="rotate-cw" class="w-4 h-4"></i>
                                <span>+90°</span>
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            }
            lucide.createIcons();
        }

        function updatePageRotation(idx) {
            const div = document.querySelector(`.rotate-page-item[data-page-idx="${idx}"]`);
            if (!div) return;

            const img = div.querySelector('img');
            const rotation = pageRotations[idx];

            // Apply rotation with smooth transition
            img.style.transform = `rotate(${rotation}deg)`;

            // Show indicator if rotated
            const indicator = div.querySelector('.rotate-indicator');
            if (rotation !== 0) {
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }

        window.rotatePageLeft = (idx) => {
            pageRotations[idx] = (pageRotations[idx] - 90 + 360) % 360;
            updatePageRotation(idx);
        };

        window.rotatePageRight = (idx) => {
            pageRotations[idx] = (pageRotations[idx] + 90) % 360;
            updatePageRotation(idx);
        };

        document.getElementById('btn-rotate-all-left').addEventListener('click', () => {
            for (let i = 0; i < pageRotations.length; i++) {
                pageRotations[i] = (pageRotations[i] - 90 + 360) % 360;
            }
            document.querySelectorAll('.rotate-page-item').forEach((div, idx) => {
                updatePageRotation(idx);
            });
        });

        document.getElementById('btn-rotate-all-right').addEventListener('click', () => {
            for (let i = 0; i < pageRotations.length; i++) {
                pageRotations[i] = (pageRotations[i] + 90) % 360;
            }
            document.querySelectorAll('.rotate-page-item').forEach((div, idx) => {
                updatePageRotation(idx);
            });
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
                showToast('PDF úspěšně otočeno!', 'success');
            } catch (e) {
                showToast('Chyba: ' + e.message, 'error');
            }
            hideLoading('btn-save-rotate');
        });
    }

    // --- PAGE NUMBERS ---
    else if (toolId === 'page-numbers') {
        container.innerHTML = `
            <div class="max-w-7xl mx-auto w-full">
                <!-- Header -->
                <div class="text-center mb-8">
                    <p class="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Page Numbers</p>
                    <h2 class="text-4xl font-semibold text-white mb-3">Page Numbers</h2>
                    <p class="text-slate-400">Přidat čísla stránek do PDF dokumentu.</p>
                </div>

                <!-- Upload Area -->
                <div id="page-numbers-upload-area" class="max-w-xl mx-auto mb-8">
                    ${createDropzone('page-numbers-dz', 'application/pdf', 'Nahrajte PDF soubor')}
                </div>

                <!-- Work Area -->
                <div id="page-numbers-work-area" class="hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Preview Area -->
                        <div class="lg:col-span-2">
                            <div class="bg-card border border-border rounded-2xl p-4 lg:p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-bold text-white">Náhled</h3>
                                    <span id="page-num-count" class="text-sm text-slate-400"></span>
                                </div>

                                <!-- Single Page Preview with Live Overlay -->
                                <div id="page-num-preview-wrapper" class="relative bg-slate-900 rounded-xl overflow-hidden">
                                    <canvas id="page-num-canvas" class="w-full"></canvas>
                                    <!-- Live Page Number Overlay -->
                                    <div id="page-num-live-overlay" class="absolute pointer-events-none transition-all duration-200"></div>
                                </div>

                                <!-- Page Navigation -->
                                <div class="flex items-center justify-center gap-4 mt-4">
                                    <button id="page-num-prev" class="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-40" disabled>
                                        <i data-lucide="chevron-left" class="w-5 h-5"></i>
                                    </button>
                                    <span id="page-num-nav" class="text-white font-medium min-w-[100px] text-center">Strana 1 z 1</span>
                                    <button id="page-num-next" class="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-40" disabled>
                                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Settings Panel -->
                        <div class="bg-card border border-border rounded-2xl p-4 lg:p-6 flex flex-col">
                            <h3 class="text-lg font-bold text-white mb-4">Nastavení</h3>

                            <!-- Position Grid -->
                            <div class="mb-5">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Pozice čísla</label>
                                <div class="grid grid-cols-3 gap-2">
                                    <button data-pos="top-left" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute -top-1 -left-1 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="top-center" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="top-right" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute -top-1 -right-1 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="middle-left" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="middle-center" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="middle-right" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="bottom-left" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute -bottom-1 -left-1 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="bottom-center" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border-2 border-blue-500 bg-blue-500/20 rounded-lg transition-all">
                                        <div class="w-8 h-10 border border-blue-400 rounded relative">
                                            <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></span>
                                        </div>
                                    </button>
                                    <button data-pos="bottom-right" class="pos-btn aspect-square flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-all">
                                        <div class="w-8 h-10 border border-slate-500 rounded relative">
                                            <span class="absolute -bottom-1 -right-1 w-2 h-2 bg-slate-500 rounded-full"></span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <!-- Format -->
                            <div class="mb-4">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Formát</label>
                                ${createCustomSelect('page-num-format', [
                                    {value: '{page}', label: '1'},
                                    {value: 'Strana {page}', label: 'Strana 1'},
                                    {value: '{page} / {total}', label: '1 / 10'},
                                    {value: '- {page} -', label: '- 1 -'},
                                    {value: 'Page {page} of {total}', label: 'Page 1 of 10'}
                                ], '1')}
                            </div>

                            <!-- Font Size -->
                            <div class="mb-4">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Velikost písma</label>
                                <div class="flex items-center gap-3">
                                    <input type="range" id="page-num-size" min="8" max="48" value="14" class="flex-1 accent-emerald-500">
                                    <span id="page-num-size-val" class="text-emerald-400 font-bold text-sm min-w-[40px] text-right">14px</span>
                                </div>
                            </div>

                            <!-- Color -->
                            <div class="mb-4">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Barva</label>
                                <div class="flex gap-2">
                                    <button data-color="0,0,0" class="color-btn w-8 h-8 rounded-full bg-black border-2 border-blue-500 hover:scale-110 transition-transform"></button>
                                    <button data-color="0.3,0.3,0.3" class="color-btn w-8 h-8 rounded-full bg-gray-600 border-2 border-transparent hover:scale-110 transition-transform"></button>
                                    <button data-color="0.5,0.5,0.5" class="color-btn w-8 h-8 rounded-full bg-gray-400 border-2 border-transparent hover:scale-110 transition-transform"></button>
                                    <button data-color="1,1,1" class="color-btn w-8 h-8 rounded-full bg-white border-2 border-transparent hover:scale-110 transition-transform"></button>
                                    <button data-color="0.2,0.4,0.8" class="color-btn w-8 h-8 rounded-full bg-blue-500 border-2 border-transparent hover:scale-110 transition-transform"></button>
                                    <button data-color="0.1,0.6,0.4" class="color-btn w-8 h-8 rounded-full bg-emerald-500 border-2 border-transparent hover:scale-110 transition-transform"></button>
                                </div>
                            </div>

                            <!-- Style Options -->
                            <div class="mb-4">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Styl</label>
                                <div class="space-y-2">
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="page-num-shadow" class="w-4 h-4 accent-emerald-500 rounded">
                                        <span class="text-slate-300 group-hover:text-white transition-colors">Stín</span>
                                    </label>
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="page-num-outline" class="w-4 h-4 accent-emerald-500 rounded">
                                        <span class="text-slate-300 group-hover:text-white transition-colors">Obrys</span>
                                    </label>
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="page-num-bold" checked class="w-4 h-4 accent-emerald-500 rounded">
                                        <span class="text-slate-300 group-hover:text-white transition-colors">Tučné</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Start Page -->
                            <div class="mb-4">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Číslovat od stránky</label>
                                <input type="number" id="page-num-start" value="1" min="1" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none transition-colors">
                            </div>

                            <!-- Margin -->
                            <div class="mb-6">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Odsazení od okraje</label>
                                <div class="flex items-center gap-3">
                                    <input type="range" id="page-num-margin" min="10" max="80" value="30" class="flex-1 accent-emerald-500">
                                    <span id="page-num-margin-val" class="text-emerald-400 font-bold text-sm min-w-[40px] text-right">30px</span>
                                </div>
                            </div>

                            <!-- Buttons -->
                            <div class="space-y-3 mt-auto">
                                <button id="btn-page-numbers" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                    <i data-lucide="hash" class="w-5 h-5 inline mr-2"></i>Přidat čísla stránek
                                </button>
                                <button id="btn-page-numbers-reset" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">
                                    Nahrát jiný PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        initCustomSelects();

        let pdfBytes = null;
        let pdfDoc = null;
        let pdfJsDoc = null;
        let currentPage = 1;
        let totalPages = 0;
        let selectedPos = 'bottom-center';
        let selectedColor = '0,0,0';

        // Helper: Get position styles for overlay
        function getOverlayStyles(pageWidth, pageHeight, fontSize, margin) {
            const wrapper = document.getElementById('page-num-preview-wrapper');
            const wrapperRect = wrapper.getBoundingClientRect();
            const scale = wrapperRect.width / pageWidth;

            const shadow = document.getElementById('page-num-shadow')?.checked;
            const outline = document.getElementById('page-num-outline')?.checked;
            const bold = document.getElementById('page-num-bold')?.checked;

            const styles = {
                fontSize: `${Math.max(fontSize * scale, 12)}px`,
                color: `rgb(${selectedColor.split(',').map(n => Math.round(parseFloat(n) * 255)).join(', ')})`,
                fontWeight: bold ? 'bold' : 'normal'
            };

            // Text shadow
            if (shadow) {
                styles.textShadow = '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3)';
            } else {
                styles.textShadow = 'none';
            }

            // Outline via text stroke
            if (outline) {
                styles.WebkitTextStroke = `${Math.max(0.5 * scale, 1)}px rgba(255,255,255,0.9)`;
                styles.paintOrder = 'stroke fill';
            } else {
                styles.WebkitTextStroke = 'none';
            }

            const marginPx = margin * scale;
            const isTop = selectedPos.includes('top');
            const isBottom = selectedPos.includes('bottom');
            const isMiddle = selectedPos.includes('middle');
            const isLeft = selectedPos.includes('left');
            const isRight = selectedPos.includes('right');
            const isCenter = selectedPos.includes('center');

            if (isTop) {
                styles.top = `${marginPx}px`;
            } else if (isBottom) {
                styles.bottom = `${marginPx}px`;
            } else if (isMiddle) {
                styles.top = '50%';
                styles.transform = 'translateY(-50%)';
            }

            if (isLeft) {
                styles.left = `${marginPx}px`;
                styles.textAlign = 'left';
            } else if (isRight) {
                styles.right = `${marginPx}px`;
                styles.textAlign = 'right';
            } else if (isCenter) {
                styles.left = '50%';
                styles.transform = (isMiddle ? 'translate(-50%, -50%)' : 'translateX(-50%)');
                styles.textAlign = 'center';
            }

            return styles;
        }

        // Update live preview
        function updateLivePreview() {
            if (!pdfDoc || !pageWidth) return;

            const canvas = document.getElementById('page-num-canvas');
            const overlay = document.getElementById('page-num-live-overlay');

            const fontSize = parseInt(document.getElementById('page-num-size').value);
            const margin = parseInt(document.getElementById('page-num-margin').value);
            const format = document.getElementById('page-num-format-input')?.value || '{page} / {total}';
            const startPage = parseInt(document.getElementById('page-num-start').value) || 1;

            const pageNum = currentPage >= startPage ? currentPage - startPage + 1 : '';
            const text = format.replace('{page}', pageNum || currentPage).replace('{total}', totalPages);

            // Apply styles to overlay
            const styles = getOverlayStyles(pageWidth, pageHeight, fontSize, margin);
            overlay.textContent = text;
            overlay.style.fontSize = styles.fontSize;
            overlay.style.color = styles.color;
            overlay.style.fontWeight = styles.fontWeight;
            overlay.style.textShadow = styles.textShadow;
            overlay.style.WebkitTextStroke = styles.WebkitTextStroke;
            overlay.style.paintOrder = styles.paintOrder || 'normal';
            overlay.style.top = styles.top || 'auto';
            overlay.style.bottom = styles.bottom || 'auto';
            overlay.style.left = styles.left || 'auto';
            overlay.style.right = styles.right || 'auto';
            overlay.style.transform = styles.transform || 'none';
            overlay.style.textAlign = styles.textAlign || 'center';
        }

        // Store page dimensions for overlay calculations
        let pageWidth = 0;
        let pageHeight = 0;

        // Render current page with high quality
        async function renderCurrentPage() {
            if (!pdfJsDoc) return;

            const canvas = document.getElementById('page-num-canvas');
            const page = await pdfJsDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1 });

            // Store original dimensions
            pageWidth = viewport.width;
            pageHeight = viewport.height;

            // Calculate scale for high quality (2x for retina-like sharpness)
            const containerWidth = canvas.parentElement.clientWidth;
            const displayScale = containerWidth / viewport.width;
            const renderScale = displayScale * 2; // 2x for high quality

            const scaledViewport = page.getViewport({ scale: renderScale });

            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            canvas.style.width = containerWidth + 'px';
            canvas.style.height = (containerWidth * viewport.height / viewport.width) + 'px';

            await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport: scaledViewport
            }).promise;

            // Update navigation
            document.getElementById('page-num-nav').textContent = `Strana ${currentPage} z ${totalPages}`;
            document.getElementById('page-num-prev').disabled = currentPage <= 1;
            document.getElementById('page-num-next').disabled = currentPage >= totalPages;

            updateLivePreview();
        }

        // Event listeners for live preview
        document.getElementById('page-num-size').addEventListener('input', (e) => {
            document.getElementById('page-num-size-val').textContent = e.target.value + 'px';
            updateLivePreview();
        });

        document.getElementById('page-num-margin').addEventListener('input', (e) => {
            document.getElementById('page-num-margin-val').textContent = e.target.value + 'px';
            updateLivePreview();
        });

        document.getElementById('page-num-format-input')?.addEventListener('change', updateLivePreview);
        document.getElementById('page-num-start').addEventListener('input', updateLivePreview);
        document.getElementById('page-num-shadow')?.addEventListener('change', updateLivePreview);
        document.getElementById('page-num-outline')?.addEventListener('change', updateLivePreview);
        document.getElementById('page-num-bold')?.addEventListener('change', updateLivePreview);

        // Position buttons
        document.querySelectorAll('.pos-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pos-btn').forEach(b => {
                    b.classList.remove('border-blue-500', 'border-2', 'bg-blue-500/20');
                    b.classList.add('border-slate-700');
                    b.querySelector('span').classList.remove('bg-blue-400');
                    b.querySelector('span').classList.add('bg-slate-500');
                });
                btn.classList.remove('border-slate-700');
                btn.classList.add('border-blue-500', 'border-2', 'bg-blue-500/20');
                btn.querySelector('span').classList.remove('bg-slate-500');
                btn.querySelector('span').classList.add('bg-blue-400');
                selectedPos = btn.dataset.pos;
                updateLivePreview();
            });
        });

        // Color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('border-blue-500'));
                btn.classList.add('border-blue-500');
                selectedColor = btn.dataset.color;
                updateLivePreview();
            });
        });

        // Navigation
        document.getElementById('page-num-prev').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCurrentPage();
            }
        });

        document.getElementById('page-num-next').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCurrentPage();
            }
        });

        // Upload
        initDropzone('page-numbers-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return showToast('Vyberte PDF soubor', 'error');

            pdfBytes = new Uint8Array(await file.arrayBuffer());
            pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
            totalPages = pdfDoc.getPageCount();
            currentPage = 1;

            document.getElementById('page-numbers-upload-area').classList.add('hidden');
            document.getElementById('page-numbers-work-area').classList.remove('hidden');
            document.getElementById('page-num-count').textContent = `${totalPages} stránek`;

            await renderCurrentPage();
        });

        // Reset
        document.getElementById('btn-page-numbers-reset').addEventListener('click', () => {
            pdfBytes = null;
            pdfDoc = null;
            pdfJsDoc = null;
            document.getElementById('page-numbers-upload-area').classList.remove('hidden');
            document.getElementById('page-numbers-work-area').classList.add('hidden');
        });

        // Apply page numbers
        document.getElementById('btn-page-numbers').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-page-numbers', 'Přidávám...');
            try {
                const pages = pdfDoc.getPages();
                const fontSize = parseInt(document.getElementById('page-num-size').value);
                const margin = parseInt(document.getElementById('page-num-margin').value);
                const format = document.getElementById('page-num-format-input')?.value || '{page}';
                const startPage = parseInt(document.getElementById('page-num-start').value) || 1;
                const [r, g, b] = selectedColor.split(',').map(Number);
                const bold = document.getElementById('page-num-bold')?.checked;
                const font = await pdfDoc.embedFont(bold ? PDFLib.StandardFonts.HelveticaBold : PDFLib.StandardFonts.Helvetica);

                for (let i = startPage - 1; i < pages.length; i++) {
                    const page = pages[i];
                    const { width, height } = page.getSize();
                    const pageNum = i - startPage + 2;
                    const text = format.replace('{page}', String(pageNum)).replace('{total}', String(pages.length));

                    let x, y;
                    const textWidth = font.widthOfTextAtSize(text, fontSize);
                    const textHeight = fontSize;

                    // Y position
                    if (selectedPos.includes('top')) {
                        y = height - margin - textHeight;
                    } else if (selectedPos.includes('bottom')) {
                        y = margin;
                    } else {
                        y = height / 2 - textHeight / 2;
                    }

                    // X position
                    if (selectedPos.includes('left')) {
                        x = margin;
                    } else if (selectedPos.includes('right')) {
                        x = width - margin - textWidth;
                    } else {
                        x = (width - textWidth) / 2;
                    }

                    page.drawText(text, { x, y, size: fontSize, font, color: PDFLib.rgb(r, g, b) });
                }

                const newPdf = await pdfDoc.save();
                downloadBlob(new Blob([newPdf], { type: 'application/pdf' }), 'with_page_numbers.pdf');
                showToast('Čísla stránek úspěšně přidána!', 'success');
            } catch (e) {
                showToast('Chyba: ' + e.message, 'error');
            }
            hideLoading('btn-page-numbers');
        });
    }

    // --- WATERMARK PDF ---
    else if (toolId === 'watermark-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-blue-400 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Watermark PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Watermark PDF</h2>
                <p class="text-slate-400">Přidat vodoznak do PDF.</p>
            </div>
            <div id="watermark-upload-area" class="max-w-xl mx-auto">
                ${createDropzone('watermark-dz', 'application/pdf', 'Nahrajte PDF soubor')}
            </div>
            <div id="watermark-work-area" class="hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <div class="bg-card border border-border rounded-2xl p-6">
                            <h3 class="text-lg font-bold text-white mb-4">Náhled s vodoznakem</h3>
                            <div id="watermark-preview-container" class="relative">
                                <canvas id="watermark-preview-canvas" class="w-full rounded-lg border border-slate-700"></canvas>
                                <div id="watermark-overlay" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span id="watermark-text-preview" class="text-white font-bold opacity-30 transform -rotate-45" style="font-size: 48px;">VODOZNÁK</span>
                                </div>
                            </div>
                            <div class="flex justify-center gap-2 mt-4">
                                <button id="watermark-prev-page" class="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white">
                                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                                </button>
                                <span id="watermark-page-info" class="px-4 py-2 bg-slate-800 rounded-lg text-white">1 / 1</span>
                                <button id="watermark-next-page" class="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white">
                                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                        <h3 class="text-lg font-bold text-white mb-4">Nastavení vodoznaku</h3>
                        <div class="space-y-4 flex-1">
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Typ vodoznaku</label>
                                <div class="flex gap-2">
                                    <button id="wm-type-text" class="flex-1 py-2 px-4 rounded-lg font-bold transition-colors bg-blue-500 text-white">Text</button>
                                    <button id="wm-type-image" class="flex-1 py-2 px-4 rounded-lg font-bold transition-colors bg-slate-700 text-white hover:bg-slate-600">Obrázek</button>
                                </div>
                            </div>
                            <div id="wm-text-config">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Text vodoznaku</label>
                                <input type="text" id="watermark-text" value="VODOZNÁK" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="Zadejte text...">
                            </div>
                            <div id="wm-image-config" class="hidden">
                                <label class="block text-sm font-bold text-slate-400 mb-2">Obrázek vodoznaku</label>
                                <div id="wm-image-drop" class="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                                    <i data-lucide="image" class="w-10 h-10 mx-auto text-slate-500 mb-2"></i>
                                    <p class="text-slate-400 text-sm">Klikněte nebo přetáhněte obrázek</p>
                                </div>
                                <input type="file" id="watermark-image-input" class="hidden" accept="image/*">
                                <div id="wm-image-preview" class="hidden mt-3">
                                    <img id="wm-image-thumb" class="max-h-24 mx-auto rounded">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-slate-400 mb-2">Velikost</label>
                                    <input type="range" id="watermark-size" min="20" max="120" value="48" class="w-full accent-blue-500">
                                    <span id="watermark-size-val" class="text-blue-400 text-sm">48px</span>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-400 mb-2">Průhlednost</label>
                                    <input type="range" id="watermark-opacity" min="10" max="100" value="30" class="w-full accent-blue-500">
                                    <span id="watermark-opacity-val" class="text-blue-400 text-sm">30%</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Rotace</label>
                                <input type="range" id="watermark-rotation" min="-90" max="90" value="-45" class="w-full accent-blue-500">
                                <span id="watermark-rotation-val" class="text-blue-400 text-sm">-45°</span>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Barva (pouze text)</label>
                                <div class="flex gap-2">
                                    <button data-color="0.5,0.5,0.5" class="wm-color w-8 h-8 rounded-full bg-gray-500 border-2 border-white hover:scale-110 transition-transform"></button>
                                    <button data-color="0,0,0" class="wm-color w-8 h-8 rounded-full bg-black border-2 border-transparent hover:scale-110 transition-transform"></button>
                                    <button data-color="0.8,0.2,0.2" class="wm-color w-8 h-8 rounded-full bg-red-600 border-2 border-transparent hover:scale-110 transition-transform"></button>
                                    <button data-color="0.2,0.4,0.8" class="wm-color w-8 h-8 rounded-full bg-blue-600 border-2 border-transparent hover:scale-110 transition-transform"></button>
                                </div>
                            </div>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="watermark-all-pages" checked class="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-[#0B0F19]">
                                <span class="text-slate-300 text-sm">Aplikovat na všechny stránky</span>
                            </label>
                        </div>
                        <div class="space-y-3 mt-4">
                            <button id="btn-watermark" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors">
                                Přidat vodoznak
                            </button>
                            <button id="btn-watermark-reset" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">
                                Nahrát jiný PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        let pdfBytes = null;
        let pdfJsDoc = null;
        let pdfDoc = null;
        let currentPage = 1;
        let totalPages = 1;
        let watermarkType = 'text';
        let watermarkImage = null;
        let selectedColor = '0.5,0.5,0.5';

        function updateWatermarkPreview() {
            if (!pdfJsDoc) return;

            const textPreview = document.getElementById('watermark-text-preview');
            const size = parseInt(document.getElementById('watermark-size').value);
            const opacity = parseInt(document.getElementById('watermark-opacity').value) / 100;
            const rotation = parseInt(document.getElementById('watermark-rotation').value);
            const text = document.getElementById('watermark-text').value || 'VODOZNÁK';
            const [r, g, b] = selectedColor.split(',').map(Number);

            textPreview.textContent = text;
            textPreview.style.fontSize = size + 'px';
            textPreview.style.opacity = opacity;
            textPreview.style.transform = `rotate(${rotation}deg)`;
            textPreview.style.color = `rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)})`;
        }

        document.getElementById('watermark-text').addEventListener('input', updateWatermarkPreview);
        document.getElementById('watermark-size').addEventListener('input', (e) => {
            document.getElementById('watermark-size-val').textContent = e.target.value + 'px';
            updateWatermarkPreview();
        });
        document.getElementById('watermark-opacity').addEventListener('input', (e) => {
            document.getElementById('watermark-opacity-val').textContent = e.target.value + '%';
            updateWatermarkPreview();
        });
        document.getElementById('watermark-rotation').addEventListener('input', (e) => {
            document.getElementById('watermark-rotation-val').textContent = e.target.value + '°';
            updateWatermarkPreview();
        });

        document.querySelectorAll('.wm-color').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.wm-color').forEach(b => b.classList.remove('border-white'));
                btn.classList.add('border-white');
                selectedColor = btn.dataset.color;
                updateWatermarkPreview();
            });
        });

        document.getElementById('wm-type-text').addEventListener('click', () => {
            watermarkType = 'text';
            document.getElementById('wm-type-text').className = 'flex-1 py-2 px-4 rounded-lg font-bold transition-colors bg-blue-500 text-white';
            document.getElementById('wm-type-image').className = 'flex-1 py-2 px-4 rounded-lg font-bold transition-colors bg-slate-700 text-white hover:bg-slate-600';
            document.getElementById('wm-text-config').classList.remove('hidden');
            document.getElementById('wm-image-config').classList.add('hidden');
            document.getElementById('watermark-text-preview').classList.remove('hidden');
            updateWatermarkPreview();
        });

        document.getElementById('wm-type-image').addEventListener('click', () => {
            watermarkType = 'image';
            document.getElementById('wm-type-image').className = 'flex-1 py-2 px-4 rounded-lg font-bold transition-colors bg-blue-500 text-white';
            document.getElementById('wm-type-text').className = 'flex-1 py-2 px-4 rounded-lg font-bold transition-colors bg-slate-700 text-white hover:bg-slate-600';
            document.getElementById('wm-text-config').classList.add('hidden');
            document.getElementById('wm-image-config').classList.remove('hidden');
            document.getElementById('watermark-text-preview').classList.add('hidden');
        });

        document.getElementById('wm-image-drop').addEventListener('click', () => {
            document.getElementById('watermark-image-input').click();
        });

        document.getElementById('watermark-image-input').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    watermarkImage = ev.target.result;
                    document.getElementById('wm-image-thumb').src = watermarkImage;
                    document.getElementById('wm-image-preview').classList.remove('hidden');
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        async function renderWatermarkPage(pageNum) {
            if (!pdfJsDoc) return;
            const page = await pdfJsDoc.getPage(pageNum);
            const viewport = page.getViewport({scale: 1.5});
            const canvas = document.getElementById('watermark-preview-canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
            document.getElementById('watermark-page-info').textContent = `${pageNum} / ${totalPages}`;
        }

        document.getElementById('watermark-prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderWatermarkPage(currentPage);
            }
        });

        document.getElementById('watermark-next-page').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderWatermarkPage(currentPage);
            }
        });

        initDropzone('watermark-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            pdfJsDoc = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
            pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            totalPages = pdfJsDoc.numPages;
            currentPage = 1;

            document.getElementById('watermark-upload-area').classList.add('hidden');
            document.getElementById('watermark-work-area').classList.remove('hidden');
            await renderWatermarkPage(1);
            updateWatermarkPreview();
        });

        document.getElementById('btn-watermark-reset').addEventListener('click', () => {
            pdfBytes = null;
            pdfJsDoc = null;
            pdfDoc = null;
            document.getElementById('watermark-upload-area').classList.remove('hidden');
            document.getElementById('watermark-work-area').classList.add('hidden');
        });

        document.getElementById('btn-watermark').addEventListener('click', async () => {
            if (!pdfDoc) return;
            showLoading('btn-watermark', 'Přidávám...');
            try {
                const pages = pdfDoc.getPages();
                const opacity = parseInt(document.getElementById('watermark-opacity').value) / 100;
                const size = parseInt(document.getElementById('watermark-size').value);
                const rotation = parseInt(document.getElementById('watermark-rotation').value);
                const allPages = document.getElementById('watermark-all-pages').checked;
                const pagesToProcess = allPages ? pages : [pages[currentPage - 1]];

                if (watermarkType === 'text') {
                    const text = document.getElementById('watermark-text').value || 'VODOZNÁK';
                    const [r, g, b] = selectedColor.split(',').map(Number);
                    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

                    for (const page of pagesToProcess) {
                        const {width, height} = page.getSize();
                        const textWidth = font.widthOfTextAtSize(text, size);
                        const textHeight = size;
                        const radians = rotation * Math.PI / 180;
                        const centerX = width / 2;
                        const centerY = height / 2;

                        page.drawText(text, {
                            x: centerX - textWidth / 2,
                            y: centerY - textHeight / 2,
                            size: size,
                            font,
                            opacity,
                            color: PDFLib.rgb(r, g, b),
                            rotate: PDFLib.degrees(rotation)
                        });
                    }
                } else if (watermarkType === 'image' && watermarkImage) {
                    const imageBytes = await fetch(watermarkImage).then(r => r.arrayBuffer());
                    let image;
                    try {
                        image = await pdfDoc.embedPng(imageBytes);
                    } catch {
                        image = await pdfDoc.embedJpg(imageBytes);
                    }

                    for (const page of pagesToProcess) {
                        const {width, height} = page.getSize();
                        const imgWidth = width / 2;
                        const imgHeight = height / 3;
                        page.drawImage(image, {
                            x: (width - imgWidth) / 2,
                            y: (height - imgHeight) / 2,
                            width: imgWidth,
                            height: imgHeight,
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
                <h2 class="text-4xl font-semibold text-white mb-3">Crop PDF</h2>
                <p class="text-slate-400">Oříznout okraje stránek PDF.</p>
            </div>
            <div id="crop-upload-area" class="max-w-xl mx-auto">
                ${createDropzone('crop-dz', 'application/pdf', 'Nahrajte PDF soubor')}
            </div>
            <div id="crop-work-area" class="hidden">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div class="lg:col-span-3">
                        <div class="bg-card border border-border rounded-2xl p-6">
                            <h3 class="text-lg font-bold text-white mb-4">Vyberte oblast oříznutí</h3>
                            <p class="text-slate-400 text-sm mb-4">Klikněte a táhněte pro vytvoření oblasti oříznutí. Oblast mimo rámeček bude odstraněna.</p>
                            <div id="crop-canvas-container" class="relative inline-block bg-slate-900 rounded-lg overflow-hidden">
                                <canvas id="crop-preview-canvas" class="max-w-full cursor-crosshair"></canvas>
                                <div id="crop-selection" class="absolute border-2 border-emerald-500 bg-emerald-500/10 hidden pointer-events-none"></div>
                            </div>
                            <div class="flex justify-center gap-2 mt-4">
                                <button id="crop-prev-page" class="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white">
                                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                                </button>
                                <span id="crop-page-info" class="px-4 py-2 bg-slate-800 rounded-lg text-white">1 / 1</span>
                                <button id="crop-next-page" class="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white">
                                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                        <h3 class="text-lg font-bold text-white mb-4">Nastavení ořezu</h3>
                        <div class="space-y-4 flex-1">
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Horní (px)</label>
                                <input type="number" id="crop-top" value="0" min="0" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Dolní (px)</label>
                                <input type="number" id="crop-bottom" value="0" min="0" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Vlevo (px)</label>
                                <input type="number" id="crop-left" value="0" min="0" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Vpravo (px)</label>
                                <input type="number" id="crop-right" value="0" min="0" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white">
                            </div>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="crop-all-pages" checked class="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-[#0B0F19]">
                                <span class="text-slate-300 text-sm">Aplikovat na všechny</span>
                            </label>
                        </div>
                        <div class="space-y-3 mt-4">
                            <button id="btn-crop" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors">
                                Oříznout PDF
                            </button>
                            <button id="btn-crop-reset" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">
                                Nahrát jiný PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        let pdfBytes = null;
        let pdfJsDoc = null;
        let pdfDoc = null;
        let currentPage = 1;
        let totalPages = 1;
        let pageWidth = 0;
        let pageHeight = 0;
        let scale = 1;

        let cropSelection = {startX: 0, startY: 0, endX: 0, endY: 0, isDrawing: false};
        const cropCanvas = document.getElementById('crop-preview-canvas');
        const cropCtx = cropCanvas.getContext('2d');
        const selection = document.getElementById('crop-selection');
        const cropCanvasContainer = document.getElementById('crop-canvas-container');

        cropCanvas.addEventListener('mousedown', (e) => {
            const rect = cropCanvas.getBoundingClientRect();
            cropSelection.startX = e.clientX - rect.left;
            cropSelection.startY = e.clientY - rect.top;
            cropSelection.isDrawing = true;
            selection.classList.remove('hidden');
        });

        cropCanvas.addEventListener('mousemove', (e) => {
            if (!cropSelection.isDrawing) return;
            const rect = cropCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const left = Math.min(cropSelection.startX, x);
            const top = Math.min(cropSelection.startY, y);
            const width = Math.abs(x - cropSelection.startX);
            const height = Math.abs(y - cropSelection.startY);

            selection.style.left = left + 'px';
            selection.style.top = top + 'px';
            selection.style.width = width + 'px';
            selection.style.height = height + 'px';
        });

        cropCanvas.addEventListener('mouseup', (e) => {
            if (!cropSelection.isDrawing) return;
            cropSelection.isDrawing = false;
            const rect = cropCanvas.getBoundingClientRect();
            cropSelection.endX = e.clientX - rect.left;
            cropSelection.endY = e.clientY - rect.top;

            // Calculate actual PDF coordinates
            const left = Math.min(cropSelection.startX, cropSelection.endX);
            const top = Math.min(cropSelection.startY, cropSelection.endY);
            const right = Math.max(cropSelection.startX, cropSelection.endX);
            const bottom = Math.max(cropSelection.startY, cropSelection.endY);

            // Update input fields (convert from display to PDF coordinates)
            document.getElementById('crop-left').value = Math.round(left / scale);
            document.getElementById('crop-top').value = Math.round(top / scale);
            document.getElementById('crop-right').value = Math.round((cropCanvas.width - right) / scale);
            document.getElementById('crop-bottom').value = Math.round((cropCanvas.height - bottom) / scale);
        });

        async function renderCropPage(pageNum) {
            if (!pdfJsDoc) return;
            const page = await pdfJsDoc.getPage(pageNum);
            const viewport = page.getViewport({scale: 1});
            pageWidth = viewport.width;
            pageHeight = viewport.height;

            // Scale to fit container
            const maxWidth = Math.min(800, window.innerWidth - 400);
            scale = maxWidth / pageWidth;
            const scaledViewport = page.getViewport({scale});

            cropCanvas.width = scaledViewport.width;
            cropCanvas.height = scaledViewport.height;

            await page.render({canvasContext: cropCtx, viewport: scaledViewport}).promise;
            document.getElementById('crop-page-info').textContent = `${pageNum} / ${totalPages}`;
        }

        document.getElementById('crop-prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCropPage(currentPage);
                selection.classList.add('hidden');
            }
        });

        document.getElementById('crop-next-page').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCropPage(currentPage);
                selection.classList.add('hidden');
            }
        });

        // Update selection when inputs change
        ['crop-top', 'crop-bottom', 'crop-left', 'crop-right'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                const top = parseInt(document.getElementById('crop-top').value) || 0;
                const left = parseInt(document.getElementById('crop-left').value) || 0;
                const right = parseInt(document.getElementById('crop-right').value) || 0;
                const bottom = parseInt(document.getElementById('crop-bottom').value) || 0;

                selection.style.top = (top * scale) + 'px';
                selection.style.left = (left * scale) + 'px';
                selection.style.width = ((pageWidth - left - right) * scale) + 'px';
                selection.style.height = ((pageHeight - top - bottom) * scale) + 'px';
                selection.classList.remove('hidden');
            });
        });

        initDropzone('crop-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            pdfJsDoc = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
            pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            totalPages = pdfJsDoc.numPages;
            currentPage = 1;

            document.getElementById('crop-upload-area').classList.add('hidden');
            document.getElementById('crop-work-area').classList.remove('hidden');
            await renderCropPage(1);
        });

        document.getElementById('btn-crop-reset').addEventListener('click', () => {
            pdfBytes = null;
            pdfJsDoc = null;
            pdfDoc = null;
            document.getElementById('crop-upload-area').classList.remove('hidden');
            document.getElementById('crop-work-area').classList.add('hidden');
        });

        document.getElementById('btn-crop').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-crop', 'Ořezávám...');
            try {
                const topPx = parseInt(document.getElementById('crop-top').value) || 0;
                const bottomPx = parseInt(document.getElementById('crop-bottom').value) || 0;
                const leftPx = parseInt(document.getElementById('crop-left').value) || 0;
                const rightPx = parseInt(document.getElementById('crop-right').value) || 0;
                const allPages = document.getElementById('crop-all-pages').checked;

                // Load original PDF
                const srcDoc = await PDFLib.PDFDocument.load(pdfBytes);
                const outDoc = await PDFLib.PDFDocument.create();
                const srcPages = srcDoc.getPages();
                const totalPages = srcPages.length;

                for (let i = 0; i < totalPages; i++) {
                    // Skip pages not selected (when not applying to all)
                    if (!allPages && i !== currentPage - 1) continue;

                    const srcPage = srcPages[i];
                    const {width, height} = srcPage.getSize();

                    // Get page rotation
                    const rotation = srcPage.getRotation().angle;

                    // Calculate actual crop values considering rotation
                    let cropLeft, cropRight, cropTop, cropBottom;
                    let newWidth, newHeight;

                    // Adjust crop dimensions based on rotation
                    if (rotation === 90 || rotation === 270) {
                        // Swap width/height for rotated pages
                        cropLeft = leftPx;
                        cropRight = rightPx;
                        cropTop = topPx;
                        cropBottom = bottomPx;
                        newWidth = height - cropLeft - cropRight;
                        newHeight = width - cropTop - cropBottom;
                    } else {
                        cropLeft = leftPx;
                        cropRight = rightPx;
                        cropTop = topPx;
                        cropBottom = bottomPx;
                        newWidth = width - cropLeft - cropRight;
                        newHeight = height - cropTop - cropBottom;
                    }

                    // Ensure valid dimensions
                    newWidth = Math.max(1, newWidth);
                    newHeight = Math.max(1, newHeight);

                    // Create new page with cropped dimensions
                    const newPage = outDoc.addPage([newWidth, newHeight]);

                    // Embed the source page as a form XObject
                    const [embeddedPage] = await outDoc.embedPdf(srcDoc, [i]);

                    // Calculate offset to position the cropped area correctly
                    // In PDF coordinates, Y increases upward, origin is bottom-left
                    const xOffset = -cropLeft;
                    const yOffset = -cropBottom;

                    // Draw the embedded page with offset
                    newPage.drawPage(embeddedPage, {
                        x: xOffset,
                        y: yOffset,
                        width: width,
                        height: height
                    });
                }

                const croppedPdf = await outDoc.save();
                downloadBlob(new Blob([croppedPdf], {type: 'application/pdf'}), 'cropped.pdf');
            } catch (e) {
                console.error('Crop error:', e);
                alert('Chyba: ' + e.message);
            }
            hideLoading('btn-crop');
        });
    }

    // --- REDACT PDF ---
    else if (toolId === 'redact-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-slate-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Redact PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Redact PDF</h2>
                <p class="text-slate-400">Skrýt citlivé informace v PDF pomocí cenzury.</p>
            </div>
            <div id="redact-upload-area" class="max-w-xl mx-auto">
                ${createDropzone('redact-dz', 'application/pdf', 'Nahrajte PDF soubor')}
            </div>
            <div id="redact-work-area" class="hidden">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div class="lg:col-span-3">
                        <div class="bg-card border border-border rounded-2xl p-6">
                            <h3 class="text-lg font-bold text-white mb-4">Označte oblasti k cenzuře</h3>
                            <p class="text-slate-400 text-sm mb-4">Klikněte a táhněte pro vytvoření obdélníku, který skryje citlivé informace.</p>
                            <div id="redact-canvas-container" class="relative inline-block bg-slate-900 rounded-lg overflow-hidden">
                                <canvas id="redact-preview-canvas" class="max-w-full"></canvas>
                                <canvas id="redact-overlay-canvas" class="absolute top-0 left-0 cursor-crosshair"></canvas>
                            </div>
                            <div class="flex justify-center gap-2 mt-4">
                                <button id="redact-prev-page" class="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white">
                                    <i data-lucide="chevron-left" class="w-5 h-5"></i>
                                </button>
                                <span id="redact-page-info" class="px-4 py-2 bg-slate-800 rounded-lg text-white">1 / 1</span>
                                <button id="redact-next-page" class="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 text-white">
                                    <i data-lucide="chevron-right" class="w-5 h-5"></i>
                                </button>
                                <button id="redact-undo" class="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-500 text-white ml-4">
                                    <i data-lucide="undo" class="w-5 h-5"></i>
                                </button>
                                <button id="redact-clear-page" class="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 text-white">
                                    Vymazat stránku
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                        <h3 class="text-lg font-bold text-white mb-4">Nastavení</h3>
                        <div class="space-y-4 flex-1">
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Typ cenzury</label>
                                <div class="space-y-2">
                                    <button data-level="pixel-small" class="redact-level w-full py-2 px-4 rounded-lg text-left bg-slate-700 hover:bg-slate-600 text-white text-sm flex items-center gap-2">
                                        <span class="w-4 h-4 rounded" style="background: repeating-linear-gradient(45deg, #555 0px, #555 2px, #888 2px, #888 4px);"></span> Jemné rozpixelování
                                    </button>
                                    <button data-level="pixel-medium" class="redact-level w-full py-2 px-4 rounded-lg text-left bg-slate-700 hover:bg-slate-600 text-white text-sm flex items-center gap-2">
                                        <span class="w-4 h-4 rounded" style="background: repeating-linear-gradient(45deg, #444 0px, #444 4px, #777 4px, #777 8px);"></span> Střední rozpixelování
                                    </button>
                                    <button data-level="pixel-large" class="redact-level w-full py-2 px-4 rounded-lg text-left border-2 border-slate-500 bg-slate-600 text-white text-sm flex items-center gap-2">
                                        <span class="w-4 h-4 rounded" style="background: repeating-linear-gradient(45deg, #333 0px, #333 6px, #666 6px, #666 12px);"></span> Hrubé rozpixelování
                                    </button>
                                    <button data-level="black" class="redact-level w-full py-2 px-4 rounded-lg text-left bg-slate-700 hover:bg-slate-600 text-white text-sm flex items-center gap-2">
                                        <span class="w-4 h-4 rounded bg-black border border-slate-500"></span> Plná čerň
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-400 mb-2">Najít text v celém dokumentu</label>
                                <textarea id="redact-text" rows="3" placeholder="slovo1; slovo2; fráze"
                                    class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm resize-none"></textarea>
                                <p class="text-slate-500 text-xs mt-1">Oddělte středníkem. Vyhledá na všech stránkách.</p>
                                <button id="btn-find-text" class="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-sm">
                                    Najít v dokumentu
                                </button>
                            </div>
                            <div class="bg-slate-800 rounded-lg p-3">
                                <p class="text-xs text-slate-400">Cenzurované oblasti:</p>
                                <p id="redact-count" class="text-2xl font-bold text-white">0</p>
                            </div>
                        </div>
                        <div class="space-y-3 mt-4">
                            <button id="btn-redact" class="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-4 rounded-xl transition-colors">
                                Aplikovat cenzuru
                            </button>
                            <button id="btn-redact-reset" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">
                                Nahrát jiný PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        let pdfBytes = null;
        let pdfJsDoc = null;
        let pdfDoc = null;
        let currentPage = 1;
        let totalPages = 1;
        let pageWidth = 0;
        let pageHeight = 0;
        let scale = 1;
        let selectedLevel = 'pixel-large';
        let redactions = {}; // {pageNum: [{x, y, width, height, level}]}
        let pageCanvases = {}; // Cache rendered pages for pixelation

        const previewCanvas = document.getElementById('redact-preview-canvas');
        const previewCtx = previewCanvas.getContext('2d');
        const overlayCanvas = document.getElementById('redact-overlay-canvas');
        const overlayCtx = overlayCanvas.getContext('2d');
        let isDrawing = false;
        let startX = 0, startY = 0;

        // Pixelation sizes in PDF points
        const levelSettings = {
            'pixel-small': { pixelSize: 3 },
            'pixel-medium': { pixelSize: 6 },
            'pixel-large': { pixelSize: 10 },
            'black': { pixelSize: 0 }
        };

        document.querySelectorAll('.redact-level').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.redact-level').forEach(b => {
                    b.classList.remove('border-2', 'border-slate-500', 'bg-slate-600');
                    b.classList.add('bg-slate-700');
                });
                btn.classList.remove('bg-slate-700');
                btn.classList.add('border-2', 'border-slate-500', 'bg-slate-600');
                selectedLevel = btn.dataset.level;
            });
        });

        // Drawing on overlay canvas
        overlayCanvas.addEventListener('mousedown', (e) => {
            const rect = overlayCanvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            isDrawing = true;
        });

        overlayCanvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = overlayCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            drawRedactionPreviews();

            overlayCtx.strokeStyle = '#ef4444';
            overlayCtx.lineWidth = 2;
            overlayCtx.setLineDash([5, 5]);
            overlayCtx.strokeRect(startX, startY, x - startX, y - startY);
            overlayCtx.setLineDash([]);
        });

        overlayCanvas.addEventListener('mouseup', (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            const rect = overlayCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (Math.abs(x - startX) < 5 || Math.abs(y - startY) < 5) {
                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                drawRedactionPreviews();
                return;
            }

            // Convert screen coordinates to PDF coordinates
            // PDF origin is bottom-left, screen origin is top-left
            const pdfX = Math.min(startX, x) / scale;
            const pdfY = pageHeight - Math.max(startY, y) / scale;
            const pdfW = Math.abs(x - startX) / scale;
            const pdfH = Math.abs(y - startY) / scale;

            if (!redactions[currentPage]) redactions[currentPage] = [];
            redactions[currentPage].push({
                x: pdfX,
                y: pdfY,
                width: pdfW,
                height: pdfH,
                level: selectedLevel
            });

            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            drawRedactionPreviews();
            updateRedactCount();
        });

        overlayCanvas.addEventListener('mouseleave', () => {
            if (isDrawing) {
                isDrawing = false;
                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                drawRedactionPreviews();
            }
        });

        function drawRedactionPreviews() {
            if (!redactions[currentPage]) return;
            redactions[currentPage].forEach(r => {
                // Convert PDF coordinates to screen coordinates
                const screenX = r.x * scale;
                const screenY = (pageHeight - r.y - r.height) * scale;
                const screenW = r.width * scale;
                const screenH = r.height * scale;

                if (r.level === 'black') {
                    overlayCtx.fillStyle = '#000';
                    overlayCtx.fillRect(screenX, screenY, screenW, screenH);
                } else {
                    // Draw pixelated overlay for preview
                    const ps = levelSettings[r.level].pixelSize * scale;
                    overlayCtx.fillStyle = 'rgba(0,0,0,0.7)';
                    overlayCtx.fillRect(screenX, screenY, screenW, screenH);
                    // Draw mosaic pattern
                    for (let py = screenY; py < screenY + screenH; py += ps) {
                        for (let px = screenX; px < screenX + screenW; px += ps) {
                            const brightness = Math.random() * 100;
                            overlayCtx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
                            overlayCtx.fillRect(px, py, Math.min(ps, screenX + screenW - px), Math.min(ps, screenY + screenH - py));
                        }
                    }
                }
                overlayCtx.strokeStyle = '#ef4444';
                overlayCtx.lineWidth = 1;
                overlayCtx.strokeRect(screenX, screenY, screenW, screenH);
            });
        }

        function updateRedactCount() {
            let count = 0;
            Object.values(redactions).forEach(arr => count += arr.length);
            document.getElementById('redact-count').textContent = count;
        }

        async function renderRedactPage() {
            if (!pdfJsDoc) return;
            const page = await pdfJsDoc.getPage(currentPage);
            const viewport = page.getViewport({scale: 1});
            pageWidth = viewport.width;
            pageHeight = viewport.height;

            const maxWidth = Math.min(800, window.innerWidth - 400);
            scale = maxWidth / pageWidth;
            const scaledViewport = page.getViewport({scale});

            previewCanvas.width = scaledViewport.width;
            previewCanvas.height = scaledViewport.height;
            overlayCanvas.width = scaledViewport.width;
            overlayCanvas.height = scaledViewport.height;

            await page.render({canvasContext: previewCtx, viewport: scaledViewport}).promise;

            // Cache the rendered page for pixelation
            pageCanvases[currentPage] = previewCanvas.toDataURL();

            document.getElementById('redact-page-info').textContent = `${currentPage} / ${totalPages}`;
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            drawRedactionPreviews();
        }

        document.getElementById('redact-prev-page').addEventListener('click', async () => {
            if (currentPage > 1) {
                currentPage--;
                await renderRedactPage();
            }
        });

        document.getElementById('redact-next-page').addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await renderRedactPage();
            }
        });

        document.getElementById('redact-undo').addEventListener('click', () => {
            if (redactions[currentPage] && redactions[currentPage].length > 0) {
                redactions[currentPage].pop();
                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                drawRedactionPreviews();
                updateRedactCount();
            }
        });

        document.getElementById('redact-clear-page').addEventListener('click', () => {
            redactions[currentPage] = [];
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            updateRedactCount();
        });

        document.getElementById('btn-find-text').addEventListener('click', async () => {
            const searchText = document.getElementById('redact-text').value.trim();
            if (!searchText || !pdfJsDoc) {
                showToast('Zadejte text k vyhledání', 'error');
                return;
            }
            const words = searchText.split(';').map(w => w.trim().toLowerCase()).filter(w => w);
            if (words.length === 0) return;

            showLoading('btn-find-text', 'Hledám v dokumentu...');
            let totalFound = 0;
            let pagesWithMatches = [];

            try {
                // Search ALL pages
                for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                    const page = await pdfJsDoc.getPage(pageNum);
                    const textContent = await page.getTextContent();

                    let foundOnPage = 0;
                    textContent.items.forEach(item => {
                        const itemText = (item.str || '').toLowerCase();
                        words.forEach(word => {
                            if (word && itemText.includes(word)) {
                                const tx = item.transform;
                                // Font size is typically in tx[0] (horizontal scale)
                                const fontSize = Math.abs(tx[0]) || Math.abs(tx[3]) || 12;
                                const textWidth = item.width || (item.str.length * fontSize * 0.5);
                                const textHeight = fontSize;

                                // PDF coordinates: tx[4] is x, tx[5] is y (from baseline)
                                if (!redactions[pageNum]) redactions[pageNum] = [];
                                redactions[pageNum].push({
                                    x: tx[4] - 1,
                                    y: tx[5] - 1,
                                    width: textWidth + 2,
                                    height: textHeight + 2,
                                    level: selectedLevel
                                });
                                foundOnPage++;
                            }
                        });
                    });

                    if (foundOnPage > 0) {
                        pagesWithMatches.push({page: pageNum, count: foundOnPage});
                        totalFound += foundOnPage;
                    }
                }

                updateRedactCount();

                // Jump to first page with matches
                if (pagesWithMatches.length > 0) {
                    currentPage = pagesWithMatches[0].page;
                    await renderRedactPage();
                }

                if (totalFound > 0) {
                    const pageList = pagesWithMatches.map(p => `str.${p.page}: ${p.count}`).join(', ');
                    showToast(`Nalezeno ${totalFound} výskytů (${pageList})`, 'success');
                } else {
                    showToast('Text nebyl nalezen v dokumentu', 'info');
                }
            } catch (e) {
                showToast('Chyba při hledání: ' + e.message, 'error');
            }
            hideLoading('btn-find-text');
        });

        initDropzone('redact-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return showToast('Vyberte PDF soubor', 'error');
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            pdfJsDoc = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
            pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            totalPages = pdfJsDoc.numPages;
            currentPage = 1;
            redactions = {};
            pageCanvases = {};

            document.getElementById('redact-upload-area').classList.add('hidden');
            document.getElementById('redact-work-area').classList.remove('hidden');
            await renderRedactPage();
            updateRedactCount();
        });

        document.getElementById('btn-redact-reset').addEventListener('click', () => {
            pdfBytes = null;
            pdfJsDoc = null;
            pdfDoc = null;
            redactions = {};
            pageCanvases = {};
            document.getElementById('redact-upload-area').classList.remove('hidden');
            document.getElementById('redact-work-area').classList.add('hidden');
        });

        document.getElementById('btn-redact').addEventListener('click', async () => {
            if (!pdfDoc) return;
            const hasRedactions = Object.values(redactions).some(arr => arr.length > 0);
            if (!hasRedactions) {
                showToast('Označte oblasti k censorování', 'error');
                return;
            }
            showLoading('btn-redact', 'Aplikuji cenzuru...');
            try {
                const pages = pdfDoc.getPages();

                for (let i = 0; i < pages.length; i++) {
                    const pageNum = i + 1;
                    if (!redactions[pageNum]) continue;

                    const page = pages[i];
                    const pageHeight = page.getHeight();

                    for (const r of redactions[pageNum]) {
                        if (r.level === 'black') {
                            // Solid black rectangle
                            page.drawRectangle({
                                x: r.x,
                                y: r.y,
                                width: r.width,
                                height: r.height,
                                color: PDFLib.rgb(0, 0, 0)
                            });
                        } else {
                            // Draw pixelated rectangle
                            const ps = levelSettings[r.level].pixelSize;
                            // Create pixelated pattern using small rectangles
                            for (let py = r.y; py < r.y + r.height; py += ps) {
                                for (let px = r.x; px < r.x + r.width; px += ps) {
                                    // Random dark color for mosaic effect
                                    const gray = 20 + Math.random() * 40;
                                    page.drawRectangle({
                                        x: px,
                                        y: r.y + r.height - (py - r.y) - ps,
                                        width: Math.min(ps, r.x + r.width - px),
                                        height: Math.min(ps, r.y + r.height - py),
                                        color: PDFLib.rgb(gray/255, gray/255, gray/255)
                                    });
                                }
                            }
                        }
                    }
                }

                const redactedPdf = await pdfDoc.save();
                downloadBlob(new Blob([redactedPdf], {type: 'application/pdf'}), 'censored.pdf');
                showToast('Cenzura úspěšně aplikována!', 'success');
            } catch (e) {
                showToast('Chyba: ' + e.message, 'error');
            }
            hideLoading('btn-redact');
        });
    }

    // --- UNLOCK PDF ---
    else if (toolId === 'unlock-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Unlock PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Unlock PDF</h2>
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
                <h2 class="text-4xl font-semibold text-white mb-3">Protect PDF</h2>
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
            <div class="max-w-7xl mx-auto w-full">
                <!-- Header -->
                <div class="text-center mb-8">
                    <p class="text-fuchsia-400 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Compare PDF</p>
                    <h2 class="text-4xl font-semibold text-white mb-3">Compare PDF</h2>
                    <p class="text-slate-400">Porovnat dvě verze PDF dokumentu vedle sebe.</p>
                </div>

                <!-- Side by Side Upload -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <!-- Document A -->
                    <div class="bg-card border border-border rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-bold text-white">Dokument A</h3>
                            <button id="compare-remove-a" class="hidden text-slate-400 hover:text-red-400 transition-colors">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <div id="compare-upload-a" class="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-fuchsia-500 hover:bg-fuchsia-500/5 transition-all">
                            <i data-lucide="file-up" class="w-10 h-10 text-fuchsia-400 mx-auto mb-3"></i>
                            <p class="text-white font-medium mb-1">Nahrát PDF</p>
                            <p class="text-slate-500 text-sm">Přetáhněte nebo klikněte</p>
                            <input type="file" id="compare-file-a-input" accept=".pdf" class="hidden">
                        </div>
                        <div id="compare-info-a" class="hidden">
                            <p id="compare-name-a" class="text-white font-medium truncate mb-3"></p>
                            <div class="flex items-center gap-2 mb-4">
                                <label class="text-slate-400 text-sm">Stránka:</label>
                                <input type="number" id="compare-page-a" value="1" min="1" class="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-center focus:border-fuchsia-500 focus:outline-none">
                                <span id="compare-max-a" class="text-slate-500 text-sm">z 1</span>
                            </div>
                            <div class="flex gap-2">
                                <button id="compare-prev-a" class="flex-1 p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-40" disabled>
                                    <i data-lucide="chevron-left" class="w-4 h-4 mx-auto"></i>
                                </button>
                                <button id="compare-next-a" class="flex-1 p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                                    <i data-lucide="chevron-right" class="w-4 h-4 mx-auto"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Document B -->
                    <div class="bg-card border border-border rounded-2xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-bold text-white">Dokument B</h3>
                            <button id="compare-remove-b" class="hidden text-slate-400 hover:text-red-400 transition-colors">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        <div id="compare-upload-b" class="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-fuchsia-500 hover:bg-fuchsia-500/5 transition-all">
                            <i data-lucide="file-up" class="w-10 h-10 text-fuchsia-400 mx-auto mb-3"></i>
                            <p class="text-white font-medium mb-1">Nahrát PDF</p>
                            <p class="text-slate-500 text-sm">Přetáhněte nebo klikněte</p>
                            <input type="file" id="compare-file-b-input" accept=".pdf" class="hidden">
                        </div>
                        <div id="compare-info-b" class="hidden">
                            <p id="compare-name-b" class="text-white font-medium truncate mb-3"></p>
                            <div class="flex items-center gap-2 mb-4">
                                <label class="text-slate-400 text-sm">Stránka:</label>
                                <input type="number" id="compare-page-b" value="1" min="1" class="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-center focus:border-fuchsia-500 focus:outline-none">
                                <span id="compare-max-b" class="text-slate-500 text-sm">z 1</span>
                            </div>
                            <div class="flex gap-2">
                                <button id="compare-prev-b" class="flex-1 p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-40" disabled>
                                    <i data-lucide="chevron-left" class="w-4 h-4 mx-auto"></i>
                                </button>
                                <button id="compare-next-b" class="flex-1 p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                                    <i data-lucide="chevron-right" class="w-4 h-4 mx-auto"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Preview Area -->
                <div id="compare-preview-area" class="hidden">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div id="compare-preview-container-a" class="bg-slate-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-fuchsia-500 transition-all">
                            <canvas id="compare-canvas-a" class="w-full"></canvas>
                        </div>
                        <div id="compare-preview-container-b" class="bg-slate-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-fuchsia-500 transition-all">
                            <canvas id="compare-canvas-b" class="w-full"></canvas>
                        </div>
                    </div>
                    <p class="text-slate-500 text-center text-sm mt-4">Klikněte na náhled pro zvětšení</p>
                </div>

                <!-- Enlarged View Modal -->
                <div id="compare-modal" class="fixed inset-0 bg-black/95 z-50 hidden items-center justify-center p-4">
                    <div class="max-w-7xl w-full max-h-[95vh] overflow-auto">
                        <div class="flex justify-between items-center mb-4">
                            <h3 id="compare-modal-title" class="text-white font-bold text-xl">Porovnání stránek</h3>
                            <button id="compare-modal-close" class="text-white hover:text-fuchsia-400 transition-colors p-2">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-slate-900 rounded-xl overflow-hidden">
                                <p class="text-fuchsia-400 text-sm p-2 text-center bg-slate-800">Dokument A - <span id="compare-modal-page-a">Stránka 1</span></p>
                                <canvas id="compare-modal-a" class="w-full"></canvas>
                            </div>
                            <div class="bg-slate-900 rounded-xl overflow-hidden">
                                <p class="text-fuchsia-400 text-sm p-2 text-center bg-slate-800">Dokument B - <span id="compare-modal-page-b">Stránka 1</span></p>
                                <canvas id="compare-modal-b" class="w-full"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        let pdfBytesA = null;
        let pdfBytesB = null;
        let pdfJsA = null;
        let pdfJsB = null;
        let totalPagesA = 0;
        let totalPagesB = 0;
        let pageA = 1;
        let pageB = 1;

        // Upload A
        const uploadA = document.getElementById('compare-upload-a');
        const fileInputA = document.getElementById('compare-file-a-input');

        uploadA.addEventListener('click', () => fileInputA.click());
        uploadA.addEventListener('dragover', (e) => { e.preventDefault(); uploadA.classList.add('border-fuchsia-500', 'bg-fuchsia-500/10'); });
        uploadA.addEventListener('dragleave', () => { uploadA.classList.remove('border-fuchsia-500', 'bg-fuchsia-500/10'); });
        uploadA.addEventListener('drop', (e) => { e.preventDefault(); uploadA.classList.remove('border-fuchsia-500', 'bg-fuchsia-500/10'); handleFileA(e.dataTransfer.files[0]); });
        fileInputA.addEventListener('change', (e) => handleFileA(e.target.files[0]));

        async function handleFileA(file) {
            if (!file || file.type !== 'application/pdf') { showToast('Vyberte PDF soubor', 'error'); return; }
            pdfBytesA = new Uint8Array(await file.arrayBuffer());
            pdfJsA = await pdfjsLib.getDocument({ data: pdfBytesA.slice() }).promise;
            totalPagesA = pdfJsA.numPages;
            pageA = 1;

            document.getElementById('compare-name-a').textContent = file.name;
            document.getElementById('compare-max-a').textContent = `z ${totalPagesA}`;
            document.getElementById('compare-page-a').value = 1;
            document.getElementById('compare-upload-a').classList.add('hidden');
            document.getElementById('compare-info-a').classList.remove('hidden');
            document.getElementById('compare-remove-a').classList.remove('hidden');

            updatePreview();
        }

        document.getElementById('compare-remove-a').addEventListener('click', () => {
            pdfBytesA = null; pdfJsA = null; totalPagesA = 0; pageA = 1;
            document.getElementById('compare-upload-a').classList.remove('hidden');
            document.getElementById('compare-info-a').classList.add('hidden');
            document.getElementById('compare-remove-a').classList.add('hidden');
            updatePreview();
        });

        // Upload B
        const uploadB = document.getElementById('compare-upload-b');
        const fileInputB = document.getElementById('compare-file-b-input');

        uploadB.addEventListener('click', () => fileInputB.click());
        uploadB.addEventListener('dragover', (e) => { e.preventDefault(); uploadB.classList.add('border-fuchsia-500', 'bg-fuchsia-500/10'); });
        uploadB.addEventListener('dragleave', () => { uploadB.classList.remove('border-fuchsia-500', 'bg-fuchsia-500/10'); });
        uploadB.addEventListener('drop', (e) => { e.preventDefault(); uploadB.classList.remove('border-fuchsia-500', 'bg-fuchsia-500/10'); handleFileB(e.dataTransfer.files[0]); });
        fileInputB.addEventListener('change', (e) => handleFileB(e.target.files[0]));

        async function handleFileB(file) {
            if (!file || file.type !== 'application/pdf') { showToast('Vyberte PDF soubor', 'error'); return; }
            pdfBytesB = new Uint8Array(await file.arrayBuffer());
            pdfJsB = await pdfjsLib.getDocument({ data: pdfBytesB.slice() }).promise;
            totalPagesB = pdfJsB.numPages;
            pageB = 1;

            document.getElementById('compare-name-b').textContent = file.name;
            document.getElementById('compare-max-b').textContent = `z ${totalPagesB}`;
            document.getElementById('compare-page-b').value = 1;
            document.getElementById('compare-upload-b').classList.add('hidden');
            document.getElementById('compare-info-b').classList.remove('hidden');
            document.getElementById('compare-remove-b').classList.remove('hidden');

            updatePreview();
        }

        document.getElementById('compare-remove-b').addEventListener('click', () => {
            pdfBytesB = null; pdfJsB = null; totalPagesB = 0; pageB = 1;
            document.getElementById('compare-upload-b').classList.remove('hidden');
            document.getElementById('compare-info-b').classList.add('hidden');
            document.getElementById('compare-remove-b').classList.add('hidden');
            updatePreview();
        });

        // Page navigation A
        document.getElementById('compare-page-a').addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 1;
            if (val < 1) val = 1;
            if (val > totalPagesA) val = totalPagesA;
            pageA = val;
            updatePreview();
        });

        document.getElementById('compare-prev-a').addEventListener('click', () => {
            if (pageA > 1) { pageA--; document.getElementById('compare-page-a').value = pageA; updatePreview(); }
        });

        document.getElementById('compare-next-a').addEventListener('click', () => {
            if (pageA < totalPagesA) { pageA++; document.getElementById('compare-page-a').value = pageA; updatePreview(); }
        });

        // Page navigation B
        document.getElementById('compare-page-b').addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 1;
            if (val < 1) val = 1;
            if (val > totalPagesB) val = totalPagesB;
            pageB = val;
            updatePreview();
        });

        document.getElementById('compare-prev-b').addEventListener('click', () => {
            if (pageB > 1) { pageB--; document.getElementById('compare-page-b').value = pageB; updatePreview(); }
        });

        document.getElementById('compare-next-b').addEventListener('click', () => {
            if (pageB < totalPagesB) { pageB++; document.getElementById('compare-page-b').value = pageB; updatePreview(); }
        });

        // Render page
        async function renderPage(pdfDoc, pageNum, canvasId, scale = 1.5) {
            const canvas = document.getElementById(canvasId);
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }

        // Update preview
        async function updatePreview() {
            const previewArea = document.getElementById('compare-preview-area');
            const containerA = document.getElementById('compare-preview-container-a');
            const containerB = document.getElementById('compare-preview-container-b');

            if (!pdfJsA && !pdfJsB) {
                previewArea.classList.add('hidden');
                return;
            }

            previewArea.classList.remove('hidden');

            // Update button states
            document.getElementById('compare-prev-a').disabled = pageA <= 1;
            document.getElementById('compare-next-a').disabled = pageA >= totalPagesA;
            document.getElementById('compare-prev-b').disabled = pageB <= 1;
            document.getElementById('compare-next-b').disabled = pageB >= totalPagesB;

            // Render A
            if (pdfJsA) {
                containerA.classList.remove('hidden');
                await renderPage(pdfJsA, pageA, 'compare-canvas-a', 1.5);
            } else {
                containerA.classList.add('hidden');
            }

            // Render B
            if (pdfJsB) {
                containerB.classList.remove('hidden');
                await renderPage(pdfJsB, pageB, 'compare-canvas-b', 1.5);
            } else {
                containerB.classList.add('hidden');
            }
        }

        // Click to enlarge
        document.getElementById('compare-preview-container-a').addEventListener('click', () => openModal('a'));
        document.getElementById('compare-preview-container-b').addEventListener('click', () => openModal('b'));

        // Modal
        async function openModal(doc) {
            if (doc === 'a' && !pdfJsA) return;
            if (doc === 'b' && !pdfJsB) return;

            const modal = document.getElementById('compare-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            lucide.createIcons();

            document.getElementById('compare-modal-page-a').textContent = `Stránka ${pageA}`;
            document.getElementById('compare-modal-page-b').textContent = `Stránka ${pageB}`;

            if (pdfJsA) await renderPage(pdfJsA, pageA, 'compare-modal-a', 2.5);
            if (pdfJsB) await renderPage(pdfJsB, pageB, 'compare-modal-b', 2.5);
        }

        document.getElementById('compare-modal-close').addEventListener('click', () => {
            document.getElementById('compare-modal').classList.add('hidden');
            document.getElementById('compare-modal').classList.remove('flex');
        });

        document.getElementById('compare-modal').addEventListener('click', (e) => {
            if (e.target.id === 'compare-modal') {
                document.getElementById('compare-modal').classList.add('hidden');
                document.getElementById('compare-modal').classList.remove('flex');
            }
        });
    }

    // --- SCAN TO PDF ---
    else if (toolId === 'scan-to-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-teal-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Scan to PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Scan to PDF</h2>
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
            {id: 'pdf-jpg', label: 'PDF → JPG', from: 'pdf', to: 'jpg', frontend: true, icon: 'image'},
            {id: 'pdf-png', label: 'PDF → PNG', from: 'pdf', to: 'png', frontend: true, icon: 'image'},
            {id: 'pdf-webp', label: 'PDF → WebP', from: 'pdf', to: 'webp', frontend: true, icon: 'image'},
            {id: 'jpg-pdf', label: 'JPG/PNG → PDF', from: 'img', to: 'pdf', frontend: true, icon: 'file-text'},
            {id: 'gif-pdf', label: 'GIF → PDF', from: 'gif', to: 'pdf', frontend: true, icon: 'file-text'},
            {id: 'webp-pdf', label: 'WebP → PDF', from: 'webp', to: 'pdf', frontend: true, icon: 'file-text'},
            {id: 'bmp-pdf', label: 'BMP → PDF', from: 'bmp', to: 'pdf', frontend: true, icon: 'file-text'},
            {id: 'tiff-pdf', label: 'TIFF → PDF', from: 'tiff', to: 'pdf', frontend: true, icon: 'file-text'},
        ];
        const quickPicks = ['pdf-jpg', 'jpg-pdf', 'pdf-png'];

        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-sky-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Converter</p>
                <h2 class="text-4xl font-semibold text-white mb-3">PDF Converter</h2>
                <p class="text-slate-400">Konverze PDF do různých formátů a zpět.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div class="bg-card border border-border rounded-2xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-3">Vstupní formát</label>
                        <select id="conv-input-format" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white">
                            <option value="auto">Auto detekce</option>
                            <option value="pdf">PDF</option>
                            <option value="img">Obrázek (JPG, PNG, WebP, GIF, BMP, TIFF)</option>
                        </select>
                    </div>

                    <div class="bg-card border border-border rounded-2xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-3">Výstupní formát</label>
                        <div class="grid grid-cols-2 gap-2" id="conv-output-options">
                            ${convFormats.filter(f => f.to !== 'pdf').map(f => `
                                <label class="conv-option flex items-center gap-2 p-3 bg-[#0B0F19] border border-slate-700 rounded-lg cursor-pointer hover:border-sky-500 transition-colors" data-format="${f.id}">
                                    <input type="radio" name="conv-output" value="${f.id}" class="w-4 h-4 text-sky-500">
                                    <i data-lucide="${f.icon}" class="w-4 h-4 text-slate-400"></i>
                                    <span class="text-white text-sm">${f.to.toUpperCase()}</span>
                                </label>
                            `).join('')}
                            <label class="conv-option flex items-center gap-2 p-3 bg-[#0B0F19] border border-slate-700 rounded-lg cursor-pointer hover:border-sky-500 transition-colors" data-format="to-pdf">
                                <input type="radio" name="conv-output" value="to-pdf" class="w-4 h-4 text-sky-500">
                                <i data-lucide="file-text" class="w-4 h-4 text-slate-400"></i>
                                <span class="text-white text-sm">PDF</span>
                            </label>
                        </div>
                    </div>

                    <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <p class="text-emerald-400 text-sm font-medium mb-2">Rychlý výběr</p>
                        <div class="flex gap-2">
                            ${quickPicks.map(q => {
                                const f = convFormats.find(x => x.id === q);
                                return `<button onclick="selectQuickConvert('${q}')" class="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm rounded-lg transition-colors">${f?.label || 'PDF'}</button>`;
                            }).join('')}
                        </div>
                    </div>

                    <div id="conv-upload-area">
                        ${createDropzone('conv-dz', '.pdf,image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif', 'Nahrajte PDF nebo obrázek')}
                    </div>
                    <div id="conv-file-info" class="hidden bg-card border border-border rounded-xl p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i data-lucide="file" class="w-8 h-8 text-sky-400"></i>
                                <div>
                                    <p id="conv-filename" class="text-white font-medium truncate max-w-[200px]"></p>
                                    <p id="conv-filesize" class="text-slate-400 text-sm"></p>
                                </div>
                            </div>
                            <button onclick="resetConverter()" class="text-slate-400 hover:text-white">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                    <button id="btn-convert" class="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        <i data-lucide="arrow-right-left" class="w-5 h-5 inline mr-2"></i>Konvertovat
                    </button>
                </div>

                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Fronta konverzí</h3>
                    <div id="conv-queue" class="flex-grow space-y-2 overflow-y-auto max-h-[400px]">
                        <div class="text-center text-slate-500 py-8">
                            <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                            <p>Zatím žádné soubory</p>
                        </div>
                    </div>
                    <button id="btn-download-all" class="hidden w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors">
                        <i data-lucide="download" class="w-5 h-5 inline mr-2"></i>Stáhnout vše jako ZIP
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();

        let uploadedFile = null;
        const convertedFiles = [];

        window.selectQuickConvert = (format) => {
            document.querySelector(`input[name="conv-output"][value="${format}"]`).checked = true;
            document.querySelectorAll('.conv-option').forEach(el => {
                el.classList.remove('border-sky-500', 'bg-sky-500/10');
            });
            const selected = document.querySelector(`[data-format="${format}"]`);
            if (selected) {
                selected.classList.add('border-sky-500', 'bg-sky-500/10');
            }
        };

        window.resetConverter = () => {
            uploadedFile = null;
            document.getElementById('conv-upload-area').classList.remove('hidden');
            document.getElementById('conv-file-info').classList.add('hidden');
            document.getElementById('btn-convert').disabled = true;
        };

        initDropzone('conv-dz', (files) => {
            uploadedFile = files[0];
            if (!uploadedFile) return;
            document.getElementById('conv-filename').innerText = uploadedFile.name;
            document.getElementById('conv-filesize').innerText = `${(uploadedFile.size / 1024).toFixed(1)} KB`;
            document.getElementById('conv-upload-area').classList.add('hidden');
            document.getElementById('conv-file-info').classList.remove('hidden');
            document.getElementById('btn-convert').disabled = false;

            // Auto detect format
            if (uploadedFile.type === 'application/pdf') {
                document.getElementById('conv-input-format').value = 'pdf';
            } else if (uploadedFile.type.startsWith('image/')) {
                document.getElementById('conv-input-format').value = 'img';
            }
        });

        document.getElementById('btn-convert').addEventListener('click', async () => {
            if (!uploadedFile) return;
            const outputFormat = document.querySelector('input[name="conv-output"]:checked')?.value || 'pdf-jpg';
            showLoading('btn-convert', 'Konvertuji...');

            const queueItem = {
                id: Date.now(),
                name: uploadedFile.name,
                format: outputFormat,
                status: 'processing',
                blob: null
            };

            const queueContainer = document.getElementById('conv-queue');
            const emptyMsg = queueContainer.querySelector('.text-center');
            if (emptyMsg) emptyMsg.remove();

            const itemEl = document.createElement('div');
            itemEl.id = `queue-${queueItem.id}`;
            itemEl.className = 'flex items-center gap-3 p-3 bg-[#0B0F19] border border-slate-700 rounded-lg';
            itemEl.innerHTML = `
                <i data-lucide="loader-2" class="w-5 h-5 animate-spin text-sky-400"></i>
                <span class="flex-grow text-white text-sm truncate">${uploadedFile.name}</span>
                <span class="text-slate-400 text-xs">Konvertuji...</span>
            `;
            queueContainer.appendChild(itemEl);
            lucide.createIcons();

            try {
                let resultBlob, resultName;

                if (outputFormat === 'to-pdf' || outputFormat === 'jpg-pdf' || outputFormat === 'gif-pdf' || outputFormat === 'webp-pdf' || outputFormat === 'bmp-pdf' || outputFormat === 'tiff-pdf') {
                    // Image to PDF
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
                    resultBlob = new Blob([pdfBytes], {type: 'application/pdf'});
                    resultName = uploadedFile.name.replace(/\.[^.]+$/, '') + '.pdf';
                } else {
                    // PDF to image
                    const pdfBytes = await uploadedFile.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({data: pdfBytes}).promise;

                    if (pdf.numPages > 1) {
                        // Multiple pages - create ZIP
                        const zip = new JSZip();
                        const format = outputFormat.split('-')[1];
                        const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';

                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const viewport = page.getViewport({scale: 2});
                            const canvas = document.createElement('canvas');
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
                            const dataUrl = canvas.toDataURL(mimeType, 0.9);
                            const base64Data = dataUrl.split(',')[1];
                            zip.file(`page_${i}.${format}`, base64Data, {base64: true});
                        }
                        resultBlob = await zip.generateAsync({type: 'blob'});
                        resultName = uploadedFile.name.replace('.pdf', '') + '_pages.zip';
                    } else {
                        // Single page
                        const page = await pdf.getPage(1);
                        const viewport = page.getViewport({scale: 2});
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;

                        const format = outputFormat.split('-')[1];
                        const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
                        canvas.toBlob((blob) => {
                            resultBlob = blob;
                        }, mimeType, 0.9);
                        await new Promise(r => setTimeout(r, 100));
                        resultName = uploadedFile.name.replace('.pdf', `.${format}`);
                    }
                }

                queueItem.blob = resultBlob;
                queueItem.status = 'done';
                convertedFiles.push(queueItem);

                itemEl.innerHTML = `
                    <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>
                    <span class="flex-grow text-white text-sm truncate">${resultName}</span>
                    <button onclick="downloadConvertedFile(${queueItem.id})" class="text-sky-400 hover:text-sky-300 text-sm">Stáhnout</button>
                `;
                lucide.createIcons();

                if (convertedFiles.length > 0) {
                    document.getElementById('btn-download-all').classList.remove('hidden');
                }
            } catch (e) {
                itemEl.innerHTML = `
                    <i data-lucide="x-circle" class="w-5 h-5 text-red-400"></i>
                    <span class="flex-grow text-white text-sm truncate">${uploadedFile.name}</span>
                    <span class="text-red-400 text-xs">Chyba: ${e.message.slice(0, 30)}</span>
                `;
                lucide.createIcons();
            }
            hideLoading('btn-convert');
            resetConverter();
        });

        window.downloadConvertedFile = (id) => {
            const file = convertedFiles.find(f => f.id === id);
            if (file && file.blob) {
                const name = file.name.replace(/\.[^.]+$/, '') + (file.blob.type === 'application/pdf' ? '.pdf' : '.zip');
                downloadBlob(file.blob, file.blob.type === 'application/zip' ? file.name : file.name);
            }
        };

        document.getElementById('btn-download-all').addEventListener('click', async () => {
            if (convertedFiles.length === 0) return;
            const zip = new JSZip();
            for (const file of convertedFiles) {
                if (file.blob) {
                    const name = file.name;
                    zip.file(name, file.blob);
                }
            }
            const zipBlob = await zip.generateAsync({type: 'blob'});
            downloadBlob(zipBlob, 'converted_files.zip');
        });
    }

    // --- OCR PDF ---
    else if (toolId === 'ocr-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / OCR PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">OCR PDF</h2>
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
                <h2 class="text-4xl font-semibold text-white mb-2">AI Summarizer</h2>
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
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            document.getElementById('btn-ai-sum').disabled = false;
        });

        document.getElementById('btn-ai-sum').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-ai-sum', 'Analyzuji...');
            document.getElementById('ai-sum-loading').classList.remove('hidden');
            document.getElementById('ai-sum-result').classList.add('hidden');
            try {
                const pdf = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
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
                    body: JSON.stringify({
                        text: fullText.substring(0, 30000),
                        lang: lang
                    })
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
                <h2 class="text-4xl font-semibold text-white mb-2">Translate PDF</h2>
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
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            document.getElementById('btn-ai-trans').disabled = false;
        });

        document.getElementById('btn-ai-trans').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-ai-trans', 'Překládám...');
            document.getElementById('ai-trans-loading').classList.remove('hidden');
            try {
                const pdf = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
                let fullText = '';
                for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                const targetLang = document.getElementById('trans-lang-input').value || 'English';
                const response = await fetch('./api/ai-translate.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        text: fullText.substring(0, 30000),
                        targetLang: targetLang,
                        lang: 'CS'
                    })
                });
                const data = await response.json();
                document.getElementById('ai-trans-result').value = data.text || 'Překlad selhal.';
            } catch (e) {
                let msg = e.message;
                if (msg.includes('JSON') || msg.includes('Unexpected')) {
                    msg = 'API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)';
                }
                showToast('Chyba: ' + msg, 'error');
            }
            document.getElementById('ai-trans-loading').classList.add('hidden');
            hideLoading('btn-ai-trans');
        });
    }

    // --- HTML TO PDF ---
    else if (toolId === 'html-to-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / HTML to PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">HTML to PDF</h2>
                <p class="text-slate-400">Převeďte HTML kód nebo webovou stránku na PDF.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div class="bg-card border border-border rounded-2xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-3">Zdroj</label>
                        <div class="flex gap-2 mb-4">
                            <button id="src-code-btn" class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium">HTML Kód</button>
                            <button id="src-url-btn" class="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors">URL Adresa</button>
                        </div>
                        <div id="src-code-area">
                            <textarea id="html-input" class="w-full h-64 bg-[#0B0F19] border border-slate-700 rounded-lg p-4 text-white font-mono text-sm resize-none" placeholder="Vložte HTML kód zde...

Příklad:
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Moje stránka</h1>
    <p>Obsah dokumentu...</p>
</body>
</html>"></textarea>
                        </div>
                        <div id="src-url-area" class="hidden">
                            <input type="url" id="url-input" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="https://example.com">
                            <p class="text-xs text-slate-500 mt-2">Zadejte URL webové stránky pro převod na PDF.</p>
                        </div>
                    </div>
                    <div class="bg-card border border-border rounded-2xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-3">Nastavení</label>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs text-slate-500 mb-1 block">Formát stránky</label>
                                <select id="page-format" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="a4">A4</option>
                                    <option value="letter">Letter</option>
                                    <option value="a3">A3</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-slate-500 mb-1 block">Orientace</label>
                                <select id="page-orientation" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                                    <option value="portrait">Na výšku</option>
                                    <option value="landscape">Na šířku</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <button id="btn-convert-html" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors">
                        <i data-lucide="file-text" class="w-5 h-5 inline mr-2"></i>Převést na PDF
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Náhled</h3>
                    <div id="html-preview" class="flex-grow bg-white rounded-lg overflow-hidden min-h-[300px]">
                        <div class="flex items-center justify-center h-full text-slate-400">
                            <p>Náhled se zobrazí po konverzi...</p>
                        </div>
                    </div>
                    <button id="btn-download-html-pdf" class="hidden w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors">
                        <i data-lucide="download" class="w-5 h-5 inline mr-2"></i>Stáhnout PDF
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();

        let generatedPdf = null;

        // Toggle source mode
        document.getElementById('src-code-btn').addEventListener('click', () => {
            document.getElementById('src-code-btn').classList.replace('bg-slate-700', 'bg-orange-500');
            document.getElementById('src-code-btn').classList.replace('text-slate-300', 'text-white');
            document.getElementById('src-url-btn').classList.replace('bg-orange-500', 'bg-slate-700');
            document.getElementById('src-url-btn').classList.replace('text-white', 'text-slate-300');
            document.getElementById('src-code-area').classList.remove('hidden');
            document.getElementById('src-url-area').classList.add('hidden');
        });

        document.getElementById('src-url-btn').addEventListener('click', () => {
            document.getElementById('src-url-btn').classList.replace('bg-slate-700', 'bg-orange-500');
            document.getElementById('src-url-btn').classList.replace('text-slate-300', 'text-white');
            document.getElementById('src-code-btn').classList.replace('bg-orange-500', 'bg-slate-700');
            document.getElementById('src-code-btn').classList.replace('text-white', 'text-slate-300');
            document.getElementById('src-url-area').classList.remove('hidden');
            document.getElementById('src-code-area').classList.add('hidden');
        });

        document.getElementById('btn-convert-html').addEventListener('click', async () => {
            const isUrlMode = !document.getElementById('src-url-area').classList.contains('hidden');
            let htmlContent = '';

            showLoading('btn-convert-html', 'Převádím...');

            try {
                if (isUrlMode) {
                    const url = document.getElementById('url-input').value.trim();
                    if (!url) {
                        alert('Zadejte URL adresu.');
                        hideLoading('btn-convert-html');
                        return;
                    }
                    // Fetch URL content via proxy (due to CORS)
                    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
                    htmlContent = await response.text();
                } else {
                    htmlContent = document.getElementById('html-input').value.trim();
                    if (!htmlContent) {
                        alert('Vložte HTML kód.');
                        hideLoading('btn-convert-html');
                        return;
                    }
                }

                const format = document.getElementById('page-format').value;
                const orientation = document.getElementById('page-orientation').value;

                // Create preview iframe
                const preview = document.getElementById('html-preview');
                preview.innerHTML = `<iframe id="preview-frame" class="w-full h-full min-h-[300px] border-0"></iframe>`;
                const iframe = document.getElementById('preview-frame');
                iframe.contentDocument.open();
                iframe.contentDocument.write(htmlContent);
                iframe.contentDocument.close();

                // Generate PDF
                const element = iframe.contentDocument.body;
                const opt = {
                    margin: 10,
                    filename: 'document.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: format, orientation: orientation }
                };

                generatedPdf = await html2pdf().set(opt).from(element).outputPdf('blob');

                document.getElementById('btn-download-html-pdf').classList.remove('hidden');
                hideLoading('btn-convert-html');

            } catch (e) {
                alert('Chyba při konverzi: ' + e.message);
                hideLoading('btn-convert-html');
            }
        });

        document.getElementById('btn-download-html-pdf').addEventListener('click', () => {
            if (generatedPdf) {
                const url = URL.createObjectURL(generatedPdf);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'document.pdf';
                a.click();
                URL.revokeObjectURL(url);
            }
        });
    }

    // --- PDF TO HTML ---
    else if (toolId === 'pdf-to-html') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-teal-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / PDF to HTML</p>
                <h2 class="text-4xl font-semibold text-white mb-3">PDF to HTML</h2>
                <p class="text-slate-400">Extrahujte obsah PDF do HTML formátu.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('pdf-html-dz', '.pdf,application/pdf', 'Nahrajte PDF soubor')}
                    <div id="pdf-html-info" class="hidden bg-card border border-border rounded-xl p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i data-lucide="file-text" class="w-8 h-8 text-teal-400"></i>
                                <div>
                                    <p id="pdf-html-filename" class="text-white font-medium truncate max-w-[200px]"></p>
                                    <p id="pdf-html-pages" class="text-slate-400 text-sm"></p>
                                </div>
                            </div>
                            <button onclick="resetPdfToHtml()" class="text-slate-400 hover:text-white">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                    <div class="bg-card border border-border rounded-2xl p-5">
                        <label class="block text-sm font-bold text-slate-400 mb-3">Možnosti exportu</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="opt-images" checked class="w-4 h-4 text-teal-500">
                                <span class="text-white text-sm">Zahrnout obrázky</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="opt-styles" checked class="w-4 h-4 text-teal-500">
                                <span class="text-white text-sm">Zahrnout styly</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="opt-preserve" class="w-4 h-4 text-teal-500">
                                <span class="text-white text-sm">Zachovat rozložení</span>
                            </label>
                        </div>
                    </div>
                    <button id="btn-extract-html" class="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50" disabled>
                        <i data-lucide="code" class="w-5 h-5 inline mr-2"></i>Extrahovat HTML
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-white">Výstup</h3>
                        <div class="flex gap-2">
                            <button id="btn-copy-html" class="hidden px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                                <i data-lucide="copy" class="w-4 h-4 inline mr-1"></i>Kopírovat
                            </button>
                            <button id="btn-download-html" class="hidden px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm rounded-lg transition-colors">
                                <i data-lucide="download" class="w-4 h-4 inline mr-1"></i>Stáhnout
                            </button>
                        </div>
                    </div>
                    <div id="html-output" class="flex-grow">
                        <textarea id="html-result" class="hidden w-full h-full min-h-[400px] bg-[#0B0F19] border border-slate-700 rounded-lg p-4 text-white font-mono text-sm resize-none" readonly></textarea>
                        <div id="html-placeholder" class="flex items-center justify-center h-full min-h-[400px] text-slate-400">
                            <div class="text-center">
                                <i data-lucide="file-code" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                                <p>HTML kód se zobrazí po extrakci...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        let pdfBytes = null;
        let extractedHtml = '';

        window.resetPdfToHtml = () => {
            pdfBytes = null;
            document.getElementById('pdf-html-dz').classList.remove('hidden');
            document.getElementById('pdf-html-info').classList.add('hidden');
            document.getElementById('btn-extract-html').disabled = true;
            document.getElementById('html-result').classList.add('hidden');
            document.getElementById('html-placeholder').classList.remove('hidden');
            document.getElementById('btn-copy-html').classList.add('hidden');
            document.getElementById('btn-download-html').classList.add('hidden');
        };

        initDropzone('pdf-html-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = new Uint8Array(await file.arrayBuffer());

            const pdf = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
            document.getElementById('pdf-html-filename').textContent = file.name;
            document.getElementById('pdf-html-pages').textContent = `${pdf.numPages} stránek`;
            document.getElementById('pdf-html-dz').classList.add('hidden');
            document.getElementById('pdf-html-info').classList.remove('hidden');
            document.getElementById('btn-extract-html').disabled = false;
        });

        document.getElementById('btn-extract-html').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-extract-html', 'Extrahuji...');

            try {
                const includeImages = document.getElementById('opt-images').checked;
                const includeStyles = document.getElementById('opt-styles').checked;
                const preserveLayout = document.getElementById('opt-preserve').checked;

                const pdf = await pdfjsLib.getDocument({data: pdfBytes.slice()}).promise;
                let htmlContent = '<!DOCTYPE html>\n<html lang="cs">\n<head>\n';
                htmlContent += '<meta charset="UTF-8">\n';
                htmlContent += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
                htmlContent += '<title>Converted PDF</title>\n';

                if (includeStyles) {
                    htmlContent += '<style>\n';
                    htmlContent += 'body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }\n';
                    htmlContent += '.page { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }\n';
                    htmlContent += '.page:last-child { border-bottom: none; }\n';
                    htmlContent += '.page-number { color: #666; font-size: 12px; margin-bottom: 10px; }\n';
                    if (preserveLayout) {
                        htmlContent += '.page { position: relative; }\n';
                        htmlContent += '.text-block { position: relative; }\n';
                    }
                    htmlContent += '</style>\n';
                }

                htmlContent += '</head>\n<body>\n';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    htmlContent += `<div class="page">\n`;
                    htmlContent += `<div class="page-number">Stránka ${i} z ${pdf.numPages}</div>\n`;

                    // Extract text with position info
                    let lastY = null;
                    let currentParagraph = '';

                    textContent.items.forEach(item => {
                        if (item.str.trim()) {
                            const y = Math.round(item.transform[5]);
                            if (lastY !== null && Math.abs(y - lastY) > 10) {
                                if (currentParagraph.trim()) {
                                    htmlContent += `<p>${currentParagraph.trim()}</p>\n`;
                                }
                                currentParagraph = '';
                            }
                            currentParagraph += item.str + ' ';
                            lastY = y;
                        }
                    });

                    if (currentParagraph.trim()) {
                        htmlContent += `<p>${currentParagraph.trim()}</p>\n`;
                    }

                    htmlContent += '</div>\n';
                }

                htmlContent += '</body>\n</html>';

                extractedHtml = htmlContent;

                document.getElementById('html-placeholder').classList.add('hidden');
                const textarea = document.getElementById('html-result');
                textarea.classList.remove('hidden');
                textarea.value = htmlContent;
                document.getElementById('btn-copy-html').classList.remove('hidden');
                document.getElementById('btn-download-html').classList.remove('hidden');

                hideLoading('btn-extract-html');
            } catch (e) {
                alert('Chyba při extrakci: ' + e.message);
                hideLoading('btn-extract-html');
            }
        });

        document.getElementById('btn-copy-html').addEventListener('click', () => {
            navigator.clipboard.writeText(extractedHtml).then(() => {
                showToast('HTML zkopírováno do schránky!', 'success');
            });
        });

        document.getElementById('btn-download-html').addEventListener('click', () => {
            const blob = new Blob([extractedHtml], {type: 'text/html'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted.html';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // --- REPAIR PDF ---
    else if (toolId === 'repair-pdf') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-yellow-500 font-bold text-sm tracking-widest uppercase mb-2">PDF Tools / Repair PDF</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Repair PDF</h2>
                <p class="text-slate-400">Opravit poškozený PDF soubor.</p>
            </div>
            <div id="repair-upload-area" class="max-w-xl mx-auto">
                ${createDropzone('repair-dz', 'application/pdf', 'Nahrajte poškozené PDF')}
            </div>
            <div id="repair-work-area" class="hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-card border border-border rounded-2xl p-6">
                        <h3 class="text-lg font-bold text-white mb-4">Nahraný soubor</h3>
                        <div class="flex items-center gap-4 p-4 bg-[#1E293B] rounded-xl">
                            <div class="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400">
                                <i data-lucide="file-text" class="w-7 h-7"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p id="repair-filename" class="text-white font-bold truncate"></p>
                                <p id="repair-filesize" class="text-slate-400 text-sm"></p>
                            </div>
                        </div>
                        <button id="btn-repair-change" class="w-full mt-4 py-2 text-yellow-400 hover:text-yellow-300 text-sm">
                            <i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i> Nahrát jiný soubor
                        </button>
                    </div>
                    <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                        <h3 class="text-lg font-bold text-white mb-4">Výsledek opravy</h3>
                        <div id="repair-status" class="flex-grow flex items-center justify-center text-slate-400 py-8">
                            <p>Klikněte na "Opravit PDF" pro spuštění opravy.</p>
                        </div>
                        <button id="btn-repair" class="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl transition-colors">
                            Opravit PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        let pdfBytes = null;
        let fileName = '';

        function formatSize(bytes) {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

        initDropzone('repair-dz', async (files) => {
            const file = files[0];
            if (!file || file.type !== 'application/pdf') return alert('Vyberte PDF soubor.');
            pdfBytes = new Uint8Array(await file.arrayBuffer());
            fileName = file.name;

            document.getElementById('repair-filename').textContent = file.name;
            document.getElementById('repair-filesize').textContent = formatSize(file.size);
            document.getElementById('repair-upload-area').classList.add('hidden');
            document.getElementById('repair-work-area').classList.remove('hidden');
            document.getElementById('repair-status').innerHTML = '<p class="text-slate-400">Klikněte na "Opravit PDF" pro spuštění opravy.</p>';
        });

        document.getElementById('btn-repair-change').addEventListener('click', () => {
            pdfBytes = null;
            fileName = '';
            document.getElementById('repair-upload-area').classList.remove('hidden');
            document.getElementById('repair-work-area').classList.add('hidden');
        });

        document.getElementById('btn-repair').addEventListener('click', async () => {
            if (!pdfBytes) return;
            showLoading('btn-repair', 'Opravuji...');
            document.getElementById('repair-status').innerHTML = '<i data-lucide="loader-2" class="w-8 h-8 animate-spin text-yellow-500"></i>';
            lucide.createIcons();

            try {
                // Method 1: Try to find PDF header if missing
                let repairedBytes = pdfBytes;
                const headerStr = '%PDF-';

                // Check if file starts with %PDF-
                const headerCheck = new TextDecoder('utf-8', {fatal: false}).decode(pdfBytes.slice(0, 5));

                if (!headerCheck.startsWith('%PDF-')) {
                    // Try to find PDF header somewhere in the file
                    const decoder = new TextDecoder('utf-8', {fatal: false});
                    const content = decoder.decode(pdfBytes);
                    const headerIndex = content.indexOf('%PDF-');

                    if (headerIndex !== -1) {
                        // Found header - extract from that point
                        repairedBytes = pdfBytes.slice(headerIndex);
                        document.getElementById('repair-status').innerHTML = '<p class="text-yellow-400 mb-2">Nalezena PDF hlavička na pozici ' + headerIndex + '</p>';
                    } else {
                        // Try to add a PDF header
                        const pdfVersion = '1.4';
                        const headerBytes = new TextEncoder().encode(`%PDF-${pdfVersion}\n`);
                        repairedBytes = new Uint8Array(headerBytes.length + pdfBytes.length);
                        repairedBytes.set(headerBytes, 0);
                        repairedBytes.set(pdfBytes, headerBytes.length);
                    }
                }

                // Method 2: Try to parse with various options
                const loadOptions = {
                    ignoreEncryption: true,
                    updateMetadata: false,
                    ignoreInstructions: true,
                    throwOnInvalidObject: false,
                    capNumbers: true
                };

                let pdfDoc;
                try {
                    pdfDoc = await PDFLib.PDFDocument.load(repairedBytes, loadOptions);
                } catch (e1) {
                    // Try parsing original bytes with more lenient options
                    try {
                        pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, loadOptions);
                    } catch (e2) {
                        // Last resort: try to reconstruct PDF structure
                        const reconstructedBytes = await reconstructPDF(pdfBytes);
                        pdfDoc = await PDFLib.PDFDocument.load(reconstructedBytes, loadOptions);
                    }
                }

                const repairedPdf = await pdfDoc.save();
                const successHtml = `
                    <div class="text-center">
                        <i data-lucide="check-circle" class="w-12 h-12 text-green-500 mb-4"></i>
                        <p class="text-green-400 font-bold text-lg mb-2">PDF úspěšně opraveno!</p>
                        <p class="text-slate-400 text-sm">Původní: ${formatSize(pdfBytes.length)} → Opravené: ${formatSize(repairedPdf.length)}</p>
                    </div>
                `;
                document.getElementById('repair-status').innerHTML = successHtml;
                lucide.createIcons();
                downloadBlob(new Blob([repairedPdf], {type: 'application/pdf'}), 'repaired_' + fileName);

            } catch (e) {
                const errorHtml = `
                    <div class="text-center">
                        <i data-lucide="x-circle" class="w-12 h-12 text-red-500 mb-4"></i>
                        <p class="text-red-400 font-bold text-lg mb-2">Oprava selhala</p>
                        <p class="text-slate-400 text-sm">${escapeHTML(e.message)}</p>
                        <p class="text-slate-500 text-xs mt-2">PDF je příliš poškozen a nelze obnovit.</p>
                    </div>
                `;
                document.getElementById('repair-status').innerHTML = errorHtml;
                lucide.createIcons();
            }
            hideLoading('btn-repair');
        });

        async function reconstructPDF(bytes) {
            // Find startxref and xref positions
            const decoder = new TextDecoder('utf-8', {fatal: false});
            const content = decoder.decode(bytes);

            // Try to create a minimal valid PDF structure
            const pdfVersion = '1.4';
            const header = `%PDF-${pdfVersion}\n`;
            const footer = '\n%%EOF';

            // Check if EOF exists
            if (!content.includes('%%EOF')) {
                const newBytes = new Uint8Array(header.length + bytes.length + footer.length);
                newBytes.set(new TextEncoder().encode(header), 0);
                newBytes.set(bytes, header.length);
                newBytes.set(new TextEncoder().encode(footer), header.length + bytes.length);
                return newBytes;
            }

            return bytes;
        }
    }

    // --- IMAGE COMPRESS ---
    else if (toolId === 'img-compress') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-violet-500 font-bold text-sm tracking-widest uppercase mb-2">Image / Compress</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Image Compressor</h2>
                <p class="text-slate-400">Zmenšete velikost obrázku bez viditelné ztráty kvality.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createImageDropzone('imgcomp-dz', 'JPG, PNG, WebP až 10MB')}
                    <div class="flex items-center gap-4">
                        <label class="text-white text-sm">Kvalita:</label>
                        <input type="range" id="imgcomp-quality" min="10" max="100" value="80" class="flex-grow">
                        <span id="imgcomp-quality-val" class="text-white text-sm w-12">80%</span>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-semibold text-white mb-4">Výsledek</h3>
                    <div id="imgcomp-result" class="flex-grow flex items-center justify-center text-slate-400 py-8">
                        <p>Nahrajte obrázek pro kompresi.</p>
                    </div>
                    <button id="btn-imgcomp" class="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 mt-4" disabled>
                        Stáhnout komprimovaný obrázek
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();

        let compressedBlob = null;
        let currentFile = null;
        const qualitySlider = document.getElementById('imgcomp-quality');
        const qualityVal = document.getElementById('imgcomp-quality-val');
        qualitySlider.addEventListener('input', () => {
            qualityVal.textContent = qualitySlider.value + '%';
            if (currentFile) compressImage(currentFile, parseInt(qualitySlider.value));
        });

        initImageDropzone('imgcomp-dz', async (files) => {
            const file = files[0];
            currentFile = file;
            document.getElementById('btn-imgcomp').disabled = false;
            compressImage(file, parseInt(qualitySlider.value));
        });

        async function compressImage(file, quality) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await img.decode();
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
                compressedBlob = blob;
                const result = document.getElementById('imgcomp-result');
                const saved = Math.round((1 - blob.size / file.size) * 100);
                result.innerHTML = `
                    <div class="text-center">
                        <p class="text-white mb-2">${file.name}</p>
                        <p class="text-slate-400 text-sm mb-2">${img.width} × ${img.height} px</p>
                        <p class="text-slate-400 text-sm mb-4">Původní: ${(file.size/1024).toFixed(1)} KB → Nový: ${(blob.size/1024).toFixed(1)} KB</p>
                        <p class="text-green-400 font-semibold">Ušetřeno: ${saved}%</p>
                    </div>`;
            }, 'image/jpeg', quality / 100);
        }

        document.getElementById('btn-imgcomp').addEventListener('click', () => {
            if (compressedBlob) downloadBlob(compressedBlob, 'compressed.jpg');
        });
    }

    // --- COLOR EXTRACTOR ---
    else if (toolId === 'color-extractor') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-purple-500 font-bold text-sm tracking-widest uppercase mb-2">Image / Color Palette</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Color Palette</h2>
                <p class="text-slate-400">Extrahuje dominantní barvy z obrázku.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createImageDropzone('color-dz', 'Nahrajte obrázek pro analýzu')}
                </div>
                <div class="bg-card border border-border rounded-2xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Dominantní barvy</h3>
                    <div id="color-result" class="grid grid-cols-3 gap-4">
                        <p class="text-slate-400 col-span-3 text-center">Nahrajte obrázek pro extrakci barev.</p>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        initImageDropzone('color-dz', async (files) => {
            const file = files[0];
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await img.decode();
            const canvas = document.createElement('canvas');
            const size = 100;
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;
            const colors = {};
            for (let i = 0; i < data.length; i += 4) {
                const r = Math.round(data[i] / 32) * 32;
                const g = Math.round(data[i+1] / 32) * 32;
                const b = Math.round(data[i+2] / 32) * 32;
                const key = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
                colors[key] = (colors[key] || 0) + 1;
            }
            const sorted = Object.entries(colors).sort((a,b) => b[1] - a[1]).slice(0, 6);
            const result = document.getElementById('color-result');
            result.innerHTML = sorted.map(([hex]) => `
                <div class="flex flex-col items-center gap-2">
                    <div class="w-16 h-16 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform" style="background:${hex}"></div>
                    <button onclick="navigator.clipboard.writeText('${hex}')" class="text-xs text-slate-400 hover:text-white">${hex}</button>
                </div>
            `).join('');
        });
    }

    // --- PALETTE GENERATOR ---
    else if (toolId === 'palette-generator') {
        container.innerHTML = `
            <div class="text-center mb-8">
                <p class="text-pink-500 font-bold text-sm tracking-widest uppercase mb-2">Image / Palette Generator</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Palette Generator</h2>
                <p class="text-slate-400">Vytvářejte a spravujte barevné palety pro vaše projekty. <span class="text-slate-500">Stiskněte <kbd class="px-2 py-0.5 bg-slate-700 rounded text-slate-300">Space</kbd> pro novou paletu.</span></p>
            </div>

            <div class="max-w-6xl mx-auto">
                <!-- Palette Display -->
                <div id="palette-display" class="grid gap-1 mb-6 rounded-2xl overflow-hidden shadow-2xl" style="min-height: 420px;">
                    <!-- Colors will be rendered here -->
                </div>

                <!-- Controls -->
                <div class="flex flex-wrap gap-3 justify-center mb-8">
                    <button id="btn-generate" class="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
                        <i data-lucide="refresh-cw" class="w-5 h-5"></i> Generovat novou
                    </button>
                    <button id="btn-save-palette" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
                        <i data-lucide="heart" class="w-5 h-5"></i> Uložit paletu
                    </button>
                    <button id="btn-export" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
                        <i data-lucide="download" class="w-5 h-5"></i> Exportovat
                    </button>
                </div>

                <!-- Harmony Mode -->
                <div class="bg-card border border-border rounded-2xl p-6 mb-6">
                    <h3 class="text-lg font-bold text-white mb-4">Režim harmonie</h3>
                    <div class="flex flex-wrap gap-2">
                        <button data-mode="random" class="harmony-btn px-4 py-2 bg-pink-500 text-white rounded-lg transition-colors">Náhodné</button>
                        <button data-mode="analogous" class="harmony-btn px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Analogické</button>
                        <button data-mode="complementary" class="harmony-btn px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Doplňkové</button>
                        <button data-mode="triadic" class="harmony-btn px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Triádní</button>
                        <button data-mode="split" class="harmony-btn px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Split-komplementární</button>
                        <button data-mode="tetradic" class="harmony-btn px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Tetradické</button>
                        <button data-mode="monochromatic" class="harmony-btn px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Monochromatické</button>
                    </div>
                </div>

                <!-- Saved Palettes -->
                <div class="bg-card border border-border rounded-2xl p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Uložené palety</h3>
                    <div id="saved-palettes" class="space-y-3">
                        <p class="text-slate-400 text-center py-4">Žádné uložené palety. Klikněte na ♡ pro uložení.</p>
                    </div>
                </div>
            </div>

            <!-- Export Modal -->
            <div id="palette-export-modal" class="fixed inset-0 bg-black/80 z-50 hidden items-center justify-center p-4">
                <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-white">Exportovat paletu</h3>
                        <button id="close-export-modal" class="text-slate-400 hover:text-white">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    <div class="space-y-3">
                        <button id="export-css" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left px-4">
                            <span class="font-bold">CSS Variables</span>
                            <span class="text-slate-400 text-sm block">:root { --color-1: #xxx; ... }</span>
                        </button>
                        <button id="export-tailwind" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left px-4">
                            <span class="font-bold">Tailwind Config</span>
                            <span class="text-slate-400 text-sm block">colors: { primary: '#xxx', ... }</span>
                        </button>
                        <button id="export-json" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left px-4">
                            <span class="font-bold">JSON</span>
                            <span class="text-slate-400 text-sm block">["#xxx", "#yyy", ...]</span>
                        </button>
                        <button id="export-url" class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left px-4">
                            <span class="font-bold">URL / Share</span>
                            <span class="text-slate-400 text-sm block">Kopírovat odkaz s paletou</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        let currentPalette = [];
        let currentMode = 'random';
        let savedPalettes = JSON.parse(localStorage.getItem('vevit-palettes') || '[]');

        // Color utilities
        function hslToHex(h, s, l) {
            s /= 100; l /= 100;
            const a = s * Math.min(l, 1 - l);
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return '#' + f(0) + f(8) + f(4);
        }

        function hexToHsl(hex) {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) { h = s = 0; }
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        }

        function randomColor() {
            return hslToHex(Math.random() * 360, 50 + Math.random() * 40, 40 + Math.random() * 30);
        }

        function generatePalette(count = 5) {
            const palette = [];
            const baseHue = Math.random() * 360;

            if (currentMode === 'random') {
                for (let i = 0; i < count; i++) {
                    palette.push(randomColor());
                }
            } else if (currentMode === 'analogous') {
                for (let i = 0; i < count; i++) {
                    const hue = (baseHue + i * 30) % 360;
                    palette.push(hslToHex(hue, 60 + Math.random() * 20, 45 + Math.random() * 20));
                }
            } else if (currentMode === 'complementary') {
                const hue2 = (baseHue + 180) % 360;
                palette.push(hslToHex(baseHue, 60, 50));
                palette.push(hslToHex(baseHue, 70, 40));
                palette.push(hslToHex(hue2, 60, 50));
                palette.push(hslToHex(hue2, 70, 40));
                palette.push(hslToHex((baseHue + 90) % 360, 50, 60));
            } else if (currentMode === 'triadic') {
                for (let i = 0; i < count && i < 3; i++) {
                    const hue = (baseHue + i * 120) % 360;
                    palette.push(hslToHex(hue, 60 + Math.random() * 20, 50));
                }
                while (palette.length < count) {
                    palette.push(hslToHex((baseHue + Math.random() * 60) % 360, 50, 60));
                }
            } else if (currentMode === 'split') {
                const hue2 = (baseHue + 150) % 360;
                const hue3 = (baseHue + 210) % 360;
                palette.push(hslToHex(baseHue, 60, 50));
                palette.push(hslToHex(baseHue, 40, 70));
                palette.push(hslToHex(hue2, 60, 50));
                palette.push(hslToHex(hue3, 60, 50));
                palette.push(hslToHex(baseHue, 30, 80));
            } else if (currentMode === 'tetradic') {
                for (let i = 0; i < count && i < 4; i++) {
                    const hue = (baseHue + i * 90) % 360;
                    palette.push(hslToHex(hue, 60 + Math.random() * 20, 50));
                }
                while (palette.length < count) {
                    palette.push(hslToHex((baseHue + Math.random() * 90) % 360, 50, 60));
                }
            } else if (currentMode === 'monochromatic') {
                for (let i = 0; i < count; i++) {
                    const l = 20 + (i * 60 / count);
                    palette.push(hslToHex(baseHue, 50 + Math.random() * 30, l));
                }
            }
            return palette;
        }

        function getContrastColor(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? '#000000' : '#ffffff';
        }

        function interpolateColor(color1, color2) {
            const hsl1 = hexToHsl(color1);
            const hsl2 = hexToHsl(color2);
            return hslToHex(
                (hsl1.h + hsl2.h) / 2,
                (hsl1.s + hsl2.s) / 2,
                (hsl1.l + hsl2.l) / 2
            );
        }

        function renderPalette() {
            const display = document.getElementById('palette-display');
            const colCount = currentPalette.length;
            display.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
            display.style.position = 'relative';
            display.className = 'grid gap-0 mb-6 rounded-2xl overflow-hidden shadow-2xl relative palette-container';
            display.style.minHeight = '420px';

            let html = '';
            currentPalette.forEach((color, i) => {
                html += `
                <div class="relative group cursor-pointer" data-index="${i}">
                    <div class="color-strip h-full flex flex-col justify-end items-center p-6 transition-all" style="background: ${color}; min-height: 420px;">
                        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="delete-color-btn w-8 h-8 rounded-full bg-black/30 hover:bg-red-500/80 flex items-center justify-center text-white" data-index="${i}">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="text-center" style="color: ${getContrastColor(color)}">
                            <p class="font-mono font-bold text-2xl mb-1">${color.toUpperCase()}</p>
                            <p class="text-sm opacity-70">Klikněte pro kopírování</p>
                        </div>
                    </div>
                </div>`;
            });

            // Add plus buttons between colors
            for (let i = 0; i < currentPalette.length - 1; i++) {
                const leftPos = ((i + 1) / colCount) * 100;
                html += `
                <div class="add-color-btn-container absolute top-1/2 -translate-y-1/2 z-20"
                     style="left: calc(${leftPos}% - 20px);"
                     data-insert-index="${i + 1}">
                    <button class="add-color-btn w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-all opacity-0 group-hover:opacity-80 hover:opacity-100">
                        <i data-lucide="plus" class="w-5 h-5 text-slate-800"></i>
                    </button>
                </div>`;
            }

            display.innerHTML = html;
            lucide.createIcons();
        }

        // Event delegation for palette display
        const paletteDisplayEl = document.getElementById('palette-display');

        // Show/hide plus buttons on hover
        paletteDisplayEl.addEventListener('mouseenter', () => {
            paletteDisplayEl.querySelectorAll('.add-color-btn').forEach(btn => {
                btn.classList.remove('opacity-0');
            });
        });
        paletteDisplayEl.addEventListener('mouseleave', () => {
            paletteDisplayEl.querySelectorAll('.add-color-btn').forEach(btn => {
                btn.classList.add('opacity-0');
            });
        });

        // Click on color to copy
        paletteDisplayEl.addEventListener('click', (e) => {
            const colorStrip = e.target.closest('.color-strip');
            if (colorStrip && !e.target.closest('.delete-color-btn')) {
                const index = parseInt(colorStrip.closest('[data-index]').dataset.index);
                navigator.clipboard.writeText(currentPalette[index]);
                showToast(`Zkopírováno: ${currentPalette[index]}`, 'success');
            }
        });

        // Click on delete button
        paletteDisplayEl.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-color-btn');
            if (deleteBtn) {
                e.stopPropagation();
                if (currentPalette.length > 2) {
                    const index = parseInt(deleteBtn.dataset.index);
                    currentPalette.splice(index, 1);
                    renderPalette();
                } else {
                    showToast('Minimálně 2 barvy', 'error');
                }
            }
        });

        // Click on add button
        paletteDisplayEl.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-color-btn');
            if (addBtn) {
                e.stopPropagation();
                const container = addBtn.closest('.add-color-btn-container');
                const insertIndex = parseInt(container.dataset.insertIndex);
                const prevColor = currentPalette[insertIndex - 1];
                const nextColor = currentPalette[insertIndex] || currentPalette[insertIndex - 1];
                const newColor = interpolateColor(prevColor, nextColor);
                currentPalette.splice(insertIndex, 0, newColor);
                renderPalette();
            }
        });

        function renderSavedPalettes() {
            const container = document.getElementById('saved-palettes');
            if (savedPalettes.length === 0) {
                container.innerHTML = '<p class="text-slate-400 text-center py-4">Žádné uložené palety. Klikněte na ♡ pro uložení.</p>';
                return;
            }
            container.innerHTML = savedPalettes.map((palette, i) => `
                <div class="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
                    <div class="flex gap-1 flex-grow">
                        ${palette.map(c => `<div class="w-8 h-8 rounded-lg" style="background: ${c}"></div>`).join('')}
                    </div>
                    <button class="load-palette-btn px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg" data-index="${i}">Načíst</button>
                    <button class="delete-palette-btn text-slate-400 hover:text-red-400" data-index="${i}">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            `).join('');
            lucide.createIcons();

            container.querySelectorAll('.load-palette-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentPalette = [...savedPalettes[parseInt(btn.dataset.index)]];
                    renderPalette();
                });
            });

            container.querySelectorAll('.delete-palette-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    savedPalettes.splice(parseInt(btn.dataset.index), 1);
                    localStorage.setItem('vevit-palettes', JSON.stringify(savedPalettes));
                    renderSavedPalettes();
                });
            });
        }

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && document.body.contains(document.getElementById('palette-display'))) {
                e.preventDefault();
                currentPalette = generatePalette(currentPalette.length || 5);
                renderPalette();
            }
        });

        // Initialize
        currentPalette = generatePalette(5);
        renderPalette();
        renderSavedPalettes();

        // Event handlers
        document.getElementById('btn-generate').addEventListener('click', () => {
            currentPalette = generatePalette(currentPalette.length || 5);
            renderPalette();
        });

        document.getElementById('btn-save-palette').addEventListener('click', () => {
            if (!savedPalettes.some(p => JSON.stringify(p) === JSON.stringify(currentPalette))) {
                savedPalettes.push([...currentPalette]);
                localStorage.setItem('vevit-palettes', JSON.stringify(savedPalettes));
                renderSavedPalettes();
                showToast('Paleta uložena!', 'success');
            } else {
                showToast('Paleta už je uložena', 'error');
            }
        });

        document.querySelectorAll('.harmony-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.harmony-btn').forEach(b => {
                    b.classList.remove('bg-pink-500');
                    b.classList.add('bg-slate-700');
                });
                btn.classList.remove('bg-slate-700');
                btn.classList.add('bg-pink-500');
                currentMode = btn.dataset.mode;
                currentPalette = generatePalette(currentPalette.length || 5);
                renderPalette();
            });
        });

        document.getElementById('btn-export').addEventListener('click', () => {
            document.getElementById('palette-export-modal').classList.remove('hidden');
            document.getElementById('palette-export-modal').classList.add('flex');
        });

        document.getElementById('close-export-modal').addEventListener('click', () => {
            document.getElementById('palette-export-modal').classList.add('hidden');
            document.getElementById('palette-export-modal').classList.remove('flex');
        });

        document.getElementById('export-css').addEventListener('click', () => {
            const css = ':root {\n' + currentPalette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}';
            navigator.clipboard.writeText(css);
            showToast('CSS zkopírováno do schránky!', 'success');
        });

        document.getElementById('export-tailwind').addEventListener('click', () => {
            const tw = 'colors: {\n  primary: \'' + currentPalette[0] + '\',\n  ' + currentPalette.slice(1).map((c, i) => `accent-${i + 1}: '${c}'`).join(',\n  ') + '\n}';
            navigator.clipboard.writeText(tw);
            showToast('Tailwind config zkopírováno!', 'success');
        });

        document.getElementById('export-json').addEventListener('click', () => {
            navigator.clipboard.writeText(JSON.stringify(currentPalette, null, 2));
            showToast('JSON zkopírováno do schránky!', 'success');
        });

        document.getElementById('export-url').addEventListener('click', () => {
            const url = window.location.origin + '?palette=' + currentPalette.map(c => c.slice(1)).join('-');
            navigator.clipboard.writeText(url);
            showToast('URL zkopírováno do schránky!', 'success');
        });
    }

    // --- IMAGE CROP ---
    else if (toolId === 'img-crop') {
        initImageCropTool(container);
    }

    // --- EXIF REMOVER ---
    else if (toolId === 'exif-remover') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-purple-500 font-bold text-sm tracking-widest uppercase mb-2">Image / EXIF Remover</p>
                <h2 class="text-4xl font-semibold text-white mb-3">EXIF Remover</h2>
                <p class="text-slate-400">Smaže GPS a metadata z fotek.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${createImageDropzone('exif-dz', 'Nahrajte JPG obrázek')}
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-semibold text-white mb-4">Výsledek</h3>
                    <div id="exif-result" class="flex-grow flex items-center justify-center text-slate-400 py-8">
                        <p>Nahrajte obrázek pro odstranění metadat.</p>
                    </div>
                    <button id="btn-exif" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 mt-4" disabled>
                        Stáhnout bez EXIF
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();

        let exifFile = null;
        initImageDropzone('exif-dz', async (files) => {
            exifFile = files[0];
            document.getElementById('btn-exif').disabled = false;
            document.getElementById('exif-result').innerHTML = `
                <div class="text-center">
                    <p class="text-white mb-2">${exifFile.name}</p>
                    <p class="text-slate-400 text-sm">${(exifFile.size/1024).toFixed(1)} KB</p>
                </div>`;
        });

        document.getElementById('btn-exif').addEventListener('click', async () => {
            if (!exifFile) return;
            showLoading('btn-exif', 'Zpracovávám...');
            try {
                const canvas = document.createElement('canvas');
                const img = new Image();
                img.src = URL.createObjectURL(exifFile);
                await img.decode();
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    downloadBlob(blob, 'no-exif.jpg');
                    hideLoading('btn-exif');
                }, 'image/jpeg', 0.95);
            } catch (e) {
                showToast('Chyba: ' + e.message, 'error');
                hideLoading('btn-exif');
            }
        });
    }

    // --- IMAGE OCR ---
    else if (toolId === 'img-ocr') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-violet-500 font-bold text-sm tracking-widest uppercase mb-2">Image / OCR</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Image to Text (OCR)</h2>
                <p class="text-slate-400">Extrakce textu z obrázku.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${createImageDropzone('ocr-img-dz', 'Nahrajte obrázek s textem')}
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-semibold text-white mb-4">Rozpoznaný text</h3>
                    <textarea id="ocr-result" class="flex-grow bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none min-h-[200px]" placeholder="Rozpoznaný text se zobrazí zde..." readonly></textarea>
                    <div class="flex gap-2 mt-4">
                        <button onclick="navigator.clipboard.writeText(document.getElementById('ocr-result').value); showToast('Zkopírováno!', 'success')" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl">Kopírovat</button>
                        <button onclick="downloadBlob(new Blob([document.getElementById('ocr-result').value], {type:'text/plain'}), 'ocr.txt')" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl">Stáhnout .txt</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        initImageDropzone('ocr-img-dz', async (files) => {
            const file = files[0];
            document.getElementById('ocr-result').value = 'Rozpoznávám text...';
            try {
                const result = await Tesseract.recognize(file, 'ces+eng', {logger: m => {}});
                document.getElementById('ocr-result').value = result.data.text || 'Žádný text nebyl rozpoznán.';
            } catch (e) {
                document.getElementById('ocr-result').value = 'Chyba: ' + e.message;
            }
        });
    }

    // --- COLLAGE MAKER ---
    else if (toolId === 'collage-maker') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-violet-500 font-bold text-sm tracking-widest uppercase mb-2">Image / Collage</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Collage Maker</h2>
                <p class="text-slate-400">Složí více fotek do jednoho obrázku.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createDropzone('collage-dz', 'image/*', 'Nahrajte více obrázků', 'upload', true)}
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="setCollageLayout('grid')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">Mřížka</button>
                        <button onclick="setCollageLayout('horizontal')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">Vodorovně</button>
                        <button onclick="setCollageLayout('vertical')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">Svisle</button>
                    </div>
                    <div id="collage-images-list" class="flex flex-wrap gap-2"></div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6">
                    <canvas id="collage-canvas" class="w-full rounded-lg bg-slate-900 mb-4" style="max-height:400px"></canvas>
                    <button id="btn-collage" class="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors" disabled>Stáhnout collage</button>
                </div>
            </div>
        `;
        let collageImages = [];
        let collageLayout = 'grid';

        window.setCollageLayout = (layout) => {
            collageLayout = layout;
            renderCollage();
        };

        initDropzone('collage-dz', (files) => {
            collageImages = [];
            loadedCount = 0;
            document.getElementById('collage-images-list').innerHTML = '';
            document.getElementById('btn-collage').disabled = true;

            const imageFiles = files.filter(f => f.type.startsWith('image/'));
            let loadedImages = 0;

            imageFiles.forEach((f) => {
                const img = new Image();
                img.src = URL.createObjectURL(f);
                img.onload = function() {
                    collageImages.push(img);
                    const imgIndex = collageImages.length - 1;

                    // Add thumbnail to list
                    const thumb = document.createElement('div');
                    thumb.className = 'relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800';
                    const imgEl = document.createElement('img');
                    imgEl.src = img.src;
                    imgEl.className = 'w-full h-full object-cover';
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600';
                    removeBtn.textContent = '×';
                    removeBtn.onclick = function() {
                        thumb.remove();
                        removeCollageImage(imgIndex);
                    };
                    thumb.appendChild(imgEl);
                    thumb.appendChild(removeBtn);
                    document.getElementById('collage-images-list').appendChild(thumb);

                    loadedImages++;
                    if (loadedImages === imageFiles.length) {
                        renderCollage();
                    }
                };
            });
        });

        window.removeCollageImage = (index) => {
            collageImages.splice(index, 1);
            if (collageImages.length === 0) {
                document.getElementById('btn-collage').disabled = true;
                const canvas = document.getElementById('collage-canvas');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                renderCollage();
            }
        };

        function renderCollage() {
            if (collageImages.length === 0) return;

            const canvas = document.getElementById('collage-canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 800;
            const maxHeight = 600;

            if (collageLayout === 'horizontal' && collageImages.length) {
                canvas.width = Math.min(maxWidth, collageImages.length * 300);
                canvas.height = Math.min(maxHeight, 300);
            } else if (collageLayout === 'vertical' && collageImages.length) {
                canvas.width = Math.min(maxWidth, 400);
                canvas.height = Math.min(maxHeight, collageImages.length * 200);
            } else {
                const cols = Math.ceil(Math.sqrt(collageImages.length));
                const rows = Math.ceil(collageImages.length / cols);
                canvas.width = Math.min(maxWidth, cols * 200);
                canvas.height = Math.min(maxHeight, rows * 200);
            }

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawCollage(ctx, canvas.width, canvas.height);
            document.getElementById('btn-collage').disabled = false;
        }

        function drawCollage(ctx, width, height) {
            if (collageImages.length === 0) return;

            if (collageLayout === 'horizontal') {
                const w = width / collageImages.length;
                collageImages.forEach((img, i) => {
                    // Draw image with cover behavior
                    const imgRatio = img.width / img.height;
                    const cellRatio = w / height;
                    let drawW, drawH, drawX, drawY;

                    if (imgRatio > cellRatio) {
                        drawH = height;
                        drawW = height * imgRatio;
                        drawX = i * w + (w - drawW) / 2;
                        drawY = 0;
                    } else {
                        drawW = w;
                        drawH = w / imgRatio;
                        drawX = i * w;
                        drawY = (height - drawH) / 2;
                    }
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                });
            } else if (collageLayout === 'vertical') {
                const h = height / collageImages.length;
                collageImages.forEach((img, i) => {
                    const imgRatio = img.width / img.height;
                    const cellRatio = width / h;
                    let drawW, drawH, drawX, drawY;

                    if (imgRatio > cellRatio) {
                        drawH = h;
                        drawW = h * imgRatio;
                        drawX = (width - drawW) / 2;
                        drawY = i * h;
                    } else {
                        drawW = width;
                        drawH = width / imgRatio;
                        drawX = 0;
                        drawY = i * h + (h - drawH) / 2;
                    }
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                });
            } else {
                // Grid layout
                const cols = Math.ceil(Math.sqrt(collageImages.length));
                const rows = Math.ceil(collageImages.length / cols);
                const cellW = width / cols;
                const cellH = height / rows;

                collageImages.forEach((img, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const imgRatio = img.width / img.height;
                    const cellRatio = cellW / cellH;
                    let drawW, drawH, drawX, drawY;

                    if (imgRatio > cellRatio) {
                        drawH = cellH;
                        drawW = cellH * imgRatio;
                        drawX = col * cellW + (cellW - drawW) / 2;
                        drawY = row * cellH;
                    } else {
                        drawW = cellW;
                        drawH = cellW / imgRatio;
                        drawX = col * cellW;
                        drawY = row * cellH + (cellH - drawH) / 2;
                    }
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                });
            }
        }

        document.getElementById('btn-collage').addEventListener('click', () => {
            if (collageImages.length === 0) return;

            const canvas = document.createElement('canvas');
            const scale = 3; // Higher resolution
            const width = 1200;
            const height = 900;

            if (collageLayout === 'horizontal') {
                canvas.width = width;
                canvas.height = height;
            } else if (collageLayout === 'vertical') {
                canvas.width = width;
                canvas.height = height;
            } else {
                canvas.width = width;
                canvas.height = height;
            }

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawCollage(ctx, canvas.width, canvas.height);

            canvas.toBlob(blob => downloadBlob(blob, 'collage.png'), 'image/png');
        });
    }

    // --- MARKDOWN EDITOR ---
    else if (toolId === 'markdown-editor') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Text / Markdown</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Markdown Editor</h2>
                <p class="text-slate-400">Live preview editor s exportem do HTML.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div class="flex gap-2">
                    <button onclick="insertMd('**', '**')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg font-bold">B</button>
                    <button onclick="insertMd('*', '*')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg italic">I</button>
                    <button onclick="insertMd('# ', '')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">H1</button>
                    <button onclick="insertMd('## ', '')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">H2</button>
                    <button onclick="insertMd('[', '](url)')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Link</button>
                    <button onclick="insertMd('\`', '\`')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Code</button>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <textarea id="md-input" class="w-full h-96 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-amber-500 outline-none" placeholder="Pište Markdown zde..."></textarea>
                </div>
                <div>
                    <div id="md-preview" class="w-full h-96 bg-white rounded-xl p-4 overflow-auto prose prose-sm"></div>
                </div>
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="downloadBlob(new Blob([document.getElementById('md-input').value], {type:'text/markdown'}), 'document.md')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl">Stáhnout .md</button>
                <button onclick="downloadBlob(new Blob([document.getElementById('md-preview').innerHTML], {type:'text/html'}), 'document.html')" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl">Stáhnout HTML</button>
            </div>
        `;
        const mdInput = document.getElementById('md-input');
        const mdPreview = document.getElementById('md-preview');
        mdInput.addEventListener('input', () => { mdPreview.innerHTML = marked.parse(mdInput.value); });
        window.insertMd = (before, after) => {
            const start = mdInput.selectionStart, end = mdInput.selectionEnd;
            const text = mdInput.value;
            const selected = text.substring(start, end);
            mdInput.value = text.substring(0, start) + before + selected + after + text.substring(end);
            mdInput.focus();
            mdInput.dispatchEvent(new Event('input'));
        };
    }

    // --- TEXT DIFF ---
    else if (toolId === 'text-diff') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Text / Diff</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Text Diff</h2>
                <p class="text-slate-400">Porovná dva texty a zvýrazní rozdíly.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="text-white text-sm mb-2 block">Text A (původní)</label>
                    <textarea id="diff-a" class="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-orange-500 outline-none" placeholder="Původní text..."></textarea>
                </div>
                <div>
                    <label class="text-white text-sm mb-2 block">Text B (nový)</label>
                    <textarea id="diff-b" class="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-orange-500 outline-none" placeholder="Nový text..."></textarea>
                </div>
            </div>
            <button onclick="compareDiff()" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl mb-4">Porovnat</button>
            <div id="diff-result" class="bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-auto"></div>
        `;
        window.compareDiff = () => {
            const a = document.getElementById('diff-a').value.split('\n');
            const b = document.getElementById('diff-b').value.split('\n');
            const result = document.getElementById('diff-result');
            let html = '';
            const maxLen = Math.max(a.length, b.length);
            for (let i = 0; i < maxLen; i++) {
                const lineA = a[i] || '';
                const lineB = b[i] || '';
                if (lineA === lineB) {
                    html += `<div class="text-slate-400">${escapeHTML(lineA) || ' '}</div>`;
                } else if (!lineA && lineB) {
                    html += `<div class="bg-green-500/20 text-green-400">+ ${escapeHTML(lineB)}</div>`;
                } else if (lineA && !lineB) {
                    html += `<div class="bg-red-500/20 text-red-400">- ${escapeHTML(lineA)}</div>`;
                } else {
                    html += `<div class="bg-red-500/20 text-red-400">- ${escapeHTML(lineA)}</div>`;
                    html += `<div class="bg-green-500/20 text-green-400">+ ${escapeHTML(lineB)}</div>`;
                }
            }
            result.innerHTML = html;
        };
    }

    // --- WORD COUNTER ---
    else if (toolId === 'word-counter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Text / Word Counter</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Word Counter</h2>
                <p class="text-slate-400">Počet slov, znaků, odstavců a doba čtení.</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-card border border-border rounded-xl p-4 text-center">
                    <div id="wc-words" class="text-3xl font-bold text-white">0</div>
                    <div class="text-slate-400 text-sm">Slova</div>
                </div>
                <div class="bg-card border border-border rounded-xl p-4 text-center">
                    <div id="wc-chars" class="text-3xl font-bold text-white">0</div>
                    <div class="text-slate-400 text-sm">Znaky</div>
                </div>
                <div class="bg-card border border-border rounded-xl p-4 text-center">
                    <div id="wc-sentences" class="text-3xl font-bold text-white">0</div>
                    <div class="text-slate-400 text-sm">Věty</div>
                </div>
                <div class="bg-card border border-border rounded-xl p-4 text-center">
                    <div id="wc-time" class="text-3xl font-bold text-white">0m</div>
                    <div class="text-slate-400 text-sm">Doba čtení</div>
                </div>
            </div>
            <textarea id="wc-input" class="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none focus:border-amber-500 outline-none" placeholder="Vložte nebo napište text zde..."></textarea>
        `;
        const wcInput = document.getElementById('wc-input');
        wcInput.addEventListener('input', () => {
            const text = wcInput.value;
            const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
            const chars = text.length;
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
            const time = Math.max(1, Math.ceil(words / 200));
            document.getElementById('wc-words').textContent = words;
            document.getElementById('wc-chars').textContent = chars;
            document.getElementById('wc-sentences').textContent = sentences;
            document.getElementById('wc-time').textContent = time + 'm';
        });
    }

    // --- CASE CONVERTER ---
    else if (toolId === 'case-converter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Text / Case Converter</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Case Converter</h2>
                <p class="text-slate-400">UPPER / lower / Title / camelCase / snake_case.</p>
            </div>
            <textarea id="case-input" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none focus:border-orange-500 outline-none mb-4" placeholder="Vložte text..."></textarea>
            <div class="flex flex-wrap gap-2 mb-4">
                <button onclick="convertCase('upper')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">UPPERCASE</button>
                <button onclick="convertCase('lower')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">lowercase</button>
                <button onclick="convertCase('title')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Title Case</button>
                <button onclick="convertCase('sentence')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Sentence case</button>
                <button onclick="convertCase('camel')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">camelCase</button>
                <button onclick="convertCase('snake')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">snake_case</button>
                <button onclick="convertCase('kebab')" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">kebab-case</button>
            </div>
            <textarea id="case-output" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
            <button onclick="navigator.clipboard.writeText(document.getElementById('case-output').value); showToast('Zkopírováno!', 'success')" class="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg">Kopírovat</button>
        `;
        window.convertCase = (type) => {
            const input = document.getElementById('case-input').value;
            let output = input;
            switch(type) {
                case 'upper': output = input.toUpperCase(); break;
                case 'lower': output = input.toLowerCase(); break;
                case 'title': output = input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); break;
                case 'sentence': output = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); break;
                case 'camel': output = input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, c) => c.toUpperCase()); break;
                case 'snake': output = input.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); break;
                case 'kebab': output = input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, ''); break;
            }
            document.getElementById('case-output').value = output;
        };
    }

    // --- LOREM IPSUM ---
    else if (toolId === 'lorem-generator') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Text / Lorem Ipsum</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Lorem Ipsum Generator</h2>
                <p class="text-slate-400">Generátor placeholder textu.</p>
            </div>
            <div class="flex gap-4 mb-4">
                <div class="flex-1">
                    <label class="text-white text-sm mb-2 block">Počet:</label>
                    <input type="number" id="lorem-count" value="3" min="1" max="50" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none">
                </div>
                <div class="flex-1">
                    <label class="text-white text-sm mb-2 block">Typ:</label>
                    <select id="lorem-type" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none">
                        <option value="paragraphs">Odstavce</option>
                        <option value="sentences">Věty</option>
                        <option value="words">Slova</option>
                    </select>
                </div>
            </div>
            <div class="flex items-center gap-2 mb-4">
                <input type="checkbox" id="lorem-start" checked class="w-4 h-4">
                <label for="lorem-start" class="text-white text-sm">Začít "Lorem ipsum dolor sit amet..."</label>
            </div>
            <button onclick="generateLorem()" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl mb-4">Generovat</button>
            <textarea id="lorem-output" class="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none outline-none" placeholder="Vygenerovaný text..." readonly></textarea>
            <button onclick="navigator.clipboard.writeText(document.getElementById('lorem-output').value); showToast('Zkopírováno!', 'success')" class="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Kopírovat</button>
        `;
        const loremWords = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
        window.generateLorem = () => {
            const count = parseInt(document.getElementById('lorem-count').value) || 3;
            const type = document.getElementById('lorem-type').value;
            const start = document.getElementById('lorem-start').checked;
            let result = [];
            if (type === 'words') {
                const words = start ? ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'] : [];
                for (let i = words.length; i < count; i++) words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
                result.push(words.join(' '));
            } else if (type === 'sentences') {
                for (let i = 0; i < count; i++) {
                    const len = 8 + Math.floor(Math.random() * 10);
                    const words = [];
                    for (let j = 0; j < len; j++) words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
                    result.push(words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.');
                }
            } else {
                for (let i = 0; i < count; i++) {
                    const sentences = 4 + Math.floor(Math.random() * 4);
                    const para = [];
                    for (let j = 0; j < sentences; j++) {
                        const len = 8 + Math.floor(Math.random() * 10);
                        const words = [];
                        for (let k = 0; k < len; k++) words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
                        para.push(words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.');
                    }
                    result.push(para.join(' '));
                }
            }
            document.getElementById('lorem-output').value = result.join('\n\n');
        };
    }

    // --- TEXT TO HANDWRITING ---
    else if (toolId === 'text-to-handwriting') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-pink-500 font-bold text-sm tracking-widest uppercase mb-2">Text / Handwriting</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Text to Handwriting</h2>
                <p class="text-slate-400">Převede text na obrázek s ručně psaným vzhledem.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <textarea id="handwriting-input" rows="8" placeholder="Zadejte text..."
                        class="w-full bg-[#0B0F19] border border-slate-700 rounded-xl p-4 text-white text-sm resize-none"></textarea>
                    <div class="bg-card border border-border rounded-xl p-4">
                        <div class="flex gap-4 mb-4">
                            <div class="flex-1">
                                <label class="text-sm text-slate-400 mb-2 block">Barva textu</label>
                                <input type="color" id="hw-color" value="#1a365d" class="w-full h-10 rounded-lg cursor-pointer border border-slate-700">
                            </div>
                            <div class="flex-1">
                                <label class="text-sm text-slate-400 mb-2 block">Pozadí</label>
                                <input type="color" id="hw-bg" value="#fef3c7" class="w-full h-10 rounded-lg cursor-pointer border border-slate-700">
                            </div>
                        </div>
                        <div class="mb-4">
                            <label class="text-sm text-slate-400 mb-2 block">Font</label>
                            <select id="hw-font" class="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-2 text-white text-sm">
                                <option value="'Caveat', cursive">Caveat (ruční psaní)</option>
                                <option value="'Indie Flower', cursive">Indie Flower</option>
                                <option value="'Patrick Hand', cursive">Patrick Hand</option>
                                <option value="'Shadows Into Light', cursive">Shadows Into Light</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-sm text-slate-400 mb-2 block">Velikost: <span id="hw-size-val">24</span>px</label>
                            <input type="range" id="hw-size" min="16" max="48" value="24">
                        </div>
                    </div>
                    <button id="btn-handwriting" class="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition-colors">
                        Vytvořit obrázek
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-bold text-white mb-4">Výsledek</h3>
                    <div id="hw-result" class="flex items-center justify-center flex-grow min-h-[300px] rounded-xl bg-[#0B0F19] border border-slate-700">
                        <p class="text-slate-500 text-sm">Výsledek se zobrazí zde</p>
                    </div>
                    <button id="btn-hw-download" class="hidden w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="download" class="w-5 h-5"></i> Stáhnout PNG
                    </button>
                </div>
            </div>
            <canvas id="hw-canvas" class="hidden"></canvas>
        `;
        lucide.createIcons();

        // Load handwriting fonts
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Indie+Flower&family=Patrick+Hand&family=Shadows+Into+Light&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        document.getElementById('hw-size').addEventListener('input', (e) => {
            document.getElementById('hw-size-val').textContent = e.target.value;
        });

        document.getElementById('btn-handwriting').addEventListener('click', () => {
            const text = document.getElementById('handwriting-input').value;
            if (!text.trim()) return showToast('Zadejte text', 'error');

            const color = document.getElementById('hw-color').value;
            const bgColor = document.getElementById('hw-bg').value;
            const font = document.getElementById('hw-font').value;
            const size = parseInt(document.getElementById('hw-size').value);

            const canvas = document.getElementById('hw-canvas');
            const ctx = canvas.getContext('2d');

            // Calculate canvas size
            const lines = text.split('\n');
            const maxWidth = Math.max(...lines.map(l => l.length)) * size * 0.6;
            const lineHeight = size * 1.5;
            const height = lines.length * lineHeight + size;

            canvas.width = Math.max(400, maxWidth + 40);
            canvas.height = height + 40;

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${size}px ${font}`;
            ctx.fillStyle = color;
            ctx.textBaseline = 'top';

            lines.forEach((line, i) => {
                // Add slight randomness for handwriting effect
                const offsetX = 10 + Math.random() * 5;
                const offsetY = 20 + i * lineHeight + Math.random() * 3;
                ctx.fillText(line, offsetX, offsetY);
            });

            const resultImg = document.createElement('img');
            resultImg.src = canvas.toDataURL('image/png');
            resultImg.className = 'max-w-full rounded-lg';

            const resultDiv = document.getElementById('hw-result');
            resultDiv.innerHTML = '';
            resultDiv.appendChild(resultImg);

            document.getElementById('btn-hw-download').classList.remove('hidden');
            lucide.createIcons();
        });

        document.getElementById('btn-hw-download').addEventListener('click', () => {
            const canvas = document.getElementById('hw-canvas');
            canvas.toBlob((blob) => {
                downloadBlob(blob, 'handwriting.png');
            }, 'image/png');
        });
    }

    // --- CSV JSON ---
    else if (toolId === 'csv-json') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Text / CSV ↔ JSON</p>
                <h2 class="text-4xl font-semibold text-white mb-3">CSV ↔ JSON Converter</h2>
                <p class="text-slate-400">Konverze mezi CSV a JSON formátem.</p>
            </div>
            <div class="flex gap-2 mb-4">
                <button onclick="setCsvJsonMode('csv2json')" id="btn-csv2json" class="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg">CSV → JSON</button>
                <button onclick="setCsvJsonMode('json2csv')" id="btn-json2csv" class="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg">JSON → CSV</button>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label class="text-white text-sm mb-2 block" id="csvjson-label-in">CSV vstup</label>
                    <textarea id="csvjson-input" class="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-amber-500 outline-none" placeholder="Vložte data..."></textarea>
                </div>
                <div>
                    <label class="text-white text-sm mb-2 block" id="csvjson-label-out">JSON výstup</label>
                    <textarea id="csvjson-output" class="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
                </div>
            </div>
            <button onclick="convertCsvJson()" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl mt-4">Převést</button>
        `;
        let csvJsonMode = 'csv2json';
        window.setCsvJsonMode = (mode) => {
            csvJsonMode = mode;
            document.getElementById('btn-csv2json').className = mode === 'csv2json' ? 'px-4 py-2 bg-amber-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
            document.getElementById('btn-json2csv').className = mode === 'json2csv' ? 'px-4 py-2 bg-amber-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
            document.getElementById('csvjson-label-in').textContent = mode === 'csv2json' ? 'CSV vstup' : 'JSON vstup';
            document.getElementById('csvjson-label-out').textContent = mode === 'csv2json' ? 'JSON výstup' : 'CSV výstup';
        };
        window.convertCsvJson = () => {
            const input = document.getElementById('csvjson-input').value;
            try {
                if (csvJsonMode === 'csv2json') {
                    const lines = input.trim().split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    const result = lines.slice(1).map(line => {
                        const values = line.split(',');
                        const obj = {};
                        headers.forEach((h, i) => obj[h] = values[i]?.trim() || '');
                        return obj;
                    });
                    document.getElementById('csvjson-output').value = JSON.stringify(result, null, 2);
                } else {
                    const data = JSON.parse(input);
                    if (!Array.isArray(data)) throw new Error('JSON musí být pole objektů');
                    const headers = Object.keys(data[0]);
                    const csv = [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n');
                    document.getElementById('csvjson-output').value = csv;
                }
            } catch (e) { showToast('Chyba: ' + e.message, 'error'); }
        };
    }

    // --- JSON FORMATTER ---
    else if (toolId === 'json-formatter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Text / JSON Formatter</p>
                <h2 class="text-4xl font-semibold text-white mb-3">JSON Formatter</h2>
                <p class="text-slate-400">Formátování, minifikace a validace JSON.</p>
            </div>
            <textarea id="json-input" class="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-orange-500 outline-none mb-4" placeholder="Vložte JSON..."></textarea>
            <div class="flex gap-2 mb-4">
                <button onclick="formatJson()" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg">Formatovat</button>
                <button onclick="minifyJson()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Minifikovat</button>
                <button onclick="validateJson()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Validovat</button>
            </div>
            <textarea id="json-output" class="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
            <div id="json-error" class="text-red-400 text-sm mt-2"></div>
        `;
        window.formatJson = () => {
            try {
                const data = JSON.parse(document.getElementById('json-input').value);
                document.getElementById('json-output').value = JSON.stringify(data, null, 2);
                document.getElementById('json-error').textContent = '';
            } catch (e) { document.getElementById('json-error').textContent = 'Chyba: ' + e.message; }
        };
        window.minifyJson = () => {
            try {
                const data = JSON.parse(document.getElementById('json-input').value);
                document.getElementById('json-output').value = JSON.stringify(data);
                document.getElementById('json-error').textContent = '';
            } catch (e) { document.getElementById('json-error').textContent = 'Chyba: ' + e.message; }
        };
        window.validateJson = () => {
            try {
                JSON.parse(document.getElementById('json-input').value);
                showToast('JSON je validní!', 'success');
                document.getElementById('json-error').textContent = '';
            } catch (e) { document.getElementById('json-error').textContent = 'Nevalidní JSON: ' + e.message; }
        };
    }

    // --- XML FORMATTER ---
    else if (toolId === 'xml-formatter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Text / XML Formatter</p>
                <h2 class="text-4xl font-semibold text-white mb-3">XML Formatter</h2>
                <p class="text-slate-400">Formátování a validace XML.</p>
            </div>
            <textarea id="xml-input" class="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-amber-500 outline-none mb-4" placeholder="Vložte XML..."></textarea>
            <div class="flex gap-2 mb-4">
                <button onclick="formatXml()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg">Formatovat</button>
                <button onclick="minifyXml()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Minifikovat</button>
            </div>
            <textarea id="xml-output" class="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
        `;
        window.formatXml = () => {
            try {
                const input = document.getElementById('xml-input').value;
                const parser = new DOMParser();
                const xml = parser.parseFromString(input, 'text/xml');
                const formatted = new XMLSerializer().serializeToString(xml.documentElement);
                document.getElementById('xml-output').value = formatted.replace(/></g, '>\n<');
            } catch (e) { showToast('Chyba: ' + e.message, 'error'); }
        };
        window.minifyXml = () => {
            const input = document.getElementById('xml-input').value;
            document.getElementById('xml-output').value = input.replace(/>\s+</g, '><').replace(/\s+/g, ' ');
        };
    }

    // --- PASSWORD GENERATOR ---
    else if (toolId === 'password-gen') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-emerald-500 font-bold text-sm tracking-widest uppercase mb-2">Security / Password Generator</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Password Generator</h2>
                <p class="text-slate-400">Generátor silných hesel.</p>
            </div>
            <div class="bg-card border border-border rounded-2xl p-6 mb-4">
                <div class="flex items-center gap-4 mb-4">
                    <input type="text" id="pwd-output" readonly class="flex-grow bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl font-mono focus:border-emerald-500 outline-none" value="">
                    <button onclick="generatePassword()" class="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"><i data-lucide="refresh-cw" class="w-5 h-5"></i></button>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label class="text-white text-sm block mb-2">Délka: <span id="pwd-length-val">16</span></label>
                        <input type="range" id="pwd-length" min="8" max="64" value="16" class="w-full">
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="pwd-upper" checked class="w-4 h-4">
                        <label for="pwd-upper" class="text-white text-sm">ABC</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="pwd-lower" checked class="w-4 h-4">
                        <label for="pwd-lower" class="text-white text-sm">abc</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="pwd-numbers" checked class="w-4 h-4">
                        <label for="pwd-numbers" class="text-white text-sm">123</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="pwd-symbols" checked class="w-4 h-4">
                        <label for="pwd-symbols" class="text-white text-sm">!@#</label>
                    </div>
                </div>
                <div id="pwd-strength" class="text-center py-2 rounded-lg text-sm"></div>
            </div>
            <div id="pwd-copies" class="space-y-2"></div>
            <button onclick="copyAllPasswords()" class="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl mt-4">Kopírovat vše</button>
        `;
        const pwdLength = document.getElementById('pwd-length');
        const pwdOutput = document.getElementById('pwd-output');
        const pwdCopies = document.getElementById('pwd-copies');
        let passwords = [];

        pwdLength.addEventListener('input', () => {
            document.getElementById('pwd-length-val').textContent = pwdLength.value;
            generatePassword();
        });
        ['pwd-upper', 'pwd-lower', 'pwd-numbers', 'pwd-symbols'].forEach(id => {
            document.getElementById(id).addEventListener('change', generatePassword);
        });

        window.generatePassword = () => {
            const len = parseInt(pwdLength.value);
            const upper = document.getElementById('pwd-upper').checked;
            const lower = document.getElementById('pwd-lower').checked;
            const numbers = document.getElementById('pwd-numbers').checked;
            const symbols = document.getElementById('pwd-symbols').checked;

            let chars = '';
            if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
            if (numbers) chars += '0123456789';
            if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

            if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

            let pwd = '';
            for (let i = 0; i < len; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
            pwdOutput.value = pwd;

            // Strength
            const strength = document.getElementById('pwd-strength');
            let score = 0;
            if (len >= 12) score++;
            if (len >= 16) score++;
            if (upper) score++;
            if (lower) score++;
            if (numbers) score++;
            if (symbols) score++;

            if (score <= 2) { strength.textContent = 'Slabé'; strength.className = 'text-center py-2 rounded-lg text-sm bg-red-500/20 text-red-400'; }
            else if (score <= 4) { strength.textContent = 'Střední'; strength.className = 'text-center py-2 rounded-lg text-sm bg-yellow-500/20 text-yellow-400'; }
            else { strength.textContent = 'Silné'; strength.className = 'text-center py-2 rounded-lg text-sm bg-green-500/20 text-green-400'; }
        };

        window.copyAllPasswords = () => {
            navigator.clipboard.writeText(pwdOutput.value);
            showToast('Heslo zkopírováno!', 'success');
        };

        generatePassword();
    }

    // --- HASH GENERATOR ---
    else if (toolId === 'hash-gen') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-emerald-500 font-bold text-sm tracking-widest uppercase mb-2">Security / Hash Generator</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Hash Generator</h2>
                <p class="text-slate-400">MD5, SHA-1, SHA-256, SHA-512 hashování.</p>
            </div>
            <textarea id="hash-input" class="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none focus:border-emerald-500 outline-none mb-4" placeholder="Zadejte text pro hashování..."></textarea>
            <button onclick="generateHashes()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mb-4">Generovat hash</button>
            <div id="hash-results" class="space-y-3"></div>
        `;
        window.generateHashes = async () => {
            const input = document.getElementById('hash-input').value;
            if (!input) return;

            const encoder = new TextEncoder();
            const data = encoder.encode(input);

            const results = document.getElementById('hash-results');
            results.innerHTML = '';

            // MD5
            const md5Hash = md5(input);
            results.innerHTML += createHashResult('MD5', md5Hash);

            // SHA hashes
            const shaAlgos = ['SHA-1', 'SHA-256', 'SHA-512'];
            for (const algo of shaAlgos) {
                const hashBuffer = await crypto.subtle.digest(algo, data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                results.innerHTML += createHashResult(algo.replace('-', '-'), hashHex);
            }
        };

        function createHashResult(name, hash) {
            return `
                <div class="bg-card border border-border rounded-xl p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-white font-semibold">${name}</span>
                        <button onclick="navigator.clipboard.writeText('${hash}'); showToast('Zkopírováno!', 'success')" class="text-emerald-400 text-sm hover:text-emerald-300">Kopírovat</button>
                    </div>
                    <code class="text-slate-400 text-xs break-all">${hash}</code>
                </div>
            `;
        }
    }

    // --- QR GENERATOR ---
    else if (toolId === 'qr-generator') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-emerald-500 font-bold text-sm tracking-widest uppercase mb-2">Security / QR Generator</p>
                <h2 class="text-4xl font-semibold text-white mb-3">QR Generator</h2>
                <p class="text-slate-400">Generování QR kódů.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <textarea id="qr-input" class="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm resize-none focus:border-emerald-500 outline-none mb-4" placeholder="Zadejte text nebo URL..."></textarea>
                    <div class="flex gap-4 mb-4">
                        <div>
                            <label class="text-white text-sm block mb-2">Velikost</label>
                            <select id="qr-size" class="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white">
                                <option value="128">128px</option>
                                <option value="256" selected>256px</option>
                                <option value="512">512px</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-white text-sm block mb-2">Barva</label>
                            <input type="color" id="qr-color" value="#000000" class="w-16 h-12 bg-slate-900 border border-slate-700 rounded-xl">
                        </div>
                    </div>
                    <button onclick="generateQR()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl">Generovat QR</button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center">
                    <div id="qr-output" class="bg-white p-4 rounded-xl mb-4">
                        <div class="w-48 h-48 flex items-center justify-center text-slate-400">
                            <i data-lucide="qr-code" class="w-24 h-24"></i>
                        </div>
                    </div>
                    <button onclick="downloadQR()" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Stáhnout PNG</button>
                </div>
            </div>
        `;
        let qrCanvas = null;
        window.generateQR = () => {
            const text = document.getElementById('qr-input').value;
            if (!text) return;
            const size = parseInt(document.getElementById('qr-size').value);
            const color = document.getElementById('qr-color').value;
            const container = document.getElementById('qr-output');
            container.innerHTML = '';
            new QRCode(container, { text, width: size, height: size, colorDark: color, colorLight: '#ffffff' });
        };
        window.downloadQR = () => {
            const canvas = document.querySelector('#qr-output canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvas.toDataURL();
                link.click();
            }
        };
    }

    // --- UUID GENERATOR ---
    else if (toolId === 'uuid-gen') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-emerald-500 font-bold text-sm tracking-widest uppercase mb-2">Security / UUID Generator</p>
                <h2 class="text-4xl font-semibold text-white mb-3">UUID Generator</h2>
                <p class="text-slate-400">Generátor UUID v1/v4/v5.</p>
            </div>
            <div class="flex gap-4 mb-6">
                <label class="flex items-center gap-2 text-white">
                    <input type="radio" name="uuid-version" value="v4" checked class="w-4 h-4"> UUID v4 (Random)
                </label>
            </div>
            <button onclick="generateUUIDs()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mb-4">Generovat 10 UUID</button>
            <div id="uuid-results" class="space-y-2"></div>
        `;
        window.generateUUIDs = () => {
            const results = document.getElementById('uuid-results');
            results.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                const uuid = crypto.randomUUID();
                results.innerHTML += `
                    <div class="flex items-center gap-4 bg-card border border-border rounded-xl p-3">
                        <code class="flex-grow text-white text-sm font-mono">${uuid}</code>
                        <button onclick="navigator.clipboard.writeText('${uuid}'); showToast('Zkopírováno!', 'success')" class="text-emerald-400 hover:text-emerald-300 text-sm">Kopírovat</button>
                    </div>
                `;
            }
        };
    }

    // --- JWT DECODER ---
    else if (toolId === 'jwt-decoder') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-teal-500 font-bold text-sm tracking-widest uppercase mb-2">Security / JWT Decoder</p>
                <h2 class="text-4xl font-semibold text-white mb-3">JWT Decoder</h2>
                <p class="text-slate-400">Dekóduje JWT token a zobrazí obsah.</p>
            </div>
            <textarea id="jwt-input" class="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-teal-500 outline-none mb-4" placeholder="Vložte JWT token..."></textarea>
            <button onclick="decodeJWT()" class="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl mb-4">Dekódovat</button>
            <div id="jwt-result" class="space-y-4"></div>
        `;
        window.decodeJWT = () => {
            const token = document.getElementById('jwt-input').value.trim();
            if (!token) return;
            const parts = token.split('.');
            if (parts.length !== 3) {
                showToast('Nevalidní JWT token', 'error');
                return;
            }
            const result = document.getElementById('jwt-result');
            try {
                const header = JSON.parse(atob(parts[0]));
                const payload = JSON.parse(atob(parts[1]));
                result.innerHTML = `
                    <div class="bg-card border border-border rounded-xl p-4">
                        <h3 class="text-white font-semibold mb-2">Header</h3>
                        <pre class="text-slate-400 text-sm overflow-auto">${JSON.stringify(header, null, 2)}</pre>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-4">
                        <h3 class="text-white font-semibold mb-2">Payload</h3>
                        <pre class="text-slate-400 text-sm overflow-auto">${JSON.stringify(payload, null, 2)}</pre>
                    </div>
                    <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm">
                        <i data-lucide="alert-triangle" class="w-4 h-4 inline mr-2"></i>
                        ⚠️ JWT není ověřen — pouze dekódován. Neukládejte citlivá data do JWT.
                    </div>
                `;
                lucide.createIcons();
            } catch (e) {
                showToast('Chyba při dekódování: ' + e.message, 'error');
            }
        };
    }

    // --- UNIT CONVERTER ---
    else if (toolId === 'unit-converter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Unit Converter</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Unit Converter</h2>
                <p class="text-slate-400">Délka, váha, teplota, plocha, objem a více.</p>
            </div>
            <select id="unit-type" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white mb-4 focus:border-orange-500 outline-none">
                <option value="length">Délka</option>
                <option value="weight">Váha</option>
                <option value="temperature">Teplota</option>
                <option value="area">Plocha</option>
                <option value="volume">Objem</option>
            </select>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <input type="number" id="unit-from-val" value="1" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl focus:border-orange-500 outline-none">
                    <select id="unit-from" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-2"></select>
                </div>
                <div>
                    <input type="number" id="unit-to-val" readonly class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl outline-none">
                    <select id="unit-to" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-2"></select>
                </div>
            </div>
        `;
        const units = {
            length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, in: 0.0254 },
            weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 },
            temperature: { c: 'c', f: 'f', k: 'k' },
            area: { 'm²': 1, 'km²': 1000000, 'ft²': 0.092903, 'ac': 4046.86 },
            volume: { l: 1, ml: 0.001, 'm³': 1000, gal: 3.78541, 'ft³': 28.3168 }
        };

        function updateUnitSelects() {
            const type = document.getElementById('unit-type').value;
            const unitList = Object.keys(units[type]);
            const fromSelect = document.getElementById('unit-from');
            const toSelect = document.getElementById('unit-to');
            fromSelect.innerHTML = unitList.map(u => `<option value="${u}">${u}</option>`).join('');
            toSelect.innerHTML = unitList.map(u => `<option value="${u}">${u}</option>`).join('');
            toSelect.selectedIndex = 1;
            convertUnit();
        }

        function convertUnit() {
            const type = document.getElementById('unit-type').value;
            const fromVal = parseFloat(document.getElementById('unit-from-val').value) || 0;
            const fromUnit = document.getElementById('unit-from').value;
            const toUnit = document.getElementById('unit-to').value;

            let result;
            if (type === 'temperature') {
                const conversions = {
                    'c-f': v => v * 9/5 + 32,
                    'c-k': v => v + 273.15,
                    'f-c': v => (v - 32) * 5/9,
                    'f-k': v => (v - 32) * 5/9 + 273.15,
                    'k-c': v => v - 273.15,
                    'k-f': v => (v - 273.15) * 9/5 + 32
                };
                const key = fromUnit + '-' + toUnit;
                result = fromUnit === toUnit ? fromVal : conversions[key]?.(fromVal) ?? fromVal;
            } else {
                const base = fromVal * units[type][fromUnit];
                result = base / units[type][toUnit];
            }
            document.getElementById('unit-to-val').value = result.toFixed(6).replace(/\.?0+$/, '');
        }

        document.getElementById('unit-type').addEventListener('change', updateUnitSelects);
        document.getElementById('unit-from-val').addEventListener('input', convertUnit);
        document.getElementById('unit-from').addEventListener('change', convertUnit);
        document.getElementById('unit-to').addEventListener('change', convertUnit);
        updateUnitSelects();
    }

    // --- COLOR CONVERTER ---
    else if (toolId === 'color-converter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Color Converter</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Color Converter</h2>
                <p class="text-slate-400">HEX ↔ RGB ↔ HSL ↔ CMYK.</p>
            </div>
            <div class="flex justify-center mb-6">
                <input type="color" id="color-picker" value="#6366f1" class="w-32 h-32 rounded-2xl cursor-pointer border-4 border-slate-700">
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-card border border-border rounded-xl p-4">
                    <label class="text-white text-sm block mb-2">HEX</label>
                    <input type="text" id="color-hex" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm font-mono" value="#6366f1">
                </div>
                <div class="bg-card border border-border rounded-xl p-4">
                    <label class="text-white text-sm block mb-2">RGB</label>
                    <input type="text" id="color-rgb" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm font-mono" value="rgb(99, 102, 241)">
                </div>
                <div class="bg-card border border-border rounded-xl p-4">
                    <label class="text-white text-sm block mb-2">HSL</label>
                    <input type="text" id="color-hsl" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm font-mono" value="hsl(239, 84%, 67%)">
                </div>
                <div class="bg-card border border-border rounded-xl p-4">
                    <label class="text-white text-sm block mb-2">CMYK</label>
                    <input type="text" id="color-cmyk" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm font-mono" value="cmyk(59, 58, 0, 5)">
                </div>
            </div>
        `;
        const picker = document.getElementById('color-picker');

        function updateColors(hex) {
            picker.value = hex;
            document.getElementById('color-hex').value = hex;

            // RGB
            const r = parseInt(hex.slice(1,3), 16);
            const g = parseInt(hex.slice(3,5), 16);
            const b = parseInt(hex.slice(5,7), 16);
            document.getElementById('color-rgb').value = `rgb(${r}, ${g}, ${b})`;

            // HSL
            const rNorm = r/255, gNorm = g/255, bNorm = b/255;
            const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
            let h, s, l = (max + min) / 2;
            if (max === min) { h = s = 0; }
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
                    case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
                    case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
                }
            }
            document.getElementById('color-hsl').value = `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;

            // CMYK
            const k = 1 - Math.max(r/255, g/255, b/255);
            const c = (1 - r/255 - k) / (1 - k) || 0;
            const m = (1 - g/255 - k) / (1 - k) || 0;
            const y = (1 - b/255 - k) / (1 - k) || 0;
            document.getElementById('color-cmyk').value = `cmyk(${Math.round(c*100)}, ${Math.round(m*100)}, ${Math.round(y*100)}, ${Math.round(k*100)})`;
        }

        picker.addEventListener('input', e => updateColors(e.target.value));
        document.getElementById('color-hex').addEventListener('input', e => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateColors(e.target.value);
        });
    }

    // --- BASE64 TOOL ---
    else if (toolId === 'base64-tool') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / Base64</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Base64 Encoder/Decoder</p>
                <p class="text-slate-400">Enkódování a dekódování Base64.</p>
            </div>
            <div class="flex gap-2 mb-4">
                <button onclick="setBase64Mode('encode')" id="btn-encode" class="px-4 py-2 bg-cyan-500 text-white text-sm rounded-lg">Encode</button>
                <button onclick="setBase64Mode('decode')" id="btn-decode" class="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg">Decode</button>
            </div>
            <textarea id="base64-input" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-cyan-500 outline-none mb-4" placeholder="Vložte text..."></textarea>
            <button onclick="convertBase64()" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl mb-4">Převést</button>
            <textarea id="base64-output" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
        `;
        let base64Mode = 'encode';
        window.setBase64Mode = (mode) => {
            base64Mode = mode;
            document.getElementById('btn-encode').className = mode === 'encode' ? 'px-4 py-2 bg-cyan-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
            document.getElementById('btn-decode').className = mode === 'decode' ? 'px-4 py-2 bg-cyan-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
        };
        window.convertBase64 = () => {
            const input = document.getElementById('base64-input').value;
            try {
                const output = base64Mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
                document.getElementById('base64-output').value = output;
            } catch (e) { showToast('Chyba: ' + e.message, 'error'); }
        };
    }

    // --- URL ENCODER ---
    else if (toolId === 'url-tool') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / URL Encoder</p>
                <h2 class="text-4xl font-semibold text-white mb-3">URL Encoder/Decoder</h2>
                <p class="text-slate-400">Enkódování a dekódování URL.</p>
            </div>
            <div class="flex gap-2 mb-4">
                <button onclick="setUrlMode('encode')" id="btn-url-encode" class="px-4 py-2 bg-cyan-500 text-white text-sm rounded-lg">Encode</button>
                <button onclick="setUrlMode('decode')" id="btn-url-decode" class="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg">Decode</button>
            </div>
            <textarea id="url-input" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-cyan-500 outline-none mb-4" placeholder="Vložte URL nebo text..."></textarea>
            <button onclick="convertUrl()" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl mb-4">Převést</button>
            <textarea id="url-output" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
        `;
        let urlMode = 'encode';
        window.setUrlMode = (mode) => {
            urlMode = mode;
            document.getElementById('btn-url-encode').className = mode === 'encode' ? 'px-4 py-2 bg-cyan-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
            document.getElementById('btn-url-decode').className = mode === 'decode' ? 'px-4 py-2 bg-cyan-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
        };
        window.convertUrl = () => {
            const input = document.getElementById('url-input').value;
            try {
                const output = urlMode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
                document.getElementById('url-output').value = output;
            } catch (e) { showToast('Chyba: ' + e.message, 'error'); }
        };
    }

    // --- REGEX TESTER ---
    else if (toolId === 'regex-tester') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / Regex Tester</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Regex Tester</h2>
                <p class="text-slate-400">Testování regulárních výrazů s live highlight.</p>
            </div>
            <div class="mb-4">
                <label class="text-white text-sm block mb-2">Pattern:</label>
                <input type="text" id="regex-pattern" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none" placeholder="/pattern/flags">
            </div>
            <div class="flex gap-4 mb-4">
                <label class="flex items-center gap-2 text-white text-sm"><input type="checkbox" id="regex-flag-g" checked class="w-4 h-4"> g (global)</label>
                <label class="flex items-center gap-2 text-white text-sm"><input type="checkbox" id="regex-flag-i" class="w-4 h-4"> i (ignore case)</label>
                <label class="flex items-center gap-2 text-white text-sm"><input type="checkbox" id="regex-flag-m" class="w-4 h-4"> m (multiline)</label>
            </div>
            <div class="mb-4">
                <label class="text-white text-sm block mb-2">Test string:</label>
                <textarea id="regex-test" class="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono resize-none focus:border-blue-500 outline-none" placeholder="Text k testování..."></textarea>
            </div>
            <div id="regex-result" class="bg-slate-900 border border-slate-700 rounded-xl p-4 min-h-[100px] whitespace-pre-wrap font-mono text-sm"></div>
            <div id="regex-matches" class="mt-4 text-slate-400 text-sm"></div>
        `;
        const pattern = document.getElementById('regex-pattern');
        const testInput = document.getElementById('regex-test');

        function testRegex() {
            const result = document.getElementById('regex-result');
            const matchesDiv = document.getElementById('regex-matches');
            try {
                let flags = '';
                if (document.getElementById('regex-flag-g').checked) flags += 'g';
                if (document.getElementById('regex-flag-i').checked) flags += 'i';
                if (document.getElementById('regex-flag-m').checked) flags += 'm';

                const regex = new RegExp(pattern.value, flags);
                const text = testInput.value;
                const matches = text.match(regex) || [];

                result.innerHTML = text.replace(regex, '<mark class="bg-yellow-500/50 text-white">$&</mark>');
                matchesDiv.innerHTML = `Nalezeno: ${matches.length} shod` + (matches.length ? `: ${matches.slice(0, 10).join(', ')}${matches.length > 10 ? '...' : ''}` : '');
            } catch (e) {
                result.innerHTML = `<span class="text-red-400">Chyba: ${e.message}</span>`;
                matchesDiv.innerHTML = '';
            }
        }

        pattern.addEventListener('input', testRegex);
        testInput.addEventListener('input', testRegex);
        ['regex-flag-g', 'regex-flag-i', 'regex-flag-m'].forEach(id => document.getElementById(id).addEventListener('change', testRegex));
    }

    // --- TIMESTAMP CONVERTER ---
    else if (toolId === 'timestamp-converter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Timestamp</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Timestamp Converter</h2>
                <p class="text-slate-400">Unix timestamp ↔ datum a čas.</p>
            </div>
            <div class="bg-card border border-border rounded-2xl p-6 mb-6">
                <div class="text-center mb-4">
                    <div class="text-4xl font-bold text-white" id="ts-current">-</div>
                    <div class="text-slate-400 text-sm">Aktuální Unix timestamp</div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-card border border-border rounded-xl p-4">
                    <label class="text-white text-sm block mb-2">Unix Timestamp → Datum</label>
                    <input type="number" id="ts-input" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono" placeholder="1704067200">
                    <div id="ts-to-date" class="text-emerald-400 mt-2 text-sm"></div>
                </div>
                <div class="bg-card border border-border rounded-xl p-4">
                    <label class="text-white text-sm block mb-2">Datum → Unix Timestamp</label>
                    <input type="datetime-local" id="ts-date" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white">
                    <div id="ts-to-unix" class="text-emerald-400 mt-2 text-sm"></div>
                </div>
            </div>
        `;

        function updateCurrentTimestamp() {
            document.getElementById('ts-current').textContent = Math.floor(Date.now() / 1000);
        }

        setInterval(updateCurrentTimestamp, 1000);
        updateCurrentTimestamp();

        document.getElementById('ts-input').addEventListener('input', (e) => {
            const ts = parseInt(e.target.value);
            if (!isNaN(ts)) {
                const date = new Date(ts * 1000);
                document.getElementById('ts-to-date').textContent = date.toLocaleString('cs-CZ') + ' (UTC: ' + date.toUTCString() + ')';
            }
        });

        document.getElementById('ts-date').addEventListener('input', (e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date)) {
                document.getElementById('ts-to-unix').textContent = 'Unix: ' + Math.floor(date.getTime() / 1000);
            }
        });
    }

    // --- CURRENCY CONVERTER ---
    else if (toolId === 'currency-converter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Currency</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Currency Converter</h2>
                <p class="text-slate-400">Live kurzy měn pro 170+ zemí.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <input type="number" id="currency-from-val" value="1" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl focus:border-amber-500 outline-none">
                    <select id="currency-from" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-2">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR" selected>EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CZK">CZK - Czech Koruna</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                    </select>
                </div>
                <div>
                    <input type="number" id="currency-to-val" readonly class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl outline-none">
                    <select id="currency-to" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mt-2">
                        <option value="USD" selected>USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CZK">CZK - Czech Koruna</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                    </select>
                </div>
            </div>
            <button onclick="swapCurrencies()" class="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl mb-4">↔ Prohodit</button>
            <div id="currency-rate" class="text-center text-slate-400 text-sm"></div>
        `;
        let rates = {};

        async function fetchRates() {
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
                const data = await res.json();
                rates = data.rates;
                convertCurrency();
            } catch (e) {
                document.getElementById('currency-rate').textContent = 'Nepodařilo se načíst kurzy';
            }
        }

        window.convertCurrency = () => {
            const fromVal = parseFloat(document.getElementById('currency-from-val').value) || 0;
            const fromCurrency = document.getElementById('currency-from').value;
            const toCurrency = document.getElementById('currency-to').value;

            if (Object.keys(rates).length === 0) return;

            const fromRate = rates[fromCurrency] || 1;
            const toRate = rates[toCurrency] || 1;
            const result = (fromVal / fromRate) * toRate;

            document.getElementById('currency-to-val').value = result.toFixed(4);
            document.getElementById('currency-rate').textContent = `1 ${fromCurrency} = ${(toRate / fromRate).toFixed(4)} ${toCurrency}`;
        };

        window.swapCurrencies = () => {
            const from = document.getElementById('currency-from');
            const to = document.getElementById('currency-to');
            [from.value, to.value] = [to.value, from.value];
            convertCurrency();
        };

        document.getElementById('currency-from-val').addEventListener('input', convertCurrency);
        document.getElementById('currency-from').addEventListener('change', convertCurrency);
        document.getElementById('currency-to').addEventListener('change', convertCurrency);

        fetchRates();
    }

    // --- PERCENTAGE CALCULATOR ---
    else if (toolId === 'percentage-calc') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Percentage</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Percentage Calculator</h2>
                <p class="text-slate-400">X% z Y, rozdíl v %, zpětný výpočet.</p>
            </div>
            <div class="space-y-6">
                <div class="bg-card border border-border rounded-xl p-4">
                    <h3 class="text-white font-semibold mb-3">Kolik je X% z Y?</h3>
                    <div class="flex gap-2 items-center">
                        <input type="number" id="pct1-x" value="25" class="w-20 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center">
                        <span class="text-white">% z</span>
                        <input type="number" id="pct1-y" value="200" class="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center">
                        <span class="text-white">=</span>
                        <span id="pct1-result" class="text-orange-400 font-bold">50</span>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-xl p-4">
                    <h3 class="text-white font-semibold mb-3">X je Y% z čeho?</h3>
                    <div class="flex gap-2 items-center">
                        <input type="number" id="pct2-x" value="50" class="w-20 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center">
                        <span class="text-white">je</span>
                        <input type="number" id="pct2-y" value="25" class="w-20 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center">
                        <span class="text-white">% z</span>
                        <span id="pct2-result" class="text-orange-400 font-bold">200</span>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-xl p-4">
                    <h3 class="text-white font-semibold mb-3">Procentuální změna</h3>
                    <div class="flex gap-2 items-center">
                        <span class="text-white">Z</span>
                        <input type="number" id="pct3-from" value="100" class="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center">
                        <span class="text-white">na</span>
                        <input type="number" id="pct3-to" value="150" class="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-center">
                        <span class="text-white">=</span>
                        <span id="pct3-result" class="text-orange-400 font-bold">+50%</span>
                    </div>
                </div>
            </div>
        `;

        function calcPercentages() {
            // Calc 1: X% of Y
            const x1 = parseFloat(document.getElementById('pct1-x').value) || 0;
            const y1 = parseFloat(document.getElementById('pct1-y').value) || 0;
            document.getElementById('pct1-result').textContent = (x1 / 100 * y1).toFixed(2);

            // Calc 2: X is Y% of what
            const x2 = parseFloat(document.getElementById('pct2-x').value) || 0;
            const y2 = parseFloat(document.getElementById('pct2-y').value) || 1;
            document.getElementById('pct2-result').textContent = (x2 / (y2 / 100)).toFixed(2);

            // Calc 3: Percentage change
            const from3 = parseFloat(document.getElementById('pct3-from').value) || 0;
            const to3 = parseFloat(document.getElementById('pct3-to').value) || 0;
            const change = ((to3 - from3) / from3 * 100);
            document.getElementById('pct3-result').textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        }

        ['pct1-x', 'pct1-y', 'pct2-x', 'pct2-y', 'pct3-from', 'pct3-to'].forEach(id => {
            document.getElementById(id).addEventListener('input', calcPercentages);
        });
        calcPercentages();
    }

    // --- PASSWORD STRENGTH ---
    else if (toolId === 'password-check') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-teal-500 font-bold text-sm tracking-widest uppercase mb-2">Security / Password Strength</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Password Strength</h2>
                <p class="text-slate-400">Analýza síly hesla a doporučení.</p>
            </div>
            <div class="max-w-md mx-auto">
                <div class="relative mb-4">
                    <input type="text" id="pwd-check-input" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-lg font-mono focus:border-teal-500 outline-none pr-12" placeholder="Zadejte heslo...">
                    <button onclick="togglePwdVisibility()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        <i data-lucide="eye" id="pwd-eye-icon" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="h-3 bg-slate-700 rounded-full mb-4 overflow-hidden">
                    <div id="pwd-strength-bar" class="h-full transition-all duration-300" style="width: 0%; background: #ef4444;"></div>
                </div>
                <div id="pwd-strength-text" class="text-center text-lg font-semibold mb-6">Zadejte heslo</div>
                <div class="space-y-3" id="pwd-checks"></div>
            </div>
        `;
        const pwdInput = document.getElementById('pwd-check-input');
        const strengthBar = document.getElementById('pwd-strength-bar');
        const strengthText = document.getElementById('pwd-strength-text');
        const checksDiv = document.getElementById('pwd-checks');

        window.togglePwdVisibility = () => {
            const isPassword = pwdInput.type === 'password';
            pwdInput.type = isPassword ? 'text' : 'password';
            document.getElementById('pwd-eye-icon').setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
            lucide.createIcons();
        };

        pwdInput.addEventListener('input', () => {
            const pwd = pwdInput.value;
            const checks = [
                { test: pwd.length >= 8, text: 'Alespoň 8 znaků' },
                { test: /[A-Z]/.test(pwd), text: 'Alespoň jedno velké písmeno' },
                { test: /[a-z]/.test(pwd), text: 'Alespoň jedno malé písmeno' },
                { test: /[0-9]/.test(pwd), text: 'Alespoň jedno číslo' },
                { test: /[^A-Za-z0-9]/.test(pwd), text: 'Alespoň jeden speciální znak' }
            ];
            const score = checks.filter(c => c.test).length;
            const pct = (score / checks.length) * 100;
            strengthBar.style.width = pct + '%';
            strengthBar.style.background = score <= 2 ? '#ef4444' : score <= 3 ? '#f59e0b' : score <= 4 ? '#22c55e' : '#10b981';
            strengthText.textContent = score <= 2 ? 'Slabé' : score <= 3 ? 'Střední' : score <= 4 ? 'Silné' : 'Velmi silné';
            strengthText.style.color = score <= 2 ? '#ef4444' : score <= 3 ? '#f59e0b' : '#22c55e';
            checksDiv.innerHTML = checks.map(c => `
                <div class="flex items-center gap-3 ${c.test ? 'text-green-400' : 'text-slate-500'}">
                    <i data-lucide="${c.test ? 'check-circle' : 'circle'}" class="w-5 h-5"></i>
                    <span>${c.text}</span>
                </div>
            `).join('');
            lucide.createIcons();
        });
    }

    // --- TEXT ENCRYPT ---
    else if (toolId === 'text-encrypt') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-teal-500 font-bold text-sm tracking-widest uppercase mb-2">Security / Encrypt</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Text Encryptor</h2>
                <p class="text-slate-400">AES šifrování textu heslem.</p>
            </div>
            <div class="flex gap-2 mb-6">
                <button onclick="setEncryptMode('encrypt')" id="btn-encrypt" class="flex-1 py-2 bg-teal-500 text-white rounded-lg">Šifrovat</button>
                <button onclick="setEncryptMode('decrypt')" id="btn-decrypt" class="flex-1 py-2 bg-slate-700 text-white rounded-lg">Dešifrovat</button>
            </div>
            <input type="password" id="encrypt-password" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white mb-4 focus:border-teal-500 outline-none" placeholder="Heslo...">
            <textarea id="encrypt-input" class="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono resize-none mb-4 focus:border-teal-500 outline-none" placeholder="Text k šifrování..."></textarea>
            <button onclick="processEncryption()" class="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl mb-4" id="btn-process-encrypt">Šifrovat</button>
            <textarea id="encrypt-output" class="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
        `;
        let encryptMode = 'encrypt';
        window.setEncryptMode = (mode) => {
            encryptMode = mode;
            document.getElementById('btn-encrypt').className = mode === 'encrypt' ? 'flex-1 py-2 bg-teal-500 text-white rounded-lg' : 'flex-1 py-2 bg-slate-700 text-white rounded-lg';
            document.getElementById('btn-decrypt').className = mode === 'decrypt' ? 'flex-1 py-2 bg-teal-500 text-white rounded-lg' : 'flex-1 py-2 bg-slate-700 text-white rounded-lg';
            document.getElementById('btn-process-encrypt').textContent = mode === 'encrypt' ? 'Šifrovat' : 'Dešifrovat';
        };
        window.processEncryption = async () => {
            const password = document.getElementById('encrypt-password').value;
            const input = document.getElementById('encrypt-input').value;
            if (!password || !input) return showToast('Zadejte heslo a text', 'error');
            try {
                const encoder = new TextEncoder();
                const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
                const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: encoder.encode('salt'), iterations: 100000, hash: 'SHA-256'}, keyMaterial, {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);
                if (encryptMode === 'encrypt') {
                    const iv = crypto.getRandomValues(new Uint8Array(12));
                    const encrypted = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, encoder.encode(input));
                    const combined = new Uint8Array(iv.length + encrypted.byteLength);
                    combined.set(iv); combined.set(new Uint8Array(encrypted), iv.length);
                    document.getElementById('encrypt-output').value = btoa(String.fromCharCode(...combined));
                } else {
                    const combined = Uint8Array.from(atob(input), c => c.charCodeAt(0));
                    const iv = combined.slice(0, 12);
                    const data = combined.slice(12);
                    const decrypted = await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, data);
                    document.getElementById('encrypt-output').value = new TextDecoder().decode(decrypted);
                }
            } catch (e) { showToast('Chyba: ' + e.message, 'error'); }
        };
    }

    // --- QR READER ---
    else if (toolId === 'qr-reader') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-teal-500 font-bold text-sm tracking-widest uppercase mb-2">Security / QR Reader</p>
                <h2 class="text-4xl font-semibold text-white mb-3">QR Reader</h2>
                <p class="text-slate-400">Přečte QR kód z obrázku.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    ${createImageDropzone('qr-reader-dz', 'Nahrajte obrázek s QR kódem')}
                </div>
                <div class="bg-card border border-border rounded-2xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Výsledek</h3>
                    <div id="qr-result" class="text-slate-400 text-center py-8">
                        <p>Nahrajte obrázek s QR kódem.</p>
                    </div>
                    <button id="btn-copy-qr" class="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 mt-4 hidden">Kopírovat</button>
                </div>
            </div>
        `;
        lucide.createIcons();
        initImageDropzone('qr-reader-dz', async (files) => {
            const file = files[0];
            const img = new Image();
            img.src = URL.createObjectURL(file);
            await img.decode();
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            try {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    const result = document.getElementById('qr-result');
                    result.innerHTML = `
                        <div class="text-green-400 font-semibold mb-2">QR kód nalezen!</div>
                        <code class="text-white bg-slate-900 p-3 rounded block break-all">${escapeHTML(code.data)}</code>
                    `;
                    const copyBtn = document.getElementById('btn-copy-qr');
                    copyBtn.classList.remove('hidden');
                    copyBtn.onclick = () => { navigator.clipboard.writeText(code.data); showToast('Zkopírováno!', 'success'); };
                } else {
                    document.getElementById('qr-result').innerHTML = '<p class="text-red-400">Žádný QR kód nenalezen</p>';
                }
            } catch (e) {
                document.getElementById('qr-result').innerHTML = '<p class="text-red-400">Chyba při čtení: ' + e.message + '</p>';
            }
        });
    }

    // --- TIP CALCULATOR ---
    else if (toolId === 'tip-calculator') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Tip</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Tip Calculator</h2>
                <p class="text-slate-400">Kalkulačka spropitného se sdílením účtu.</p>
            </div>
            <div class="max-w-md mx-auto space-y-6">
                <div>
                    <label class="text-white text-sm block mb-2">Částka účtu</label>
                    <input type="number" id="tip-amount" value="1000" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl focus:border-amber-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Spropitné: <span id="tip-percent-val">15%</span></label>
                    <input type="range" id="tip-percent" min="0" max="30" value="15" class="w-full">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Počet lidí</label>
                    <input type="number" id="tip-people" value="1" min="1" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl focus:border-amber-500 outline-none">
                </div>
                <div class="bg-card border border-border rounded-xl p-6 text-center">
                    <div class="text-3xl font-bold text-white mb-2"><span id="tip-total">1150</span> Kč</div>
                    <div class="text-slate-400 text-sm">Celkem (včetně spropitného)</div>
                    <div class="text-xl text-amber-400 mt-4"><span id="tip-per-person">1150</span> Kč / osoba</div>
                </div>
            </div>
        `;
        const calcTip = () => {
            const amount = parseFloat(document.getElementById('tip-amount').value) || 0;
            const percent = parseInt(document.getElementById('tip-percent').value) || 0;
            const people = parseInt(document.getElementById('tip-people').value) || 1;
            const tip = amount * percent / 100;
            const total = amount + tip;
            const perPerson = total / people;
            document.getElementById('tip-percent-val').textContent = percent + '%';
            document.getElementById('tip-total').textContent = total.toFixed(0);
            document.getElementById('tip-per-person').textContent = perPerson.toFixed(0);
        };
        ['tip-amount', 'tip-percent', 'tip-people'].forEach(id => {
            document.getElementById(id).addEventListener('input', calcTip);
        });
        calcTip();
    }

    // --- LOAN CALCULATOR ---
    else if (toolId === 'loan-calculator') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Loan</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Loan Calculator</h2>
                <p class="text-slate-400">Splátky úvěru a amortizace.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label class="text-white text-sm block mb-2">Výše úvěru (Kč)</label>
                    <input type="number" id="loan-amount" value="1000000" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-orange-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Úrok (%)</label>
                    <input type="number" id="loan-rate" value="5" step="0.1" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-orange-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Doba (roky)</label>
                    <input type="number" id="loan-years" value="20" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-orange-500 outline-none">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-card border border-border rounded-xl p-6 text-center">
                    <div class="text-3xl font-bold text-white" id="loan-monthly">-</div>
                    <div class="text-slate-400 text-sm">Měsíční splátka</div>
                </div>
                <div class="bg-card border border-border rounded-xl p-6 text-center">
                    <div class="text-3xl font-bold text-white" id="loan-total">-</div>
                    <div class="text-slate-400 text-sm">Celkem zaplaceno</div>
                </div>
                <div class="bg-card border border-border rounded-xl p-6 text-center">
                    <div class="text-3xl font-bold text-orange-400" id="loan-interest">-</div>
                    <div class="text-slate-400 text-sm">Celkem úrok</div>
                </div>
            </div>
        `;
        const calcLoan = () => {
            const principal = parseFloat(document.getElementById('loan-amount').value) || 0;
            const rate = parseFloat(document.getElementById('loan-rate').value) / 100 / 12 || 0;
            const months = (parseInt(document.getElementById('loan-years').value) || 0) * 12;
            if (rate === 0) {
                const monthly = principal / months;
                document.getElementById('loan-monthly').textContent = monthly.toFixed(0) + ' Kč';
                document.getElementById('loan-total').textContent = principal.toFixed(0) + ' Kč';
                document.getElementById('loan-interest').textContent = '0 Kč';
            } else {
                const monthly = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
                const total = monthly * months;
                const interest = total - principal;
                document.getElementById('loan-monthly').textContent = monthly.toFixed(0) + ' Kč';
                document.getElementById('loan-total').textContent = total.toFixed(0) + ' Kč';
                document.getElementById('loan-interest').textContent = interest.toFixed(0) + ' Kč';
            }
        };
        ['loan-amount', 'loan-rate', 'loan-years'].forEach(id => {
            document.getElementById(id).addEventListener('input', calcLoan);
        });
        calcLoan();
    }

    // --- BMI CALCULATOR ---
    else if (toolId === 'bmi-calculator') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / BMI</p>
                <h2 class="text-4xl font-semibold text-white mb-3">BMI Calculator</h2>
                <p class="text-slate-400">Index tělesné hmotnosti.</p>
            </div>
            <div class="max-w-md mx-auto space-y-6">
                <div>
                    <label class="text-white text-sm block mb-2">Výška (cm)</label>
                    <input type="number" id="bmi-height" value="175" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl focus:border-amber-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Váha (kg)</label>
                    <input type="number" id="bmi-weight" value="70" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl focus:border-amber-500 outline-none">
                </div>
                <div class="bg-card border border-border rounded-xl p-6 text-center">
                    <div class="text-5xl font-bold mb-2" id="bmi-value">22.9</div>
                    <div class="text-slate-400 text-sm mb-4">BMI</div>
                    <div class="text-xl" id="bmi-category">Normální váha</div>
                    <div class="mt-4 h-3 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full relative">
                        <div id="bmi-indicator" class="absolute w-3 h-3 bg-white rounded-full border-2 border-slate-900 -translate-x-1/2" style="left: 50%;"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Podváha</span>
                        <span>Normální</span>
                        <span>Nadváha</span>
                        <span>Obezita</span>
                    </div>
                </div>
            </div>
        `;
        const calcBMI = () => {
            const height = parseFloat(document.getElementById('bmi-height').value) / 100 || 0;
            const weight = parseFloat(document.getElementById('bmi-weight').value) || 0;
            if (height > 0 && weight > 0) {
                const bmi = weight / (height * height);
                document.getElementById('bmi-value').textContent = bmi.toFixed(1);
                let category, color;
                if (bmi < 18.5) { category = 'Podváha'; color = '#3b82f6'; }
                else if (bmi < 25) { category = 'Normální váha'; color = '#22c55e'; }
                else if (bmi < 30) { category = 'Nadváha'; color = '#f59e0b'; }
                else { category = 'Obezita'; color = '#ef4444'; }
                document.getElementById('bmi-category').textContent = category;
                document.getElementById('bmi-category').style.color = color;
                const position = Math.min(100, Math.max(0, (bmi / 40) * 100));
                document.getElementById('bmi-indicator').style.left = position + '%';
            }
        };
        ['bmi-height', 'bmi-weight'].forEach(id => {
            document.getElementById(id).addEventListener('input', calcBMI);
        });
        calcBMI();
    }

    // --- NUMBER BASE CONVERTER ---
    else if (toolId === 'base-converter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-amber-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Number Base</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Number Base Converter</h2>
                <p class="text-slate-400">Binární / Hex / Oktal / Decimální převody.</p>
            </div>
            <div class="max-w-md mx-auto">
                <div class="mb-4">
                    <label class="text-white text-sm block mb-2">Vstupní číslo</label>
                    <input type="text" id="base-input" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl font-mono focus:border-amber-500 outline-none" placeholder="Zadejte číslo...">
                </div>
                <div class="mb-4">
                    <label class="text-white text-sm block mb-2">Ze soustavy</label>
                    <select id="base-from" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white">
                        <option value="2">Binární (2)</option>
                        <option value="8">Oktální (8)</option>
                        <option value="10" selected>Decimální (10)</option>
                        <option value="16">Hexadecimální (16)</option>
                    </select>
                </div>
                <div class="space-y-3" id="base-results">
                    <div class="bg-card border border-border rounded-xl p-4 flex justify-between items-center">
                        <span class="text-slate-400">Binární</span>
                        <code id="base-bin" class="text-white font-mono">-</code>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-4 flex justify-between items-center">
                        <span class="text-slate-400">Oktální</span>
                        <code id="base-oct" class="text-white font-mono">-</code>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-4 flex justify-between items-center">
                        <span class="text-slate-400">Decimální</span>
                        <code id="base-dec" class="text-white font-mono">-</code>
                    </div>
                    <div class="bg-card border border-border rounded-xl p-4 flex justify-between items-center">
                        <span class="text-slate-400">Hexadecimální</span>
                        <code id="base-hex" class="text-white font-mono">-</code>
                    </div>
                </div>
            </div>
        `;
        const convertBases = () => {
            const input = document.getElementById('base-input').value.trim();
            const fromBase = parseInt(document.getElementById('base-from').value);
            try {
                const decimal = parseInt(input, fromBase);
                if (isNaN(decimal)) throw new Error();
                document.getElementById('base-bin').textContent = decimal.toString(2);
                document.getElementById('base-oct').textContent = decimal.toString(8);
                document.getElementById('base-dec').textContent = decimal.toString(10);
                document.getElementById('base-hex').textContent = decimal.toString(16).toUpperCase();
            } catch {
                document.getElementById('base-bin').textContent = '-';
                document.getElementById('base-oct').textContent = '-';
                document.getElementById('base-dec').textContent = '-';
                document.getElementById('base-hex').textContent = '-';
            }
        };
        document.getElementById('base-input').addEventListener('input', convertBases);
        document.getElementById('base-from').addEventListener('change', convertBases);
    }

    // --- ROMAN NUMERALS ---
    else if (toolId === 'roman-converter') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-orange-500 font-bold text-sm tracking-widest uppercase mb-2">Calc / Roman</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Roman Numerals</h2>
                <p class="text-slate-400">Arabské ↔ římské číslice.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label class="text-white text-sm block mb-2">Arabské → Římské</label>
                    <input type="number" id="roman-arabic" min="1" max="3999" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl focus:border-orange-500 outline-none mb-4" placeholder="1-3999">
                    <div class="bg-card border border-border rounded-xl p-4 text-center">
                        <div class="text-3xl font-bold text-white" id="roman-result-1">-</div>
                    </div>
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Římské → Arabské</label>
                    <input type="text" id="roman-input" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl uppercase focus:border-orange-500 outline-none mb-4" placeholder="I-IXCM">
                    <div class="bg-card border border-border rounded-xl p-4 text-center">
                        <div class="text-3xl font-bold text-white" id="roman-result-2">-</div>
                    </div>
                </div>
            </div>
        `;
        const toRoman = (num) => {
            const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
            let roman = '';
            for (let i in lookup) { while (num >= lookup[i]) { roman += i; num -= lookup[i]; } }
            return roman;
        };
        const fromRoman = (roman) => {
            const lookup = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
            let result = 0;
            for (let i = 0; i < roman.length; i++) {
                if (lookup[roman[i]] < lookup[roman[i+1]]) result -= lookup[roman[i]];
                else result += lookup[roman[i]];
            }
            return result;
        };
        document.getElementById('roman-arabic').addEventListener('input', (e) => {
            const num = parseInt(e.target.value);
            if (num >= 1 && num <= 3999) {
                document.getElementById('roman-result-1').textContent = toRoman(num);
            } else {
                document.getElementById('roman-result-1').textContent = '-';
            }
        });
        document.getElementById('roman-input').addEventListener('input', (e) => {
            const roman = e.target.value.toUpperCase();
            if (/^[IVXLCDM]+$/.test(roman)) {
                document.getElementById('roman-result-2').textContent = fromRoman(roman);
            } else {
                document.getElementById('roman-result-2').textContent = '-';
            }
        });
    }

    // --- CSS MINIFIER ---
    else if (toolId === 'css-tools') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / CSS</p>
                <h2 class="text-4xl font-semibold text-white mb-3">CSS Minifier</h2>
                <p class="text-slate-400">Minifikace a formátování CSS.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label class="text-white text-sm block mb-2">Vstupní CSS</label>
                    <textarea id="css-input" class="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm resize-none focus:border-cyan-500 outline-none" placeholder="Vložte CSS kód..."></textarea>
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Výstup</label>
                    <textarea id="css-output" class="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
                </div>
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="minifyCSS()" class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl">Minifikovat</button>
                <button onclick="formatCSS()" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl">Formátovat</button>
                <button onclick="navigator.clipboard.writeText(document.getElementById('css-output').value); showToast('Zkopírováno!', 'success')" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl">Kopírovat</button>
            </div>
        `;
        window.minifyCSS = () => {
            const input = document.getElementById('css-input').value;
            const output = input.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;}/g, '}').trim();
            document.getElementById('css-output').value = output;
            showToast(`Zmenšeno: ${input.length} → ${output.length} znaků (${Math.round((1 - output.length/input.length) * 100)}% úspora)`, 'success');
        };
        window.formatCSS = () => {
            const input = document.getElementById('css-input').value;
            let output = input.replace(/\{/g, ' {\n  ').replace(/;/g, ';\n  ').replace(/\}/g, '\n}\n').replace(/\n\s*\n/g, '\n');
            document.getElementById('css-output').value = output;
        };
    }

    // --- JS MINIFIER ---
    else if (toolId === 'js-tools') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / JavaScript</p>
                <h2 class="text-4xl font-semibold text-white mb-3">JS Minifier</h2>
                <p class="text-slate-400">Minifikace a formátování JavaScript.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label class="text-white text-sm block mb-2">Vstupní JS</label>
                    <textarea id="js-input" class="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm resize-none focus:border-blue-500 outline-none" placeholder="Vložte JavaScript kód..."></textarea>
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Výstup</label>
                    <textarea id="js-output" class="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
                </div>
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="minifyJS()" class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl">Minifikovat</button>
                <button onclick="navigator.clipboard.writeText(document.getElementById('js-output').value); showToast('Zkopírováno!', 'success')" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl">Kopírovat</button>
            </div>
        `;
        window.minifyJS = () => {
            const input = document.getElementById('js-input').value;
            const output = input.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').replace(/\s*([{}()\[\];:,<>=!+\-*\/])\s*/g, '$1').trim();
            document.getElementById('js-output').value = output;
            showToast(`Zmenšeno: ${input.length} → ${output.length} znaků`, 'success');
        };
    }

    // --- HTML MINIFIER ---
    else if (toolId === 'html-tools') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / HTML</p>
                <h2 class="text-4xl font-semibold text-white mb-3">HTML Minifier</h2>
                <p class="text-slate-400">Minifikace a formátování HTML.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <label class="text-white text-sm block mb-2">Vstupní HTML</label>
                    <textarea id="html-input" class="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm resize-none focus:border-cyan-500 outline-none" placeholder="Vložte HTML kód..."></textarea>
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Výstup</label>
                    <textarea id="html-output" class="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
                </div>
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="minifyHTML()" class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl">Minifikovat</button>
                <button onclick="navigator.clipboard.writeText(document.getElementById('html-output').value); showToast('Zkopírováno!', 'success')" class="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl">Kopírovat</button>
            </div>
        `;
        window.minifyHTML = () => {
            const input = document.getElementById('html-input').value;
            const output = input.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
            document.getElementById('html-output').value = output;
            showToast(`Zmenšeno: ${input.length} → ${output.length} znaků`, 'success');
        };
    }

    // --- CRON BUILDER ---
    else if (toolId === 'cron-builder') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / Cron</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Cron Builder</h2>
                <p class="text-slate-400">Vizuální stavitel cron výrazů.</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div>
                    <label class="text-white text-sm block mb-2">Minuta</label>
                    <input type="text" id="cron-min" value="*" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-center font-mono focus:border-cyan-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Hodina</label>
                    <input type="text" id="cron-hour" value="*" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-center font-mono focus:border-cyan-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Den</label>
                    <input type="text" id="cron-dom" value="*" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-center font-mono focus:border-cyan-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Měsíc</label>
                    <input type="text" id="cron-mon" value="*" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-center font-mono focus:border-cyan-500 outline-none">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Den v týdnu</label>
                    <input type="text" id="cron-dow" value="*" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-center font-mono focus:border-cyan-500 outline-none">
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-6">
                <button onclick="setCron('0 * * * *')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Každou hodinu</button>
                <button onclick="setCron('0 0 * * *')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Každý den</button>
                <button onclick="setCron('0 0 * * 1')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Každý týden</button>
                <button onclick="setCron('0 0 1 * *')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg">Každý měsíc</button>
            </div>
            <div class="bg-card border border-border rounded-xl p-6 text-center">
                <code id="cron-output" class="text-2xl font-mono text-cyan-400">* * * * *</code>
                <p class="text-slate-400 mt-2" id="cron-desc">Každou minutu</p>
            </div>
        `;
        window.setCron = (expr) => {
            const parts = expr.split(' ');
            document.getElementById('cron-min').value = parts[0];
            document.getElementById('cron-hour').value = parts[1];
            document.getElementById('cron-dom').value = parts[2];
            document.getElementById('cron-mon').value = parts[3];
            document.getElementById('cron-dow').value = parts[4];
            updateCron();
        };
        const updateCron = () => {
            const min = document.getElementById('cron-min').value || '*';
            const hour = document.getElementById('cron-hour').value || '*';
            const dom = document.getElementById('cron-dom').value || '*';
            const mon = document.getElementById('cron-mon').value || '*';
            const dow = document.getElementById('cron-dow').value || '*';
            const expr = `${min} ${hour} ${dom} ${mon} ${dow}`;
            document.getElementById('cron-output').textContent = expr;
            // Simple description
            const desc = document.getElementById('cron-desc');
            if (expr === '* * * * *') desc.textContent = 'Každou minutu';
            else if (expr === '0 * * * *') desc.textContent = 'Každou hodinu';
            else if (expr === '0 0 * * *') desc.textContent = 'Každý den o půlnoci';
            else if (expr === '0 0 * * 1') desc.textContent = 'Každé pondělí o půlnoci';
            else if (expr === '0 0 1 * *') desc.textContent = 'Prvního dne v měsíci o půlnoci';
            else desc.textContent = 'Vlastní cron výraz';
        };
        ['cron-min', 'cron-hour', 'cron-dom', 'cron-mon', 'cron-dow'].forEach(id => {
            document.getElementById(id).addEventListener('input', updateCron);
        });
    }

    // --- META GENERATOR ---
    else if (toolId === 'meta-generator') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / Meta Tags</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Meta Tags Generator</h2>
                <p class="text-slate-400">Generátor SEO meta tagů a Open Graph.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="text-white text-sm block mb-2">Title</label>
                    <input type="text" id="meta-title" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Titulek stránky">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">URL</label>
                    <input type="text" id="meta-url" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="https://example.com">
                </div>
                <div class="md:col-span-2">
                    <label class="text-white text-sm block mb-2">Description</label>
                    <textarea id="meta-desc" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white resize-none h-20 focus:border-blue-500 outline-none" placeholder="Popis stránky..."></textarea>
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">OG Image URL</label>
                    <input type="text" id="meta-image" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="https://example.com/image.png">
                </div>
                <div>
                    <label class="text-white text-sm block mb-2">Author</label>
                    <input type="text" id="meta-author" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Jméno autora">
                </div>
            </div>
            <button onclick="generateMeta()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl mb-4">Generovat</button>
            <textarea id="meta-output" class="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm resize-none outline-none" placeholder="HTML kód se zobrazí zde..." readonly></textarea>
        `;
        window.generateMeta = () => {
            const title = document.getElementById('meta-title').value || 'Page Title';
            const desc = document.getElementById('meta-desc').value || 'Page description';
            const url = document.getElementById('meta-url').value || 'https://example.com';
            const image = document.getElementById('meta-image').value || '';
            const author = document.getElementById('meta-author').value || '';

            let html = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">
${author ? `<meta name="author" content="${author}">\n` : ''}
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
${image ? `<meta property="og:image" content="${image}">\n` : ''}<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">
${image ? `<meta property="twitter:image" content="${image}">` : ''}`;

            document.getElementById('meta-output').value = html;
        };
    }

    // --- FAVICON GENERATOR ---
    else if (toolId === 'favicon-gen') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-cyan-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / Favicon</p>
                <h2 class="text-4xl font-semibold text-white mb-3">Favicon Generator</h2>
                <p class="text-slate-400">Generuje favicon ve všech velikostech.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${createImageDropzone('favicon-dz', 'Nahrajte PNG nebo SVG (min. 256x256)')}
                <div class="bg-card border border-border rounded-2xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Velikosti</h3>
                    <div id="favicon-preview" class="grid grid-cols-4 gap-4 mb-4"></div>
                    <button id="btn-favicon" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl disabled:opacity-50" disabled>Stáhnout ZIP</button>
                </div>
            </div>
        `;
        lucide.createIcons();
        let faviconImg = null;
        initImageDropzone('favicon-dz', async (files) => {
            const file = files[0];
            faviconImg = new Image();
            faviconImg.src = URL.createObjectURL(file);
            await faviconImg.decode();
            document.getElementById('btn-favicon').disabled = false;
            const sizes = [16, 32, 48, 64, 128, 256];
            const preview = document.getElementById('favicon-preview');
            preview.innerHTML = sizes.map(s => `<div class="text-center"><div class="w-12 h-12 bg-slate-800 rounded flex items-center justify-center mx-auto mb-1" style="background-image: url(${faviconImg.src}); background-size: contain; background-repeat: no-repeat; background-position: center;"></div><span class="text-xs text-slate-400">${s}x${s}</span></div>`).join('');
        });

        document.getElementById('btn-favicon').addEventListener('click', async () => {
            if (!faviconImg) return;
            const zip = new JSZip();
            const sizes = [16, 32, 48, 64, 128, 256];
            for (const s of sizes) {
                const canvas = document.createElement('canvas');
                canvas.width = s;
                canvas.height = s;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(faviconImg, 0, 0, s, s);
                const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
                zip.file(`favicon-${s}x${s}.png`, blob);
            }
            const blob = await zip.generateAsync({type: 'blob'});
            downloadBlob(blob, 'favicons.zip');
        });
    }

    // --- HTML ENTITIES ---
    else if (toolId === 'html-entities') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <p class="text-blue-500 font-bold text-sm tracking-widest uppercase mb-2">Dev / HTML Entities</p>
                <h2 class="text-4xl font-semibold text-white mb-3">HTML Entities</h2>
                <p class="text-slate-400">Konverze HTML speciálních znaků.</p>
            </div>
            <div class="flex gap-2 mb-4">
                <button onclick="setEntityMode('encode')" id="btn-ent-encode" class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg">Encode</button>
                <button onclick="setEntityMode('decode')" id="btn-ent-decode" class="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg">Decode</button>
            </div>
            <textarea id="entity-input" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none focus:border-blue-500 outline-none mb-4" placeholder="Vložte text..."></textarea>
            <button onclick="convertEntities()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl mb-4">Převést</button>
            <textarea id="entity-output" class="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm font-mono resize-none outline-none" placeholder="Výsledek..." readonly></textarea>
        `;
        let entityMode = 'encode';
        window.setEntityMode = (mode) => {
            entityMode = mode;
            document.getElementById('btn-ent-encode').className = mode === 'encode' ? 'px-4 py-2 bg-blue-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
            document.getElementById('btn-ent-decode').className = mode === 'decode' ? 'px-4 py-2 bg-blue-500 text-white text-sm rounded-lg' : 'px-4 py-2 bg-slate-700 text-white text-sm rounded-lg';
        };
        window.convertEntities = () => {
            const input = document.getElementById('entity-input').value;
            const textarea = document.createElement('textarea');
            let output;
            if (entityMode === 'encode') {
                output = input.replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
            } else {
                textarea.innerHTML = input;
                output = textarea.value;
            }
            document.getElementById('entity-output').value = output;
        };
    }

    // --- TEXT SUMMARIZER (AI) ---
    else if (toolId === 'text-summarizer') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                     bg-orange-500/10 border border-orange-500/20 text-orange-400
                     text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="sparkles" class="w-3 h-3"></i> AI POWERED
                </div>
                <h2 class="text-4xl font-semibold text-white mb-2">AI Summarizer</h2>
                <p class="text-slate-400">Shrnutí libovolného textu pomocí AI.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <label class="block text-sm font-semibold text-slate-400 mb-1">
                        Vložte text ke shrnutí
                    </label>
                    <textarea id="sum-input"
                        class="w-full h-64 bg-[#0B0F19] border border-slate-700
                               rounded-xl p-4 text-white outline-none
                               focus:border-emerald-500 resize-none text-sm"
                        placeholder="Vložte sem libovolný text..."></textarea>
                    <button id="btn-summarize"
                        class="w-full bg-[#10b981] hover:bg-[#059669] text-white
                               font-bold py-4 rounded-xl transition-colors
                               flex items-center justify-center gap-2">
                        <i data-lucide="sparkles" class="w-5 h-5"></i> Vytvořit shrnutí
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-semibold text-white mb-4">Výsledek</h3>
                    <div id="sum-loading" class="hidden flex-col items-center
                         justify-center py-12 text-emerald-400">
                        <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-3"></i>
                        <p class="animate-pulse">Analyzuji text...</p>
                    </div>
                    <div id="sum-result"
                         class="flex-grow text-slate-300 whitespace-pre-wrap
                                leading-relaxed text-sm hidden"></div>
                    <div id="sum-empty"
                         class="flex-grow flex items-center justify-center
                                text-slate-500 text-sm">
                        Výsledek se zobrazí zde
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        document.getElementById('btn-summarize').addEventListener('click', async () => {
            const text = document.getElementById('sum-input').value.trim();
            if (!text) return showToast('Vložte text ke shrnutí', 'error');
            showLoading('btn-summarize', 'Generuji...');
            document.getElementById('sum-loading').classList.remove('hidden');
            document.getElementById('sum-loading').classList.add('flex');
            document.getElementById('sum-result').classList.add('hidden');
            document.getElementById('sum-empty').classList.add('hidden');
            try {
                const lang = document.getElementById('current-lang').innerText || 'CS';
                const res = await fetch('./api/ai-summarize.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: text.substring(0, 30000),
                        lang: lang
                    })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                let html = escapeHTML(data.text)
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                document.getElementById('sum-result').innerHTML = html;
                document.getElementById('sum-result').classList.remove('hidden');
            } catch (e) {
                let msg = e.message;
                if (msg.includes('JSON') || msg.includes('Unexpected')) {
                    msg = 'API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)';
                }
                showToast('Chyba: ' + msg, 'error');
                document.getElementById('sum-empty').classList.remove('hidden');
            }
            document.getElementById('sum-loading').classList.add('hidden');
            document.getElementById('sum-loading').classList.remove('flex');
            hideLoading('btn-summarize');
        });
    }

    // --- GRAMMAR CHECKER (AI) ---
    else if (toolId === 'grammar-checker') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                     bg-amber-500/10 border border-amber-500/20 text-amber-400
                     text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="spell-check" class="w-3 h-3"></i> AI GRAMMAR
                </div>
                <h2 class="text-4xl font-semibold text-white mb-2">Grammar Checker</h2>
                <p class="text-slate-400">AI kontrola gramatiky, pravopisu a stylu textu.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <textarea id="grammar-input"
                        class="w-full h-64 bg-[#0B0F19] border border-slate-700
                               rounded-xl p-4 text-white outline-none
                               focus:border-amber-500 resize-none text-sm"
                        placeholder="Vložte text ke kontrole..."></textarea>
                    <button id="btn-grammar"
                        class="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black
                               font-bold py-4 rounded-xl transition-colors
                               flex items-center justify-center gap-2">
                        <i data-lucide="spell-check" class="w-5 h-5"></i> Zkontrolovat text
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-semibold text-white mb-4">Výsledek kontroly</h3>
                    <div id="grammar-loading" class="hidden flex-col items-center
                         justify-center py-12 text-amber-400">
                        <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-3"></i>
                        <p class="animate-pulse">Kontroluji text...</p>
                    </div>
                    <div id="grammar-result"
                         class="flex-grow text-slate-300 whitespace-pre-wrap
                                leading-relaxed text-sm hidden overflow-y-auto"></div>
                    <div id="grammar-empty"
                         class="flex-grow flex items-center justify-center text-slate-500 text-sm">
                        Výsledek se zobrazí zde
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        document.getElementById('btn-grammar').addEventListener('click', async () => {
            const text = document.getElementById('grammar-input').value.trim();
            if (!text) return showToast('Vložte text ke kontrole', 'error');
            showLoading('btn-grammar', 'Kontroluji...');
            document.getElementById('grammar-loading').classList.remove('hidden');
            document.getElementById('grammar-loading').classList.add('flex');
            document.getElementById('grammar-result').classList.add('hidden');
            document.getElementById('grammar-empty').classList.add('hidden');
            try {
                const lang = document.getElementById('current-lang').innerText || 'CS';
                const res = await fetch('./api/grammar-check.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: text.substring(0, 10000),
                        lang: lang
                    })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                let html = escapeHTML(data.text)
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                document.getElementById('grammar-result').innerHTML = html;
                document.getElementById('grammar-result').classList.remove('hidden');
            } catch (e) {
                let msg = e.message;
                if (msg.includes('JSON') || msg.includes('Unexpected') || msg.includes('Failed to fetch')) {
                    msg = 'API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)';
                }
                showToast('Chyba: ' + msg, 'error');
                document.getElementById('grammar-empty').classList.remove('hidden');
            }
            document.getElementById('grammar-loading').classList.add('hidden');
            document.getElementById('grammar-loading').classList.remove('flex');
            hideLoading('btn-grammar');
        });
    }

    // --- PARAPHRASER (AI) ---
    else if (toolId === 'paraphraser') {
        const styles = [
            { value: 'standard', label: 'Standardní' },
            { value: 'formal',   label: 'Formální' },
            { value: 'simple',   label: 'Jednoduchý' },
            { value: 'creative', label: 'Kreativní' }
        ];
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                     bg-rose-500/10 border border-rose-500/20 text-rose-400
                     text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="repeat-2" class="w-3 h-3"></i> AI PARAPHRASER
                </div>
                <h2 class="text-4xl font-semibold text-white mb-2">Paraphraser</h2>
                <p class="text-slate-400">AI přeformulování textu různými styly.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div class="flex gap-2 flex-wrap">
                        ${styles.map((s, i) => `
                            <button onclick="selectParaStyle('${s.value}', this)"
                                class="para-style-btn px-4 py-2 rounded-xl text-sm font-semibold
                                       transition-colors border ${i === 0
                                           ? 'bg-emerald-500 text-white border-emerald-500'
                                           : 'bg-card border-border text-slate-400 hover:border-slate-500'}"
                                data-style="${s.value}">
                                ${s.label}
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="para-style-input" value="standard">
                    <textarea id="para-input"
                        class="w-full h-52 bg-[#0B0F19] border border-slate-700
                               rounded-xl p-4 text-white outline-none
                               focus:border-rose-500 resize-none text-sm"
                        placeholder="Vložte text k přeformulování..."></textarea>
                    <button id="btn-paraphrase"
                        class="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white
                               font-bold py-4 rounded-xl transition-colors
                               flex items-center justify-center gap-2">
                        <i data-lucide="repeat-2" class="w-5 h-5"></i> Přeformulovat
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col">
                    <h3 class="text-lg font-semibold text-white mb-4">Výsledek</h3>
                    <div id="para-loading" class="hidden flex-col items-center
                         justify-center py-12 text-rose-400">
                        <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-3"></i>
                        <p class="animate-pulse">Přeformulovávám...</p>
                    </div>
                    <div id="para-result"
                         class="flex-grow text-slate-300 leading-relaxed
                                text-sm hidden overflow-y-auto"></div>
                    <div id="para-empty"
                         class="flex-grow flex items-center justify-center text-slate-500 text-sm">
                        Výsledek se zobrazí zde
                    </div>
                    <div id="para-actions" class="hidden mt-4 flex gap-2">
                        <button onclick="navigator.clipboard.writeText(document.getElementById('para-result').innerText); showToast('Zkopírováno!','success')"
                            class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white
                                   text-sm font-semibold rounded-xl transition-colors flex
                                   items-center justify-center gap-2">
                            <i data-lucide="copy" class="w-4 h-4"></i> Kopírovat
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        window.selectParaStyle = (style, btn) => {
            document.querySelectorAll('.para-style-btn').forEach(b => {
                b.className = b.className.replace(
                    'bg-emerald-500 text-white border-emerald-500',
                    'bg-card border-border text-slate-400 hover:border-slate-500'
                );
            });
            btn.className = btn.className.replace(
                'bg-card border-border text-slate-400 hover:border-slate-500',
                'bg-emerald-500 text-white border-emerald-500'
            );
            document.getElementById('para-style-input').value = style;
        };

        document.getElementById('btn-paraphrase').addEventListener('click', async () => {
            const text = document.getElementById('para-input').value.trim();
            const style = document.getElementById('para-style-input').value;
            if (!text) return showToast('Vložte text k přeformulování', 'error');
            showLoading('btn-paraphrase', 'Přeformulovávám...');
            document.getElementById('para-loading').classList.remove('hidden');
            document.getElementById('para-loading').classList.add('flex');
            document.getElementById('para-result').classList.add('hidden');
            document.getElementById('para-empty').classList.add('hidden');
            document.getElementById('para-actions').classList.add('hidden');
            try {
                const lang = document.getElementById('current-lang').innerText || 'CS';
                const stylePrompts = {
                    standard: lang === 'CS' ? 'Přeformuluj následující text jiným způsobem, zachovej stejný jazyk a smysl:' : 'Paraphrase the following text differently, keeping the same language and meaning:',
                    formal: lang === 'CS' ? 'Přeformuluj následující text formálním profesionálním stylem:' : 'Paraphrase the following text in a formal professional style:',
                    simple: lang === 'CS' ? 'Přeformuluj následující text jednoduše a srozumitelně:' : 'Paraphrase the following text in simple and clear language:',
                    creative: lang === 'CS' ? 'Přeformuluj následující text kreativně a zajímavě:' : 'Paraphrase the following text creatively and engagingly:'
                };
                const res = await fetch('./api/paraphrase.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: text.substring(0, 10000),
                        style: style,
                        lang: lang
                    })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                document.getElementById('para-result').innerText = data.text;
                document.getElementById('para-result').classList.remove('hidden');
                document.getElementById('para-actions').classList.remove('hidden');
            } catch (e) {
                let msg = e.message;
                if (msg.includes('JSON') || msg.includes('Unexpected') || msg.includes('Failed to fetch')) {
                    msg = 'API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)';
                }
                showToast('Chyba: ' + msg, 'error');
                document.getElementById('para-empty').classList.remove('hidden');
            }
            document.getElementById('para-loading').classList.add('hidden');
            document.getElementById('para-loading').classList.remove('flex');
            hideLoading('btn-paraphrase');
        });
    }

    // --- SCREENSHOT TO CODE (AI) ---
    else if (toolId === 'screenshot-to-code') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                     bg-purple-500/10 border border-purple-500/20 text-purple-400
                     text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="code-2" class="w-3 h-3"></i> AI CODE GEN
                </div>
                <h2 class="text-4xl font-semibold text-white mb-2">Screenshot to Code</h2>
                <p class="text-slate-400">AI převede screenshot UI na HTML/CSS kód.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div>
                        <p class="text-sm font-semibold text-slate-400 mb-2">Framework</p>
                        <div class="flex gap-2">
                            ${[
                                {value:'html', label:'HTML + CSS'},
                                {value:'tailwind', label:'Tailwind CSS'},
                                {value:'react', label:'React JSX'}
                            ].map((f, i) => `
                                <button onclick="selectS2CFramework('${f.value}', this)"
                                    class="s2c-fw-btn px-4 py-2 rounded-xl text-sm font-semibold
                                           transition-colors border ${i === 0
                                               ? 'bg-purple-500 text-white border-purple-500'
                                               : 'bg-card border-border text-slate-400'}"
                                    data-fw="${f.value}">
                                    ${f.label}
                                </button>
                            `).join('')}
                        </div>
                        <input type="hidden" id="s2c-framework" value="html">
                    </div>
                    <div id="s2c-upload-area">
                        ${createDropzone('s2c-dz', 'image/png,image/jpeg,image/webp',
                            'PNG, JPG nebo WEBP — screenshot UI', 'image', true)}
                    </div>
                    <div id="s2c-preview-area" class="hidden">
                        <img id="s2c-preview"
                             class="w-full rounded-xl border border-slate-700 object-contain max-h-64">
                        <button onclick="document.getElementById('s2c-preview-area').classList.add('hidden'); document.getElementById('s2c-upload-area').classList.remove('hidden'); s2cFile=null;"
                            class="mt-2 text-sm text-slate-400 hover:text-white underline">
                            Změnit obrázek
                        </button>
                    </div>
                    <button id="btn-s2c"
                        class="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white
                               font-bold py-4 rounded-xl transition-colors
                               flex items-center justify-center gap-2 disabled:opacity-50" disabled>
                        <i data-lucide="code-2" class="w-5 h-5"></i> Generovat kód
                    </button>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-white">Vygenerovaný kód</h3>
                        <button id="s2c-copy-btn"
                            onclick="navigator.clipboard.writeText(document.getElementById('s2c-code-output').value); showToast('Zkopírováno!','success')"
                            class="hidden px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white
                                   text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                            <i data-lucide="copy" class="w-3.5 h-3.5"></i> Kopírovat
                        </button>
                    </div>
                    <div id="s2c-loading" class="hidden flex-col items-center
                         justify-center py-12 text-purple-400">
                        <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-3"></i>
                        <p class="animate-pulse">Generuji kód...</p>
                    </div>
                    <textarea id="s2c-code-output"
                        class="flex-grow min-h-[300px] bg-[#0B0F19] border border-slate-700
                               rounded-xl p-4 text-green-400 outline-none resize-none
                               font-mono text-xs hidden"
                        readonly placeholder="Vygenerovaný kód se zobrazí zde..."></textarea>
                    <div id="s2c-empty"
                         class="flex-grow flex items-center justify-center text-slate-500 text-sm">
                        Nahrajte screenshot a klikněte na "Generovat kód"
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        let s2cFile = null;
        let s2cBase64 = null;

        window.selectS2CFramework = (fw, btn) => {
            document.querySelectorAll('.s2c-fw-btn').forEach(b => {
                b.className = b.className
                    .replace('bg-purple-500 text-white border-purple-500',
                             'bg-card border-border text-slate-400');
            });
            btn.className = btn.className
                .replace('bg-card border-border text-slate-400',
                         'bg-purple-500 text-white border-purple-500');
            document.getElementById('s2c-framework').value = fw;
        };

        initDropzone('s2c-dz', (files) => {
            s2cFile = files[0];
            if (!s2cFile || !s2cFile.type.startsWith('image/')) {
                return showToast('Nahrajte platný obrázek', 'error');
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                s2cBase64 = e.target.result.split(',')[1];
                document.getElementById('s2c-preview').src = e.target.result;
                document.getElementById('s2c-upload-area').classList.add('hidden');
                document.getElementById('s2c-preview-area').classList.remove('hidden');
                document.getElementById('btn-s2c').disabled = false;
            };
            reader.readAsDataURL(s2cFile);
        });

        document.getElementById('btn-s2c').addEventListener('click', async () => {
            if (!s2cBase64) return;
            showLoading('btn-s2c', 'Generuji...');
            document.getElementById('s2c-loading').classList.remove('hidden');
            document.getElementById('s2c-loading').classList.add('flex');
            document.getElementById('s2c-code-output').classList.add('hidden');
            document.getElementById('s2c-empty').classList.add('hidden');
            document.getElementById('s2c-copy-btn').classList.add('hidden');
            try {
                const framework = document.getElementById('s2c-framework').value;
                const frameworkDesc = {
                    html: 'plain HTML and CSS (no frameworks)',
                    tailwind: 'HTML with Tailwind CSS classes',
                    react: 'React JSX with inline styles or Tailwind'
                };
                const res = await fetch('./api/screenshot-to-code.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageBase64: s2cBase64,
                        mimeType: s2cFile.type,
                        framework: framework
                    })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                // Vyčisti code fences pokud přítomny
                let code = data.text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/,'');
                document.getElementById('s2c-code-output').value = code;
                document.getElementById('s2c-code-output').classList.remove('hidden');
                document.getElementById('s2c-copy-btn').classList.remove('hidden');
            } catch (e) {
                let msg = e.message;
                if (msg.includes('JSON') || msg.includes('Unexpected') || msg.includes('Failed to fetch')) {
                    msg = 'API není dostupné. Spusťte projekt na PHP serveru (php -S localhost:8000)';
                }
                showToast('Chyba: ' + msg, 'error');
                document.getElementById('s2c-empty').classList.remove('hidden');
            }
            document.getElementById('s2c-loading').classList.add('hidden');
            document.getElementById('s2c-loading').classList.remove('flex');
            hideLoading('btn-s2c');
        });
    }

    // --- BACKGROUND REMOVER ---
    else if (toolId === 'bg-remover') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                     bg-violet-500/10 border border-violet-500/20 text-violet-400
                     text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="eraser" class="w-3 h-3"></i> BACKGROUND REMOVER
                </div>
                <h2 class="text-4xl font-semibold text-white mb-2">Background Remover</h2>
                <p class="text-slate-400">
                    Odstraní jednobarevné pozadí z obrázku (vhodné pro loga a ikony).
                </p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div id="bgr-upload-area">
                        ${createDropzone('bgr-dz', 'image/*',
                            'PNG, JPG, WEBP — nejlépe logo nebo ikona', 'image', true)}
                    </div>
                    <div id="bgr-config" class="hidden bg-card border border-border rounded-2xl p-5">
                        <div class="flex items-center gap-4 mb-4">
                            <img id="bgr-preview-small"
                                 class="w-16 h-16 rounded-lg object-contain border border-slate-700 bg-slate-800">
                            <div>
                                <p id="bgr-filename" class="text-white font-semibold text-sm truncate"></p>
                                <p class="text-slate-400 text-xs mt-1">Klikněte na obrázek pro výběr barvy pozadí</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 mb-4">
                            <label class="text-sm text-slate-400">Barva pozadí:</label>
                            <input type="color" id="bgr-color" value="#ffffff"
                                class="w-10 h-10 rounded-lg cursor-pointer border border-slate-700">
                            <span class="text-xs text-slate-500">Nastavte barvu pozadí k odstranění</span>
                        </div>
                        <div class="mb-4">
                            <div class="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Tolerance: <span id="bgr-tol-val">30</span></span>
                            </div>
                            <input type="range" id="bgr-tolerance" min="5" max="100" value="30">
                        </div>
                        <button id="btn-bgr"
                            class="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white
                                   font-bold py-4 rounded-xl transition-colors
                                   flex items-center justify-center gap-2">
                            <i data-lucide="eraser" class="w-5 h-5"></i> Odstranit pozadí
                        </button>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                    <h3 class="text-lg font-semibold text-white">Výsledek</h3>
                    <div id="bgr-result-area" class="flex items-center justify-center
                         flex-grow min-h-[200px] rounded-xl bg-[#0B0F19] border
                         border-slate-700" style="background-image: repeating-conic-gradient(#1e293b 0% 25%, #131826 0% 50%); background-size: 20px 20px;">
                        <p class="text-slate-500 text-sm">Výsledek se zobrazí zde</p>
                    </div>
                    <button id="btn-bgr-download"
                        class="hidden w-full bg-[#10b981] hover:bg-[#059669] text-white
                               font-bold py-3 rounded-xl transition-colors
                               flex items-center justify-center gap-2">
                        <i data-lucide="download" class="w-5 h-5"></i> Stáhnout PNG
                    </button>
                </div>
            </div>
            <canvas id="bgr-canvas" class="hidden"></canvas>
        `;
        lucide.createIcons();

        let bgrFile = null;
        let bgrImg = null;
        let resultCanvas = null;

        document.getElementById('bgr-tolerance').addEventListener('input', (e) => {
            document.getElementById('bgr-tol-val').innerText = e.target.value;
        });

        initDropzone('bgr-dz', (files) => {
            bgrFile = files[0];
            if (!bgrFile || !bgrFile.type.startsWith('image/')) {
                return showToast('Nahrajte platný obrázek', 'error');
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                bgrImg = new Image();
                bgrImg.onload = () => {
                    document.getElementById('bgr-preview-small').src = e.target.result;
                    document.getElementById('bgr-filename').innerText = bgrFile.name;
                    document.getElementById('bgr-upload-area').classList.add('hidden');
                    document.getElementById('bgr-config').classList.remove('hidden');
                };
                bgrImg.src = e.target.result;
            };
            reader.readAsDataURL(bgrFile);
        });

        document.getElementById('btn-bgr').addEventListener('click', () => {
            if (!bgrImg) return;
            showLoading('btn-bgr', 'Odstraňuji...');
            setTimeout(() => {
                const canvas = document.getElementById('bgr-canvas');
                canvas.width = bgrImg.width;
                canvas.height = bgrImg.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bgrImg, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                const colorHex = document.getElementById('bgr-color').value;
                const tolerance = parseInt(document.getElementById('bgr-tolerance').value);
                const tr = parseInt(colorHex.slice(1, 3), 16);
                const tg = parseInt(colorHex.slice(3, 5), 16);
                const tb = parseInt(colorHex.slice(5, 7), 16);

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2];
                    const diff = Math.sqrt(
                        Math.pow(r - tr, 2) +
                        Math.pow(g - tg, 2) +
                        Math.pow(b - tb, 2)
                    );
                    if (diff < tolerance * 2.2) {
                        data[i + 3] = 0; // transparent
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                resultCanvas = canvas;

                const resultArea = document.getElementById('bgr-result-area');
                resultArea.innerHTML = '';
                const resultImg = document.createElement('img');
                resultImg.src = canvas.toDataURL('image/png');
                resultImg.className = 'max-w-full max-h-64 object-contain';
                resultArea.appendChild(resultImg);
                document.getElementById('btn-bgr-download').classList.remove('hidden');
                hideLoading('btn-bgr');
            }, 50);
        });

        document.getElementById('btn-bgr-download').addEventListener('click', () => {
            if (!resultCanvas) return;
            resultCanvas.toBlob((blob) => {
                downloadBlob(blob, 'background_removed.png');
            }, 'image/png');
        });
    }

    // --- IMAGE UPSCALER ---
    else if (toolId === 'img-upscaler') {
        container.innerHTML = `
            <div class="text-center mb-10">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                     bg-violet-500/10 border border-violet-500/20 text-violet-400
                     text-xs font-bold tracking-wide mb-4">
                    <i data-lucide="zoom-in" class="w-3 h-3"></i> IMAGE UPSCALER
                </div>
                <h2 class="text-4xl font-semibold text-white mb-2">Image Upscaler</h2>
                <p class="text-slate-400">Zvětšení obrázku 2x nebo 4x s vyhlazením.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div id="ups-upload-area">
                        ${createDropzone('ups-dz', 'image/*',
                            'PNG, JPG, WEBP — max 2000×2000px', 'image', true)}
                    </div>
                    <div id="ups-config" class="hidden bg-card border border-border rounded-2xl p-5">
                        <div class="flex items-center gap-4 mb-4">
                            <img id="ups-preview"
                                 class="w-16 h-16 rounded-lg object-contain border border-slate-700">
                            <div>
                                <p id="ups-filename" class="text-white font-semibold text-sm truncate"></p>
                                <p id="ups-dims" class="text-slate-400 text-xs mt-1"></p>
                            </div>
                        </div>
                        <p class="text-sm text-slate-400 mb-3">Faktor zvětšení:</p>
                        <div class="flex gap-3 mb-4">
                            <button onclick="selectUpscaleFactor(2, this)"
                                class="ups-factor flex-1 py-3 rounded-xl text-sm font-bold
                                       transition-colors bg-violet-500 text-white border border-violet-500"
                                data-factor="2">2× zvětšení</button>
                            <button onclick="selectUpscaleFactor(4, this)"
                                class="ups-factor flex-1 py-3 rounded-xl text-sm font-bold
                                       transition-colors bg-card text-slate-400 border border-border"
                                data-factor="4">4× zvětšení</button>
                        </div>
                        <input type="hidden" id="ups-factor" value="2">
                        <button id="btn-upscale"
                            class="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white
                                   font-bold py-4 rounded-xl transition-colors
                                   flex items-center justify-center gap-2">
                            <i data-lucide="zoom-in" class="w-5 h-5"></i> Zvětšit obrázek
                        </button>
                    </div>
                </div>
                <div class="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                    <h3 class="text-lg font-semibold text-white">Výsledek</h3>
                    <div id="ups-result-area"
                         class="flex items-center justify-center flex-grow
                                min-h-[200px] rounded-xl bg-[#0B0F19] border border-slate-700">
                        <p class="text-slate-500 text-sm">Výsledek se zobrazí zde</p>
                    </div>
                    <p id="ups-new-dims" class="hidden text-emerald-400 text-xs text-center font-semibold"></p>
                    <button id="btn-ups-download"
                        class="hidden w-full bg-[#10b981] hover:bg-[#059669] text-white
                               font-bold py-3 rounded-xl transition-colors
                               flex items-center justify-center gap-2">
                        <i data-lucide="download" class="w-5 h-5"></i> Stáhnout
                    </button>
                </div>
            </div>
            <canvas id="ups-canvas" class="hidden"></canvas>
        `;
        lucide.createIcons();

        let upsImg = null;
        let upsResultBlob = null;

        window.selectUpscaleFactor = (factor, btn) => {
            document.querySelectorAll('.ups-factor').forEach(b => {
                b.className = b.className
                    .replace('bg-violet-500 text-white border-violet-500',
                             'bg-card text-slate-400 border-border');
            });
            btn.className = btn.className
                .replace('bg-card text-slate-400 border-border',
                         'bg-violet-500 text-white border-violet-500');
            document.getElementById('ups-factor').value = factor;
        };

        initDropzone('ups-dz', (files) => {
            const file = files[0];
            if (!file || !file.type.startsWith('image/')) {
                return showToast('Nahrajte platný obrázek', 'error');
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                upsImg = new Image();
                upsImg.onload = () => {
                    document.getElementById('ups-preview').src = e.target.result;
                    document.getElementById('ups-filename').innerText = file.name;
                    document.getElementById('ups-dims').innerText =
                        `Původní: ${upsImg.width} × ${upsImg.height} px`;
                    document.getElementById('ups-upload-area').classList.add('hidden');
                    document.getElementById('ups-config').classList.remove('hidden');
                };
                upsImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });

        document.getElementById('btn-upscale').addEventListener('click', () => {
            if (!upsImg) return;
            const factor = parseInt(document.getElementById('ups-factor').value);
            showLoading('btn-upscale', 'Zvětšuji...');
            setTimeout(() => {
                const newW = upsImg.width * factor;
                const newH = upsImg.height * factor;
                const canvas = document.getElementById('ups-canvas');
                canvas.width = newW;
                canvas.height = newH;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(upsImg, 0, 0, newW, newH);

                canvas.toBlob((blob) => {
                    upsResultBlob = blob;
                    const resultImg = document.createElement('img');
                    resultImg.src = URL.createObjectURL(blob);
                    resultImg.className = 'max-w-full max-h-64 object-contain rounded-lg';
                    const area = document.getElementById('ups-result-area');
                    area.innerHTML = '';
                    area.appendChild(resultImg);
                    document.getElementById('ups-new-dims').innerText =
                        `Nové rozměry: ${newW} × ${newH} px`;
                    document.getElementById('ups-new-dims').classList.remove('hidden');
                    document.getElementById('btn-ups-download').classList.remove('hidden');
                    hideLoading('btn-upscale');
                }, 'image/png');
            }, 50);
        });

        document.getElementById('btn-ups-download').addEventListener('click', () => {
            if (upsResultBlob) downloadBlob(upsResultBlob, 'upscaled.png');
        });
    }

    // --- GENERIC FALLBACK (pouze pro neimplementované nástroje) ---
    else {
        container.innerHTML = `
            <div class="text-center py-20">
                <div class="w-20 h-20 bg-slate-800 rounded-2xl flex items-center
                            justify-center mx-auto mb-6">
                    <i data-lucide="wrench" class="w-10 h-10 text-slate-400"></i>
                </div>
                <h2 class="text-3xl font-semibold text-white mb-4">Nástroj ve vývoji</h2>
                <p class="text-slate-400">Tento nástroj bude brzy dostupný.</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// ==========================================
// 5. INICIALIZACE APLIKACE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderHome();
    initCustomSelects();

    // Inicializuj překlady podle aktuálního jazyka
    const initialLang = document.getElementById('current-lang').innerText || 'CS';
    setLang(initialLang);

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
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme');
        let isDark = savedTheme ? savedTheme === 'dark' : true; // Default to dark

        // Apply saved theme
        if (!isDark) {
            document.documentElement.classList.add('light-mode');
            themeToggle.innerHTML = '<i data-lucide="moon" class="w-5 h-5"></i>';
        } else {
            document.documentElement.classList.remove('light-mode');
            themeToggle.innerHTML = '<i data-lucide="sun" class="w-5 h-5"></i>';
        }
        lucide.createIcons();

        themeToggle.addEventListener('click', () => {
            isDark = !isDark;
            if (isDark) {
                themeToggle.innerHTML = '<i data-lucide="sun" class="w-5 h-5"></i>';
                document.documentElement.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                themeToggle.innerHTML = '<i data-lucide="moon" class="w-5 h-5"></i>';
                document.documentElement.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            }
            lucide.createIcons();
        });
    }
});
/**
 * Word Tools Bridge Implementation
 * Handles the Load (DOCX -> HTML) -> Edit -> Export (HTML -> DOCX) flow
 *
 * Note: This file is being appended to. The existing logic should be preserved.
 * Since the file is too large to read fully, we are adding these as new global functions.
 */

async function initWordEditor() {
    // Initialize TinyMCE
    if (typeof tinymce === 'undefined') {
        console.error('TinyMCE is not loaded');
        return;
    }
    tinymce.init({
        selector: '#word-editor',
        plugins: 'lists link image table code help wordcount',
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright | bullist numlist | table image | code',
        content_style: 'body { font-family: "Sora", sans-serif; font-size: 14px; line-height: 1.6; }',
        setup: function(editor) {
            editor.on('change', () => {
                // Update some internal state if needed
            });
        }
    });
}

async function loadWordDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('api/word-to-html.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to parse DOCX to HTML');

        const htmlContent = await response.text();

        // Populate TinyMCE editor
        if (tinymce.get('word-editor')) {
            tinymce.get('word-editor').setContent(htmlContent);
        }
    } catch (error) {
        console.error('Error loading document:', error);
        alert('Error loading document: ' + error.message);
    }
}

async function exportToWord() {
    const editor = tinymce.get('word-editor');
    if (!editor) {
        alert('Editor not found');
        return;
    }
    const htmlContent = editor.getContent();
    const formData = new FormData();
    formData.append('html', htmlContent);

    try {
        const response = await fetch('api/html-to-word.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Trigger download
            const link = document.createElement('a');
            link.href = result.download_url;
            link.download = 'edited_document.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            throw new Error(result.error || 'Export failed');
        }
    } catch (error) {
        console.error('Error exporting document:', error);
        alert('Error exporting document: ' + error.message);
    }
}

// This is a helper to inject the HTML for the editor into the tool-container
function renderWordEditorUI() {
    const container = document.getElementById('tool-container');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col h-full space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold text-white">Lite Word Editor</h2>
                <div class="flex gap-3">
                    <label class="px-4 py-2 bg-slate-700 text-white rounded-lg cursor-pointer hover:bg-slate-600 transition-colors flex items-center gap-2">
                        <i data-lucide="file-up" class="w-4 h-4"></i> Load .docx
                        <input type="file" class="hidden" accept=".docx" onchange="loadWordDocument(this.files[0])">
                    </label>
                    <button onclick="exportToWord()" class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i> Export .docx
                    </button>
                </div>
            </div>
            <div class="editor-canvas-container">
                <div class="paper-canvas">
                    <textarea id="word-editor"></textarea>
                </div>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
    initWordEditor();
}
