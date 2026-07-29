<?php
declare(strict_types=1);
require_once __DIR__ . '/../../app/bootstrap.php';

use VeVit\App\Http\JsonResponse;
use VeVit\App\Http\Request;

$app = vevit_store_bootstrap();
if (!Request::methodAllowed($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET'])) {
    header('Allow: GET');
    JsonResponse::send(JsonResponse::error(405, 'method_not_allowed', $app['request_id']));
}
JsonResponse::send(JsonResponse::success([
    'service' => 'vevit-store',
    'environment' => $app['config']->environment(),
], $app['request_id']));
