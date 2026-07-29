#!/usr/bin/env python3
"""Generuje statický index.html z includes/registry.php + includes/icons.php.

Jediný zdroj pravdy zůstává v PHP (registry + icons). Tento skript ten samý
výstup, co by udělalo index.php, vyexportuje jako hotový statický HTML soubor,
aby Wedos mohl serve-ovat `/` bez PHP. Spusť znovu po změně registrů:

    python3 scripts/generate-index.py
"""
import html
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ── Načti kanonický export přes PHP; žádné regexové parsování PHP. ──────────
raw = subprocess.check_output(["php", os.path.join(ROOT, "scripts", "export-tools.php"), "--generator"], text=True)
dataset = json.loads(raw)
CATEGORY_ORDER = [category["id"] for category in dataset["categories"]]
CATEGORY_COLORS = {category["id"]: category["color"] for category in dataset["categories"]}
CATEGORY_LABELS = {category["id"]: category["name"] for category in dataset["categories"]}
CATEGORY_DESCRIPTIONS = {category["id"]: category["description"] for category in dataset["categories"]}
ICON_MAP = dataset["icons"]


def icon_svg(name, size=24):
    svg = ICON_MAP.get(name, "")
    return svg.replace('width="24" height="24"', 'width="%d" height="%d"' % (size, size), 1)


LOC_META = {
    "client": ("Lokálně", "ShieldCheck", "local",
               "Soubor se zpracovává ve vašem prohlížeči a neopustí tento počítač."),
    "server": ("Na serveru", "Server", "server",
               "Soubor se zpracuje na serveru a po dokonání se smaže."),
    "ai":     ("Přes AI", "Sparkles", "ai",
               "Zpracování probíhá přes AI model."),
}


def e(s):
    return html.escape(str(s), quote=True)


# ── Nástroje ────────────────────────────────────────────────────────
TOOLS = [{
    "slug": tool["slug"], "name": tool["name"], "desc": tool["description"],
    "cat": tool["category"], "loc": {"client": "client", "vevit_server": "server", "external_ai": "ai"}[tool["processing_location"]],
    "icon": tool["icon"], "new": tool["new"], "status": tool["status"], "availability": tool["availability"]
} for tool in dataset["tools"]]

by_cat = {c: [] for c in CATEGORY_ORDER}
for t in TOOLS:
    by_cat.setdefault(t["cat"], []).append(t)

new_tools = [t for t in TOOLS if t["new"]][:8]
client_count = sum(1 for t in TOOLS if t["loc"] == "client")
total = len(TOOLS)
cat_count = len(CATEGORY_ORDER)


def render_tool_card(t):
    color = CATEGORY_COLORS[t["cat"]]
    label, loc_icon, tone, title = LOC_META[t["loc"]]
    icon = icon_svg(t["icon"], 20)
    li = icon_svg(loc_icon, 12)
    new_badge = '<span class="badge badge-new">NOVÉ</span>' if t["new"] else ""
    status_labels = {
        "working": "Dostupný", "limited": "Omezeně dostupný", "experimental": "Experimentální",
        "coming_soon": "Připravujeme", "unavailable_on_wedos": "Nedostupné na WEDOS", "broken": "Nefunkční",
    }
    status_badge = '' if t["status"] == "working" else '<span class="badge badge-status-%s">%s</span>' % (e(t["status"]), e(status_labels[t["status"]]))
    loc_class = "badge-loc-local" if tone == "local" else "badge-loc-other"
    return ('<a class="tool-card" href="/tools/%s" data-name="%s" data-desc="%s" data-slug="%s">'
            '<span class="accent" style="background:%s"></span>'
            '<div class="top">'
            '<span class="icon-box" style="background:%s">%s</span>'
            '%s%s'
            '</div>'
            '<h3 class="name">%s</h3>'
            '<p class="desc">%s</p>'
            '<div class="footer">'
            '<span class="badge %s" title="%s">%s%s</span>'
            '<span class="open">Otevřít →</span>'
            '</div>'
            '</a>') % (
        e(t["slug"]), e(t["name"].lower()), e(t["desc"].lower()), e(t["slug"]),
        color, color + "15", icon, new_badge, status_badge,
        e(t["name"]), e(t["desc"]),
        loc_class, e(title), li, e(label))


# ── Header (dropdown kategorií) ─────────────────────────────────────
cat_dropdown = (
    '<a href="/#nove" role="menuitem"><span class="dot" style="background:var(--color-emerald)"></span> Nejnovější</a>'
    '<div class="sep"></div>'
    + "".join(
        '<a href="/#%s" role="menuitem"><span class="dot" style="background:%s"></span> %s</a>'
        % (c, CATEGORY_COLORS[c], e(CATEGORY_LABELS[c]))
        for c in CATEGORY_ORDER
    )
)

# ── cat-nav chipy ────────────────────────────────────────────────────
cat_chips = (
    '<a class="chip" href="#nove" data-target="nove">Nejnovější</a>'
    + "".join(
        '<a class="chip" href="#%s" data-target="%s"><span class="dot" style="background:%s"></span> %s</a>'
        % (c, c, CATEGORY_COLORS[c], e(CATEGORY_LABELS[c]))
        for c in CATEGORY_ORDER
    )
)

# ── Sekce ───────────────────────────────────────────────────────────
sections_html = ""
if new_tools:
    sections_html += (
        '<section class="section" id="nove">'
        '<div class="section-head"><span class="bar" style="background:var(--color-emerald)"></span><h2>Nejnovější nástroje</h2></div>'
        '<p class="section-desc">Čerstvě přidané nástroje, které ještě nemusíte znát.</p>'
        '<div class="grid">%s</div>'
        '</section>'
    ) % "".join(render_tool_card(t) for t in new_tools)

for cat in CATEGORY_ORDER:
    lst = by_cat.get(cat, [])
    if not lst:
        continue
    sections_html += (
        '<section class="section" id="%s">'
        '<div class="section-head"><span class="bar" style="background:%s"></span><h2>%s</h2><span class="count">%d</span></div>'
        '<p class="section-desc">%s</p>'
        '<div class="grid">%s</div>'
        '</section>'
    ) % (cat, CATEGORY_COLORS[cat], e(CATEGORY_LABELS[cat]), len(lst),
         e(CATEGORY_DESCRIPTIONS[cat]),
         "".join(render_tool_card(t) for t in lst))

# ── Sestavení stránky ────────────────────────────────────────────────
page = """<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VeVit Tools — Nástroje pro vaši práci</title>
  <meta name="description" content="Sada nástrojů pro PDF, obrázky, média, text, AI, vývoj, bezpečnost i kalkulačky. Většinu souborů zpracujeme lokálně v prohlížeči, bez nahrávání na server.">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<header class="site-header glass">
  <div class="container bar">
    <div class="header-left">
      <a class="brand" href="/">
        <span class="brand-logo">__BOX__</span>
        <span class="brand-mark">
          <span class="brand-name">VeVit</span>
          <span class="brand-suffix">Tools</span>
        </span>
      </a>
      <div class="cat-wrap" style="position:relative">
        <button class="cat-toggle" id="cat-toggle" aria-expanded="false" aria-haspopup="menu">
          Kategorie __CHEVRON__
        </button>
        <div class="cat-dropdown glass-strong hidden" id="cat-menu" role="menu">
          __DROPDOWN__
        </div>
      </div>
    </div>
    <div class="header-right">
      <a class="login-btn" href="https://account.vevit.cz/login"
         title="Přihlášení k účtu VeVit je volitelné — všechny nástroje fungují i bez něj.">
        __LOGIN__ Přihlásit se
      </a>
    </div>
  </div>
</header>

<main class="main">
  <section class="hero">
    <div class="hero-glow"></div>
    <div class="hero-inner">
      <div class="eyebrow">__WRENCH__ Nástroje</div>
      <h1>Nástroje pro <span class="g-emerald">práci</span><span class="g-white"> &amp; </span><span class="g-sky">každý den.</span></h1>
      <p class="subtitle">PDF, obrázky, video, text, AI i kalkulačky. Většinu souborů zpracujeme přímo ve vašem prohlížeči — bez nahrávání na server.</p>

      <div class="pills">
        <span class="pill">__ZAP__ __TOTAL__ nástrojů</span>
        <span class="pill">__SHIELD__ Zpracováno lokálně</span>
        <span class="pill">__GIFT__ Zdarma &amp; bez registrace</span>
      </div>

      <div class="stats-row">
        <span><strong>__CLIENT__</strong> běží lokálně</span>
        <span class="sep">·</span>
        <span><strong>__CATS__</strong> kategorií</span>
        <span class="sep">·</span>
        <span><strong>0</strong> nucených registrací</span>
      </div>

      <div class="search-wrap">
        __SEARCH__
        <input id="hub-search" type="text" placeholder="Hledat nástroj... (např. 'json', 'pdf', 'hash')" autocomplete="off">
      </div>
    </div>
  </section>

  <section class="section beta-section" id="beta">
    <div class="beta-card glass">
      <div class="beta-head">
        __BUG__ <span class="beta-tag">BETA TESTING</span>
      </div>
      <h2 class="beta-title">Beta testing</h2>
      <p class="beta-sub">Narazili jste na chybu, něco nefunguje nebo chybí? Napište nám to sem — stačí jeden text. Nic víc po vás nechceme.</p>

      <form class="beta-form" id="beta-form" novalidate>
        <textarea class="textarea" id="beta-message" name="message" rows="4"
          placeholder="Popište, co se nepovedlo (nástroj, kroky, co jste čekali vs. co se stalo)…"></textarea>
        <button class="btn btn-primary btn-touch" id="beta-send" type="submit">
          __SEND__ <span class="beta-label">Odeslat hlášení</span>
        </button>
      </form>

      <p class="beta-note hidden" id="beta-note">
        <strong>Díky!</strong> Hlášení jsme poslali na <span>info@vevit.cz</span>.
      </p>

      <p class="beta-small">Pro toho, kdo najde chybu, nahlásí ji a do zprávy připojí svůj e-mail, máme připravený <strong>rank beta-tester s výhodami</strong> — dřívější přístup k novým nástrojům, priorita hlášení a malé bonusy. E-mail do zprávy je čistě dobrovolný; bez něj hlášení normálně pošleme, jen se ozveme jen tehdy, když k tomu bude důvod.</p>
    </div>
  </section>

  <section class="sections hidden" id="search-results">
    <h2 class="muted" id="results-title" style="font-size:0.875rem;font-weight:500;margin:0 0 1.5rem"></h2>
    <div class="grid" id="results-grid"></div>
    <div class="empty-state hidden" id="results-empty">
      __SEARCH40__
      <p class="t">Žádný nástroj neodpovídá hledání.</p>
      <p class="muted" style="font-size:0.875rem">Zkuste jiné klíčové slovo.</p>
    </div>
  </section>

  <div id="sections-view">
    <div class="sections" style="padding-top:0">
      <nav class="cat-nav" id="cat-nav">
        <div class="scroll">
          __CHIPS__
        </div>
      </nav>
    </div>

    <div class="sections">
      __SECTIONS__
    </div>
  </div>
</main>

<footer class="site-footer">
  <div class="bar">
    <a href="https://vevit.cz" class="hover-fg">
      __ARROWLEFT__ Zpět na VeVit.cz
    </a>
    <span class="privacy">
      __SHIELDSM__ Vše zpracováno lokálně v prohlížeči
    </span>
    <p>© 2026 VeVit Tools.</p>
  </div>
</footer>
<script src="/assets/js/lib/toast.js"></script>
<script src="/assets/js/lib/icons.js"></script>
<script src="/assets/js/site.js"></script>
<script src="/assets/js/hub.js"></script>
<script src="/assets/js/beta.js"></script>
</body>
</html>
"""

page = (page
        .replace("__BOX__", icon_svg("Box", 20))
        .replace("__CHEVRON__", icon_svg("ChevronDown", 16))
        .replace("__LOGIN__", icon_svg("LogIn", 16))
        .replace("__DROPDOWN__", cat_dropdown)
        .replace("__WRENCH__", icon_svg("Wrench", 14))
        .replace("__ZAP__", icon_svg("Zap", 14))
        .replace("__SHIELD__", icon_svg("ShieldCheck", 14))
        .replace("__GIFT__", icon_svg("Gift", 14))
        .replace("__SEARCH__", icon_svg("Search", 20))
        .replace("__SEARCH40__", icon_svg("Search", 40))
        .replace("__ARROWLEFT__", icon_svg("ArrowLeft", 16))
        .replace("__SHIELDSM__", icon_svg("ShieldCheck", 16))
        .replace("__BUG__", icon_svg("Bug", 18))
        .replace("__SEND__", icon_svg("Send", 18))
        .replace("__CHIPS__", cat_chips)
        .replace("__SECTIONS__", sections_html)
        .replace("__TOTAL__", str(total))
        .replace("__CLIENT__", str(client_count))
        .replace("__CATS__", str(cat_count)))

out = os.path.join(ROOT, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(page)
print("Zapsáno: %s  (nástrojů=%d, kategorií=%d, lokálně=%d)" % (out, total, cat_count, client_count))
