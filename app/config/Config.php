<?php
declare(strict_types=1);
namespace VeVit\App\Config;

final class ConfigurationException extends \RuntimeException {
    public function __construct(public readonly string $category, public readonly array $keys) { parent::__construct($category); }
}

final class Config {
    public function __construct(private array $values) {}
    /** Process environment wins over defaults; explicit overrides are test-only and win last. */
    public static function fromEnvironment(array $overrides = []): self { return self::fromSources(getenv() ?: [], $overrides); }
    public static function fromSources(array $process, array $overrides = []): self { return new self(array_replace($process, $overrides)); }
    public function string(string $key, ?string $default = null): ?string { $value = $this->values[$key] ?? $default; return is_string($value) && trim($value) !== '' ? $value : $default; }
    public function bool(string $key, bool $default = false): bool { return filter_var($this->values[$key] ?? $default, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default; }
    public function environment(): string { return $this->string('APP_ENV', 'production') ?? 'production'; }
    public function debugEnabled(): bool { return $this->environment() !== 'production' && $this->bool('APP_DEBUG'); }
    public function requireCritical(array $keys): void { foreach ($keys as $key) if ($this->string($key) === null) throw new ConfigurationException('missing_configuration', [$key]); }
    public function validateStore(): void {
        $this->requireCritical(['APP_ENV', 'APP_URL', 'APP_KEY', 'LOG_PATH', 'DIGITAL_FILES_PATH']);
        $invalid = [];
        $url = $this->string('APP_URL'); $key = $this->string('APP_KEY'); $production = $this->environment() === 'production';
        if (!in_array($this->environment(), ['production', 'development', 'test'], true)) $invalid[] = 'APP_ENV';
        if (!filter_var($url, FILTER_VALIDATE_URL) || ($production && parse_url($url, PHP_URL_SCHEME) !== 'https')) $invalid[] = 'APP_URL';
        if ($key === 'replace-with-a-random-server-side-secret' || strlen((string)$key) < 32) $invalid[] = 'APP_KEY';
        $name = $this->string('SESSION_COOKIE_NAME', 'vevit_store_session');
        if (!preg_match('/^[A-Za-z][A-Za-z0-9_-]{2,63}$/', (string)$name)) $invalid[] = 'SESSION_COOKIE_NAME';
        $lifetime = filter_var($this->string('SESSION_LIFETIME_SECONDS', '1800'), FILTER_VALIDATE_INT);
        if ($lifetime === false || $lifetime < 300 || $lifetime > 86400) $invalid[] = 'SESSION_LIFETIME_SECONDS';
        if (!in_array($this->string('SESSION_SAME_SITE', 'Lax'), ['Lax', 'Strict'], true)) $invalid[] = 'SESSION_SAME_SITE';
        foreach (['LOG_PATH', 'DIGITAL_FILES_PATH'] as $pathKey) { $path = $this->string($pathKey); if ($path === null || str_contains($path, '..') || str_starts_with($path, '/')) $invalid[] = $pathKey; }
        if ($production && !$this->bool('SESSION_SECURE')) throw new ConfigurationException('insecure_production_configuration', ['SESSION_SECURE']);
        if ($invalid) throw new ConfigurationException('invalid_configuration', array_values(array_unique($invalid)));
    }
}
