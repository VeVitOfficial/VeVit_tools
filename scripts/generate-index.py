#!/usr/bin/env python3
"""Generuje statický index.html z includes/registry.php + includes/icons.php.

Jediný zdroj pravdy zůstává v PHP (registry + icons). Tento skript ten samý
výstup, co by udělalo index.php, vyexportuje jako hotový statický HTML soubor,
aby Wedos mohl serve-ovat `/` bez PHP. Spusť znovu po změně registrů:

    python3 scripts/generate-index.py
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


# ── Parsovací pomocníci ────────────────────────────────────────────
def parse_const_dict(src, name):
    """Vrátí dict z `const NAME = [ 'k' => 'v', ... ];`."""
    m = re.search(r"const\s+%s\s*=\s*\[(.*?)\];" % re.escape(name), src, re.S)
    if not m:
        raise RuntimeError("Nenalezeno: " + name)
    body = m.group(1)
    out = {}
    for key, val in re.findall(r"'([^']*)'\s*=>\s*'([^']*)'", body):
        out[key] = val
    return out


def parse_const_list(src, name):
    """Vrátí list z `const NAME = ['a','b',...];`."""
    m = re.search(r"const\s+%s\s*=\s*\[(.*?)\];" % re.escape(name), src, re.S)
    return re.findall(r"'([^']+)'", m.group(1))


# ── Načti data ─────────────────────────────────────────────────────
reg = load("includes/registry.php")
ico = load("includes/icons.php")

CATEGORY_COLORS = parse_const_dict(reg, "CATEGORY_COLORS")
CATEGORY_LABELS = parse_const_dict(reg, "CATEGORY_LABELS")
CATEGORY_DESCRIPTIONS = parse_const_dict(reg, "CATEGORY_DESCRIPTIONS")
CATEGORY_ORDER = parse_const_list(reg, "CATEGORY_ORDER")

# Ikony: mapování Jméno -> vnitřní SVG (obsah mezi <svg> a </svg>).
ICON_MAP = dict(re.findall(r"'([A-Za-z0-9]+)'\s*=>\s*'(<[^']*)',", ico))


def icon_svg(name, size=24):
    inner = ICON_MAP.get(name, "")
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" '
            'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            'stroke-linecap="round" stroke-linejoin="round">%s</svg>') % (size, size, inner)


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
TOOLS = []
for line in reg.splitlines():
    m = re.search(r"\['slug'\s*=>\s*'([^']+)'.*'name'\s*=>\s*'([^']+)'.*'desc'\s*=>\s*'([^']*)'.*'cat'\s*=>\s*'([^']+)'.*'loc'\s*=>\s*'([^']+)'.*'icon'\s*=>\s*'([^']+)'.*'new'\s*=>\s*(true|false)\]", line)
    if m:
        TOOLS.append(dict(slug=m[1], name=m[2], desc=m[3], cat=m[4], loc=m[5],
                          icon=m[6], new=(m[7] == "true")))

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
    loc_class = "badge-loc-local" if tone == "local" else "badge-loc-other"
    return ('<a class="tool-card" href="/tools/%s" data-name="%s" data-desc="%s" data-slug="%s">'
            '<span class="accent" style="background:%s"></span>'
            '<div class="top">'
            '<span class="icon-box" style="background:%s">%s</span>'
            '%s'
            '</div>'
            '<h3 class="name">%s</h3>'
            '<p class="desc">%s</p>'
            '<div class="footer">'
            '<span class="badge %s" title="%s">%s%s</span>'
            '<span class="open">Otevřít →</span>'
            '</div>'
            '</a>') % (
        e(t["slug"]), e(t["name"].lower()), e(t["desc"].lower()), e(t["slug"]),
        color, color + "15", icon, new_badge,
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
        .replace("__CHIPS__", cat_chips)
        .replace("__SECTIONS__", sections_html)
        .replace("__TOTAL__", str(total))
        .replace("__CLIENT__", str(client_count))
        .replace("__CATS__", str(cat_count)))

out = os.path.join(ROOT, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(page)
print("Zapsáno: %s  (nástrojů=%d, kategorií=%d, lokálně=%d)" % (out, total, cat_count, client_count))