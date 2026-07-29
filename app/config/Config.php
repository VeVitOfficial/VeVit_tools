<?php
declare(strict_types=1);
namespace VeVit\App\Config;

final class Config {
    public function __construct(private array $values) {}
    public static function fromEnvironment(): self { return new self($_ENV + getenv()); }
    public function string(string $key, ?string $default = null): ?string {
        $value = $this->values[$key] ?? $default;
        return is_string($value) && $value !== '' ? $value : $default;
    }
    public function bool(string $key, bool $default = false): bool {
        return filter_var($this->values[$key] ?? $default, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
    }
    public function environment(): string { return $this->string('APP_ENV', 'production') ?? 'production'; }
    public function debugEnabled(): bool { return $this->environment() !== 'production' && $this->bool('APP_DEBUG'); }
    public function requireCritical(array $keys): void {
        foreach ($keys as $key) if ($this->string($key) === null) throw new \RuntimeException('Critical configuration is missing.');
    }
}
