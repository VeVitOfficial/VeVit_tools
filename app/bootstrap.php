<?php
declare(strict_types=1);

use VeVit\App\Config\Config;
use VeVit\App\Http\JsonResponse;
use VeVit\App\Http\Request;
use VeVit\App\Session\Session;
use VeVit\App\Support\ErrorHandler;
use VeVit\App\Support\Logger;

foreach (['config/Config.php', 'http/JsonResponse.php', 'http/Request.php', 'http/Redirect.php', 'session/Session.php', 'security/Csrf.php', 'support/Logger.php', 'support/ErrorHandler.php', 'auth/AuthProviderInterface.php', 'auth/AnonymousAuthProvider.php', 'auth/VeVitSsoProvider.php'] as $file) require_once __DIR__ . '/' . $file;

function vevit_store_bootstrap(bool $startSession = true): array {
    $config = Config::fromEnvironment();
    $requestId = Request::requestId();
    $logPath = rtrim((string)$config->string('LOG_PATH', 'storage/logs'), '/') . '/store.log';
    ErrorHandler::install($logPath, $requestId);
    $config->validateStore();
    if ($startSession) Session::start($config);
    return ['config' => $config, 'request_id' => $requestId];
}
