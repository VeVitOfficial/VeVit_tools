<?php
/**
 * VeVit Tools – Tier-based AI rate limiting
 * Include this in every AI proxy endpoint before making the API call.
 */

require_once __DIR__ . '/../../vevit-account-system/lib/tier-helpers.php';

// Get account DB connection for tier verification
function getAccountDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    $pdo = new PDO(
        'mysql:host=md396.wedos.net;port=3306;dbname=d390994_account;charset=utf8',
        'a390994_account',
        'Vitek2008.',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    return $pdo;
}

/**
 * Enforce AI rate limit based on the user's tier.
 * Sends a 429 JSON response and exits if the limit is exceeded.
 * Returns the user data array if allowed.
 *
 * @param string $toolSlug Unique slug for this AI tool (e.g. 'ai-summarize')
 * @return array{id:string, tier:string, nickname:string}
 */
function enforceTierLimit(string $toolSlug): array {
    $userData = getVevitUserFromCookie();

    if (!$userData || empty($userData['id'])) {
        http_response_code(401);
        echo json_encode([
            'error' => 'not_logged_in',
            'message' => 'Pro použití AI nástrojů se musíte přihlásit.'
        ]);
        exit;
    }

    $userId = $userData['id'];
    $pdo = getAccountDb();

    // Always check tier expiry first
    checkTierExpiry($pdo, $userId);

    // Get fresh tier from DB (don't trust cookie)
    $stmt = $pdo->prepare('SELECT tier FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    $tier = $row ? ($row['tier'] ?? 'free') : 'free';

    // Check AI limit
    if (!checkAiLimit($pdo, $userId, $tier, $toolSlug)) {
        $limitError = getAiLimitError($tier);
        http_response_code(429);
        echo json_encode([
            'error' => 'limit_exceeded',
            'message' => "Dosáhli jste limitu AI dotazů ({$limitError['limit']} {$limitError['period']}).",
            'tier' => $tier,
            'limit' => $limitError['limit'],
            'period' => $limitError['period'],
            'upgrade_url' => $limitError['upgrade_url'],
            'upgrade_tier' => $limitError['upgrade_tier']
        ]);
        exit;
    }

    // Log usage
    logAiUsage($pdo, $userId, $toolSlug, $tier);

    return ['id' => $userId, 'tier' => $tier, 'nickname' => $userData['nickname'] ?? ''];
}
