<?php
require_once __DIR__ . '/config_secret.php';
require_once __DIR__ . '/../lib/tier-check.php';

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
$prompt = $input['prompt'] ?? '';
$system = $input['system'] ?? '';
$model = $input['model'] ?? OLLAMA_MODEL;
$toolSlug = $input['tool_slug'] ?? 'unknown';
$stream = ($input['stream'] ?? false) === true;

if (empty($prompt)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing prompt']);
    exit;
}

// Auth & rate limiting
$userData = null;
if (!empty($_COOKIE['vevit_auth'])) {
    try {
        $cookieData = json_decode(urldecode($_COOKIE['vevit_auth']), true);
        if (!empty($cookieData['id'])) {
            $userData = enforceTierLimit($toolSlug);
        }
    } catch (Throwable $e) {
        // If enforceTierLimit exits with 429, it's already sent response
        // If it throws, we return 500
        if (http_response_code() === 429) {
            exit;
        }
        http_response_code(500);
        echo json_encode(['error' => 'Rate limit check failed', 'message' => $e->getMessage()]);
        exit;
    }
}

// Guest user fallback
if (!$userData) {
    $userData = ['id' => 'guest_' . bin2hex(random_bytes(8)), 'tier' => 'guest', 'nickname' => ''];
}

// Build Ollama payload
$payload = [
    'model' => $model,
    'prompt' => $prompt,
    'stream' => $stream,
];

if (!empty($system)) {
    $payload['system'] = $system;
}

// Handle images for vision models
if (!empty($input['images']) && is_array($input['images'])) {
    $payload['images'] = $input['images'];
}

$jsonPayload = json_encode($payload);

// Call Ollama API
$url = rtrim(OLLAMA_URL, '/') . '/api/generate';

$headers = [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($jsonPayload),
];

if (!empty(OLLAMA_API_KEY)) {
    $headers[] = 'Authorization: Bearer ' . OLLAMA_API_KEY;
}

$ctx = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => implode("\r\n", $headers),
        'content' => $jsonPayload,
        'timeout' => 120,
    ]
]);

$response = @file_get_contents($url, false, $ctx);

if ($response === false) {
    // Dev fallback: return mock response for localhost testing when Ollama is not running
    $isDev = !empty($_SERVER['HTTP_HOST']) && in_array($_SERVER['HTTP_HOST'], ['localhost:5173', 'localhost:8000', 'localhost:3000', '127.0.0.1:5173', '127.0.0.1:8000']);
    if ($isDev) {
        $mockPrefix = $model === 'llava' ? '[DEV MODE - Vision simulace]\n\n' : '[DEV MODE - AI simulace]\n\n';
        $mockText = $mockPrefix . "Toto je simulovaná odpověď pro lokální testování. Ollama není nainstalovaná nebo spuštěná.\n\n**Model:** " . $model . "\n**Tool:** " . $toolSlug . "\n\n---\n\n**Prompt (prvních 300 znaků):**\n" . mb_substr($prompt, 0, 300) . "...";
        echo json_encode([
            'text' => $mockText,
            'done' => true,
            'model' => $model,
            'dev' => true
        ]);
        exit;
    }

    http_response_code(502);
    echo json_encode([
        'error' => 'Ollama API unavailable',
        'message' => 'AI služba je momentálně nedostupná. Zkuste to prosím později.'
    ]);
    exit;
}

$data = json_decode($response, true);

if (!isset($data['response'])) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Invalid Ollama response',
        'message' => 'Neočekávaná odpověď od AI služby.'
    ]);
    exit;
}

echo json_encode([
    'text' => $data['response'],
    'done' => $data['done'] ?? true,
    'model' => $data['model'] ?? $model,
]);
