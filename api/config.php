<?php
// This file intentionally does not expose any secrets.
// It may be used for public configuration or health checks.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'version' => '2.0',
    'ai_provider' => 'ollama'
]);
