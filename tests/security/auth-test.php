<?php
test('anonymous auth provider is explicitly unauthenticated', function (): void {
    require_once __DIR__ . '/../../app/auth/AuthProviderInterface.php';
    require_once __DIR__ . '/../../app/auth/AnonymousAuthProvider.php';
    $provider = new VeVit\App\Auth\AnonymousAuthProvider();
    expect_same(false, $provider->isAuthenticated());
    expect_same(null, $provider->identity());
});

test('VeVit SSO placeholder cannot authenticate without a contract', function (): void {
    require_once __DIR__ . '/../../app/auth/AuthProviderInterface.php';
    require_once __DIR__ . '/../../app/auth/VeVitSsoProvider.php';
    $provider = new VeVit\App\Auth\VeVitSsoProvider();
    expect_same('not_configured', $provider->status());
    expect_same(false, $provider->isAuthenticated());
});
