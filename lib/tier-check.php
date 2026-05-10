<?php
/**
 * VeVit Tools – Tier-based AI rate limiting (standalone version)
 * This file is self-contained and does NOT depend on vevit-account-system.
 */

/**
 * Extract user data from vevit_auth cookie
 */
function getVevitUserFromCookie(): ?array {
    if (empty($_COOKIE['vevit_auth'])) return null;
    try {
        $data = json_decode(urldecode($_COOKIE['vevit_auth']), true);
        if (!empty($data['id'])) return $data;
    } catch (Throwable $e) {
        // ignore decode errors
    }
    return null;
}

/**
 * Get account DB connection for tier verification
 */
function getAccountDb(): ?PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    try {
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
    } catch (Throwable $e) {
        return null;
    }
}

/**
 * Check if user's tier has expired and downgrade if needed
 */
function checkTierExpiry(PDO $pdo, string $userId): void {
    $stmt = $pdo->prepare("UPDATE users SET tier = 'free' WHERE id = ? AND tier_expires_at IS NOT NULL AND tier_expires_at < NOW()");
    $stmt->execute([$userId]);
}

/**
 * Get AI limit for a given tier
 */
function getAiLimit(string $tier): int {
    return match ($tier) {
        'premium' => 500,
        'pro'     => 200,
        'basic'   => 50,
        default   => 10, // free/guest
    };
}

/**
 * Get AI limit period (human readable)
 */
function getAiLimitPeriod(): string {
    return 'den';
}

/**
 * Get upgrade info
 */
function getAiLimitError(string $tier): array {
    $limit = getAiLimit($tier);
    return [
        'limit'       => $limit,
        'period'      => getAiLimitPeriod(),
        'upgrade_url' => '/upgrade',
        'upgrade_tier'=> $tier === 'free' ? 'basic' : 'premium',
    ];
}

/**
 * Check if user is within AI usage limit for today
 */
function checkAiLimit(PDO $pdo, string $userId, string $tier, string $toolSlug): bool {
    $limit = getAiLimit($tier);
    $today = date('Y-m-d');

    $stmt = $pdo->prepare(
        'SELECT COUNT(*) as cnt FROM ai_usage_log WHERE user_id = ? AND DATE(used_at) = ?'
    );
    $stmt->execute([$userId, $today]);
    $row = $stmt->fetch();

    return ($row['cnt'] ?? 0) < $limit;
}

/**
 * Log AI usage
 */
function logAiUsage(PDO $pdo, string $userId, string $toolSlug, string $tier): void {
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO ai_usage_log (user_id, tool_slug, used_at, tier) VALUES (?, ?, NOW(), ?)'
        );
        $stmt->execute([$userId, $toolSlug, $tier]);
    } catch (Throwable $e) {
        // silent fail
    }
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

    if ($pdo === null) {
        // DB unavailable — allow operation without limits (degraded mode)
        return ['id' => $userId, 'tier' => 'free', 'nickname' => $userData['nickname'] ?? ''];
    }

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
