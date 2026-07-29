<?php
declare(strict_types=1);
namespace VeVit\App\Session;
use VeVit\App\Config\Config;
require_once __DIR__ . '/../security/Csrf.php';
use VeVit\App\Security\Csrf;

final class Session {
    public static function cookieOptions(array $values): array {
        return ['lifetime' => (int)($values['SESSION_LIFETIME_SECONDS'] ?? 1800), 'path' => '/', 'secure' => filter_var($values['SESSION_SECURE'] ?? true, FILTER_VALIDATE_BOOLEAN), 'httponly' => true, 'samesite' => $values['SESSION_SAME_SITE'] ?? 'Lax'];
    }
    public static function shouldRegenerate(int $lastActivity, int $now, int $idleSeconds): bool { return $lastActivity === $now || $now - $lastActivity >= $idleSeconds; }
    public static function start(Config $config): bool {
        if (session_status() === PHP_SESSION_ACTIVE) return false;
        ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1'); ini_set('session.use_trans_sid', '0');
        session_name((string)$config->string('SESSION_COOKIE_NAME', 'vevit_store_session'));
        $options = self::cookieOptions(['SESSION_SECURE' => $config->string('SESSION_SECURE', $config->environment() === 'production' ? 'true' : 'false'), 'SESSION_SAME_SITE' => $config->string('SESSION_SAME_SITE', 'Lax'), 'SESSION_LIFETIME_SECONDS' => $config->string('SESSION_LIFETIME_SECONDS', '1800')]);
        session_set_cookie_params($options); if (!session_start()) throw new \RuntimeException('Session start failed');
        $now = time(); $last = (int)($_SESSION['_vevit_last_activity'] ?? $now);
        if ($now - $last >= $options['lifetime']) { self::expireToAnonymous($now); return true; }
        $interval = (int)$config->string('SESSION_REGENERATION_INTERVAL_SECONDS', '900');
        if ($now - (int)($_SESSION['_vevit_last_regeneration'] ?? $now) >= $interval) self::regenerateForPrivilegeChange($now);
        $_SESSION['_vevit_last_activity'] = $now; return false;
    }
    /** Idle timeout is an anonymous-session transition: identity/authorization and CSRF are discarded. */
    public static function expireToAnonymous(?int $now = null): bool {
        if (session_status() !== PHP_SESSION_ACTIVE) return false;
        $_SESSION = []; if (!session_regenerate_id(true)) return false;
        $_SESSION['_vevit_last_activity'] = $now ?? time(); $_SESSION['_vevit_last_regeneration'] = $now ?? time(); Csrf::rotate($_SESSION); return true;
    }
    public static function regenerateForPrivilegeChange(?int $now = null): bool {
        if (session_status() !== PHP_SESSION_ACTIVE || !session_regenerate_id(true)) return false;
        $_SESSION['_vevit_last_regeneration'] = $now ?? time(); Csrf::rotate($_SESSION); return true;
    }
    public static function logout(): bool {
        if (session_status() !== PHP_SESSION_ACTIVE) return false;
        $params = session_get_cookie_params(); $name = session_name(); $_SESSION = [];
        setcookie($name, '', self::expiryCookieOptions($params));
        return session_destroy();
    }
    public static function expiryCookieOptions(array $params, ?int $now = null): array {
        $out = ['expires' => ($now ?? time()) - 3600, 'path' => $params['path'] ?? '/', 'secure' => (bool)($params['secure'] ?? true), 'httponly' => (bool)($params['httponly'] ?? true), 'samesite' => $params['samesite'] ?? 'Lax'];
        if (($params['domain'] ?? '') !== '') $out['domain'] = $params['domain']; return $out;
    }
}
