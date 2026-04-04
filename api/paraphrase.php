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
$style = $input['style'] ?? 'standard';
$lang = $input['lang'] ?? 'CS';

if (empty($text)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing text']);
    exit;
}

$styles = [
    'standard'  => 'Přeformuluj následující text jiným způsobem, zachovej stejný jazyk a smysl:',
    'formal'    => 'Přeformuluj následující text formálním profesionálním stylem:',
    'simple'    => 'Přeformuluj následující text jednoduše a srozumitelně:',
    'creative'  => 'Přeformuluj následující text kreativně a zajímavě:',
];

$stylesEn = [
    'standard'  => 'Paraphrase the following text differently, keeping the same language and meaning:',
    'formal'    => 'Paraphrase the following text in a formal professional style:',
    'simple'    => 'Paraphrase the following text in simple and clear language:',
    'creative'  => 'Paraphrase the following text creatively and engagingly:',
];

$prompt = ($lang === 'CS' ? ($styles[$style] ?? $styles['standard']) : ($stylesEn[$style] ?? $stylesEn['standard'])) . "\n\n" . mb_substr($text, 0, 10000);

$payload = json_encode(['contents' => [['parts' => [['text' => $prompt]]]]]);

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
echo json_encode(['text' => $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Přeformulování selhalo.']);
?>