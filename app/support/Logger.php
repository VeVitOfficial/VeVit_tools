<?php
declare(strict_types=1);
namespace VeVit\App\Support;

final class Logger {
    public static function redact(array $context): array {
        foreach ($context as $key => $value) if (preg_match('/pass|secret|token|cookie|authorization|card|key/i', (string)$key)) $context[$key] = '[REDACTED]';
        return $context;
    }
    public static function error(string $path, string $requestId, \Throwable $exception): void {
        $directory = dirname($path); if (!is_dir($directory)) @mkdir($directory, 0700, true);
        $record = ['time' => gmdate('c'), 'level' => 'error', 'request_id' => $requestId, 'type' => get_class($exception), 'message' => $exception->getMessage()];
        @file_put_contents($path, json_encode(self::redact($record), JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX);
    }
}
