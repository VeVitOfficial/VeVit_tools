<?php
test('missing critical configuration fails closed', function (): void {
    require_once __DIR__ . '/../../app/config/Config.php';
    $config = new VeVit\App\Config\Config(['APP_ENV' => 'production']);
    try { $config->requireCritical(['APP_KEY', 'APP_URL']); }
    catch (RuntimeException) { return; }
    throw new RuntimeException('missing configuration was accepted');
});

test('production configuration disables debug output', function (): void {
    require_once __DIR__ . '/../../app/config/Config.php';
    $config = new VeVit\App\Config\Config(['APP_ENV' => 'production', 'APP_DEBUG' => 'true']);
    expect_same(false, $config->debugEnabled(), 'production debug must be false');
});
