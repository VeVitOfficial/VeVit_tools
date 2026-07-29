<?php
declare(strict_types=1);
namespace VeVit\App\Security;

final class Csrf {
    private const KEY = '_vevit_csrf';
    public static function token(array &$session): string {
        if (!isset($session[self::KEY]) || !is_string($session[self::KEY])) $session[self::KEY] = bin2hex(random_bytes(32));
        return $session[self::KEY];
    }
    public static function verify(array $session, ?string $token): bool {
        return is_string($token) && isset($session[self::KEY]) && is_string($session[self::KEY]) && hash_equals($session[self::KEY], $token);
    }
    public static function rotate(array &$session): string { unset($session[self::KEY]); return self::token($session); }
    public static function clear(array &$session): void { unset($session[self::KEY]); }
}
