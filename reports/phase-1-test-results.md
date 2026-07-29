# Výsledky testů — fáze 1

Čas posledního běhu: **2026-07-29 02:15 CEST**. Příkazy byly spuštěné v čistém
checkoutu větve `codex/phase-1-security-registry-tests`.

| Příkaz | Výsledek | Poznámka |
| --- | --- | --- |
| `php tests/html-pdf-sanitize-test.php` | přeskočeno | Regresní fixture je browser HTML; byla ověřena přes Chromium v dřívějším běhu, ale tento PHP příkaz neexistuje. |
| `chromium --headless --no-sandbox --disable-gpu --allow-file-access-from-files --dump-dom file:///tmp/vevit-tools-git-metadata/tests/html-pdf-sanitize-test.html` | PASS | Sanitizer odstranil script, event handlery, nebezpečné URL, aktivní SVG a rozbitý markup. |
| `php tests/ssl-checker-test.php` | PASS | Deterministické resolver/connector fixtures; bez spojení do interní sítě. |
| `php tests/request-rate-limit-test.php` | PASS | Limit i nedostupné úložiště jsou rozlišené. |
| `php tests/registry-export-test.php` | PASS | 107 unikátních slugů, validační export a veřejný dataset. |
| `php scripts/export-tools.php` | PASS | Atomicky vytvořil `assets/data/tools.json`. |
| `python3 scripts/generate-index.py` | PASS | Vytvořil statický `index.html` z PHP exportu bez regex parsování registru. |
| `php scripts/generate-tool-manifest.php` | PASS | Vytvořil manifest všech 107 nástrojů. |
| `php tests/tool-manifest-structural-test.php` | PASS | Existující šablony, JS a společný asset; unikátní slugy. |
| `VEVIT_TEST_BASE_URL=http://127.0.0.1:3940 php tests/route-smoke-test.php` | PASS | 107/107 rout: HTTP 200, title, pracovní plocha/pravdivý placeholder, bez fatální PHP chyby. |
| `find . -name '*.php' -print0 \| xargs -0 -n1 php -l` | PASS | PHP lint všech PHP souborů. |
| `find assets/js -name '*.js' ! -name '*.min.js' -print0 \| xargs -0 -n1 node --check` | PASS | Syntaxe všech neminifikovaných JavaScriptů. |
| `git diff --check` | PASS | Žádné chyby whitespace. |

## Neprovedené testy

* Browser smoke pro všech 107 nástrojů (včetně `console.error` a `pageerror`).
* Happy-path funkční testy a fixtures pro jednotlivé nástroje.
* Mobilní layout a rozšířené vyhledávání — patří do následujících fází.
* SSO testy — VeVit-account není součástí tohoto checkoutu.

Tyto položky nejsou úspěšné testy a nezvyšují `verified_test_level`.
