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
$framework = $input['framework'] ?? 'html';
$mimeType = $input['mimeType'] ?? 'image/png';

if (empty($imageBase64)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing image']);
    exit;
}

$frameworkDesc = [
    'html'    => 'plain HTML and CSS (no frameworks)',
    'tailwind'=> 'HTML with Tailwind CSS classes',
    'react'   => 'React JSX with inline styles or Tailwind',
];

$prompt = "You are an expert frontend developer. Analyze this UI screenshot and generate clean, production-ready code using " . ($frameworkDesc[$framework] ?? 'plain HTML and CSS') . ".\n\nRequirements:\n- Recreate the UI as accurately as possible\n- Use semantic HTML\n- Include all visible text content\n- Make it responsive\n- Return ONLY the code, no explanations\n\nGenerate the complete code now:";

$payload = json_encode([
    'contents' => [[
        'parts' => [
            ['text' => $prompt],
            ['inline_data' => ['mime_type' => $mimeType, 'data' => $imageBase64]]
        ]
    ]]
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
echo json_encode(['code' => $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Konverze selhala.']);
?>