<?php
test('log context redacts secret values', function (): void {
    require_once __DIR__ . '/../../app/support/Logger.php';
    $context = VeVit\App\Support\Logger::redact(['password' => 'secret', 'token' => 'abc', 'safe' => 'value']);
    expect_same('[REDACTED]', $context['password']);
    expect_same('[REDACTED]', $context['token']);
    expect_same('value', $context['safe']);
});
