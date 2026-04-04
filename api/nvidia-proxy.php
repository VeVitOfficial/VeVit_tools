<?php
require_once __DIR__ . '/nvidia-config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$model = $input['model'] ?? 'meta/llama-3.1-8b-instruct';
$messages = $input['messages'] ?? [];
$maxTokens = $input['max_tokens'] ?? 1024;

if (empty($messages)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing messages']);
    exit;
}

$payload = json_encode([
    'model' => $model,
    'messages' => $messages,
    'max_tokens' => $maxTokens,
    'stream' => false
]);

$ctx = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nAuthorization: Bearer " . NVIDIA_API_KEY,
        'content' => $payload,
        'timeout' => 60
    ]
]);

$response = file_get_contents(NVIDIA_BASE_URL . '/chat/completions', false, $ctx);

if (!$response) {
    http_response_code(500);
    echo json_encode(['error' => 'NVIDIA API call failed']);
    exit;
}

$data = json_decode($response, true);
$text = $data['choices'][0]['message']['content'] ?? 'Chyba odpovědi.';
echo json_encode(['text' => $text]);
?>