<?php
test('CSRF accepts the session-bound token only', function (): void {
    require_once __DIR__ . '/../../app/security/Csrf.php';
    $session = [];
    $token = VeVit\App\Security\Csrf::token($session);
    expect(VeVit\App\Security\Csrf::verify($session, $token), 'valid token rejected');
    expect(!VeVit\App\Security\Csrf::verify($session, ''), 'missing token accepted');
    expect(!VeVit\App\Security\Csrf::verify($session, 'invalid'), 'invalid token accepted');
});
