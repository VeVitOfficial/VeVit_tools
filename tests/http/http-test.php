<?php
test('JSON success has safe envelope and request id', function (): void {
    require_once __DIR__ . '/../../app/http/JsonResponse.php';
    $response = VeVit\App\Http\JsonResponse::success(['service' => 'vevit-store'], 'request-test');
    expect_same(200, $response['status']);
    expect_same('request-test', $response['body']['request_id']);
    expect_same(true, $response['body']['ok']);
});

test('JSON error does not expose exception details in production', function (): void {
    require_once __DIR__ . '/../../app/http/JsonResponse.php';
    $response = VeVit\App\Http\JsonResponse::error(500, 'internal_error', 'request-test', 'secret /srv/path');
    expect(!str_contains(json_encode($response['body']), '/srv/path'), 'internal details leaked');
});
