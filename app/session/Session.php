<?php
declare(strict_types=1);
namespace VeVit\App\Session;

use VeVit\App\Config\Config;

final class Session {
    public static function cookieOptions(array $values): array {
        $sameSite = ($values['SESSION_SAME_SITE'] ?? 'Lax') === 'Strict' ? 'Strict' : 'Lax';
        return ['lifetime' => max(60, (int)($values['SESSION_LIFETIME_SECONDS'] ?? 1800)), 'path' => '/', 'secure' => filter_var($values['SESSION_SECURE'] ?? true, FILTER_VALIDATE_BOOLEAN), 'httponly' => true, 'samesite' => $sameSite];
    }
    public static function shouldRegenerate(int $lastActivity, int $now, int $idleSeconds): bool { return $lastActivity === $now || $now - $lastActivity >= $idleSeconds; }
    public static function start(Config $config): void {
        if (session_status() === PHP_SESSION_ACTIVE) return;
        ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1'); ini_set('session.use_trans_sid', '0');
        session_name($config->string('SESSION_COOKIE_NAME', 'vevit_store_session'));
        $options = self::cookieOptions(['SESSION_SECURE' => $config->string('SESSION_SECURE', $config->environment() === 'production' ? 'true' : 'false'), 'SESSION_SAME_SITE' => $config->string('SESSION_SAME_SITE', 'Lax'), 'SESSION_LIFETIME_SECONDS' => $config->string('SESSION_LIFETIME_SECONDS', '1800')]);
        session_set_cookie_params($options); session_start();
        $now = time(); $idle = $options['lifetime'];
        if (isset($_SESSION['_vevit_last_activity']) && $now - (int)$_SESSION['_vevit_last_activity'] >= $idle) { $_SESSION = []; session_regenerate_id(true); }
        $_SESSION['_vevit_last_activity'] = $now;
    }
    public static function regenerateForPrivilegeChange(): void { if (session_status() === PHP_SESSION_ACTIVE) session_regenerate_id(true); }
    public static function logout(): void { if (session_status() === PHP_SESSION_ACTIVE) { $_SESSION = []; session_destroy(); } }
}
