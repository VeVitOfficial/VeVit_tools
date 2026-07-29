<?php
declare(strict_types=1);
namespace VeVit\App\Http;

final class Redirect {
    public static function safePath(string $candidate, string $fallback = '/'): string {
        return str_starts_with($candidate, '/') && !str_starts_with($candidate, '//') && !str_contains($candidate, "\n") && !str_contains($candidate, "\r") ? $candidate : $fallback;
    }
}
