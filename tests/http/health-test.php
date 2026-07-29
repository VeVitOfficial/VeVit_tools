<?php
test('health response exposes only safe service fields', function (): void {
    require_once __DIR__ . '/../../app/http/JsonResponse.php';
    $response = VeVit\App\Http\JsonResponse::success(['service' => 'vevit-store', 'environment' => 'production'], 'request-health');
    expect_same(['service' => 'vevit-store', 'environment' => 'production'], $response['body']['data']);
    expect(!str_contains(json_encode($response['body']), 'DATABASE_PASSWORD'), 'health response leaked configuration');
});
