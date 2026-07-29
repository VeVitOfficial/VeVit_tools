# Audit nástrojů — fáze 1

Stav k 2026-07-29 02:13 CEST. Strojově čitelný ekvivalent je
`reports/tool-status.json`.

| Metrika | Hodnota |
| --- | ---: |
| Registrované nástroje | 107 |
| Skutečně strukturálně a route smoke otestované | 107 |
| working | 91 |
| limited | 13 |
| experimental | 0 |
| coming_soon | 1 |
| unavailable_on_wedos | 2 |
| broken | 0 |
| Browser smoke testy | 0 dokončeno v tomto reportu |
| Happy-path testy | 0 dokončeno v tomto reportu |

## Opravené problémy

* HTML → PDF již nevkládá uživatelský HTML vstup do hlavního DOM; sanitizuje
  úzký allowlist a renderuje pouze do sandboxovaného iframe bez skriptů.
* SSL checker používá DNS/IP allowlist pro IPv4 i IPv6, odmítá interní cíle a
  připojuje se přímo na ověřenou IP se SNI a `peer_name` původní domény.
* TLS výsledek znamená skutečné ověření důvěryhodného řetězce, ne jen datum
  expirace.
* Placeholdery `pdf-password`, `screenshot-tool` a `ai-image-gen` mají platné
  HTML atributy a pravdivý stav.

## Známé blockery

| Nástroj | Stav | Důvod |
| --- | --- | --- |
| `pdf-password` | unavailable_on_wedos | Potřebuje `qpdf` a `shell_exec`; sdílený WEDOS je neposkytuje. |
| `screenshot-tool` | unavailable_on_wedos | Potřebuje izolovaný headless browser a bezpečnou SSRF infrastrukturu. |
| `ai-image-gen` | coming_soon | Není implementovaný ani nakonfigurovaný bezpečný externí provider. |
| 13 Ollama AI nástrojů | limited | Endpoint je vývojový; lokální Ollama na sdíleném WEDOS neběží. |

## Co tento audit nepředstírá

Provedené testy ověřují registr, lokální assety, PHP rendering a HTTP routy.
Neověřují funkční výstup každého nástroje ani browser console. Browser a
happy-path testy proto nejsou označené jako hotové a `verified_test_level` v
reportu končí u `structural`.

Čtyři assety chyběly pouze v původním neúplném snapshotu:
`assets/js/site.js`, `assets/js/lib/tool-ui.js`, `assets/js/lib/purify.min.js`
a `assets/js/lib/pdf.worker.min.js`. V čistém upstream checkoutu jsou všechny
přítomné. Jejich absence by ovlivnila navigaci, společné ovládání nástrojů,
sanitizovaný Markdown a PDF nástroje používající worker.
