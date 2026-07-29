<?php
declare(strict_types=1);

use VeVit\App\Config\Config;
use VeVit\App\Http\JsonResponse;
use VeVit\App\Http\Request;
use VeVit\App\Session\Session;
use VeVit\App\Support\Logger;

foreach (['config/Config.php', 'http/JsonResponse.php', 'http/Request.php', 'http/Redirect.php', 'session/Session.php', 'security/Csrf.php', 'support/Logger.php', 'auth/AuthProviderInterface.php', 'auth/AnonymousAuthProvider.php', 'auth/VeVitSsoProvider.php'] as $file) require_once __DIR__ . '/' . $file;

function vevit_store_bootstrap(): array {
    $config = Config::fromEnvironment();
    $requestId = Request::requestId();
    $logPath = rtrim($config->string('LOG_PATH', __DIR__ . '/../storage/logs') ?? '', '/') . '/store.log';
    set_error_handler(static function (int $severity, string $message, string $file, int $line): never { throw new ErrorException($message, 0, $severity, $file, $line); });
    set_exception_handler(static function (Throwable $exception) use ($logPath, $requestId): void { Logger::error($logPath, $requestId, $exception); JsonResponse::send(JsonResponse::error(500, 'internal_error', $requestId)); });
    $config->requireCritical(['APP_ENV', 'APP_URL', 'APP_KEY']);
    Session::start($config);
    return ['config' => $config, 'request_id' => $requestId];
}
