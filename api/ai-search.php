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
$query = $input['query'] ?? '';
$lang  = $input['lang']  ?? 'CS';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing query']);
    exit;
}

$systemPrompt = $lang === 'CS'
    ? 'Jsi AI asistent. Odpovídej v češtině, strukturovaně a přesně.'
    : 'You are an AI assistant. Answer accurately and in a structured way.';

$payload = json_encode([
    'contents' => [[
        'parts' => [['text' => $systemPrompt . "\n\nDotaz: " . $query]]
    ]],
    'tools' => [['google_search' => (object)[]]]
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
$text = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Vyhledávání selhalo.';

echo json_encode(['text' => $text]);
?>