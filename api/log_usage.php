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
$toolSlug = $input['tool_slug'] ?? '';

if (empty($toolSlug)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing tool_slug']);
    exit;
}

// Read user from vevit_auth cookie
$userId = null;
if (!empty($_COOKIE['vevit_auth'])) {
    try {
        $cookieData = json_decode(urldecode($_COOKIE['vevit_auth']), true);
        if (!empty($cookieData['id'])) {
            $userId = $cookieData['id'];
        }
    } catch (Throwable $e) {
        $userId = null;
    }
}

if (empty($userId)) {
    $userId = 'guest_' . bin2hex(random_bytes(8));
}

$monthKey = date('Y-m');

try {
    $pdo = new PDO(
        'pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $stmt = $pdo->prepare('INSERT INTO ai_usage_log (user_id, tool_slug, used_at, month_key) VALUES (?, ?, NOW(), ?)');
    $stmt->execute([$userId, $toolSlug, $monthKey]);

    echo json_encode(['success' => true, 'user_id' => $userId]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
}
