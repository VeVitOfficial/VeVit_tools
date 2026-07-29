<?php
test('production configuration rejects insecure and placeholder values', function (): void {
    require_once __DIR__ . '/../../app/config/Config.php';
    $base = ['APP_ENV' => 'production', 'APP_URL' => 'https://tools.example.test', 'APP_KEY' => str_repeat('a', 32), 'SESSION_SECURE' => 'true', 'SESSION_COOKIE_NAME' => 'vevit_store_session', 'SESSION_LIFETIME_SECONDS' => '1800', 'SESSION_SAME_SITE' => 'Lax', 'LOG_PATH' => 'storage/logs', 'DIGITAL_FILES_PATH' => 'storage/private'];
    foreach ([['SESSION_SECURE' => 'false'], ['APP_URL' => 'http://tools.example.test'], ['APP_KEY' => 'replace-with-a-random-server-side-secret'], ['SESSION_COOKIE_NAME' => 'bad name'], ['SESSION_LIFETIME_SECONDS' => '1'], ['SESSION_SAME_SITE' => 'None'], ['LOG_PATH' => '../logs'], ['DIGITAL_FILES_PATH' => '']] as $invalid) {
        try { (new VeVit\App\Config\Config(array_replace($base, $invalid)))->validateStore(); }
        catch (RuntimeException) { continue; }
        throw new RuntimeException('insecure production configuration was accepted');
    }
});

test('environment precedence is process then explicit test override', function (): void {
    require_once __DIR__ . '/../../app/config/Config.php';
    $config = VeVit\App\Config\Config::fromSources(['VALUE' => 'process'], ['VALUE' => 'override']);
    expect_same('override', $config->string('VALUE'));
});

test('configuration categories distinguish missing invalid and insecure production', function (): void {
    require_once __DIR__ . '/../../app/config/Config.php';
    try { (new VeVit\App\Config\Config([]))->validateStore(); } catch (VeVit\App\Config\ConfigurationException $e) { expect_same('missing_configuration', $e->category); }
    $base = ['APP_ENV'=>'production','APP_URL'=>'https://tools.example.test','APP_KEY'=>str_repeat('a',32),'SESSION_SECURE'=>'true','SESSION_COOKIE_NAME'=>'store_session','SESSION_LIFETIME_SECONDS'=>'1800','SESSION_SAME_SITE'=>'Lax','LOG_PATH'=>'storage/logs','DIGITAL_FILES_PATH'=>'storage/private'];
    try { (new VeVit\App\Config\Config(array_replace($base,['APP_URL'=>'http://x'])))->validateStore(); } catch (VeVit\App\Config\ConfigurationException $e) { expect_same('invalid_configuration', $e->category); }
    try { (new VeVit\App\Config\Config(array_replace($base,['SESSION_SECURE'=>'false'])))->validateStore(); } catch (VeVit\App\Config\ConfigurationException $e) { expect_same('insecure_production_configuration', $e->category); }
});

test('JSON parser distinguishes all invalid request states', function (): void {
    require_once __DIR__ . '/../../app/http/Request.php';
    foreach ([['', 'empty_body'], ['{bad}', 'invalid_json'], ['[]', 'json_object_required'], [str_repeat('a', 9), 'request_too_large']] as [$body, $error]) {
        $result = VeVit\App\Http\Request::decodeJson($body, 8);
        expect_same($error, $result['error']);
    }
    expect_same(['x' => 1], VeVit\App\Http\Request::decodeJson('{"x":1}', 100)['data']);
});

test('redirect helper rejects encoded controls and slash bypasses', function (): void {
    require_once __DIR__ . '/../../app/http/Redirect.php';
    foreach (['//evil.test', '/\\evil', '\\evil', '/%0d%0aLocation:evil', "/safe\n", '/\\\\evil'] as $candidate) expect_same('/', VeVit\App\Http\Redirect::safePath($candidate, '/'));
    expect_same('/store?next=1#top', VeVit\App\Http\Redirect::safePath('/store?next=1#top', '/'));
});

test('CSRF rotation invalidates the previous token', function (): void {
    require_once __DIR__ . '/../../app/security/Csrf.php';
    $session = []; $old = VeVit\App\Security\Csrf::token($session); $new = VeVit\App\Security\Csrf::rotate($session);
    expect($old !== $new && !VeVit\App\Security\Csrf::verify($session, $old) && VeVit\App\Security\Csrf::verify($session, $new));
});

test('logger redacts nested sensitive context and survives unavailable path', function (): void {
    require_once __DIR__ . '/../../app/support/Logger.php';
    $redacted = VeVit\App\Support\Logger::redact(['headers' => ['authorization' => 'bearer x'], 'query' => ['api_key' => 'x'], 'safe' => ['name' => 'ok']]);
    expect_same('[REDACTED]', $redacted['headers']['authorization']); expect_same('[REDACTED]', $redacted['query']['api_key']); expect_same('ok', $redacted['safe']['name']);
    expect_same(false, VeVit\App\Support\Logger::write('/proc/vevit-unwritable/store.log', ['message' => 'x']));
});
