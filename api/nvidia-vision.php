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
$imageBase64 = $input['imageBase64'] ?? '';
$prompt = $input['prompt'] ?? 'Describe this image in detail.';
$mimeType = $input['mimeType'] ?? 'image/png';

if (empty($imageBase64)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing image']);
    exit;
}

$payload = json_encode([
    'model' => 'microsoft/phi-3-vision-128k-instruct',
    'messages' => [[
        'role' => 'user',
        'content' => [
            ['type' => 'text', 'text' => $prompt],
            ['type' => 'image_url', 'image_url' => [
                'url' => 'data:' . $mimeType . ';base64,' . $imageBase64
            ]]
        ]
    ]],
    'max_tokens' => 1024,
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
    echo json_encode(['error' => 'NVIDIA Vision API failed']);
    exit;
}

$data = json_decode($response, true);
$text = $data['choices'][0]['message']['content'] ?? 'Analýza selhala.';
echo json_encode(['text' => $text]);
?>