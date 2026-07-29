<?php
declare(strict_types=1);
namespace VeVit\App\Support;

use Throwable;
use VeVit\App\Http\JsonResponse;

final class ErrorHandler {
    public static function response(Throwable $exception, string $requestId): array {
        return JsonResponse::error(500, 'internal_error', $requestId);
    }
    public static function install(string $logPath, string $requestId): void {
        set_error_handler(static function (int $severity, string $message, string $file, int $line): never { throw new \ErrorException($message, 0, $severity, $file, $line); });
        set_exception_handler(static function (Throwable $exception) use ($logPath, $requestId): void { Logger::error($logPath, $requestId, $exception); JsonResponse::send(self::response($exception, $requestId)); });
    }
}
