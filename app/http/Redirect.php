<?php
declare(strict_types=1);
namespace VeVit\App\Http;
final class Redirect {
    public static function safePath(string $candidate, string $fallback = '/'): string {
        if (!preg_match('//u', $candidate)) return $fallback;
        $decoded = rawurldecode($candidate);
        if (preg_match('/[\x00-\x1F\x7F]/', $decoded) || str_contains($decoded, '\\') || !str_starts_with($decoded, '/') || str_starts_with($decoded, '//')) return $fallback;
        return $candidate;
    }
}
