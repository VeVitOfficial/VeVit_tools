<?php
require_once __DIR__ . '/includes/registry.php';
require_once __DIR__ . '/includes/icons.php';

$slug = isset($_GET['slug']) ? preg_replace('/[^a-z0-9-]/', '', $_GET['slug']) : '';
$tool = $slug ? get_tool($slug) : null;

if (!$tool) {
    http_response_code(404);
    require __DIR__ . '/includes/header.php';
    echo '<main class="main"><div class="tool-page center"><div class="tool-placeholder"><div class="t">Nástroj nebyl nalezen</div><p class="muted" style="font-size:0.875rem">Tento nástroj neexistuje.</p><p style="margin-top:1.5rem"><a class="btn btn-outline" href="/">Zpět na přehled</a></p></div></div></main>';
    require __DIR__ . '/includes/footer.php';
    exit;
}

$color = CATEGORY_COLORS[$tool['cat']];
$cat_label = CATEGORY_LABELS[$tool['cat']];
$loc = location_meta($tool['loc']);

// Seznam slugů s reálnou implementací (zbytek = placeholder).
$implemented = [
  // Dev / Bezpečnost / Kalkulačky (Fáze 0)
  'json-formatter','uuid-gen','hash-gen','regex-tester','password-gen','color-converter','number-base-converter',
  // AI
  'ai-chat',
  // Fáze 1 — čistě client-side, žádný backend
  'percentage-calc','loan-calc','unit-converter','encrypt-decrypt','markdown-editor',
  'pdf-merge','pdf-split','pdf-compress',
  // Dávka 1 — další kalkulačky
  'bmi-calc','discount-calc','vat-calc','net-salary-calc','date-diff-calc','compound-interest-calc',
  'grade-average-calc','fuel-consumption-calc','bmr-calc','time-calc','iban-converter','birth-number-validator',
  // Dávka 2 — Dev nástroje
  'gradient-gen','jwt-decoder','base64-tool','url-encoder','jwt-generator',
  'yaml-json-converter','csv-json-converter','cron-builder','timestamp-converter',
  // Dávka 3 — Dev nástroje
  'code-diff','css-js-html-formatter','contrast-checker','qr-generator',
  'og-meta-generator','gitignore-generator','fake-data-generator','color-palette-generator',
];
$has_impl = in_array($tool['slug'], $implemented, true);

require __DIR__ . '/includes/header.php';
?>
<main class="main">
  <div class="tool-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <a href="/"><?= icon_svg('ArrowLeft', 16) ?> Nástroje</a>
      <span class="sep">/</span>
      <span style="color:<?= $color ?>"><?= e($cat_label) ?></span>
      <span class="sep">/</span>
      <span><?= e($tool['name']) ?></span>
    </nav>

    <!-- Tool header -->
    <div class="tool-header">
      <span class="bar" style="background:<?= $color ?>"></span>
      <h1><?= e($tool['name']) ?></h1>
      <span class="loc-tag" style="border-color:<?= $color ?>30;color:<?= $color ?>;background:<?= $color ?>10"><?= e($loc['label']) ?></span>
    </div>
    <p class="tool-desc"><?= e($tool['desc']) ?></p>

    <!-- Tool body -->
    <div class="tool-shell glass">
      <?php if ($has_impl): ?>
        <div class="tool-tool" id="tool-root">
          <?php require __DIR__ . '/includes/tools/' . $tool['slug'] . '.php'; ?>
        </div>
        <script src="/assets/js/tools/<?= $tool['slug'] ?>.js" defer></script>
      <?php else: ?>
        <div class="tool-placeholder">
          <p class="t">Nástroj „<?= e($tool['name']) ?>“</p>
          <p style="font-size:0.875rem">Tento nástroj je zatím ve vývoji. Brzy bude dostupný.</p>
        </div>
      <?php endif; ?>
    </div>
  </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>