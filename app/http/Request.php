<?php
declare(strict_types=1);
namespace VeVit\App\Http;
final class Request {
    public static function methodAllowed(string $method, array $allowed): bool { return in_array(strtoupper($method), array_map('strtoupper', $allowed), true); }
    public static function decodeJson(string $body, int $maxBytes, ?int $contentLength = null): array {
        if (($contentLength !== null && $contentLength > $maxBytes) || strlen($body) > $maxBytes) return ['ok' => false, 'error' => 'request_too_large'];
        if ($body === '') return ['ok' => false, 'error' => 'empty_body'];
        try { $decoded = json_decode($body, true, 32, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { return ['ok' => false, 'error' => 'invalid_json']; }
        return is_array($decoded) && !array_is_list($decoded) ? ['ok' => true, 'data' => $decoded] : ['ok' => false, 'error' => 'json_object_required'];
    }
    public static function requestId(): string { return bin2hex(random_bytes(12)); }
}
