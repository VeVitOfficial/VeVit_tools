<?php
test('global error handler returns generic production response with request id', function (): void {
    require_once __DIR__ . '/../../app/http/JsonResponse.php';
    require_once __DIR__ . '/../../app/support/Logger.php';
    require_once __DIR__ . '/../../app/support/ErrorHandler.php';
    $response = VeVit\App\Support\ErrorHandler::response(new RuntimeException('SQL failed at /srv/private'), 'req-123');
    expect_same(500, $response['status']);
    expect_same('req-123', $response['body']['request_id']);
    expect(!str_contains(json_encode($response['body']), '/srv/private'), 'production error leaked internal path');
});
