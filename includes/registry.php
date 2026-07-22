<?php
// Registr nástrojů — jeden zdroj pravdy pro PHP renderování (hub, karty, breadcrumb).
// Interaktivní logika nástrojů žije v assets/js/tools/<slug>.js.

const CATEGORY_COLORS = [
    'pdf'      => '#f59e0b', // oranžová
    'image'    => '#8b5cf6', // fialová
    'media'    => '#ec4899', // růžová
    'text'     => '#6b7280', // šedá
    'ai'       => '#0ea5e9', // modrá
    'dev'      => '#06b6d4', // tyrkysová
    'security' => '#10b981', // zelená
    'calc'     => '#ef4444', // červená
];

const CATEGORY_LABELS = [
    'pdf'      => 'PDF',
    'image'    => 'Obrázky',
    'media'    => 'Média',
    'text'     => 'Text',
    'ai'       => 'AI',
    'dev'      => 'Dev',
    'security' => 'Bezpečnost',
    'calc'     => 'Kalkulačky',
];

// Zobrazené pořadí kategorií napříč webem.
const CATEGORY_ORDER = ['pdf', 'image', 'media', 'text', 'ai', 'dev', 'security', 'calc'];

// category => popis sekce
const CATEGORY_DESCRIPTIONS = [
    'pdf'      => 'Slučování, dělení, komprese a převody PDF dokumentů.',
    'image'    => 'Komprese, úpravy a vylepšení obrázků.',
    'media'    => 'Práce s videem a zvukem — konverze, komprese, střih.',
    'text'     => 'Překlad, shrnutí, Markdown a vizualizace myšlenek.',
    'ai'       => 'Asistent, generování obsahu i obrázků pomocí AI.',
    'dev'      => 'Regex, JSON, UUID, JWT a další pomůcky pro vývoj.',
    'security' => 'Hashe, hesla, šifrování a kontrola certifikátů.',
    'calc'     => 'Procenta, půjčky, převody jednotek a barev.',
];

// Pole nástrojů. loc = processingLocation (client|server|ai).
const TOOLS = [
    ['slug' => 'pdf-merge',  'name' => 'Sloučení PDF',        'desc' => 'Sloučí více PDF souborů do jednoho.',                'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Files',     'new' => false],
    ['slug' => 'pdf-split',  'name' => 'Rozdělení PDF',       'desc' => 'Rozdělí PDF na jednotlivé stránky.',                'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Scissors',  'new' => false],
    ['slug' => 'pdf-compress','name'=> 'Komprese PDF',        'desc' => 'Zmenší velikost PDF souboru.',                      'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Shrink',    'new' => false],
    ['slug' => 'pdf-to-word', 'name' => 'PDF → Word',         'desc' => 'Vytáhne text z PDF a sestaví .docx.',               'cat' => 'pdf',      'loc' => 'client', 'icon' => 'FileText',  'new' => false],
    ['slug' => 'html-to-pdf', 'name' => 'HTML → PDF',         'desc' => 'Převede HTML kód na PDF (html2canvas+jsPDF).',     'cat' => 'pdf',      'loc' => 'client', 'icon' => 'FileCode',  'new' => false],
    ['slug' => 'invoice-gen', 'name' => 'Faktura generátor',   'desc' => 'Generujte profesionální faktury s QR kódem.',        'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Receipt',   'new' => true],
    ['slug' => 'pdf-to-images','name'=> 'PDF → obrázky',        'desc' => 'Převede stránky PDF na obrázky (PNG/JPEG ZIP).',    'cat' => 'pdf',      'loc' => 'client', 'icon' => 'ImagePlus', 'new' => true],
    ['slug' => 'images-to-pdf','name'=> 'Obrázky → PDF',        'desc' => 'Spojí více obrázků do jednoho PDF.',                'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Files',     'new' => true],
    ['slug' => 'pdf-rotate',   'name' => 'Otočení PDF',         'desc' => 'Otočí nebo překlopí stránky PDF.',                  'cat' => 'pdf',      'loc' => 'client', 'icon' => 'RotateCw',  'new' => true],
    ['slug' => 'pdf-organize', 'name' => 'Organizace PDF',      'desc' => 'Odstraňte nebo přerovnejte stránky PDF.',           'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Maximize',  'new' => true],
    ['slug' => 'pdf-watermark','name'=> 'Vodoznak PDF',        'desc' => 'Přidá textový vodoznak do PDF.',                    'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Stamp',     'new' => true],
    ['slug' => 'pdf-page-numbers','name'=>'Číslování stránek',  'desc' => 'Přidá čísla stránek do PDF.',                       'cat' => 'pdf',      'loc' => 'client', 'icon' => 'Hash',      'new' => true],
    ['slug' => 'pdf-extract-text','name'=>'Extrakce textu PDF','desc' => 'Vytáhne text z PDF (pdf.js).',                       'cat' => 'pdf',      'loc' => 'client', 'icon' => 'AlignLeft', 'new' => true],
    ['slug' => 'pdf-password', 'name' => 'Ochrana PDF heslem', 'desc' => 'Nastaví nebo odstraní heslo PDF (qpdf).',            'cat' => 'pdf',      'loc' => 'server', 'icon' => 'FileKey',   'new' => false, 'note' => 'Tento nástroj vyžaduje VPS / shell_exec (nástroj qpdf). Na sdíleném hostingu jej provozovat nelze.'],

    ['slug' => 'img-compress',  'name' => 'Komprese obrázku',  'desc' => 'Zmenšete obrázek přes canvas (kvalita, JPEG/WebP).','cat' => 'image',    'loc' => 'client', 'icon' => 'Image',     'new' => false],
    ['slug' => 'bg-remover',    'name' => 'Odstranit pozadí',  'desc' => 'AI odstranění pozadí z fotografií.',               'cat' => 'image',    'loc' => 'server', 'icon' => 'Eraser',    'new' => true],
    ['slug' => 'img-upscaler',  'name' => 'Zvětšení kvality',  'desc' => 'Zvětší rozlišení obrázku (2×/3×/4×) přes canvas.',   'cat' => 'image',    'loc' => 'client', 'icon' => 'Maximize',  'new' => true],
    ['slug' => 'gif-maker',     'name' => 'Tvůrce GIFu',       'desc' => 'Vytvořte GIF z obrázku nebo videa.',                'cat' => 'image',    'loc' => 'server', 'icon' => 'Film',      'new' => true],
    ['slug' => 'screenshot-tool','name'=> 'Screenshot URL',    'desc' => 'Pořiďte screenshot libovolné webové stránky.',      'cat' => 'image',    'loc' => 'server', 'icon' => 'Camera',    'new' => true],
    // ── Dávka 5 — obrázky přes canvas ─────────────────────────────
    ['slug' => 'image-convert',     'name' => 'Převod formátu',   'desc' => 'Převeďte PNG/JPG/WebP/BMP přes canvas.',           'cat' => 'image', 'loc' => 'client', 'icon' => 'Repeat',           'new' => true],
    ['slug' => 'image-crop',        'name' => 'Oříznutí obrázku', 'desc' => 'Interaktivně ořízněte obrázek v canvasu.',         'cat' => 'image', 'loc' => 'client', 'icon' => 'Crop',             'new' => true],
    ['slug' => 'image-rotate-flip', 'name' => 'Otočení/Překlopení','desc'=> 'Otočte nebo překlopte obrázek (90/180/270/flip).',  'cat' => 'image', 'loc' => 'client', 'icon' => 'RotateCw',         'new' => true],
    ['slug' => 'image-filters',     'name' => 'Filtry obrázku',   'desc' => 'Grayscale, sepia, jas, kontrast, saturace.',        'cat' => 'image', 'loc' => 'client', 'icon' => 'SlidersHorizontal','new' => true],
    // ── Dávka 6 — další obrázky + komprese/zvětšení ───────────────
    ['slug' => 'image-watermark',   'name' => 'Vodoznak',          'desc' => 'Přidejte textový nebo obrázkový vodoznak.',         'cat' => 'image', 'loc' => 'client', 'icon' => 'Stamp',            'new' => true],
    ['slug' => 'image-exif',        'name' => 'EXIF metadata',     'desc' => 'Prohlížejte a odstraňujte EXIF (vč. GPS).',         'cat' => 'image', 'loc' => 'client', 'icon' => 'ScanLine',        'new' => true],
    ['slug' => 'image-collage',     'name' => 'Koláž obrázků',     'desc' => 'Spojte více obrázků do koláže (různá rozvržení).',   'cat' => 'image', 'loc' => 'client', 'icon' => 'Images',           'new' => true],
    ['slug' => 'favicon-generator', 'name' => 'Favicon generátor',  'desc' => 'Vygeneruje favicony (PNG více velikostí + ICO).',   'cat' => 'image', 'loc' => 'client', 'icon' => 'Globe',            'new' => true],
    ['slug' => 'meme-generator',    'name' => 'Meme generátor',     'desc' => 'Vytvořte meme s horním/dolním textem (Impact).',    'cat' => 'image', 'loc' => 'client', 'icon' => 'Laugh',            'new' => true],

    ['slug' => 'video-convert', 'name' => 'Konverze videa',    'desc' => 'Převeďte video mezi formáty MP4, WebM, AVI...',     'cat' => 'media',    'loc' => 'server', 'icon' => 'Video',     'new' => false],
    ['slug' => 'video-compress', 'name' => 'Komprese videa',   'desc' => 'Zmenší velikost videa s nastavitelnou kvalitou.',    'cat' => 'media',    'loc' => 'server', 'icon' => 'Shrink',    'new' => false],
    ['slug' => 'video-trim',     'name' => 'Ořez videa',       'desc' => 'Vyberte část videa a odstraňte zbytek.',            'cat' => 'media',    'loc' => 'server', 'icon' => 'Scissors',  'new' => false],
    ['slug' => 'audio-convert',  'name' => 'Konverze audia',   'desc' => 'Převeďte audio mezi MP3, WAV, FLAC, OGG...',        'cat' => 'media',    'loc' => 'server', 'icon' => 'Music',     'new' => false],

    ['slug' => 'translate',      'name' => 'Překlad textu',    'desc' => 'Přeložte text do více než 100 jazyků pomocí AI.',  'cat' => 'text',     'loc' => 'ai',     'icon' => 'Languages', 'new' => true],
    ['slug' => 'summarize-text', 'name' => 'Shrnutí textu',    'desc' => 'Vytvořte stručné shrnutí dlouhého textu.',          'cat' => 'text',     'loc' => 'ai',     'icon' => 'AlignLeft',  'new' => true],
    ['slug' => 'markdown-editor','name' => 'Markdown editor', 'desc' => 'Editujte a náhledněte Markdown v reálném čase.',    'cat' => 'text',     'loc' => 'client', 'icon' => 'FileCode',   'new' => false],
    ['slug' => 'mind-map',       'name' => 'Myšlenková mapa', 'desc' => 'Vizualizujte strukturu myšlenek jako radiální strom.','cat' => 'text',   'loc' => 'client', 'icon' => 'GitBranch',  'new' => true],
    // ── Dávka 4 — další textové nástroje ──────────────────────────
    ['slug' => 'text-counter',       'name' => 'Počítadlo textu',   'desc' => 'Spočítejte znaky, slova, věty a odhad doby čtení.', 'cat' => 'text', 'loc' => 'client', 'icon' => 'Type',          'new' => true],
    ['slug' => 'text-case-converter', 'name' => 'Velikost písmen',   'desc' => 'Převod UPPER/lower/Title/camelCase/snake_case.',      'cat' => 'text', 'loc' => 'client', 'icon' => 'CaseSensitive',  'new' => true],
    ['slug' => 'lorem-ipsum',        'name' => 'Lorem ipsum',        'desc' => 'Generujte zástupný text (věty/odstavce/slova).',     'cat' => 'text', 'loc' => 'client', 'icon' => 'Pilcrow',        'new' => true],
    ['slug' => 'remove-diacritics',  'name' => 'Odstranění diakritiky','desc' => 'Převeďte text bez diakritiky (ASCII fold).',        'cat' => 'text', 'loc' => 'client', 'icon' => 'SpellCheck',     'new' => true],
    ['slug' => 'text-to-speech',     'name' => 'Text na řeč (TTS)',  'desc' => 'Přečtěte text nahlas přes Web Speech API.',          'cat' => 'text', 'loc' => 'client', 'icon' => 'Volume2',       'new' => true],
    ['slug' => 'text-lines-tool',    'name' => 'Práce s řádky',       'desc' => 'Duplicity, řazení, prázdné řádky, unique.',         'cat' => 'text', 'loc' => 'client', 'icon' => 'Rows3',         'new' => true],

    ['slug' => 'ai-chat',     'name' => 'AI asistent',        'desc' => 'Chatujte s AI asistentem pro různé úkoly.',         'cat' => 'ai',  'loc' => 'ai',     'icon' => 'MessageSquare', 'new' => false],
    ['slug' => 'ai-vision',   'name' => 'AI analýza obrázku',  'desc' => 'Popište a analyzujte obsah obrázku pomocí AI.',     'cat' => 'ai',  'loc' => 'ai',     'icon' => 'Eye',           'new' => false],
    ['slug' => 'ai-seo',     'name' => 'SEO meta generátor',   'desc' => 'Generujte SEO titulky a popisky automaticky.',      'cat' => 'ai',  'loc' => 'ai',     'icon' => 'Search',       'new' => true],
    ['slug' => 'ai-image-gen','name'=> 'AI generátor obrázku','desc' => 'Vytvořte unikátní obrázky z textového popisu.',       'cat' => 'ai',  'loc' => 'ai',     'icon' => 'ImagePlus',    'new' => true],
    ['slug' => 'ai-sql-gen',  'name' => 'AI generátor SQL',    'desc' => 'Převeďte přirozený jazyk na SQL dotazy.',           'cat' => 'ai',  'loc' => 'ai',     'icon' => 'Database',     'new' => true],

    ['slug' => 'regex-tester',   'name' => 'Regex tester',    'desc' => 'Testujte regulární výrazy v reálném čase.',          'cat' => 'dev',  'loc' => 'client', 'icon' => 'Regex',      'new' => false],
    ['slug' => 'json-formatter', 'name' => 'JSON formátovač', 'desc' => 'Formátujte a validujte JSON strukturu.',              'cat' => 'dev',  'loc' => 'client', 'icon' => 'Braces',     'new' => false],
    ['slug' => 'gradient-gen',   'name' => 'CSS Gradient Editor','desc'=> 'Vytvářejte a upravujte CSS gradienty interaktivně.', 'cat' => 'dev','loc' => 'client', 'icon' => 'Palette',    'new' => true],
    ['slug' => 'uuid-gen',       'name' => 'UUID generátor',  'desc' => 'Generujte náhodné UUID v4 a v7.',                    'cat' => 'dev',  'loc' => 'client', 'icon' => 'Fingerprint','new' => true],
    ['slug' => 'jwt-decoder',    'name' => 'JWT dekodér',     'desc' => 'Dekódujte a ověřte JWT tokeny.',                     'cat' => 'dev',  'loc' => 'client', 'icon' => 'KeyRound',   'new' => true],

    // ── Dávka 2 — další Dev nástroje ─────────────────────────────
    ['slug' => 'base64-tool',          'name' => 'Base64 kodér/dekodér', 'desc' => 'Kódujte a dekódujte Base64 (text i soubory).',  'cat' => 'dev', 'loc' => 'client', 'icon' => 'Code',            'new' => true],
    ['slug' => 'url-encoder',          'name' => 'URL kodér/dekodér',    'desc' => 'Kódujte a dekódujte URL (percent encoding).',   'cat' => 'dev', 'loc' => 'client', 'icon' => 'Link2',           'new' => true],
    ['slug' => 'jwt-generator',        'name' => 'JWT generátor',        'desc' => 'Vytvořte a podepište JWT token (HMAC).',         'cat' => 'dev', 'loc' => 'client', 'icon' => 'FileKey',         'new' => true],
    ['slug' => 'yaml-json-converter',  'name' => 'YAML ↔ JSON',         'desc' => 'Převádějte mezi YAML a JSON obousměrně.',      'cat' => 'dev', 'loc' => 'client', 'icon' => 'FileCode',        'new' => true],
    ['slug' => 'csv-json-converter',   'name' => 'CSV ↔ JSON',          'desc' => 'Převádějte mezi CSV a JSON obousměrně.',        'cat' => 'dev', 'loc' => 'client', 'icon' => 'FileSpreadsheet',  'new' => true],
    ['slug' => 'cron-builder',         'name' => 'Cron výraz builder',  'desc' => 'Sestavte a vysvětlete cron výraz obousměrně.', 'cat' => 'dev', 'loc' => 'client', 'icon' => 'CalendarClock',  'new' => true],
    ['slug' => 'timestamp-converter',  'name' => 'Unix timestamp',      'desc' => 'Převod mezi Unix timestampem a datem (i pásma).', 'cat' => 'dev', 'loc' => 'client', 'icon' => 'Timer',        'new' => true],

    // ── Dávka 3 — další Dev nástroje ─────────────────────────────
    ['slug' => 'code-diff',            'name' => 'Code diff',            'desc' => 'Porovnejte dva texty/kód a zobrazte změny.',       'cat' => 'dev', 'loc' => 'client', 'icon' => 'GitCompare',     'new' => true],
    ['slug' => 'css-js-html-formatter', 'name' => 'CSS/JS/HTML formátovač','desc' => 'Naformátujte nebo zminifikujte CSS, JS a HTML.', 'cat' => 'dev', 'loc' => 'client', 'icon' => 'SquareCode',     'new' => true],
    ['slug' => 'contrast-checker',     'name' => 'Kontrast (WCAG)',      'desc' => 'Ověřte kontrast barev dle WCAG AA/AAA.',          'cat' => 'dev', 'loc' => 'client', 'icon' => 'Contrast',       'new' => true],
    ['slug' => 'qr-generator',         'name' => 'QR generátor',         'desc' => 'Vytvořte QR kód (text, URL, Wi-Fi, vCard).',      'cat' => 'dev', 'loc' => 'client', 'icon' => 'QrCode',        'new' => true],
    ['slug' => 'og-meta-generator',    'name' => 'OG meta generátor',    'desc' => 'Vygenerujte Open Graph meta tagy s náhledem.',   'cat' => 'dev', 'loc' => 'client', 'icon' => 'Share2',        'new' => true],
    ['slug' => 'gitignore-generator',  'name' => '.gitignore generátor', 'desc' => 'Sestavte .gitignore podle jazyka/nástroje.',     'cat' => 'dev', 'loc' => 'client', 'icon' => 'FileX',         'new' => true],
    ['slug' => 'fake-data-generator',  'name' => 'Fake data generátor',  'desc' => 'Generujte testovací data a exportujte CSV/JSON.', 'cat' => 'dev', 'loc' => 'client', 'icon' => 'Database',      'new' => true],
    ['slug' => 'color-palette-generator','name' => 'Paleta barev',        'desc' => 'Vytvořte paletu (komplementární, analogická…).',  'cat' => 'dev', 'loc' => 'client', 'icon' => 'SwatchBook',    'new' => true],

    ['slug' => 'hash-gen',        'name' => 'Hash generátor',  'desc' => 'Generujte MD5, SHA-256, SHA-512 hashe.',            'cat' => 'security', 'loc' => 'client', 'icon' => 'Hash',      'new' => false],
    ['slug' => 'password-gen',    'name' => 'Generátor hesel', 'desc' => 'Vytvářejte bezpečná hesla na míru.',                 'cat' => 'security', 'loc' => 'client', 'icon' => 'Lock',      'new' => false],
    ['slug' => 'encrypt-decrypt', 'name' => 'Šifrování textu','desc' => 'Zašifrujte a dešifrujte text pomocí AES-256-GCM.',   'cat' => 'security', 'loc' => 'client', 'icon' => 'Shield',    'new' => false],
    ['slug' => 'steganography',   'name' => 'Steganografie',  'desc' => 'Skryjte text v obrázku pomocí LSB encoding.',        'cat' => 'security', 'loc' => 'client', 'icon' => 'EyeOff',    'new' => true],
    ['slug' => 'certificate-info', 'name'=> 'SSL certifikát info','desc'=>'Zkontrolujte platnost a detaily SSL certifikátu.','cat' => 'security', 'loc' => 'server', 'icon' => 'GlobeLock', 'new' => true],
    ['slug' => 'password-strength', 'name'=> 'Síla hesla',       'desc' => 'Odhadněte entropii a dobu prolomení hesla.',          'cat' => 'security', 'loc' => 'client', 'icon' => 'ShieldCheck','new' => true],
    ['slug' => 'totp-generator',   'name' => 'TOTP generátor',   'desc' => 'Vygenerujte 2FA TOTP kódy (RFC 6238) z tajemství.',   'cat' => 'security', 'loc' => 'client', 'icon' => 'Timer',      'new' => true],
    ['slug' => 'password-breach-check','name'=>'Kontrola úniku hesla','desc'=>'Ověří, jestli heslo uniklo (HIBP k-anonymity).',   'cat' => 'security', 'loc' => 'client', 'icon' => 'Fingerprint','new' => true],
    ['slug' => 'file-encryption',   'name' => 'Šifrování souborů','desc' => 'Zašifruje/dešifruje soubor AES-256-GCM (Web Crypto).','cat' => 'security', 'loc' => 'client', 'icon' => 'FileKey',    'new' => true],
    ['slug' => 'token-generator',  'name' => 'Token generátor', 'desc' => 'Generuje náhodné tokeny (délka, znaková sada).',       'cat' => 'security', 'loc' => 'client', 'icon' => 'Zap',        'new' => true],

    ['slug' => 'percentage-calc',     'name' => 'Kalkulačka procent', 'desc' => 'Rychle spočítejte procenta, zvýšení a snížení.', 'cat' => 'calc', 'loc' => 'client', 'icon' => 'Percent',    'new' => false],
    ['slug' => 'loan-calc',           'name' => 'Kalkulačka půjčky',  'desc' => 'Vypočítejte splátky a amortizační tabulku.',       'cat' => 'calc', 'loc' => 'client', 'icon' => 'Calculator','new' => false],
    ['slug' => 'unit-converter',      'name' => 'Převodník jednotek','desc' => 'Převádějte délku, hmotnost, teplotu, objem a další.','cat' => 'calc','loc' => 'client', 'icon' => 'Ruler',     'new' => false],
    ['slug' => 'color-converter',     'name' => 'Převodník barev',   'desc' => 'Převádějte mezi HEX, RGB, HSL a CMYK.',            'cat' => 'calc', 'loc' => 'client', 'icon' => 'Palette',    'new' => false],
    ['slug' => 'number-base-converter','name'=> 'Soustava čísel',   'desc' => 'Převádějte mezi decimální, binární, oktálovou a hexadecimální soustavou.', 'cat' => 'calc', 'loc' => 'client', 'icon' => 'Binary', 'new' => true],

    // ── Dávka 1 — další kalkulačky ────────────────────────────────
    ['slug' => 'bmi-calc',                'name' => 'BMI kalkulačka',       'desc' => 'Vypočítejte index tělesné hmotnosti a kategorii.', 'cat' => 'calc', 'loc' => 'client', 'icon' => 'Scale',          'new' => true],
    ['slug' => 'discount-calc',           'name' => 'Kalkulačka slev',      'desc' => 'Spočítejte cenu po slevě, i vícenásobné slevy.',    'cat' => 'calc', 'loc' => 'client', 'icon' => 'Tag',            'new' => true],
    ['slug' => 'vat-calc',                'name' => 'DPH kalkulačka',       'desc' => 'Převeďte částku mezi bez DPH a s DPH (CZ sazby).',  'cat' => 'calc', 'loc' => 'client', 'icon' => 'Landmark',       'new' => true],
    ['slug' => 'net-salary-calc',          'name' => 'Kalkulačka čisté mzdy','desc' => 'Odhad čisté mzdy ze hrubé (CZ sazby).',           'cat' => 'calc', 'loc' => 'client', 'icon' => 'Wallet',         'new' => true],
    ['slug' => 'date-diff-calc',           'name' => 'Rozdíl datumů',        'desc' => 'Vypočítejte rozdíl mezi dvěma daty v dnech.',       'cat' => 'calc', 'loc' => 'client', 'icon' => 'CalendarDays',   'new' => true],
    ['slug' => 'compound-interest-calc',   'name' => 'Složené úročení',     'desc' => 'Spočítejte výnos složeného úročení.',               'cat' => 'calc', 'loc' => 'client', 'icon' => 'TrendingUp',     'new' => true],
    ['slug' => 'grade-average-calc',       'name' => 'Průměr známek',       'desc' => 'Vypočítejte vážený průměr známek.',                 'cat' => 'calc', 'loc' => 'client', 'icon' => 'GraduationCap',  'new' => true],
    ['slug' => 'fuel-consumption-calc',    'name' => 'Spotřeba paliva',    'desc' => 'Převod mezi l/100 km a mpg.',                       'cat' => 'calc', 'loc' => 'client', 'icon' => 'Fuel',          'new' => true],
    ['slug' => 'bmr-calc',                 'name' => 'BMR a kalorie',        'desc' => 'Bazální metabolismus a denní příjem kalorií.',       'cat' => 'calc', 'loc' => 'client', 'icon' => 'Flame',         'new' => true],
    ['slug' => 'time-calc',                'name' => 'Časová kalkulačka',   'desc' => 'Sčítání a odčítání časových údajů.',               'cat' => 'calc', 'loc' => 'client', 'icon' => 'Clock',         'new' => true],
    ['slug' => 'iban-converter',           'name' => 'Převodník IBAN',      'desc' => 'Převede české číslo účtu na IBAN a zpět.',         'cat' => 'calc', 'loc' => 'client', 'icon' => 'Banknote',      'new' => true],
    ['slug' => 'birth-number-validator',    'name' => 'Validátor rodného čísla','desc' => 'Ověří formát a kontrolní součet rodného čísla.',  'cat' => 'calc', 'loc' => 'client', 'icon' => 'BadgeCheck',    'new' => true],
];

// Pomocné funkce ────────────────────────────────────────────────

function get_tool(string $slug): ?array {
    foreach (TOOLS as $t) if ($t['slug'] === $slug) return $t;
    return null;
}

function tools_by_category(): array {
    $map = [];
    foreach (CATEGORY_ORDER as $c) $map[$c] = [];
    foreach (TOOLS as $t) $map[$t['cat']][] = $t;
    return $map;
}

function new_tools(int $limit = 8): array {
    $out = [];
    foreach (TOOLS as $t) if ($t['new']) { $out[] = $t; if (count($out) >= $limit) break; }
    return $out;
}

function client_count(): int {
    $c = 0;
    foreach (TOOLS as $t) if ($t['loc'] === 'client') $c++;
    return $c;
}

// Text + ikona + tooltip pro badge místa zpracování.
function location_meta(string $loc): array {
    switch ($loc) {
        case 'client': return ['label' => 'Lokálně',  'icon' => 'ShieldCheck', 'tone' => 'local',   'title' => 'Soubor se zpracovává ve vašem prohlížeči a neopustí tento počítač.'];
        case 'server': return ['label' => 'Na serveru','icon' => 'Server',     'tone' => 'server',  'title' => 'Soubor se zpracuje na serveru a po dokonání se smaže.'];
        default:       return ['label' => 'Přes AI',   'icon' => 'Sparkles',   'tone' => 'ai',      'title' => 'Zpracování probíhá přes AI model.'];
    }
}

function e(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}