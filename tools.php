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
  // Dávka 4 — textové nástroje
  'text-counter','text-case-converter','lorem-ipsum','remove-diacritics',
  'text-to-speech','text-lines-tool','mind-map',
  // Dávka 5 — obrázky přes canvas
  'image-convert','image-crop','image-rotate-flip','image-filters',
  // Dávka 6 — další obrázky + komprese/zvětšení
  'img-compress','img-upscaler','image-watermark','image-exif',
  'image-collage','favicon-generator','meme-generator',
  // Dávka 7 — PDF client-side
  'invoice-gen','pdf-to-images','images-to-pdf','pdf-rotate',
  'pdf-organize','pdf-watermark','pdf-page-numbers','pdf-extract-text',
  // Dávka 8 — PDF client alternativy
  'pdf-to-word','html-to-pdf',
  // Dávka 9 — security
  'steganography','certificate-info','password-strength','totp-generator',
  'password-breach-check','file-encryption','token-generator',
  // Dávka 10 — média bez ffmpeg
  'video-thumbnail','audio-waveform',
  // Dávka 11 — ffmpeg.wasm + ML obrázky
  'video-convert','video-compress','video-trim','audio-convert',
  'video-extract-audio','video-to-gif','video-merge','video-target-size','audio-trim-normalize',
  'bg-remover',
  // Dávka 12 — AI nástroje (Ollama)
  'ai-vision','ai-seo','ai-sql-gen',
  'translate','summarize-text','grammar-check','ai-email-writer','ai-text-qa',
  'ai-commit-message','ai-regex-generator','ai-code-explainer',
  'gif-maker',
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
        <div class=”tool-placeholder”>
          <p class=”t”>Nástroj „<?= e($tool['name']) ?>”</p>
          <p style=”font-size:0.875rem”>Tento nástroj je zatím ve vývoji. Brzy bude dostupný.</p>
          <?php if (!empty($tool['note'])): ?>
            <p class=”error-text” style=”margin-top:0.75rem;display:block”><?= e($tool['note']) ?></p>
          <?php endif; ?>
        </div>
      <?php endif; ?>
    </div>
  </div>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>