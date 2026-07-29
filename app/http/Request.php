<?php
declare(strict_types=1);
namespace VeVit\App\Http;

final class Request {
    public static function methodAllowed(string $method, array $allowed): bool { return in_array(strtoupper($method), $allowed, true); }
    public static function decodeJson(string $body, int $maxBytes): ?array {
        if (strlen($body) > $maxBytes) return null;
        try { $decoded = json_decode($body, true, 32, JSON_THROW_ON_ERROR); return is_array($decoded) ? $decoded : null; }
        catch (\JsonException) { return null; }
    }
    public static function requestId(): string { return bin2hex(random_bytes(12)); }
}
