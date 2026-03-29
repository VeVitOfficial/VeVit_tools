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
$text = $input['text'] ?? '';
$targetLang = $input['targetLang'] ?? 'English';
$lang = $input['lang'] ?? 'CS';

if (empty($text)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing text']);
    exit;
}

$prompt = "Translate the following text to {$targetLang}. Keep the formatting:\n\n" . mb_substr($text, 0, 30000);

$payload = json_encode([
    'contents' => [['parts' => [['text' => $prompt]]]]
]);

$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . GEMINI_API_KEY;

$ctx = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $payload
    ]
]);

$response = file_get_contents($url, false, $ctx);

if (!$response) {
    http_response_code(500);
    echo json_encode(['error' => 'API failed']);
    exit;
}

$data = json_decode($response, true);
echo json_encode(['text' => $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Překlad selhal.']);
?>