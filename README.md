# VeVit Tools

Vanilla HTML/CSS/JavaScript a PHP sada nástrojů pro PDF, obrázky, média, text,
AI, vývoj, bezpečnost a kalkulačky. Landing page je generovaný statický
`index.html`; detaily zůstávají na URL `/tools/<slug>` a fungují bez Node.js.

## Aktuální stav

Registr v `includes/registry.php` je jediný zdroj pravdy pro 107 nástrojů.
Z něj vzniká `assets/data/tools.json`, `index.html` a testovací manifest.
Každý záznam obsahuje stav, dostupnost, zpracování, požadavky, poznámku o
soukromí a deklarovaný testovací cíl. Skutečně provedené testy jsou výhradně v
reportech — registr netvrdí neprovedený happy-path test.

Některé nástroje nejsou použitelné na sdíleném WEDOS hostingu:

* `pdf-password` vyžaduje `qpdf` a `shell_exec`;
* `screenshot-tool` vyžaduje izolovaný headless browser;
* `ai-image-gen` zatím nemá implementovaného providera.

Tyto stavy jsou v registru a detailu nástroje jasně označené. AI proxy pro
Ollamu je pouze vývojová integrace: model volí server, proxy má limity a na
sdíleném WEDOS ji nelze provozovat bez externí bezpečné AI služby.

## Vývoj

```bash
php -S 127.0.0.1:3939 router.php
```

Potom otevřete `http://127.0.0.1:3939`. Pro lokální vývoj AI je nutná samostatně
provozovaná Ollama; není to produkční závislost WEDOS nasazení.

## Generování a testy

```bash
php scripts/export-tools.php
python3 scripts/generate-index.py
php scripts/generate-tool-manifest.php
php tests/registry-export-test.php
php tests/tool-manifest-structural-test.php
VEVIT_TEST_BASE_URL=http://127.0.0.1:3939 php tests/route-smoke-test.php
```

Kompletní výsledky první fáze jsou v `reports/phase-1-test-results.md` a
`reports/tool-audit.md`. Testy browseru a funkční happy-path testy nejsou v
první fázi deklarované jako hotové, pokud nebyly skutečně spuštěné.

## Produkce na WEDOS

* `/` obsluhuje statický `index.html`.
* Apache `mod_rewrite` mapuje `/tools/<slug>` na `tools.php`.
* Produkce nepotřebuje Node.js ani `node_modules`.
* Nikdy neukládejte AI klíče ani service-role klíče do klientského JavaScriptu.

Podrobnější postup nasazení bude doplněn v samostatné nasazovací fázi.
