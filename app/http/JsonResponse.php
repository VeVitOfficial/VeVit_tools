<?php
declare(strict_types=1);
namespace VeVit\App\Http;

final class JsonResponse {
    public static function success(array $data, string $requestId, int $status = 200): array {
        return ['status' => $status, 'body' => ['ok' => true, 'data' => $data, 'request_id' => $requestId]];
    }
    public static function error(int $status, string $code, string $requestId, ?string $internal = null): array {
        return ['status' => $status, 'body' => ['ok' => false, 'error' => ['code' => $code, 'message' => self::message($code)], 'request_id' => $requestId]];
    }
    public static function send(array $response): never {
        http_response_code($response['status']);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, private, max-age=0');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($response['body'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        exit;
    }
    private static function message(string $code): string {
        return match ($code) {
            'method_not_allowed' => 'Nepovolená HTTP metoda.',
            'invalid_json' => 'Neplatné JSON tělo požadavku.',
            'request_too_large' => 'Požadavek je příliš velký.',
            'csrf_invalid' => 'Neplatný bezpečnostní token.',
            default => 'Požadavek se nepodařilo zpracovat.',
        };
    }
}
