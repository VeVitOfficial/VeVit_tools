<?php
test('session options are secure in production', function (): void {
    require_once __DIR__ . '/../../app/session/Session.php';
    $options = VeVit\App\Session\Session::cookieOptions(['SESSION_SECURE' => 'true', 'SESSION_SAME_SITE' => 'Lax', 'SESSION_LIFETIME_SECONDS' => '1800']);
    expect_same(true, $options['secure']);
    expect_same(true, $options['httponly']);
    expect_same('Lax', $options['samesite']);
    expect(!isset($options['domain']), 'cookie must stay host-only');
});

test('session wrapper regenerates identity after privilege change', function (): void {
    require_once __DIR__ . '/../../app/session/Session.php';
    expect(VeVit\App\Session\Session::shouldRegenerate(100, 100, 1800), 'new session should regenerate');
    expect(!VeVit\App\Session\Session::shouldRegenerate(100, 101, 1800), 'active session should not regenerate');
    expect(VeVit\App\Session\Session::shouldRegenerate(100, 1901, 1800), 'expired idle session should regenerate');
});

test('session wrapper regenerates the actual session id', function (): void {
    require_once __DIR__ . '/../../app/config/Config.php';
    require_once __DIR__ . '/../../app/session/Session.php';
    if (session_status() === PHP_SESSION_ACTIVE) { session_destroy(); }
    $config = new VeVit\App\Config\Config(['APP_ENV' => 'development', 'SESSION_SECURE' => 'false']);
    VeVit\App\Session\Session::start($config);
    $before = session_id(); VeVit\App\Session\Session::regenerateForPrivilegeChange(); $after = session_id();
    expect($before !== $after, 'session id was not regenerated');
    VeVit\App\Session\Session::logout();
});

test('logout expires a host-only cookie with original security options', function (): void {
    require_once __DIR__ . '/../../app/session/Session.php';
    $cookie = VeVit\App\Session\Session::expiryCookieOptions(['path' => '/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict'], 1000);
    expect_same(-2600, $cookie['expires']); expect_same('/', $cookie['path']); expect_same(true, $cookie['secure']); expect_same(true, $cookie['httponly']); expect_same('Strict', $cookie['samesite']); expect(!isset($cookie['domain']));
});

test('idle expiration removes identity and authorization before anonymous renewal', function (): void {
    require_once __DIR__ . '/../../app/session/Session.php';
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();
    $_SESSION = ['identity' => ['id' => 1], 'roles' => ['admin'], '_vevit_last_activity' => 0];
    expect(VeVit\App\Session\Session::expireToAnonymous(1000));
    expect(!isset($_SESSION['identity']) && !isset($_SESSION['roles']), 'identity survived idle expiration');
    expect(isset($_SESSION['_vevit_last_activity']), 'anonymous session was not renewed');
    VeVit\App\Session\Session::logout();
});
