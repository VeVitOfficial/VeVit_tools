<?php
declare(strict_types=1);
namespace VeVit\App\Support;
final class Logger {
    private const SENSITIVE = '/pass|secret|token|cookie|authorization|api[_-]?key|service[_-]?role|card|key/i';
    public static function redact(mixed $value, ?string $key = null): mixed {
        if ($key !== null && preg_match(self::SENSITIVE, $key)) return '[REDACTED]';
        if (is_array($value)) { foreach ($value as $childKey => $child) $value[$childKey] = self::redact($child, (string)$childKey); return $value; }
        if (is_object($value)) return '[OBJECT]';
        return $value;
    }
    public static function write(string $path, array $record): bool {
        $directory = dirname($path);
        if (!is_dir($directory)) {
            set_error_handler(static fn(): bool => true);
            $created = mkdir($directory, 0700, true);
            restore_error_handler();
            if (!$created && !is_dir($directory)) { error_log('VeVit store logger unavailable'); return false; }
        }
        $encoded = json_encode(self::redact($record), JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
        if ($encoded === false || file_put_contents($path, $encoded . "\n", FILE_APPEND | LOCK_EX) === false) { error_log('VeVit store logger write failed'); return false; }
        return true;
    }
    public static function error(string $path, string $requestId, \Throwable $exception, ?string $category = null, array $keys = []): bool {
        return self::write($path, ['time' => gmdate('c'), 'level' => 'error', 'request_id' => $requestId, 'category' => $category ?? 'internal_error', 'keys' => $keys, 'type' => get_class($exception)]);
    }
}
