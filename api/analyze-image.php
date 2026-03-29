<?php
require_once __DIR__ . '/config_secret.php';

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
$mimeType    = $input['mimeType']    ?? 'image/png';
$lang        = $input['lang']        ?? 'CS';

if (empty($imageBase64)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing imageBase64']);
    exit;
}

$prompt = $lang === 'CS'
    ? 'Analyzuj tento obrázek detailně v češtině. Popiš co vidíš.'
    : 'Analyze this image in detail. Describe what you see.';

$payload = json_encode([
    'contents' => [[
        'parts' => [
            ['text' => $prompt],
            ['inline_data' => ['mime_type' => $mimeType, 'data' => $imageBase64]]
        ]
    ]]
]);

$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . GEMINI_API_KEY;

$context = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/json',
        'content' => $payload
    ]
]);

$response = file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Gemini API call failed']);
    exit;
}

$data = json_decode($response, true);
$text = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Analýza selhala.';

echo json_encode(['text' => $text]);
?>